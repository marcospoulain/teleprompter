import { useState, useEffect } from 'react';

interface ExportTranscriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transcript: string[];
}

const ExportTranscriptModal = ({
  isOpen,
  onClose,
  transcript
}: ExportTranscriptModalProps) => {
  const [exportFormat, setExportFormat] = useState<'txt' | 'json' | 'html' | 'docx'>('txt');
  const [fileName, setFileName] = useState('transcript');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Reset export success when modal is opened
  useEffect(() => {
    if (isOpen) {
      setExportSuccess(false);
      // Default filename with date
      setFileName(`transcript-${new Date().toISOString().slice(0, 10)}`);
    }
  }, [isOpen]);

  // Export transcript in selected format
  const handleExport = () => {
    if (transcript.length === 0) return;

    setIsExporting(true);
    setExportSuccess(false);

    try {
      let content = '';
      let mimeType = 'text/plain';
      let fileExtension = '.txt';

      // Process content according to selected format
      if (exportFormat === 'txt') {
        content = transcript.join('\n\n');
        mimeType = 'text/plain';
        fileExtension = '.txt';
      } else if (exportFormat === 'json') {
        content = JSON.stringify({
          transcript: transcript,
          timestamp: new Date().toISOString(),
          metadata: {
            format: 'Teleprompter for LiveStreaming Export',
            version: '1.0'
          }
        }, null, 2);
        mimeType = 'application/json';
        fileExtension = '.json';
      } else if (exportFormat === 'html') {
        content = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Transcripción</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
    }
    h1 {
      text-align: center;
      color: #333;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
      margin-bottom: 30px;
    }
    .timestamp {
      color: #777;
      font-size: 0.8em;
      margin-bottom: 40px;
      text-align: center;
    }
    p {
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <h1>Transcripción</h1>
  <div class="timestamp">Generado el ${new Date().toLocaleString()}</div>
  ${transcript.map(text => `<p>${text}</p>`).join('\n')}
</body>
</html>`;
        mimeType = 'text/html';
        fileExtension = '.html';
      } else if (exportFormat === 'docx') {
        // For DOCX we'll create a basic XML that Word can open
        // This is a simplified DOCX - for a real implementation
        // you'd want to use a library like docx-js
        content = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<?mso-application progid="Word.Document"?>
<w:wordDocument xmlns:w="http://schemas.microsoft.com/office/word/2003/wordml">
  <w:body>
    <w:p>
      <w:r>
        <w:t>Transcripción</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>Generado el ${new Date().toLocaleString()}</w:t>
      </w:r>
    </w:p>
    ${transcript.map(text => `
    <w:p>
      <w:r>
        <w:t>${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</w:t>
      </w:r>
    </w:p>`).join('\n')}
  </w:body>
</w:wordDocument>`;
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        fileExtension = '.docx';
      }

      // Create and download the file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName + fileExtension;
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportSuccess(true);

      // Save the last used format in localStorage
      localStorage.setItem('teleprompter-for-livestreaming-export-format', exportFormat);

    } catch (error) {
      console.error('Error exporting transcript:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 font-['Montserrat']">
      <div className="bg-zinc-900 w-full max-w-md rounded-lg shadow-lg overflow-hidden border border-zinc-800">
        <div className="flex justify-between items-center p-4 border-b border-zinc-800">
          <h2 className="text-xl font-semibold text-white">Exportar Transcripción</h2>
          <button
            className="text-zinc-400 hover:text-white"
            onClick={onClose}
            aria-label="Cerrar exportación"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5">
          {transcript.length === 0 ? (
            <div className="text-center text-zinc-400 py-6">
              No hay texto para exportar. Realiza una transcripción primero.
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-zinc-300 mb-2 font-medium">Nombre del archivo</label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full bg-zinc-800 text-white px-3 py-2 rounded border border-zinc-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="mb-6">
                <label className="block text-zinc-300 mb-2 font-medium">Formato de exportación</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    className={`py-2 px-4 rounded-md font-medium ${exportFormat === 'txt' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
                    onClick={() => setExportFormat('txt')}
                  >
                    TXT
                  </button>
                  <button
                    className={`py-2 px-4 rounded-md font-medium ${exportFormat === 'json' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
                    onClick={() => setExportFormat('json')}
                  >
                    JSON
                  </button>
                  <button
                    className={`py-2 px-4 rounded-md font-medium ${exportFormat === 'html' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
                    onClick={() => setExportFormat('html')}
                  >
                    HTML
                  </button>
                  <button
                    className={`py-2 px-4 rounded-md font-medium ${exportFormat === 'docx' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
                    onClick={() => setExportFormat('docx')}
                  >
                    DOCX
                  </button>
                </div>
              </div>

              <div className="text-zinc-400 text-sm mb-6">
                {exportFormat === 'txt' && (
                  <p>Formato de texto plano, adecuado para importar en cualquier editor de texto.</p>
                )}
                {exportFormat === 'json' && (
                  <p>Formato estructurado para procesamiento y análisis de datos.</p>
                )}
                {exportFormat === 'html' && (
                  <p>Página web con formato que se puede abrir directamente en un navegador.</p>
                )}
                {exportFormat === 'docx' && (
                  <p>Documento de Microsoft Word, útil para edición posterior.</p>
                )}
              </div>

              {exportSuccess && (
                <div className="bg-green-900/30 text-green-400 px-4 py-3 rounded-md mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Transcripción exportada exitosamente
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end p-4 border-t border-zinc-800">
          <button
            className="px-4 py-2 bg-zinc-700 text-white rounded hover:bg-zinc-600 transition-colors mr-2"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center ${
              transcript.length === 0 || isExporting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handleExport}
            disabled={transcript.length === 0 || isExporting}
          >
            {isExporting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exportando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                Exportar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportTranscriptModal;
