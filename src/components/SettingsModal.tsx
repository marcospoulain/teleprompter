import { useState, useEffect } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
}

const SettingsModal = ({
  isOpen,
  onClose,
  fontSize,
  setFontSize,
  darkMode,
  setDarkMode
}: SettingsModalProps) => {
  const [localFontSize, setLocalFontSize] = useState(fontSize);
  const [localDarkMode, setLocalDarkMode] = useState(darkMode);

  // Update local state when props change
  useEffect(() => {
    setLocalFontSize(fontSize);
    setLocalDarkMode(darkMode);
  }, [fontSize, darkMode]);

  // Handle saving settings
  const handleSave = () => {
    setFontSize(localFontSize);
    setDarkMode(localDarkMode);
    onClose();
  };

  // Handle dialog close
  const handleClose = () => {
    // Reset local state to props
    setLocalFontSize(fontSize);
    setLocalDarkMode(darkMode);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 font-['Montserrat']">
      <div className="bg-zinc-900 w-full max-w-md rounded-lg shadow-lg overflow-hidden border border-zinc-800">
        <div className="flex justify-between items-center p-4 border-b border-zinc-800">
          <h2 className="text-xl font-semibold text-white">Settings</h2>
          <button
            className="text-zinc-400 hover:text-white"
            onClick={handleClose}
            aria-label="Close settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5">
          <div className="mb-6">
            <label className="block text-zinc-300 mb-2 font-medium">Font Size: {localFontSize}px</label>
            <div className="flex items-center">
              <span className="text-zinc-400 mr-3 w-8 text-right">16px</span>
              <input
                type="range"
                min="16"
                max="72"
                value={localFontSize}
                onChange={(e) => setLocalFontSize(Number(e.target.value))}
                className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-zinc-400 ml-3 w-8">72px</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-zinc-300 font-medium">Dark Mode</span>
              <div className="relative ml-4">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={localDarkMode}
                  onChange={(e) => setLocalDarkMode(e.target.checked)}
                />
                <div className={`block w-14 h-8 rounded-full ${localDarkMode ? 'bg-blue-600' : 'bg-zinc-600'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-all duration-300 ease-in-out ${localDarkMode ? 'transform translate-x-6' : ''}`}></div>
              </div>
            </label>
            <p className="text-zinc-500 text-sm mt-1">Always dark for better contrast</p>
          </div>
        </div>

        <div className="flex justify-end p-4 border-t border-zinc-800">
          <button
            className="px-4 py-2 bg-zinc-700 text-white rounded hover:bg-zinc-600 transition-colors mr-2"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
