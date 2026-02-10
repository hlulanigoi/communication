/**
 * OCR Vehicle Data Extraction Service
 * Extracts vehicle information from photos (registration, VIN, make, model)
 * Uses Tesseract.js for offline OCR with optional cloud fallback
 */

export interface OcrResult {
  fullText: string;
  confidence: number;
  extractedData: {
    registrationNumber?: string;
    vinNumber?: string;
    vehicleMake?: string;
    vehicleModel?: string;
    otherText?: string;
  };
  error?: string;
}

/**
 * Extract text from an image using Tesseract.js (offline OCR)
 */
export async function extractTextFromImage(imageSource: string | Blob): Promise<OcrResult> {
  try {
    // Dynamically import Tesseract
    let Tesseract: any;
    try {
      const mod = await import('tesseract.js' as any);
      Tesseract = mod.default || mod;
    } catch (err) {
      console.warn('Tesseract.js not available. Install with: npm install tesseract.js');
      return {
        fullText: '',
        confidence: 0,
        extractedData: {},
        error: 'OCR library not installed. Install tesseract.js for this feature.',
      };
    }
    
    if (!Tesseract || !Tesseract.createWorker) {
      throw new Error('Tesseract module not properly loaded');
    }
    
    const worker = await Tesseract.createWorker();
    
    // Convert blob to URL if needed
    const source = typeof imageSource === 'string' ? imageSource : URL.createObjectURL(imageSource);
    
    const result = await worker.recognize(source);
    await worker.terminate();
    
    const fullText = result.data.text;
    const confidence = result.data.confidence;
    
    return {
      fullText,
      confidence: confidence / 100,
      extractedData: parseVehicleData(fullText),
    };
  } catch (error) {
    console.error('OCR Error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    // Return partial result with error flag instead of throwing
    return {
      fullText: '',
      confidence: 0,
      extractedData: {},
      error: 'OCR processing failed: ' + errorMsg,
    };
  }
}

/**
 * Parse vehicle data from OCR text
 * Looks for registration numbers, VINs, make, and model
 */
function parseVehicleData(text: string): OcrResult['extractedData'] {
  const data: OcrResult['extractedData'] = {
    otherText: text,
  };

  if (!text) return data;

  const upperText = text.toUpperCase();

  // Registration/License Plate patterns
  // South African format: XXX-123-XX (Irgadgets context)
  // US format: ABC-1234 or ABC1234
  // UK format: XX69 ABC
  const registrationPatterns = [
    /[A-Z]{2,3}[-\s]?\d{1,4}[-\s]?[A-Z]{2,3}/gi, // Generic: ABC 1234 DEF
    /^[A-Z]{2}\d{2}\s?[A-Z]{3}$/gm, // UK: AB12 CDE
    /\d{1,4}[-\s][A-Z]{1,3}[-\s]\d{1}/gi, // Variations
  ];

  for (const pattern of registrationPatterns) {
    const match = text.match(pattern);
    if (match) {
      data.registrationNumber = match[0].toUpperCase().replace(/\s+/g, '-');
      break;
    }
  }

  // VIN pattern (17 alphanumeric characters)
  // VINs never contain I, O, or Q
  const vinMatch = text.match(/\b[A-HJ-NPR-Z0-9]{17}\b/i);
  if (vinMatch) {
    data.vinNumber = vinMatch[0].toUpperCase();
  }

  // Common vehicle make patterns
  const makes = [
    'AUDI', 'BMW', 'MERCEDES', 'PORSCHE', 'VOLKSWAGEN', 'VW',
    'TOYOTA', 'HONDA', 'NISSAN', 'MAZDA', 'HYUNDAI', 'KIA',
    'FORD', 'CHEVROLET', 'DODGE', 'GMC', 'RAM',
    'LEXUS', 'INFINITI', 'ACURA', 'TESLA',
    'JAGUAR', 'LAND ROVER', 'ROVER', 'BENTLEY', 'ROLLS-ROYCE',
    'FIAT', 'ALFA ROMEO', 'LAMBORGHINI', 'FERRARI', 'MASERATI',
    'VOLVO', 'SAAB', 'PEUGEOT', 'CITROËN', 'RENAULT',
    'SUBARU', 'MITSUBISHI', 'DAIHATSU', 'SUZUKI',
  ];

  for (const make of makes) {
    if (upperText.includes(make)) {
      data.vehicleMake = make;
      break;
    }
  }

  // Common model patterns for popular makes
  const modelPatterns: Record<string, RegExp[]> = {
    'AUDI': [/RS\d+|A\d+|Q\d+|TT|R8/gi],
    'BMW': [/\d{3}|M\d+|X\d+|Z\d+/gi],
    'MERCEDES': [/C-CLASS|E-CLASS|S-CLASS|A-CLASS|GLC|GLE|GLS|AMG/gi],
    'PORSCHE': [/911|CAYENNE|MACAN|PANAMERA|TAYCAN/gi],
    'VOLKSWAGEN': [/GOLF|PASSAT|TIGUAN|TOUAREG|JETTA|BEETLE/gi],
    'TOYOTA': [/CAMRY|COROLLA|RAV4|HIGHLANDER|PRIUS|YARIS/gi],
    'HONDA': [/CIVIC|ACCORD|CR-V|PILOT|FIT|HR-V/gi],
    'FORD': [/MUSTANG|F-150|FOCUS|FUSION|ESCAPE|EDGE/gi],
    'TESLA': [/MODEL S|MODEL 3|MODEL X|MODEL Y|ROADSTER/gi],
  };

  if (data.vehicleMake && modelPatterns[data.vehicleMake]) {
    for (const pattern of modelPatterns[data.vehicleMake]) {
      const match = text.match(pattern);
      if (match) {
        data.vehicleModel = match[0].toUpperCase();
        break;
      }
    }
  }

  return data;
}

/**
 * Extract text using Google Vision API (cloud option)
 * Requires API_KEY in environment
 */
export async function extractTextWithGoogleVision(
  imageSource: string | Blob
): Promise<OcrResult> {
  const apiKey = import.meta.env.VITE_GOOGLE_VISION_API_KEY;
  
  if (!apiKey) {
    console.warn('Google Vision API key not configured. Using offline OCR.');
    return extractTextFromImage(imageSource);
  }

  try {
    let base64Image: string;

    if (typeof imageSource === 'string') {
      // If it's already a URL or base64 string
      if (imageSource.startsWith('data:image')) {
        base64Image = imageSource.split(',')[1];
      } else {
        // Convert URL to blob, then to base64
        const response = await fetch(imageSource);
        const blob = await response.blob();
        base64Image = await blobToBase64(blob);
      }
    } else {
      // Convert blob to base64
      base64Image = await blobToBase64(imageSource);
    }

    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotateRequest?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [
            {
              image: { content: base64Image },
              features: [{ type: 'TEXT_DETECTION' }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Google Vision API error');
    }

    const data = await response.json();
    const fullText = data.responses[0]?.fullTextAnnotation?.text || '';

    return {
      fullText,
      confidence: 0.9, // Assume high confidence from cloud API
      extractedData: parseVehicleData(fullText),
    };
  } catch (error) {
    console.warn('Cloud OCR failed, falling back to offline:', error);
    return extractTextFromImage(imageSource);
  }
}

/**
 * Convert blob to base64 string
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // Remove data:image/... prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Process multiple images and merge extracted data
 */
export async function processMultipleImages(
  images: (string | Blob)[],
  useCloudApi = false
): Promise<OcrResult[]> {
  const ocrFn = useCloudApi ? extractTextWithGoogleVision : extractTextFromImage;
  
  return Promise.all(
    images.map((img) => 
      ocrFn(img).catch((error) => ({
        fullText: '',
        confidence: 0,
        extractedData: {},
        error: error.message,
      }))
    )
  );
}

/**
 * Merge multiple OCR results, prioritizing by confidence
 */
export function mergeOcrResults(results: OcrResult[]): OcrResult {
  const merged: OcrResult['extractedData'] = {};
  let totalConfidence = 0;
  let count = 0;

  for (const result of results) {
    if (result.error) continue;
    
    totalConfidence += result.confidence;
    count++;

    // Keep the first found value for each field (highest priority)
    if (!merged.registrationNumber && result.extractedData.registrationNumber) {
      merged.registrationNumber = result.extractedData.registrationNumber;
    }
    if (!merged.vinNumber && result.extractedData.vinNumber) {
      merged.vinNumber = result.extractedData.vinNumber;
    }
    if (!merged.vehicleMake && result.extractedData.vehicleMake) {
      merged.vehicleMake = result.extractedData.vehicleMake;
    }
    if (!merged.vehicleModel && result.extractedData.vehicleModel) {
      merged.vehicleModel = result.extractedData.vehicleModel;
    }
  }

  return {
    fullText: results.map((r) => r.fullText).join('\n'),
    confidence: count > 0 ? totalConfidence / count : 0,
    extractedData: merged,
  };
}
