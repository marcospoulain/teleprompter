import { useEffect, useRef, useState } from 'react';

interface TeleprompterControllerProps {
  transcript: string[];
  interimTranscript: string;
  isListening: boolean;
  darkMode: boolean;
  fontSize: number;
  onClearTranscript: () => void;
  onSetDarkMode: (isDarkMode: boolean) => void;
  onSetFontSize: (fontSize: number) => void;
}

const TeleprompterController = ({
  transcript,
  interimTranscript,
  isListening,
  darkMode,
  fontSize,
  onClearTranscript,
  onSetDarkMode,
  onSetFontSize
}: TeleprompterControllerProps) => {
  const [lastSavedTranscript, setLastSavedTranscript] = useState<string[]>([]);

  // Load saved transcript from local storage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('web-captioner-transcript');
      if (savedData) {
        const { transcript } = JSON.parse(savedData);
        if (transcript && Array.isArray(transcript) && transcript.length > 0) {
          console.log('Loaded saved transcript from local storage:', transcript.length, 'lines');
          setLastSavedTranscript(transcript);
        }
      }
    } catch (e) {
      console.error('Error loading transcript from local storage:', e);
    }
  }, []);

  // Save transcript to local storage when it changes
  useEffect(() => {
    // Save transcript in local storage periodically when it changes
    if (transcript.length > 0 && JSON.stringify(transcript) !== JSON.stringify(lastSavedTranscript)) {
      localStorage.setItem('web-captioner-transcript', JSON.stringify({
        transcript,
        interim: interimTranscript,
        timestamp: new Date().toISOString()
      }));
      setLastSavedTranscript(transcript);
      console.log('Auto-saved transcript');
    }
  }, [transcript, interimTranscript, lastSavedTranscript]);

  // This component now doesn't render anything visually
  return null;
};

export default TeleprompterController;
