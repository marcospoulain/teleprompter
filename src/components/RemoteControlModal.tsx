import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface RemoteControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
}

const RemoteControlModal = ({ isOpen, onClose, sessionId }: RemoteControlModalProps) => {
  const [remoteControlUrl, setRemoteControlUrl] = useState<string>('');

  useEffect(() => {
    // Generar URL única para control remoto basada en el ID de sesión
    // En producción, esto sería una URL real de tu dominio
    const baseUrl = window.location.origin;
    const controlUrl = `${baseUrl}/remote/${sessionId}`;
    setRemoteControlUrl(controlUrl);
  }, [sessionId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="bg-zinc-900 rounded-lg shadow-xl w-full max-w-md p-6 border border-zinc-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Control Remoto</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="text-zinc-300 mb-4">
          <p className="mb-3">Escanea este código QR con tu smartphone para controlar el teleprompter de forma remota.</p>
          <div className="flex flex-col items-center bg-white p-4 rounded-lg mb-4">
            <QRCodeSVG
              value={remoteControlUrl}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>
          <div className="bg-zinc-800 p-3 rounded text-sm font-mono break-all">
            {remoteControlUrl}
          </div>
        </div>

        <div className="text-zinc-400 text-sm">
          <h3 className="font-medium mb-1">Instrucciones:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Escanea el código QR con la cámara de tu smartphone</li>
            <li>Abre la URL en tu navegador móvil</li>
            <li>No cierres esta ventana mientras uses el control remoto</li>
            <li>El control sólo funciona mientras estés en la misma red WiFi</li>
          </ul>
        </div>

        <div className="mt-6 flex justify-end">
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

export default RemoteControlModal;
