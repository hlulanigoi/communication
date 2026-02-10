/**
 * Document OCR Data Extraction Service
 * Extracts key invoice/receipt data from scanned documents
 */

export interface DocumentOcrResult {
  fullText: string;
  confidence: number;
  error?: string;
  extractedData: {
    documentType?: string; // invoice, receipt, estimate, bill
    invoiceNumber?: string;
    poNumber?: string;
    vendorName?: string;
    vendorEmail?: string;
    vendorPhone?: string;
    invoiceDate?: string;
    dueDate?: string;
    totalAmount?: string;
    subtotal?: string;
    tax?: string;
    currency?: string;
    clientName?: string;
    clientEmail?: string;
    description?: string;
    lineItems?: Array<{ description: string; quantity: string; unitPrice: string; amount: string }>;
    otherText?: string;
  };
}

/**
 * Parse invoice/receipt data from OCR text
 */
export function parseDocumentData(text: string): DocumentOcrResult['extractedData'] {
  const data: DocumentOcrResult['extractedData'] = {
    otherText: text,
  };

  if (!text) return data;

  const upperText = text.toUpperCase();

  // Detect document type
  if (upperText.includes('INVOICE')) data.documentType = 'invoice';
  else if (upperText.includes('RECEIPT') || upperText.includes('RECEIPT#')) data.documentType = 'receipt';
  else if (upperText.includes('ESTIMATE') || upperText.includes('QUOTE')) data.documentType = 'estimate';
  else if (upperText.includes('BILL') || upperText.includes('BILLING')) data.documentType = 'bill';

  // Invoice number patterns
  const invoicePatterns = [
    /Invoice[\s#:]+(\d{4,})/i,
    /INV-?(\d{4,})/i,
    /Invoice\s*Number[\s:]+([A-Z]{0,3}\d{4,})/i,
    /^\s*(\d{4,})\s*$/m,
  ];

  for (const pattern of invoicePatterns) {
    const match = text.match(pattern);
    if (match) {
      data.invoiceNumber = match[1];
      break;
    }
  }

  // PO Number
  const poMatch = text.match(/PO[\s#:]+(\d{4,})|P\.O\.[\s#:]+(\d{4,})/i);
  if (poMatch) {
    data.poNumber = poMatch[1] || poMatch[2];
  }

  // Dates (common formats)
  const datePatterns = [
    /Invoice Date[\s:]+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
    /Date[\s:]+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
    /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/,
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      data.invoiceDate = match[1];
      break;
    }
  }

  // Due date
  const dueMatch = text.match(/Due Date[\s:]+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i);
  if (dueMatch) {
    data.dueDate = dueMatch[1];
  }

  // Currency
  if (text.includes('$') || upperText.includes('USD')) data.currency = 'USD';
  else if (text.includes('€') || upperText.includes('EUR')) data.currency = 'EUR';
  else if (text.includes('£') || upperText.includes('GBP')) data.currency = 'GBP';
  else if (text.includes('R$') || upperText.includes('BRL')) data.currency = 'ZAR'; // South African Rand for Irgadgets context

  // Amounts (currency + number patterns)
  const amountPatterns = [
    /Total[\s:]*\$?\s*([\d,]+\.?\d{0,2})/i,
    /Amount Due[\s:]*\$?\s*([\d,]+\.?\d{0,2})/i,
    /(?:Total|Grand\s+Total)[\s:]*\$?\s*([\d,]+\.?\d{0,2})/i,
  ];

  for (const pattern of amountPatterns) {
    const match = text.match(pattern);
    if (match) {
      data.totalAmount = match[1];
      break;
    }
  }

  // Subtotal
  const subtotalMatch = text.match(/Subtotal[\s:]*\$?\s*([\d,]+\.?\d{0,2})/i);
  if (subtotalMatch) {
    data.subtotal = subtotalMatch[1];
  }

  // Tax
  const taxMatch = text.match(/(?:Tax|VAT|GST)[\s:]*\$?\s*([\d,]+\.?\d{0,2})/i);
  if (taxMatch) {
    data.tax = taxMatch[1];
  }

  // Vendor/Company name (usually at top)
  const lines = text.split('\n');
  if (lines.length > 0) {
    // First non-empty line is often vendor name
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim();
      if (line.length > 3 && !line.match(/^\d+$/) && !upperText.includes('INVOICE')) {
        data.vendorName = line;
        break;
      }
    }
  }

  // Email pattern
  const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
  if (emailMatch) {
    if (data.vendorName) {
      data.vendorEmail = emailMatch[1];
    } else {
      data.clientEmail = emailMatch[1];
    }
  }

  // Phone pattern
  const phoneMatch = text.match(/\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})/);
  if (phoneMatch) {
    data.vendorPhone = `${phoneMatch[1]}-${phoneMatch[2]}-${phoneMatch[3]}`;
  }

  return data;
}

/**
 * Extract document data using OCR
 */
export async function extractDocumentData(imageSource: string | Blob): Promise<DocumentOcrResult> {
  try {
    const TesseractModule = await import('tesseract.js').then((m) => m.default || m);
    const Tesseract = (TesseractModule as any).Tesseract || TesseractModule;

    if (!Tesseract || !Tesseract.createWorker) {
      return {
        fullText: '',
        confidence: 0,
        error: 'OCR library not available',
        extractedData: {},
      };
    }

    const worker = await Tesseract.createWorker();
    const source = typeof imageSource === 'string' ? imageSource : URL.createObjectURL(imageSource);

    const result = await worker.recognize(source);
    await worker.terminate();

    const fullText = result.data.text;
    const confidence = result.data.confidence / 100;

    return {
      fullText,
      confidence,
      extractedData: parseDocumentData(fullText),
    };
  } catch (error) {
    console.error('Document OCR Error:', error);
    return {
      fullText: '',
      confidence: 0,
      error: error instanceof Error ? error.message : 'OCR failed',
      extractedData: {},
    };
  }
}
