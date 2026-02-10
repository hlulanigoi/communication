import { useState, useCallback } from 'react';
import { extractTextFromImage, extractTextWithGoogleVision, mergeOcrResults, type OcrResult } from '@/lib/ocrService';
import { toast } from 'sonner';

interface UseOcrOptions {
  useCloudApi?: boolean;
  autoExtract?: boolean;
}

export function useOcr(options: UseOcrOptions = {}) {
  const { useCloudApi = false, autoExtract = true } = options;
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<OcrResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Process a single image with OCR
   */
  const processImage = useCallback(
    async (image: string | Blob) => {
      setIsProcessing(true);
      setError(null);
      
      try {
        const ocrFn = useCloudApi ? extractTextWithGoogleVision : extractTextFromImage;
        const result = await ocrFn(image);
        
        setResults(result);
        
        if (autoExtract && result.extractedData) {
          const count = Object.values(result.extractedData).filter(Boolean).length;
          if (count > 0) {
            toast.success(`📸 Found ${count} vehicle detail(s)`, {
              description: result.extractedData.registrationNumber 
                ? `Registration: ${result.extractedData.registrationNumber}`
                : 'Processing image data...'
            });
          }
        }
        
        return result;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to process image';
        setError(errorMsg);
        toast.error('OCR Error', { description: errorMsg });
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [useCloudApi, autoExtract]
  );

  /**
   * Process multiple images and merge results
   */
  const processImages = useCallback(
    async (images: (string | Blob)[]) => {
      if (images.length === 0) return null;
      
      setIsProcessing(true);
      setError(null);
      
      try {
        const ocrFn = useCloudApi ? extractTextWithGoogleVision : extractTextFromImage;
        const ocrResults = await Promise.all(
          images.map((img) => 
            ocrFn(img).catch((err) => ({
              fullText: '',
              confidence: 0,
              extractedData: {},
              error: err instanceof Error ? err.message : 'Unknown error',
            }))
          )
        );
        
        const merged = mergeOcrResults(ocrResults);
        setResults(merged);
        
        if (autoExtract && merged.extractedData) {
          const extracted = Object.entries(merged.extractedData)
            .filter(([, v]) => v && v !== merged.extractedData.otherText)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ');
          
          if (extracted) {
            toast.success('📸 Vehicle data extracted', {
              description: extracted.substring(0, 150) + (extracted.length > 150 ? '...' : ''),
            });
          }
        }
        
        return merged;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to process images';
        setError(errorMsg);
        toast.error('OCR Error', { description: errorMsg });
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [useCloudApi, autoExtract]
  );

  /**
   * Reset OCR state
   */
  const reset = useCallback(() => {
    setResults(null);
    setError(null);
  }, []);

  return {
    isProcessing,
    results,
    error,
    processImage,
    processImages,
    reset,
    extractedData: results?.extractedData || {},
  };
}
