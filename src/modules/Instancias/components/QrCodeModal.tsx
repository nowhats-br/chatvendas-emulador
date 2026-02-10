import React from 'react';
import { WhatsAppService } from '../../../services/WhatsAppService';
import { WhatsAppInstance } from '../types';

// Ícones customizados para evitar problemas de importação
const X = ({ size = 16, className = "", style }: { size?: number; className?: string; style?: React.CSSProperties }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className, style
  },
    React.createElement('path', { d: 'm18 6-12 12' }),
    React.createElement('path', { d: 'm6 6 12 12' }));

const Smartphone = ({ size = 16, className = "", style }: { size?: number; className?: string; style?: React.CSSProperties }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className, style
  },
    React.createElement('rect', { width: '14', height: '20', x: '5', y: '2', rx: '2', ry: '2' }),
    React.createElement('path', { d: 'M12 18h.01' }));

const Loader2 = ({ size = 16, className = "", style }: { size?: number; className?: string; style?: React.CSSProperties }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className, style
  },
    React.createElement('path', { d: 'M21 12a9 9 0 1 1-6.219-8.56' }));

const ShieldCheck = ({ size = 16, className = "", style }: { size?: number; className?: string; style?: React.CSSProperties }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className, style
  },
    React.createElement('path', { d: 'M20 13c0 5-3.5 7.5-8 12.5a1 1 0 0 1-1.5 0C6 20.5 2.5 18 2.5 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.5-2.5a1 1 0 0 1 1 0C13.5 3.8 16 5 18 5a1 1 0 0 1 1 1z' }),
    React.createElement('path', { d: 'm9 12 2 2 4-4' }));

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  instance: WhatsAppInstance | null;
}

export function QrCodeModal({ isOpen, onClose, instance }: QrCodeModalProps) {
  const [qrCode, setQrCode] = React.useState<string>('');
  const [timeLeft, setTimeLeft] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isConnecting, setIsConnecting] = React.useState(false);

  // Função para lidar com o sucesso da conexão
  const handleSuccess = React.useCallback(() => {
    if (!isConnecting) {
      console.log('🎉 Instância conectada, preparando para fechar modal');
      setIsConnecting(true);
      setIsLoading(false);

      // Fechar modal após delay
      setTimeout(() => {
        onClose();
      }, 3000); // 3 segundos para ler a mensagem de sucesso
    }
  }, [isConnecting, onClose]);

  const loadQr = React.useCallback(async () => {
    if (!instance || isConnecting) return;

    setIsLoading(true);
    try {
      console.log(`🔄 Carregando QR Code para instância ${instance.id}...`);
      const data = await WhatsAppService.getQrCode(instance.id);
      setQrCode(data.base64);
      setTimeLeft(data.expiresIn || 60);
      console.log(`✅ QR Code carregado com sucesso, expira em ${data.expiresIn}s`);
    } catch (error: any) {
      console.error('❌ Erro ao carregar QR:', error);
      
      // Se QR não estiver disponível, mostrar mensagem mais clara
      if (error.message?.includes('QR Code não disponível')) {
        console.log('⚠️ QR Code não disponível, pode estar sendo gerado...');
        setTimeLeft(5); // Tentar novamente em 5 segundos
      } else if (error.status === 410 || error.message?.includes('410')) {
        console.log('⚠️ QR Code expirado');
        setTimeLeft(-1); // Para o loop
      } else {
        console.log('⚠️ Erro genérico, tentando novamente em 10 segundos');
        setTimeLeft(10); // Tentar novamente em 10 segundos
      }
    } finally {
      setIsLoading(false);
    }
  }, [instance, isConnecting]);

  // Efeito principal de monitoramento
  React.useEffect(() => {
    if (!isOpen || !instance) return;

    // Resetar estados
    if (!isConnecting) {
      setQrCode('');
      setIsLoading(true);
      loadQr();
    }

    const onConnected = (data: any) => {
      const providerStr = data.provider ? `[${data.provider.toUpperCase()}]` : '';
      console.log(`📡 QrCodeModal: Evento connection ${providerStr} recebido:`, data);

      if (data.instanceId === instance.id) {
        console.log('🎉 ID coincide! Finalizando conexão...');
        handleSuccess();
      }
    };

    const onStatus = (data: any) => {
      const providerStr = data.provider ? `[${data.provider.toUpperCase()}]` : '';
      console.log(`📡 QrCodeModal: Evento status ${providerStr} recebido:`, data);

      if (data.instanceId === instance.id && (data.status === 'connected' || data.status === 'Online')) {
        console.log('🎉 Status conectado! Finalizando...');
        handleSuccess();
      }
    };

    const onQr = (data: any) => {
      if (data.instanceId === instance.id) {
        setQrCode(data.qrCode);
        if (data.expiresAt) {
          setTimeLeft(Math.floor((new Date(data.expiresAt).getTime() - Date.now()) / 1000));
        }
        setIsLoading(false);
      }
    };

    WhatsAppService.on('instanceConnected', onConnected);
    WhatsAppService.on('instanceStatusChanged', onStatus);
    WhatsAppService.on('qrCode', onQr);

    // Verificar status inicial
    const checkInitialStatus = async () => {
      try {
        const statusData = await WhatsAppService.getInstanceStatus(instance.id);
        if (statusData.status === 'connected') {
          handleSuccess();
        }
      } catch (e) {
        console.error('❌ QrCodeModal: Erro ao carregar status inicial:', e);
      }
    };

    checkInitialStatus();

    // Polling de segurança (verificar a cada 3 segundos)
    const pollingInterval = setInterval(checkInitialStatus, 3000);

    return () => {
      clearInterval(pollingInterval);
      WhatsAppService.off('instanceConnected', onConnected);
      WhatsAppService.off('instanceStatusChanged', onStatus);
      WhatsAppService.off('qrCode', onQr);
    };
  }, [isOpen, instance?.id, handleSuccess, loadQr, isConnecting]);

  // Timer de renovação
  React.useEffect(() => {
    if (!isOpen || timeLeft <= 0 || isConnecting) return;

    const interval = setInterval(() => {
      setTimeLeft((prev: number) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, isOpen, isConnecting]);

  // Recarregar quando expirar
  React.useEffect(() => {
    if (isOpen && timeLeft === 0 && !isLoading && !isConnecting) {
      loadQr();
    }
  }, [timeLeft, isOpen, isLoading, loadQr, isConnecting]);

  if (!isOpen || !instance) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: 'white', width: '100%', maxWidth: '400px',
        borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden', position: 'relative', margin: '20px'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px', background: 'none',
            border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '8px', zIndex: 10
          }}
        >
          <X size={20} />
        </button>

        <div style={{
          padding: '32px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', textAlign: 'center'
        }}>
          {isConnecting ? (
            <>
              <div style={{
                marginBottom: '16px', backgroundColor: '#d1fae5',
                padding: '16px', borderRadius: '50%', color: '#059669', fontSize: '24px'
              }}>✅</div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669', margin: '0 0 8px 0' }}>
                Conectado com Sucesso!
              </h2>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 16px 24px 16px' }}>
                Sua instância <strong>{instance.name}</strong> está pronta.
              </p>
              <button
                onClick={onClose}
                style={{
                  backgroundColor: '#10b981', color: 'white', border: 'none',
                  padding: '10px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
                }}
              >
                Concluir
              </button>
            </>
          ) : (
            <>
              <div style={{
                marginBottom: '16px', backgroundColor: '#d1fae5',
                padding: '12px', borderRadius: '50%', color: '#059669'
              }}>
                <Smartphone size={32} />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px 0' }}>
                Conectar WhatsApp
              </h2>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 16px 24px 16px' }}>
                Aponte a câmera do WhatsApp para este código ({instance.provider}).
              </p>

              <div style={{
                position: 'relative', width: '256px', height: '256px',
                backgroundColor: '#f3f4f6', borderRadius: '12px', display: 'flex',
                alignItems: 'center', justifyContent: 'center', border: '2px dashed #d1d5db',
                marginBottom: '24px'
              }}>
                {isLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <Loader2 size={32} style={{ color: '#10b981', animation: 'spin 1s linear infinite' }} />
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                        Gerando QR Code...
                      </span>
                      <p style={{ fontSize: '12px', color: '#9ca3af', margin: '4px 0 0 0' }}>
                        {instance?.provider === 'baileys' ? 'Baileys' : 'Whaileys'} • Aguarde alguns segundos
                      </p>
                    </div>
                  </div>
                ) : qrCode ? (
                  <img src={qrCode} alt="QR Code" style={{ width: '100%', height: '100%', padding: '8px' }} />
                ) : (
                  <div style={{ color: '#ef4444', textAlign: 'center', padding: '20px' }}>
                    <div style={{ marginBottom: '12px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>Erro ao gerar QR Code</span>
                      <p style={{ fontSize: '12px', margin: '4px 0 0 0', color: '#9ca3af' }}>
                        Verifique se a instância está configurada corretamente
                      </p>
                    </div>
                    <button 
                      onClick={loadQr} 
                      style={{ 
                        padding: '8px 16px', 
                        backgroundColor: '#059669', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      🔄 Tentar Novamente
                    </button>
                  </div>
                )}

                {!isLoading && qrCode && (
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '8px', borderRadius: '50%' }}>
                    <ShieldCheck size={24} style={{ color: '#059669' }} />
                  </div>
                )}
              </div>

              <div style={{ width: '256px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>
                  <span>Atualiza em</span>
                  <span>{timeLeft}s</span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', backgroundColor: '#10b981', transition: 'width 1s linear', width: `${(timeLeft / 45) * 100}%` }} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
