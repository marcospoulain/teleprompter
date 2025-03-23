import { useState, useEffect, useCallback } from 'react';

interface TeleprompterWindowProps {
  transcript: string[];
  interimTranscript: string;
  isListening: boolean;
  fontSize: number;
  onSetFontSize: (size: number) => void;
}

const TeleprompterWindow = ({
  transcript,
  interimTranscript,
  isListening,
  fontSize,
  onSetFontSize
}: TeleprompterWindowProps) => {
  const [teleprompterWindow, setTeleprompterWindow] = useState<Window | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Actualizar el contenido del teleprompter cuando cambia el transcript o interimTranscript
  const updateTeleprompterContent = useCallback(() => {
    if (teleprompterWindow && !teleprompterWindow.closed) {
      teleprompterWindow.postMessage({
        type: 'updateContent',
        transcript,
        interimTranscript
      }, '*');
    }
  }, [teleprompterWindow, transcript, interimTranscript]);

  // Función para abrir una ventana del teleprompter
  const openTeleprompter = useCallback(() => {
    // Verifica si ya existe una ventana abierta
    if (teleprompterWindow && !teleprompterWindow.closed) {
      teleprompterWindow.focus();
      return;
    }

    // Abre una nueva ventana con tamaño específico para livestreaming
    const newWindow = window.open('', 'Teleprompter', 'width=1920,height=175,menubar=no,toolbar=no,location=no,resizable=yes');
    if (!newWindow) {
      setError('No se pudo abrir la ventana del teleprompter. Por favor, comprueba la configuración de tu bloqueador de ventanas emergentes.');
      return;
    }

    setTeleprompterWindow(newWindow);

    // Crear el contenido HTML para la ventana del teleprompter
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Teleprompter for LiveStreaming</title>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 0;
            font-family: 'Montserrat', sans-serif;
            background-color: #000000;
            color: #ffffff;
            overflow: hidden;
            height: 100vh;
            display: flex;
            flex-direction: column;
          }

          .controls {
            background-color: #111111;
            padding: 5px 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #333;
            height: 32px;
          }

          .control-group {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          button {
            background-color: #333;
            color: white;
            border: none;
            padding: 3px 8px;
            border-radius: 4px;
            cursor: pointer;
            font-family: 'Montserrat', sans-serif;
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 12px;
          }

          button:hover {
            background-color: #444;
          }

          button.active {
            background-color: #3b82f6;
          }

          .split-view {
            display: flex;
            flex: 1;
            overflow: hidden;
            transition: transform 0.3s ease;
          }

          .content-container {
            flex: 1;
            overflow-y: auto;
            padding: 12px 20px;
            white-space: nowrap;
          }

          .divider {
            width: 1px;
            background-color: #333;
          }

          .text-content {
            white-space: nowrap;
            font-size: ${fontSize}px;
            line-height: 1.3;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          input[type="range"] {
            width: 80px;
            height: 5px;
          }

          label {
            color: #aaa;
            font-size: 12px;
          }

          .placeholder {
            color: #555;
            text-align: center;
          }

          .mirrored {
            transform: scale(-1, 1);
          }

          /* Modo Chroma Key - estos colores serán reemplazados dinámicamente */
          .chroma-green { background-color: #00B140; }
          .chroma-blue { background-color: #0047AB; }
          .chroma-red { background-color: #C41E3A; }
          .chroma-black { background-color: #000000; }

          /* Animación para texto que entra */
          @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        </style>
      </head>
      <body>
        <div class="controls">
          <div class="control-group">
            <button id="mirrorBtn" title="Espejo">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
              Espejo
            </button>
            <button id="fullscreenBtn" title="Pantalla completa">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
              </svg>
              Pantalla completa
            </button>
          </div>
          <div class="control-group">
            <label for="fontSizeInput">Tamaño:</label>
            <input type="range" id="fontSizeInput" min="20" max="100" value="${fontSize}" />
            <span id="fontSizeValue">${fontSize}px</span>
          </div>
          <div class="control-group">
            <select id="chromaSelect" class="bg-black text-white border border-gray-700 rounded text-xs p-1">
              <option value="chroma-black">Negro</option>
              <option value="chroma-green">Verde</option>
              <option value="chroma-blue">Azul</option>
              <option value="chroma-red">Rojo</option>
            </select>
          </div>
        </div>

        <div id="splitView" class="split-view">
          <div id="textContainer" class="content-container">
            <div id="content" class="text-content"></div>
            <div id="placeholder" class="placeholder">El texto aparecerá aquí cuando comiences a hablar...</div>
          </div>
        </div>

        <script>
          // Elements
          const mirrorBtn = document.getElementById('mirrorBtn');
          const fullscreenBtn = document.getElementById('fullscreenBtn');
          const fontSizeInput = document.getElementById('fontSizeInput');
          const fontSizeValue = document.getElementById('fontSizeValue');
          const chromaSelect = document.getElementById('chromaSelect');
          const splitView = document.getElementById('splitView');
          const content = document.getElementById('content');
          const placeholder = document.getElementById('placeholder');

          // State
          let mirrored = false;
          let scrollSpeed = 1.0;
          let autoScrollEnabled = true;
          let isPaused = false;

          // Function to scroll to bottom
          function scrollToBottom() {
            if (isPaused) return;
            textContainer.scrollTop = textContainer.scrollHeight;
          }

          // Toggle mirror mode
          mirrorBtn.addEventListener('click', () => {
            mirrored = !mirrored;
            if (mirrored) {
              splitView.classList.add('mirrored');
              mirrorBtn.classList.add('active');
            } else {
              splitView.classList.remove('mirrored');
              mirrorBtn.classList.remove('active');
            }
          });

          // Toggle fullscreen
          fullscreenBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen().catch(err => {
                console.error('Error al intentar pantalla completa:', err);
              });
              fullscreenBtn.classList.add('active');
            } else {
              document.exitFullscreen();
              fullscreenBtn.classList.remove('active');
            }
          });

          // Font size control
          fontSizeInput.addEventListener('input', (e) => {
            const newSize = e.target.value;
            fontSizeValue.textContent = newSize + 'px';
            content.style.fontSize = newSize + 'px';

            // Notify parent window about font size change
            window.opener.postMessage({
              type: 'fontSizeChange',
              size: Number(newSize)
            }, '*');
          });

          // Chroma key background
          chromaSelect.addEventListener('change', (e) => {
            document.body.className = '';
            document.body.classList.add(e.target.value);
          });

          // Listen for messages from parent window
          window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'updateContent') {
              // Update content - mostrar el texto de manera continua
              let transcriptText = '';

              if (event.data.transcript && event.data.transcript.length > 0) {
                // Unir todas las líneas del transcript en un único texto continuo
                transcriptText = event.data.transcript.join(' ');
                placeholder.style.display = 'none';
              } else {
                if (!event.data.interimTranscript) {
                  placeholder.style.display = 'block';
                }
              }

              // Añadir el texto interino al final
              if (event.data.interimTranscript) {
                if (transcriptText) {
                  transcriptText += ' ' + event.data.interimTranscript;
                } else {
                  transcriptText = event.data.interimTranscript;
                }
                placeholder.style.display = 'none';
              }

              content.textContent = transcriptText;

              // Auto-scroll to bottom
              scrollToBottom();
            } else if (event.data && event.data.type === 'updateFontSize') {
              // Update font size
              const newSize = event.data.fontSize;
              fontSizeInput.value = newSize;
              fontSizeValue.textContent = newSize + 'px';
              content.style.fontSize = newSize + 'px';
            } else if (event.data && event.data.type === 'updateSettings') {
              // Actualizar configuraciones visuales
              if (event.data.chromaKey) {
                // Cambiar el fondo según el color de chroma key
                document.body.style.backgroundColor = event.data.chromaKey;
              }
              if (event.data.fontFamily) {
                content.style.fontFamily = event.data.fontFamily;
              }
              if (event.data.textColor) {
                content.style.color = event.data.textColor;
              }
            }
          });

          // Notify parent window that we're ready
          window.opener.postMessage({ type: 'teleprompterReady' }, '*');

          // Auto-scroll when content changes
          new MutationObserver(scrollToBottom).observe(content, {
            childList: true,
            subtree: true,
            characterData: true
          });

          // Keyboard controls
          document.addEventListener('keydown', (e) => {
            switch(e.key) {
              case 'f': // Pantalla completa
                fullscreenBtn.click();
                break;
              case 'm': // Espejo
                mirrorBtn.click();
                break;
              case ' ': // Espacio - pausar/reanudar autoscroll
                isPaused = !isPaused;
                if (!isPaused) scrollToBottom();
                break;
              case 'ArrowUp': // Subir velocidad
                scrollSpeed = Math.min(3, scrollSpeed + 0.1);
                break;
              case 'ArrowDown': // Bajar velocidad
                scrollSpeed = Math.max(0.1, scrollSpeed - 0.1);
                break;
            }
          });
        </script>
      </body>
      </html>
    `;

    // Escribir el HTML en la ventana
    newWindow.document.open();
    newWindow.document.write(html);
    newWindow.document.close();

    // Comunicación con la ventana principal
    const handleTeleprompterMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'fontSizeChange' && typeof event.data.size === 'number') {
        onSetFontSize(event.data.size);
      } else if (event.data && event.data.type === 'teleprompterReady') {
        // Cuando el teleprompter está listo, enviamos el contenido actual
        updateTeleprompterContent();
      }
    };

    window.addEventListener('message', handleTeleprompterMessage);

    // Cleanup cuando la ventana se cierre
    const checkIfClosed = setInterval(() => {
      if (newWindow.closed) {
        clearInterval(checkIfClosed);
        window.removeEventListener('message', handleTeleprompterMessage);
        setTeleprompterWindow(null);
      }
    }, 1000);

    return () => {
      window.removeEventListener('message', handleTeleprompterMessage);
      clearInterval(checkIfClosed);
    };
  }, [teleprompterWindow, fontSize, onSetFontSize, updateTeleprompterContent]);

  // Actualizar el tamaño de fuente en el teleprompter cuando cambia en la aplicación principal
  useEffect(() => {
    if (teleprompterWindow && !teleprompterWindow.closed) {
      teleprompterWindow.postMessage({
        type: 'updateFontSize',
        fontSize
      }, '*');
    }
  }, [teleprompterWindow, fontSize]);

  // Actualizar el contenido cuando cambian los datos
  useEffect(() => {
    updateTeleprompterContent();
  }, [updateTeleprompterContent]);

  // Limpieza al desmontar el componente
  useEffect(() => {
    return () => {
      if (teleprompterWindow && !teleprompterWindow.closed) {
        teleprompterWindow.close();
      }
    };
  }, [teleprompterWindow]);

  return (
    <button
      onClick={openTeleprompter}
      className="p-2 rounded-full hover:bg-zinc-800 transition-colors"
      title="Abrir Teleprompter"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
      </svg>
    </button>
  );
};

export default TeleprompterWindow;
