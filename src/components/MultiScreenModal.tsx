import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface Screen {
  id: string;
  name: string;
  status: 'connected' | 'disconnected';
  lastSeen?: Date;
}

interface MultiScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
}

const MultiScreenModal = ({ isOpen, onClose, sessionId }: MultiScreenModalProps) => {
  const [screens, setScreens] = useState<Screen[]>([]);
  const [newScreenName, setNewScreenName] = useState('');
  const [multiDisplayUrl, setMultiDisplayUrl] = useState('');

  // Generar la URL única para cada pantalla adicional
  useEffect(() => {
    const baseUrl = window.location.origin;
    const displayUrl = `${baseUrl}/display/${sessionId}`;
    setMultiDisplayUrl(displayUrl);
  }, [sessionId]);

  // Simular la detección de pantallas activas
  useEffect(() => {
    if (isOpen) {
      // Simular pantallas conectadas (en una implementación real, esto vendría de un servidor o WebRTC)
      const mockScreens: Screen[] = [
        { id: '1', name: 'Teleprompter Principal', status: 'connected', lastSeen: new Date() },
      ];
      setScreens(mockScreens);
    }
  }, [isOpen]);

  // Manejar la adición de una nueva pantalla
  const handleAddScreen = () => {
    if (newScreenName.trim() === '') return;

    const newScreen: Screen = {
      id: Date.now().toString(),
      name: newScreenName,
      status: 'disconnected'
    };

    setScreens(prev => [...prev, newScreen]);
    setNewScreenName('');
  };

  // Manejar la eliminación de una pantalla
  const handleRemoveScreen = (id: string) => {
    setScreens(prev => prev.filter(screen => screen.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4">
      <div className="bg-zinc-900 rounded-lg shadow-xl w-full max-w-2xl p-6 border border-zinc-700 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-xl font-semibold text-white">Teleprompter en Múltiples Pantallas</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-zinc-800 p-4 rounded-lg mb-4">
            <div className="flex items-start">
              <div className="text-blue-400 mr-3 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-zinc-300 text-sm">
                <strong>Importante:</strong> Esta función sincroniza múltiples instancias del teleprompter externo. Primero debes abrir el teleprompter haciendo clic en el botón de ojo en la barra de herramientas.
              </p>
            </div>
          </div>

          <p className="text-zinc-300 mb-4">
            Añade y administra múltiples pantallas de teleprompter. Todas las pantallas mostrarán el mismo contenido sincronizado que aparece en tu teleprompter principal.
          </p>

          <div className="bg-zinc-800 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-medium text-white mb-3">Añadir Nueva Pantalla</h3>
            <div className="flex">
              <input
                type="text"
                value={newScreenName}
                onChange={(e) => setNewScreenName(e.target.value)}
                placeholder="Nombre de la pantalla (ej: Monitor Presentador)"
                className="flex-1 bg-zinc-700 text-white border border-zinc-600 rounded-l p-2 text-sm"
              />
              <button
                onClick={handleAddScreen}
                disabled={newScreenName.trim() === ''}
                className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 transition-colors disabled:bg-zinc-600 disabled:cursor-not-allowed text-sm"
              >
                Añadir
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-base font-medium text-white mb-3">Pantallas Conectadas</h3>
              {screens.length === 0 ? (
                <p className="text-zinc-400 text-sm">No hay pantallas configuradas.</p>
              ) : (
                <ul className="space-y-2">
                  {screens.map((screen) => (
                    <li
                      key={screen.id}
                      className="bg-zinc-800 p-3 rounded flex justify-between items-center"
                    >
                      <div>
                        <span className="text-white text-sm">{screen.name}</span>
                        <div className="flex items-center mt-1">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              screen.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
                            }`}
                          ></div>
                          <span className="text-xs text-zinc-400 ml-1">
                            {screen.status === 'connected' ? 'Conectada' : 'Desconectada'}
                          </span>
                        </div>
                      </div>
                      {screen.id !== '1' && (
                        <button
                          onClick={() => handleRemoveScreen(screen.id)}
                          className="text-zinc-400 hover:text-white"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h3 className="text-base font-medium text-white mb-3">Conectar Nueva Pantalla</h3>
              <div className="flex flex-col items-center bg-white p-3 rounded-lg mb-2">
                <QRCodeSVG
                  value={multiDisplayUrl}
                  size={150}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <input
                type="text"
                value={multiDisplayUrl}
                readOnly
                className="w-full bg-zinc-800 text-zinc-400 border border-zinc-700 rounded p-2 text-sm font-mono"
              />
              <p className="text-zinc-400 text-xs mt-1">
                Escanea este código con un dispositivo para añadirlo como pantalla de teleprompter.
              </p>
            </div>
          </div>

          <div className="bg-zinc-800 p-4 rounded-lg">
            <h3 className="text-base font-medium text-white mb-2">Instrucciones</h3>
            <ol className="list-decimal text-zinc-300 text-sm ml-5 space-y-1">
              <li>Primero abre el teleprompter principal con el botón de ojo en la barra de herramientas.</li>
              <li>Añade un nombre para cada pantalla adicional que desees usar.</li>
              <li>Abre la URL o escanea el código QR en cada dispositivo adicional.</li>
              <li>Todos los dispositivos mostrarán el mismo contenido que el teleprompter principal.</li>
              <li>Los cambios en la configuración visual (tamaño, color, etc.) se aplicarán a todas las pantallas.</li>
            </ol>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-zinc-700 text-white rounded hover:bg-zinc-600 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default MultiScreenModal;
