import { useState, useCallback, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import useSpeechRecognition from './hooks/useSpeechRecognition';
import SettingsModal from './components/SettingsModal';
import TeleprompterController from './components/TeleprompterController';
import ExportTranscriptModal from './components/ExportTranscriptModal';
import EditTranscriptModal from './components/EditTranscriptModal';
import TeleprompterWindow from './components/TeleprompterWindow';
import RemoteControlModal from './components/RemoteControlModal';
import VisualSettingsModal from './components/VisualSettingsModal';
import MultiScreenModal from './components/MultiScreenModal';

// Definimos el tipo para las configuraciones visuales
interface VisualSettings {
  chromaKey: string;
  fontFamily: string;
  textColor: string;
  position: string;
  showWordCount: boolean;
  showTimer: boolean;
  accessibilityMode: string;
}

function App() {
  const [language, setLanguage] = useState('Español');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRemoteControlOpen, setIsRemoteControlOpen] = useState(false);
  const [isVisualSettingsOpen, setIsVisualSettingsOpen] = useState(false);
  const [isMultiScreenOpen, setIsMultiScreenOpen] = useState(false);
  const [fontSize, setFontSize] = useState(42);
  const [darkMode, setDarkMode] = useState(true);
  const [sessionId] = useState(() => uuidv4()); // Generar un ID de sesión único
  const [wordCount, setWordCount] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerDisplay, setTimerDisplay] = useState('00:00:00');
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);

  // Configuración visual para el teleprompter
  const [visualSettings, setVisualSettings] = useState<VisualSettings>({
    chromaKey: '#000000',
    fontFamily: '"Montserrat", sans-serif',
    textColor: '#FFFFFF',
    position: 'center',
    showWordCount: false,
    showTimer: false,
    accessibilityMode: 'default'
  });

  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    clearTranscript,
    setTranscript
  } = useSpeechRecognition({
    language,
    onInterim: (text) => {
      if (transcriptContainerRef.current) {
        setTimeout(() => {
          if (transcriptContainerRef.current) {
            transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
          }
        }, 10);
      }
    },
    onResult: (text) => {
      if (transcriptContainerRef.current) {
        setTimeout(() => {
          if (transcriptContainerRef.current) {
            transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
          }
        }, 10);
      }
    },
    onError: (error) => {
      console.error('Speech recognition error:', error);
    }
  });

  // Actualizar el contador de palabras cuando cambia el transcript
  useEffect(() => {
    const words = transcript.join(' ').split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(words);
  }, [transcript]);

  // Función para formatear el tiempo del temporizador
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
      .map(val => val.toString().padStart(2, '0'))
      .join(':');
  };

  // Iniciar o detener el temporizador
  useEffect(() => {
    if (isListening && !timerActive) {
      setTimerActive(true);
      startTimeRef.current = Date.now();

      timerRef.current = window.setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Date.now() - startTimeRef.current;
          setTimerDisplay(formatTime(elapsed));
        }
      }, 1000);
    } else if (!isListening && timerActive) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setTimerActive(false);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isListening, timerActive]);

  const handleLanguageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  }, []);

  const handleSaveEditedTranscript = useCallback((editedTranscript: string[]) => {
    setTranscript(editedTranscript);

    try {
      localStorage.setItem('teleprompter-transcript', JSON.stringify({
        transcript: editedTranscript,
        timestamp: new Date().toISOString()
      }));
    } catch (e) {
      console.error('Error saving edited transcript to local storage:', e);
    }
  }, [setTranscript]);

  const handleDownloadTranscript = useCallback(() => {
    if (transcript.length === 0) return;

    const text = transcript.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [transcript]);

  const toggleSettings = useCallback(() => {
    setIsSettingsOpen(prev => !prev);
  }, []);

  const toggleExport = useCallback(() => {
    setIsExportOpen(prev => !prev);
  }, []);

  const toggleEdit = useCallback(() => {
    setIsEditOpen(prev => !prev);
  }, []);

  const toggleRemoteControl = useCallback(() => {
    setIsRemoteControlOpen(prev => !prev);
  }, []);

  const toggleVisualSettings = useCallback(() => {
    setIsVisualSettingsOpen(prev => !prev);
  }, []);

  const toggleMultiScreen = useCallback(() => {
    setIsMultiScreenOpen(prev => !prev);
  }, []);

  // Corregido con tipo explícito
  const handleUpdateVisualSettings = useCallback((newSettings: VisualSettings) => {
    setVisualSettings(newSettings);
    // En una implementación real, aquí enviaríamos los ajustes a las ventanas del teleprompter
    console.log('Visual settings updated:', newSettings);
  }, []);

  useEffect(() => {
    document.title = isListening ? 'Teleprompter for LiveStreaming (Recording...)' : 'Teleprompter for LiveStreaming';
  }, [isListening]);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const getListeningStatusText = () => {
    if (isListening) {
      if (language === 'Español') return 'Escuchando...';
      if (language === 'Português') return 'Ouvindo...';
      return 'Listening...';
    } else {
      if (language === 'Español') return 'Micrófono apagado';
      if (language === 'Português') return 'Microfone desligado';
      return 'Microphone off';
    }
  };

  const getPlaceholderText = () => {
    if (language === 'Español') return 'Haz clic en el botón del micrófono para empezar a subtitular';
    if (language === 'Português') return 'Clique no botão do microfone para começar a legendar';
    return 'Click the microphone button below to start captioning';
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white font-['Montserrat']">
      <header className="bg-black p-4 flex justify-between items-center border-b border-zinc-800">
        <div className="flex items-center space-x-2">
          <svg
            className="h-6 w-6 text-blue-500"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
          </svg>
          <h1 className="text-xl font-semibold">Teleprompter for LiveStreaming</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <select
              className="bg-zinc-900 text-white border border-zinc-700 rounded p-1 text-sm"
              title="Select language"
              onChange={handleLanguageChange}
              value={language}
            >
              <option value="Español">Español</option>
              <option value="English">English</option>
              <option value="Português">Português</option>
            </select>
          </div>

          <TeleprompterController
            transcript={transcript}
            interimTranscript={interimTranscript}
            isListening={isListening}
            darkMode={darkMode}
            fontSize={fontSize}
            onClearTranscript={clearTranscript}
            onSetDarkMode={setDarkMode}
            onSetFontSize={setFontSize}
          />

          <TeleprompterWindow
            transcript={transcript}
            interimTranscript={interimTranscript}
            isListening={isListening}
            fontSize={fontSize}
            onSetFontSize={setFontSize}
          />

          {/* Nuevos botones para las características añadidas */}
          <button
            onClick={toggleRemoteControl}
            className="p-2 rounded-full hover:bg-zinc-800 transition-colors"
            title="Control Remoto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </button>

          <button
            onClick={toggleVisualSettings}
            className="p-2 rounded-full hover:bg-zinc-800 transition-colors"
            title="Configuración Visual"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </button>

          <button
            onClick={toggleMultiScreen}
            className="p-2 rounded-full hover:bg-zinc-800 transition-colors"
            title="Múltiples Pantallas"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </button>

          <button
            className="p-2 rounded-full hover:bg-zinc-800 transition-colors"
            title="Settings"
            onClick={toggleSettings}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </button>

          <button
            className={`p-2 rounded-full transition-colors ${
              transcript.length === 0
                ? 'text-zinc-600 cursor-not-allowed'
                : 'hover:bg-zinc-800 cursor-pointer'
            }`}
            title="Edit Transcript"
            disabled={transcript.length === 0}
            onClick={toggleEdit}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>

          <button
            className={`p-2 rounded-full transition-colors ${
              transcript.length === 0
                ? 'text-zinc-600 cursor-not-allowed'
                : 'hover:bg-zinc-800 cursor-pointer'
            }`}
            title="Download Transcript (TXT)"
            disabled={transcript.length === 0}
            onClick={handleDownloadTranscript}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          <button
            className={`p-2 rounded-full transition-colors ${
              transcript.length === 0
                ? 'text-zinc-600 cursor-not-allowed'
                : 'hover:bg-zinc-800 cursor-pointer'
            }`}
            title="Export Transcript (Multiple Formats)"
            disabled={transcript.length === 0}
            onClick={toggleExport}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          </button>

          <button
            className={`p-2 rounded-full transition-colors ${
              transcript.length === 0
                ? 'text-zinc-600 cursor-not-allowed'
                : 'hover:bg-zinc-800 cursor-pointer'
            }`}
            title="Clear transcript"
            disabled={transcript.length === 0}
            onClick={clearTranscript}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col bg-black">
        <div className="bg-zinc-900 px-4 py-2 text-sm flex justify-between items-center border-b border-zinc-800">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-zinc-400">
                {language === 'Español' ? 'Idioma actual:' :
                 language === 'Português' ? 'Idioma atual:' :
                 'Current language:'}
              </span>
              <span className="font-medium">{language}</span>
            </div>

            {/* Contador de palabras */}
            {visualSettings.showWordCount && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-zinc-800 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7 4a1 1 0 01.94.658L10 12l2.06-7.342a1 1 0 011.88 0L16 12l-2.12-7.342a1 1 0 01.88-1.316 1 1 0 011.072.658l2.096 7.342A1 1 0 0117 12.342V17a1 1 0 01-1 1H4a1 1 0 01-1-1v-4.658a1 1 0 01.928-.684L6 5.658A1 1 0 017 5v-.342z" />
                </svg>
                <span className="text-zinc-300 text-xs">{wordCount} palabras</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Temporizador */}
            {visualSettings.showTimer && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-zinc-800 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span className="text-zinc-300 text-xs font-mono">{timerDisplay}</span>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <span className="text-zinc-400">
                {getListeningStatusText()}
              </span>
              <div className={`h-2 w-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-zinc-600'}`}></div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-full flex-1 overflow-hidden">
            <div
              ref={transcriptContainerRef}
              className="h-full p-6 overflow-y-auto relative"
              style={{
                fontSize: `${fontSize}px`,
                fontFamily: visualSettings.fontFamily,
                color: visualSettings.textColor,
                backgroundColor: visualSettings.chromaKey
              }}
            >
              {transcript.length === 0 && !isListening && !interimTranscript ? (
                <div className="text-zinc-500 text-center mt-20">
                  {getPlaceholderText()}
                </div>
              ) : (
                <div>
                  {transcript.map((text, index) => (
                    <div key={index} className="mb-8 leading-tight group">
                      {text}
                      <button
                        onClick={toggleEdit}
                        className="opacity-0 group-hover:opacity-100 inline-block ml-2 align-middle bg-zinc-800 p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all"
                        style={{ fontSize: '14px' }}
                        title="Editar transcripción"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  {interimTranscript && (
                    <div className="text-zinc-400 italic leading-tight">{interimTranscript}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <div className="flex justify-center py-6">
        <button
          onClick={isListening ? stopListening : startListening}
          className={`rounded-full p-5 ${
            isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
          } transition-colors`}
          aria-label={isListening ? 'Stop captioning' : 'Start captioning'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <footer className="bg-zinc-900 p-3 text-center text-sm text-zinc-500 border-t border-zinc-800">
        <p>Teleprompter for LiveStreaming uses your browser's speech recognition feature. Works best in Chrome.</p>
      </footer>

      {/* Modales */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={toggleSettings}
        fontSize={fontSize}
        setFontSize={setFontSize}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <ExportTranscriptModal
        isOpen={isExportOpen}
        onClose={toggleExport}
        transcript={transcript}
      />

      <EditTranscriptModal
        isOpen={isEditOpen}
        onClose={toggleEdit}
        transcript={transcript}
        onSave={handleSaveEditedTranscript}
      />

      {/* Nuevos modales */}
      <RemoteControlModal
        isOpen={isRemoteControlOpen}
        onClose={toggleRemoteControl}
        sessionId={sessionId}
      />

      <VisualSettingsModal
        isOpen={isVisualSettingsOpen}
        onClose={toggleVisualSettings}
        visualSettings={visualSettings}
        onUpdateSettings={handleUpdateVisualSettings}
      />

      <MultiScreenModal
        isOpen={isMultiScreenOpen}
        onClose={toggleMultiScreen}
        sessionId={sessionId}
      />
    </div>
  );
}

export default App;
