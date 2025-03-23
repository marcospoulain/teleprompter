import { useState, useEffect, useRef } from 'react';

interface EditTranscriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transcript: string[];
  onSave: (editedTranscript: string[]) => void;
}

const EditTranscriptModal = ({
  isOpen,
  onClose,
  transcript,
  onSave
}: EditTranscriptModalProps) => {
  const [editedTranscriptText, setEditedTranscriptText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Load transcript into editor when modal is opened
  useEffect(() => {
    if (isOpen) {
      const text = transcript.join('\n\n');
      setEditedTranscriptText(text);
      setEditSuccess(false);

      // Focus the textarea and set cursor at the end
      setTimeout(() => {
        if (textAreaRef.current) {
          textAreaRef.current.focus();
          textAreaRef.current.setSelectionRange(
            text.length,
            text.length
          );
        }
      }, 100);
    }
  }, [isOpen, transcript]);

  // Handle saving the edited transcript
  const handleSave = () => {
    if (!editedTranscriptText.trim()) return;

    setIsSaving(true);
    setEditSuccess(false);

    try {
      // Split the text by double newlines to maintain paragraph structure
      const updatedTranscript = editedTranscriptText
        .split('\n\n')
        .filter(text => text.trim())
        .map(text => text.trim());

      onSave(updatedTranscript);
      setEditSuccess(true);

      // Close after a brief delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error saving edited transcript:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle discard changes
  const handleDiscard = () => {
    onClose();
  };

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 font-['Montserrat']">
      <div className="bg-zinc-900 w-full max-w-3xl max-h-[90vh] rounded-lg shadow-lg overflow-hidden border border-zinc-800 flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-zinc-800">
          <h2 className="text-xl font-semibold text-white">Editar Transcripción</h2>
          <button
            className="text-zinc-400 hover:text-white"
            onClick={onClose}
            aria-label="Cerrar editor"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 flex-1 overflow-hidden flex flex-col">
          {transcript.length === 0 ? (
            <div className="text-center text-zinc-400 py-6">
              No hay texto para editar. Realiza una transcripción primero.
            </div>
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between">
                <label className="text-zinc-300 font-medium">Texto de la transcripción</label>
                <div className="text-zinc-500 text-sm">
                  Separa los párrafos con doble salto de línea
                </div>
              </div>

              <textarea
                ref={textAreaRef}
                value={editedTranscriptText}
                onChange={(e) => setEditedTranscriptText(e.target.value)}
                className="w-full bg-zinc-800 text-white px-4 py-3 rounded border border-zinc-700 focus:outline-none focus:border-blue-500 resize-none flex-1 font-mono text-md"
                placeholder="Edita el texto de la transcripción aquí..."
                spellCheck="true"
              />

              {editSuccess && (
                <div className="bg-green-900/30 text-green-400 px-4 py-3 rounded-md mt-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Transcripción guardada exitosamente
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex justify-between items-center p-4 border-t border-zinc-800 bg-zinc-800">
          <div className="flex items-center">
            <button
              className="px-4 py-2 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 transition-colors flex items-center"
              onClick={handleDiscard}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              Descartar cambios
            </button>
          </div>

          <div className="flex items-center">
            <span className="text-zinc-400 text-sm mr-3">
              {transcript.length} {transcript.length === 1 ? 'párrafo' : 'párrafos'}
            </span>
            <button
              className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center ${
                !editedTranscriptText.trim() || isSaving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={handleSave}
              disabled={!editedTranscriptText.trim() || isSaving}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Guardar cambios
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTranscriptModal;
