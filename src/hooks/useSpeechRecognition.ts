import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface UseSpeechRecognitionProps {
  onResult?: (text: string) => void;
  onInterim?: (text: string) => void;
  onError?: (error: string) => void;
  language?: string;
}

// Define proper types for the speech recognition events
interface SpeechRecognitionResultItem {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionResultItem;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResult[];
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

// Type for the SpeechRecognition API which is not fully typed in TypeScript
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onaudioend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onnomatch: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognition;

// Define the browser's SpeechRecognition API
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

// Languages supported by the app
type SupportedLanguage = 'English' | 'Español' | 'Português';

const useSpeechRecognition = ({
  onResult,
  onInterim,
  onError,
  language = 'Español'
}: UseSpeechRecognitionProps = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Load saved transcript from local storage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('web-captioner-transcript');
      if (savedData) {
        const { transcript: savedTranscript } = JSON.parse(savedData);
        if (savedTranscript && Array.isArray(savedTranscript) && savedTranscript.length > 0) {
          console.log('Loaded saved transcript from local storage:', savedTranscript.length, 'lines');
          setTranscript(savedTranscript);
        }
      }
    } catch (e) {
      console.error('Error loading transcript from local storage:', e);
    }
  }, []);

  // Map language display names to BCP 47 language codes using useMemo
  const languageMap = useMemo(() => ({
    'English': 'en-US',
    'Español': 'es-ES',
    'Português': 'pt-BR'
  }), []);

  // Start the speech recognition
  const startListening = useCallback(() => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      if (onError) onError('El reconocimiento de voz no está soportado en este navegador.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;

    recognition.continuous = true;
    recognition.interimResults = true;

    // Set the language based on the languageMap or fallback to the provided language
    if (language in languageMap) {
      recognition.lang = languageMap[language as SupportedLanguage];
      console.log(`Setting speech recognition language to: ${recognition.lang} (${language})`);
    } else {
      recognition.lang = language;
      console.log(`Using custom language code: ${language}`);
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let currentInterimTranscript = '';

      const resultLength = event.results.length;
      for (let i = event.resultIndex; i < resultLength; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;

        if (result.isFinal) {
          finalTranscript += transcript;
        } else {
          currentInterimTranscript += transcript;
        }
      }

      // Update interim transcript for real-time display
      if (currentInterimTranscript) {
        setInterimTranscript(currentInterimTranscript);
        if (onInterim) onInterim(currentInterimTranscript);
      }

      // Add final transcript to the history
      if (finalTranscript) {
        setTranscript(prev => {
          const newTranscript = [...prev, finalTranscript];

          // Save to local storage for persistence
          try {
            localStorage.setItem('web-captioner-transcript', JSON.stringify({
              transcript: newTranscript,
              interim: currentInterimTranscript,
              timestamp: new Date().toISOString()
            }));
          } catch (e) {
            console.error('Error saving transcript to local storage:', e);
          }

          return newTranscript;
        });
        setInterimTranscript('');
        if (onResult) onResult(finalTranscript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (onError) {
        const errorMsg = event.error || 'Error desconocido de reconocimiento de voz';
        console.error('Speech recognition error:', errorMsg);
        onError(errorMsg);
      }
    };

    recognition.onend = () => {
      console.log('Speech recognition service disconnected');
      if (isListening) {
        console.log('Restarting speech recognition');
        recognition.start();
      }
    };

    try {
      recognition.start();
      console.log('Speech recognition started');
      setIsListening(true);
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      if (onError) onError('No se pudo iniciar el reconocimiento de voz. Intente nuevamente.');
    }
  }, [language, onResult, onInterim, onError, isListening, languageMap]);

  // Stop the speech recognition
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      console.log('Speech recognition stopped');
      setIsListening(false);
      setInterimTranscript('');
    }
  }, []);

  // Clear the transcript
  const clearTranscript = useCallback(() => {
    console.log('Transcript cleared');
    setTranscript([]);
    setInterimTranscript('');

    // Also clear local storage
    try {
      localStorage.removeItem('web-captioner-transcript');
    } catch (e) {
      console.error('Error clearing transcript from local storage:', e);
    }
  }, []);

  // Manual setter for transcript (for editing)
  const setTranscriptManually = useCallback((newTranscript: string[]) => {
    setTranscript(newTranscript);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        console.log('Speech recognition cleaned up on unmount');
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    clearTranscript,
    setTranscript: setTranscriptManually
  };
};

export default useSpeechRecognition;
