import React, { useState } from 'react';

const CHROMA_COLORS = [
  { name: 'Negro', value: '#000000' },
  { name: 'Verde', value: '#00B140' },
  { name: 'Azul', value: '#0047AB' },
  { name: 'Rojo', value: '#C41E3A' }
];

const FONT_OPTIONS = [
  { name: 'Montserrat', value: '"Montserrat", sans-serif' },
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Roboto', value: '"Roboto", sans-serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Courier', value: '"Courier New", monospace' }
];

const TEXT_COLORS = [
  { name: 'Blanco', value: '#FFFFFF' },
  { name: 'Amarillo', value: '#FFD700' },
  { name: 'Verde claro', value: '#90EE90' },
  { name: 'Celeste', value: '#87CEEB' },
  { name: 'Rosa', value: '#FFB6C1' }
];

const POSITIONS = [
  { name: 'Centro', value: 'center' },
  { name: 'Superior', value: 'top' },
  { name: 'Inferior', value: 'bottom' },
  { name: 'Izquierda', value: 'left' },
  { name: 'Derecha', value: 'right' }
];

interface VisualSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  visualSettings: {
    chromaKey: string;
    fontFamily: string;
    textColor: string;
    position: string;
    showWordCount: boolean;
    showTimer: boolean;
    accessibilityMode: string;
  };
  onUpdateSettings: (settings: any) => void;
}

const VisualSettingsModal = ({
  isOpen,
  onClose,
  visualSettings,
  onUpdateSettings
}: VisualSettingsModalProps) => {
  const [settings, setSettings] = useState({ ...visualSettings });

  const handleChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onUpdateSettings(settings);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4">
      <div className="bg-zinc-900 rounded-lg shadow-xl w-full max-w-2xl p-4 sm:p-6 border border-zinc-700 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sm:mb-6 sticky top-0 bg-zinc-900 py-2 z-10">
          <h2 className="text-lg sm:text-xl font-semibold text-white">Configuración Visual</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {/* Modo Chroma Key */}
          <div className="mb-6 md:mb-0">
            <h3 className="text-base sm:text-lg font-medium text-white mb-3">Modo Chroma Key</h3>
            <div className="space-y-2">
              <p className="text-zinc-400 text-xs sm:text-sm">
                Selecciona un color de fondo para uso con chroma key en software de streaming.
              </p>
              <div className="grid grid-cols-4 gap-2">
                {CHROMA_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleChange('chromaKey', color.value)}
                    className={`h-10 sm:h-12 rounded-md border-2 ${
                      settings.chromaKey === color.value
                        ? 'border-blue-500'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
              <div className="bg-zinc-800 p-2 sm:p-3 rounded text-xs sm:text-sm mt-2">
                <p className="text-zinc-300">
                  <strong>Consejo:</strong> El modo chroma key permite que solo el texto sea visible en software como OBS Studio.
                </p>
              </div>
            </div>
          </div>

          {/* Fuentes y Colores */}
          <div className="mb-6 md:mb-0">
            <h3 className="text-base sm:text-lg font-medium text-white mb-3">Tipografía y Color</h3>
            <div className="space-y-3">
              <div>
                <label className="text-zinc-300 block mb-1 text-sm">Fuente</label>
                <select
                  value={settings.fontFamily}
                  onChange={(e) => handleChange('fontFamily', e.target.value)}
                  className="w-full bg-zinc-800 text-white border border-zinc-700 rounded p-2 text-sm"
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-zinc-300 block mb-1 text-sm">Color del texto</label>
                <div className="grid grid-cols-5 gap-2">
                  {TEXT_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => handleChange('textColor', color.value)}
                      className={`h-7 sm:h-8 rounded-md border ${
                        settings.textColor === color.value
                          ? 'border-blue-500'
                          : 'border-zinc-600'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              <div className="border border-zinc-800 rounded p-2 sm:p-3 mt-2">
                <p className="text-zinc-400 text-xs mb-1">Vista previa:</p>
                <div className="p-2 sm:p-3 rounded" style={{ backgroundColor: settings.chromaKey }}>
                  <p style={{
                    fontFamily: settings.fontFamily,
                    color: settings.textColor,
                    fontSize: '18px'
                  }}>
                    Así se verá el texto del teleprompter
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Posición en pantalla */}
          <div className="mb-6 md:mb-0">
            <h3 className="text-base sm:text-lg font-medium text-white mb-3">Posición y Layout</h3>
            <div className="space-y-3">
              <div>
                <label className="text-zinc-300 block mb-1 text-sm">Posición en pantalla</label>
                <select
                  value={settings.position}
                  onChange={(e) => handleChange('position', e.target.value)}
                  className="w-full bg-zinc-800 text-white border border-zinc-700 rounded p-2 text-sm"
                >
                  {POSITIONS.map((pos) => (
                    <option key={pos.value} value={pos.value}>
                      {pos.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <input
                  type="checkbox"
                  id="showWordCount"
                  checked={settings.showWordCount}
                  onChange={(e) => handleChange('showWordCount', e.target.checked)}
                  className="h-4 w-4 rounded bg-zinc-800 border-zinc-600 text-blue-600"
                />
                <label htmlFor="showWordCount" className="text-zinc-300 text-sm">
                  Mostrar contador de palabras
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showTimer"
                  checked={settings.showTimer}
                  onChange={(e) => handleChange('showTimer', e.target.checked)}
                  className="h-4 w-4 rounded bg-zinc-800 border-zinc-600 text-blue-600"
                />
                <label htmlFor="showTimer" className="text-zinc-300 text-sm">
                  Mostrar temporizador
                </label>
              </div>
            </div>
          </div>

          {/* Accesibilidad */}
          <div>
            <h3 className="text-base sm:text-lg font-medium text-white mb-3">Accesibilidad</h3>
            <div className="space-y-2">
              <p className="text-zinc-400 text-xs sm:text-sm">
                Opciones para mejorar la legibilidad y accesibilidad.
              </p>
              <div>
                <label className="text-zinc-300 block mb-1 text-sm">Modo de accesibilidad</label>
                <select
                  value={settings.accessibilityMode}
                  onChange={(e) => handleChange('accessibilityMode', e.target.value)}
                  className="w-full bg-zinc-800 text-white border border-zinc-700 rounded p-2 text-sm"
                >
                  <option value="default">Estándar</option>
                  <option value="highContrast">Alto contraste</option>
                  <option value="largeText">Texto grande</option>
                  <option value="deuteranopia">Deuteranopia (daltonismo rojo-verde)</option>
                  <option value="protanopia">Protanopia (daltonismo rojo)</option>
                  <option value="tritanopia">Tritanopia (daltonismo azul-amarillo)</option>
                </select>
              </div>
              <div className="bg-zinc-800 p-2 sm:p-3 rounded text-xs sm:text-sm mt-2">
                <p className="text-zinc-300">
                  <strong>Información:</strong> Los modos de accesibilidad ajustan automáticamente los colores y contrastes para optimizar la legibilidad.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6 sticky bottom-0 bg-zinc-900 py-3 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm bg-zinc-700 text-white rounded hover:bg-zinc-600 mr-2 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisualSettingsModal;
