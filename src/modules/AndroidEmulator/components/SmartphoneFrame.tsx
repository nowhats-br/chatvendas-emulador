import React, { useState, useEffect } from 'react';
import { VNCViewer } from './VNCViewer';
import { AndroidEmulatorInstance } from '../services/QEMUAndroidEmulator';

interface SmartphoneFrameProps {
  instance: AndroidEmulatorInstance & { network: { vncPort: number; adbPort: number } };
  onPowerToggle: () => void;
}

export function SmartphoneFrame({ instance, onPowerToggle }: SmartphoneFrameProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [showVNC] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const isRunning = instance.status === 'running';
  const isBooting = instance.status === 'starting';

  // Calcular dimensões responsivas
  useEffect(() => {
    const updateDimensions = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Agora temos TODA a tela disponível (sem menu lateral)
      const availableHeight = viewportHeight - 40; // Apenas 40px de margem
      const availableWidth = viewportWidth - 40; // Apenas 40px de margem

      // Proporção de smartphone moderno (9:19)
      const phoneRatio = 9 / 19;

      let phoneHeight = Math.min(availableHeight, 820);
      let phoneWidth = phoneHeight * phoneRatio;

      if (phoneWidth > availableWidth) {
        phoneWidth = Math.min(availableWidth, 420);
        phoneHeight = phoneWidth / phoneRatio;
      }

      setDimensions({ width: phoneWidth, height: phoneHeight });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAndroidButton = (button: 'home' | 'back' | 'menu') => {
    console.log(`Android button pressed: ${button}`);
    // Aqui seria enviado comando ADB para simular botão
  };

  // Calcular tamanhos proporcionais
  const phoneWidth = dimensions.width;
  const phoneHeight = dimensions.height;
  const screenWidth = phoneWidth - 16; // 8px padding de cada lado
  const screenHeight = phoneHeight - 16;
  const borderRadius = Math.min(phoneWidth * 0.08, 24); // Raio proporcional
  const notchWidth = phoneWidth * 0.35;
  const notchHeight = phoneHeight * 0.04;

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-100 to-gray-300 items-center justify-center">
      {/* Área Principal - APENAS O SMARTPHONE CENTRALIZADO */}
      <div className="flex flex-col items-center justify-center">
        {/* Título MUITO Compacto - REMOVIDO para deixar mais limpo */}

        {/* Smartphone Frame */}
        <div className="relative">
          {/* Smartphone Body */}
          <div
            className="relative bg-black p-2 shadow-2xl"
            style={{
              width: `${phoneWidth}px`,
              height: `${phoneHeight}px`,
              borderRadius: `${borderRadius}px`,
              background: 'linear-gradient(145deg, #1a1a1a, #2d2d2d)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
            }}
          >
            {/* Screen Bezel */}
            <div
              className="relative bg-black overflow-hidden"
              style={{
                width: `${screenWidth}px`,
                height: `${screenHeight}px`,
                borderRadius: `${borderRadius - 8}px`,
                background: '#000'
              }}
            >
              {/* Notch */}
              <div
                className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-black z-20"
                style={{
                  width: `${notchWidth}px`,
                  height: `${notchHeight}px`,
                  borderBottomLeftRadius: `${notchHeight / 2}px`,
                  borderBottomRightRadius: `${notchHeight / 2}px`
                }}
              >
                {/* Speaker */}
                <div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 rounded-full"
                  style={{
                    width: `${notchWidth * 0.4}px`,
                    height: '2px'
                  }}
                ></div>
                {/* Camera */}
                <div
                  className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-gray-900 rounded-full border border-gray-700"
                  style={{
                    width: `${Math.max(notchHeight * 0.3, 6)}px`,
                    height: `${Math.max(notchHeight * 0.3, 6)}px`
                  }}
                ></div>
              </div>

              {/* Status Bar removida para mostrar o Android real */}

              {/* Screen Content */}
              <div
                className="absolute inset-0 bg-black overflow-hidden"
                style={{
                  borderRadius: `${borderRadius - 8}px`,
                  paddingTop: '0px'
                }}
              >
                {/* Android Screen */}
                {isRunning && showVNC ? (
                  <div className="w-full h-full relative group">
                    <VNCViewer
                      instance={instance}
                    />
                  </div>
                ) : isBooting ? (
                  /* Boot Screen */
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-green-400 via-blue-500 to-purple-600">
                    <div className="text-center space-y-4">
                      <div style={{ fontSize: `${Math.max(phoneWidth * 0.15, 40)}px` }}>🤖</div>
                      <h3 className="font-bold text-white" style={{ fontSize: `${Math.max(phoneWidth * 0.06, 18)}px` }}>Android</h3>
                      <p className="text-white/90" style={{ fontSize: `${Math.max(phoneWidth * 0.04, 14)}px` }}>Iniciando Android...</p>

                      {/* Progress Bar */}
                      <div
                        className="bg-white/20 rounded-full"
                        style={{
                          width: `${phoneWidth * 0.7}px`,
                          height: `${Math.max(phoneWidth * 0.02, 8)}px`
                        }}
                      >
                        <div
                          className="bg-white rounded-full transition-all duration-1000"
                          style={{
                            width: '50%',
                            height: '100%'
                          }}
                        />
                      </div>

                      <div className="text-white/80" style={{ fontSize: `${Math.max(phoneWidth * 0.04, 14)}px` }}>
                        <span className="font-bold">50%</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Lock Screen / Off Screen */
                  <div className="w-full h-full flex flex-col items-center justify-center bg-black">
                    {!isRunning ? (
                      <div className="text-center space-y-4">
                        <div style={{ fontSize: `${Math.max(phoneWidth * 0.12, 32)}px`, opacity: 0.3 }}>📱</div>
                        <p className="text-gray-500" style={{ fontSize: `${Math.max(phoneWidth * 0.05, 16)}px` }}>Dispositivo Desligado</p>
                        <button
                          onClick={onPowerToggle}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full transition-colors"
                          style={{ fontSize: `${Math.max(phoneWidth * 0.04, 14)}px` }}
                        >
                          ⚡ Ligar
                        </button>
                      </div>
                    ) : (
                      <div className="text-center space-y-3">
                        <div style={{ fontSize: `${Math.max(phoneWidth * 0.12, 32)}px` }}>🔒</div>
                        <p className="text-white" style={{ fontSize: `${Math.max(phoneWidth * 0.05, 16)}px` }}>{getCurrentTime()}</p>
                        <p className="text-gray-400" style={{ fontSize: `${Math.max(phoneWidth * 0.04, 14)}px` }}>Deslize para desbloquear</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Home Indicator (iPhone style) */}
              <div
                className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-white/30 rounded-full"
                style={{
                  width: `${phoneWidth * 0.25}px`,
                  height: `${Math.max(phoneWidth * 0.008, 3)}px`
                }}
              ></div>
            </div>

            {/* Physical Buttons */}
            {/* Power Button */}
            <button
              onClick={onPowerToggle}
              className="absolute right-[-2px] bg-gray-600 hover:bg-gray-500 transition-colors"
              style={{
                top: `${phoneHeight * 0.2}px`,
                width: '3px',
                height: `${phoneHeight * 0.1}px`,
                borderTopRightRadius: '2px',
                borderBottomRightRadius: '2px'
              }}
              title="Power"
            />

            {/* Volume Buttons */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="absolute left-[-2px] bg-gray-600 hover:bg-gray-500 transition-colors"
              style={{
                top: `${phoneHeight * 0.15}px`,
                width: '3px',
                height: `${phoneHeight * 0.08}px`,
                borderTopLeftRadius: '2px',
                borderBottomLeftRadius: '2px'
              }}
              title="Volume Up"
            />
            <button
              className="absolute left-[-2px] bg-gray-600 hover:bg-gray-500 transition-colors"
              style={{
                top: `${phoneHeight * 0.25}px`,
                width: '3px',
                height: `${phoneHeight * 0.08}px`,
                borderTopLeftRadius: '2px',
                borderBottomLeftRadius: '2px'
              }}
              title="Volume Down"
            />
          </div>
        </div>
      </div>
    </div>
  );
}