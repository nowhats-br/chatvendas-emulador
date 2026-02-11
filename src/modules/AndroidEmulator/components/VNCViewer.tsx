import React, { useEffect, useState, useRef } from 'react';

interface AndroidEmulatorInstance {
  id: string;
  name: string;
  config: any;
  status: 'running' | 'starting' | 'stopped' | 'error';
}

interface VNCViewerProps {
  instance: AndroidEmulatorInstance & { network: { vncPort: number; adbPort: number } };
  onError?: (error: string) => void;
}

export function VNCViewer({ instance }: VNCViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // ☁️ CLOUD MODE: Usar vncUrl da API se disponível (modo cloud)
  // Caso contrário, usar localhost (modo local/WSL2)
  const cloudVncUrl = (instance as any).vncUrl;
  
  let vncUrl: string;
  
  if (cloudVncUrl) {
    // Modo Cloud: Usar proxy WebSocket do backend
    // Formato original: wss://167.86.72.198:6081/websockify
    const wsUrl = cloudVncUrl.replace('wss://', '').replace('ws://', '');
    const [hostPort] = wsUrl.split('/');
    const [host, port] = hostPort.split(':');
    
    // Conectar via proxy do backend
    // O noVNC vai conectar em ws://127.0.0.1:3010/vnc-proxy/167.86.72.198:6081
    // Usando o parâmetro 'path' do noVNC
    const proxyPath = `vnc-proxy/${host}:${port}`;
    vncUrl = `http://127.0.0.1:3010/vnc/index.html?host=127.0.0.1&port=3010&path=${proxyPath}&autoconnect=true&encrypt=false&resize=scale&quality=6&compression=2`;
    
    console.log(`☁️ VNC Cloud Mode (via proxy):`, {
      instanceId: instance.id,
      cloudVncUrl: cloudVncUrl,
      targetHost: host,
      targetPort: port,
      proxyPath: proxyPath,
      vncUrl: vncUrl
    });
  } else {
    // Modo Local/WSL2: Usar localhost
    const wsPort = (instance as any).wsPort || (instance.network.vncPort + 180);
    const host = '127.0.0.1';
    vncUrl = `http://127.0.0.1:3010/vnc/index.html?host=${host}&port=${wsPort}&autoconnect=true&encrypt=false&resize=scale&quality=6&compression=2`;
    
    console.log(`💻 VNC Local Mode:`, {
      instanceId: instance.id,
      vncPort: instance.network.vncPort,
      wsPort: wsPort,
      vncUrl: vncUrl
    });
  }

  useEffect(() => {
    // Otimizar canvas se existir
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d', {
        willReadFrequently: true,
        alpha: false // Otimização adicional para performance
      });

      if (ctx) {
        // Configurações de performance para canvas
        ctx.imageSmoothingEnabled = false; // Desabilitar suavização para melhor performance
      }
    }

    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Função para otimizar iframe do noVNC
  const handleIframeLoad = () => {
    setLoading(false);

    // Tentar otimizar canvas dentro do iframe (se acessível)
    try {
      const iframeDoc = iframeRef.current?.contentDocument;
      if (iframeDoc) {
        const canvases = iframeDoc.querySelectorAll('canvas');
        canvases.forEach(canvas => {
          // Adicionar atributo willReadFrequently se não existir
          if (!canvas.hasAttribute('data-optimized')) {
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            canvas.setAttribute('data-optimized', 'true');
            console.log('🎨 Canvas otimizado para VNC:', canvas);
          }
        });
      }
    } catch (e) {
      // Ignorar erros de CORS - é normal para iframes externos
      console.log('ℹ️ Canvas do VNC será otimizado internamente');
    }
  };

  return (
    <div className="w-full h-full bg-black relative flex flex-col items-center justify-center">
      {loading && (
        <div className="absolute inset-0 z-10 bg-black flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white font-medium animate-pulse">Estabelecendo fluxo de vídeo real...</p>
        </div>
      )}

      {error ? (
        <div className="p-8 text-center space-y-4 max-w-md">
          <div className="text-4xl">⚠️</div>
          <p className="text-white font-bold">{error}</p>
          <button
            onClick={() => setError(null)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg"
          >
            Tentar Novamente
          </button>
        </div>
      ) : (
        <div className="w-full h-full">
          {/* Canvas otimizado para fallback */}
          <canvas
            ref={canvasRef}
            className="hidden"
            style={{ imageRendering: 'pixelated' }}
          />

          {/* NoVNC Iframe otimizado */}
          <iframe
            ref={iframeRef}
            src={vncUrl}
            className="w-full h-full border-none shadow-2xl"
            title="Android Real View"
            onLoad={handleIframeLoad}
            onError={() => setError('Não foi possível carregar a visualização do Android. Verifique se o backend está rodando.')}
            // Otimizações para iframe
            allow="fullscreen"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </div>
      )}

      {/* Overlay de Controle flutuante discreto */}
      {!loading && !error && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-6 opacity-0 hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-2 text-green-400 text-xs font-bold">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            LIVE: ANDROID REAL
          </div>
          <div className="h-4 w-px bg-white/10"></div>
          <p className="text-white/50 text-[10px] uppercase tracking-widest font-bold">Interação por Mouse e Teclado Ativada</p>
        </div>
      )}
    </div>
  );
}