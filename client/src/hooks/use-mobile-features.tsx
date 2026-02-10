import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

export interface CameraOptions {
  facingMode?: 'user' | 'environment';
  maxWidth?: number;
  maxHeight?: number;
}

export function useCamera(options: CameraOptions = {}) {
  const { facingMode = 'environment', maxWidth = 1280, maxHeight = 720 } = options;
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const constraints = {
        video: {
          facingMode,
          width: { max: maxWidth },
          height: { max: maxHeight },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsActive(true);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to access camera';
      setError(errorMsg);
      toast.error(`Camera error: ${errorMsg}`);
      setIsActive(false);
    }
  }, [facingMode, maxHeight, maxWidth]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsActive(false);
  }, []);

  const capturePhoto = useCallback(async (): Promise<string | null> => {
    if (!videoRef.current || !canvasRef.current) return null;

    try {
      const context = canvasRef.current.getContext('2d');
      if (!context) return null;

      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;

      context.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.85);

      setPhotos((prev) => [...prev, dataUrl]);
      toast.success('Photo captured');
      return dataUrl;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to capture photo';
      setError(errorMsg);
      toast.error(errorMsg);
      return null;
    }
  }, []);

  const switchCamera = useCallback(async () => {
    stopCamera();
    const newFacingMode = facingMode === 'environment' ? 'user' : 'environment';
    await new Promise((resolve) => setTimeout(resolve, 100));
    await startCamera();
  }, [facingMode, startCamera, stopCamera]);

  const removePhoto = useCallback((index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearPhotos = useCallback(() => {
    setPhotos([]);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    canvasRef,
    isActive,
    error,
    photos,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
    removePhoto,
    clearPhotos,
  };
}

export function useVoiceRecorder() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordings((prev) => [...prev, audioUrl]);
        toast.success('Recording saved');
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to start recording';
      setError(errorMsg);
      toast.error(`Audio error: ${errorMsg}`);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const removeRecording = useCallback((index: number) => {
    setRecordings((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearRecordings = useCallback(() => {
    setRecordings([]);
  }, []);

  return {
    isRecording,
    recordings,
    error,
    startRecording,
    stopRecording,
    removeRecording,
    clearRecordings,
  };
}

export function useLocation() {
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    return new Promise<GeolocationCoordinates | null>((resolve) => {
      if (!navigator.geolocation) {
        const msg = 'Geolocation not supported';
        setError(msg);
        toast.error(msg);
        setIsLoading(false);
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(position.coords);
          toast.success('Location captured');
          setIsLoading(false);
          resolve(position.coords);
        },
        (err) => {
          const msg = `Location error: ${err.message}`;
          setError(msg);
          toast.error(msg);
          setIsLoading(false);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }, []);

  return {
    location,
    error,
    isLoading,
    getLocation,
  };
}

export function useVoiceCommands(onCommand?: (command: string) => void) {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          const command = transcript.toLowerCase().trim();
          setTranscript(command);
          onCommand?.(command);
          toast.success(`Command: ${command}`);
        } else {
          interimTranscript += transcript;
        }
      }
    };

    recognition.onerror = (event) => {
      const errorMsg = `Speech error: ${event.error}`;
      setError(errorMsg);
      toast.error(errorMsg);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return () => {
      recognition.abort();
    };
  }, [onCommand]);

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      setTranscript('');
      recognitionRef.current.start();
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
  };
}
