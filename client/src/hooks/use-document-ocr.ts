import { useState, useCallback } from 'react';
import { extractDocumentData, type DocumentOcrResult } from '@/lib/documentOcrService';
import { toast } from 'sonner';

interface UseDocumentOcrOptions {
  autoExtract?: boolean;
}

export function useDocumentOcr(options: UseDocumentOcrOptions = {}) {
  const { autoExtract = true } = options;

  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<DocumentOcrResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processDocument = useCallback(
    async (image: string | Blob) => {
      setIsProcessing(true);
      setError(null);

      try {
        const result = await extractDocumentData(image);
        setResults(result);

        if (autoExtract && result.extractedData) {
          const extracted = Object.entries(result.extractedData)
            .filter(([k, v]) => v && k !== 'otherText' && k !== 'lineItems')
            .map(([k, v]) => {
              const labels: Record<string, string> = {
                documentType: 'Type',
                invoiceNumber: 'Invoice#',
                totalAmount: 'Amount',
                vendorName: 'Vendor',
                invoiceDate: 'Date',
              };
              return `${labels[k] || k}: ${v}`;
            })
            .join(' | ');

          if (extracted) {
            toast.success('📄 Document data extracted', {
              description: extracted.substring(0, 120),
            });
          }
        }

        return result;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to process document';
        setError(errorMsg);
        toast.error('Document OCR Error', { description: errorMsg });
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [autoExtract]
  );

  const reset = useCallback(() => {
    setResults(null);
    setError(null);
  }, []);

  return {
    isProcessing,
    results,
    error,
    processDocument,
    reset,
    extractedData: results?.extractedData || {},
  };
}

export type { DocumentOcrResult };
