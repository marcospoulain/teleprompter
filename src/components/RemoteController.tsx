import React, { useState, useEffect } from 'react';

interface RemoteControllerProps {
  sessionId: string;
}

const RemoteController = ({ sessionId }: RemoteControllerProps) => {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speed, setSpeed] = useState(1.0);

  // Simular conexión WebSocket/WebRTC para comunicación entre dispositivos
  useEffect(() => {
    // En una implementación real, aquí se establecería una conexión WebSocket o WebRTC
    const simulateConnection = setTimeout(() => {
      console.log(`Connecting to session: ${sessionId}`);
      setConnected(true);
    }, 1500);

    return () => clearTimeout(simulateConnection);
  }, [sessionId]);

  // Función para enviar comandos al teleprompter principal
  const sendCommand = (command: string, value?: any) => {
    if (!connected) {
      setError('No se pudo enviar el comando: desconectado');
      return;
    }

    console.log(`Sending command: ${command}`, value);
    // En una implementación real, aquí se enviaría el comando a través de la conexión establecida
    // Por ejemplo: socket.emit('command', { type: command, value });

    // Simular respuesta exitosa
    setError(null);
  };

  const handlePlayPause = () => {
    sendCommand('togglePlayPause');
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    sendCommand('setSpeed', newSpeed);
  };

  const handleScroll = (direction: 'up' | 'down') => {
    sendCommand('scroll', direction);
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-900 text-white font-['Montserrat']">
      <header className="bg-black p-4 border-b border-zinc-800">
        <h1 className="text-xl font-semibold">Control Remoto - Teleprompter</h1>
        <div className="mt-1 flex items-center">
          <div className={`h-2 w-2 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-zinc-400">
            {connected ? 'Conectado' : 'Conectando...'}
          </span>
        </div>
      </header>

      <main className="flex-1 p-4 overflow-y-auto">
        {error && (
          <div className="bg-red-900 text-white p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="bg-zinc-800 rounded-lg p-5 mb-5">
          <h2 className="text-lg font-medium mb-4">Control Básico</h2>
          <div className="flex justify-center mb-6">
            <button
              onClick={handlePlayPause}
              className="bg-blue-600 hover:bg-blue-700 text-white w-24 h-24 rounded-full flex items-center justify-center shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => handleScroll('up')}
              className="bg-zinc-700 hover:bg-zinc-600 p-4 rounded flex flex-col items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <span className="mt-1 text-sm">Subir</span>
            </button>
            <button
              onClick={() => handleScroll('down')}
              className="bg-zinc-700 hover:bg-zinc-600 p-4 rounded flex flex-col items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              <span className="mt-1 text-sm">Bajar</span>
            </button>
            <button
              onClick={() => sendCommand('clear')}
              className="bg-zinc-700 hover:bg-zinc-600 p-4 rounded flex flex-col items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="mt-1 text-sm">Limpiar</span>
            </button>
          </div>
        </div>

        <div className="bg-zinc-800 rounded-lg p-5 mb-5">
          <h2 className="text-lg font-medium mb-4">Velocidad</h2>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Más lento</span>
            <span className="text-sm text-zinc-400">Más rápido</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.1"
            value={speed}
            onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="mt-2 text-center">
            <span className="text-lg font-semibold">{speed.toFixed(1)}x</span>
          </div>
        </div>

        <div className="bg-zinc-800 rounded-lg p-5">
          <h2 className="text-lg font-medium mb-4">Ajustes Rápidos</h2>
          <div className="space-y-3">
            <button
              onClick={() => sendCommand('toggleMirror')}
              className="w-full bg-zinc-700 hover:bg-zinc-600 p-3 rounded text-left flex justify-between items-center"
            >
              <span>Activar/Desactivar Espejo</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={() => sendCommand('toggleFullscreen')}
              className="w-full bg-zinc-700 hover:bg-zinc-600 p-3 rounded text-left flex justify-between items-center"
            >
              <span>Pantalla Completa</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 011.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 011.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={() => sendCommand('increaseFontSize')}
              className="w-full bg-zinc-700 hover:bg-zinc-600 p-3 rounded text-left flex justify-between items-center"
            >
              <span>Aumentar Tamaño de Texto</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={() => sendCommand('decreaseFontSize')}
              className="w-full bg-zinc-700 hover:bg-zinc-600 p-3 rounded text-left flex justify-between items-center"
            >
              <span>Disminuir Tamaño de Texto</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </main>

      <footer className="bg-black p-3 text-center text-sm text-zinc-500 border-t border-zinc-800">
        Teleprompter for LiveStreaming - Control Remoto
      </footer>
    </div>
  );
};

export default RemoteController;
