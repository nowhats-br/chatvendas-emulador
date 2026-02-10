import React, { useState, useEffect } from 'react';
import {
  Info as AlertCircle,
  Check as CheckCircle,
  RefreshCw as Loader,
  Monitor,
  Database as HardDrive,
  Cpu,
  AlertTriangle
} from 'lucide-react';

interface Requirements {
  windows10: boolean;
  virtualization: boolean;
  diskSpace: boolean;
  ram: boolean;
}

interface SetupStatus {
  wsl2Installed: boolean;
  distroInstalled: boolean;
  setupComplete: boolean;
  ready: boolean;
}

const RequirementItem: React.FC<{ icon: React.ReactNode; label: string; met: boolean }> = ({
  icon,
  label,
  met
}) => (
  <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
    <div className="flex items-center">
      <div className="text-gray-600 mr-2.5 w-4 h-4">{icon}</div>
      <span className="text-gray-700 text-sm">{label}</span>
    </div>
    {met ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <AlertCircle className="w-4 h-4 text-red-500" />
    )}
  </div>
);

export const WSL2SetupWizard: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [requirements, setRequirements] = useState<Requirements | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSetupRunning, setIsSetupRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [needsReboot, setNeedsReboot] = useState(false);

  useEffect(() => {
    checkStatus();
    checkRequirements();
  }, []);

  const checkStatus = async () => {
    try {
      setIsLoading(true);
      // O setup do WSL2 em 127.0.0.1
      const response = await fetch('http://127.0.0.1:3010/api/wsl2-android/setup/status');
      if (!response.ok) throw new Error('Servidor não respondeu adequadamente');
      const data = await response.json();
      setStatus(data);

      if (data.ready) {
        onComplete();
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      setError('O backend parece estar reiniciando ou WSL está ocupado. Tente novamente em instantes.');
    } finally {
      setIsLoading(false);
    }
  };

  const checkRequirements = async () => {
    try {
      const response = await fetch('http://127.0.0.1:3010/api/wsl2-android/setup/requirements');
      const data = await response.json();
      setRequirements(data);
    } catch (error) {
      console.error('Erro ao verificar requisitos:', error);
    }
  };

  const runSetup = async () => {
    setIsSetupRunning(true);
    setError('');
    setProgress(0);
    setMessage('Iniciando configuração...');

    try {
      const eventSource = new EventSource('http://127.0.0.1:3010/api/wsl2-android/setup/run');

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.done) {
          eventSource.close();
          setIsSetupRunning(false);

          if (data.result.success) {
            if (data.result.needsReboot) {
              setNeedsReboot(true);
              setMessage(data.result.message);
            } else {
              setProgress(100);
              setMessage('Configuração concluída com sucesso!');
              setTimeout(() => {
                onComplete();
              }, 2000);
            }
          } else {
            setError(data.result.error || 'Erro desconhecido');
          }
        } else if (data.error) {
          eventSource.close();
          setIsSetupRunning(false);
          setError(data.error);
        } else {
          setMessage(data.message);
          setProgress(data.progress);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        setIsSetupRunning(false);
        setError('A conexão com o setup foi interrompida. Isso pode acontecer se o WSL travar. Reinicie o computador se o problema persistir.');
      };

    } catch (error) {
      setIsSetupRunning(false);
      setError('Erro ao iniciar configuração');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600 font-medium">Sincronizando com WSL2...</p>
        </div>
      </div>
    );
  }

  if (needsReboot) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold mb-3">Reinicialização Necessária</h2>
            <p className="text-gray-600 text-sm mb-4">
              O Windows precisa ser reiniciado para concluir a configuração do WSL2.
            </p>
            <p className="text-gray-600 text-sm mb-6">
              Após reiniciar, abra o ChatVendas novamente e clique em Android Emulator para continuar.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-500 text-white py-2.5 px-6 rounded-lg hover:bg-blue-600 transition text-sm font-semibold"
            >
              Entendi
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status?.ready) {
    return null;
  }

  const allRequirementsMet = requirements?.windows10 && requirements?.diskSpace && requirements?.ram;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
        <div className="max-h-[90vh] overflow-y-auto p-8">
          {!isSetupRunning ? (
            <>
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Monitor className="w-10 h-10 text-blue-500" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Ambiente Android WSL2</h2>
                <p className="text-gray-500 text-sm">Configuração automática e otimizada</p>
              </div>

              {requirements && (
                <div className="mb-8 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Requisitos do Sistema</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-4 rounded-xl border-2 transition-all ${requirements.windows10 ? 'bg-white border-green-100' : 'bg-red-50 border-red-100'}`}>
                      <Monitor className={`w-5 h-5 mb-2 ${requirements.windows10 ? 'text-green-500' : 'text-red-500'}`} />
                      <p className="text-xs font-bold text-gray-700">Windows 10/11</p>
                      <p className="text-[10px] text-gray-400">{requirements.windows10 ? 'Compatível' : 'Incompatível'}</p>
                    </div>
                    <div className={`p-4 rounded-xl border-2 transition-all ${requirements.diskSpace ? 'bg-white border-green-100' : 'bg-red-50 border-red-100'}`}>
                      <HardDrive className={`w-5 h-5 mb-2 ${requirements.diskSpace ? 'text-green-500' : 'text-red-500'}`} />
                      <p className="text-xs font-bold text-gray-700">20GB Disco</p>
                      <p className="text-[10px] text-gray-400">{requirements.diskSpace ? 'Espaço Suficiente' : 'Espaço Insuficiente'}</p>
                    </div>
                    <div className={`p-4 rounded-xl border-2 transition-all ${requirements.ram ? 'bg-white border-green-100' : 'bg-red-50 border-red-100'}`}>
                      <Cpu className={`w-5 h-5 mb-2 ${requirements.ram ? 'text-green-500' : 'text-red-500'}`} />
                      <p className="text-xs font-bold text-gray-700">8GB RAM</p>
                      <p className="text-[10px] text-gray-400">{requirements.ram ? 'Memória OK' : 'Memória Baixa'}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-8 space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Loader className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-blue-900 font-bold">Modo Ultra-Rápido Habilitado</p>
                      <p className="text-blue-700 text-xs mt-1">
                        O setup será concluído em segundos. O Android será baixado apenas no primeiro uso.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-red-800 font-bold text-sm">Atenção</p>
                      <p className="text-red-600 text-xs mt-1 leading-relaxed">{error}</p>

                      {error.includes('WSL') && (
                        <div className="mt-4 p-4 bg-white/50 border border-red-200 rounded-xl">
                          <p className="text-gray-900 font-bold text-xs mb-2">💡 Sugestão:</p>
                          <p className="text-gray-700 text-[10px] leading-relaxed">
                            O Windows às vezes trava o serviço do WSL2. Tente abrir o terminal (PowerShell) e execute:
                            <code className="block mt-1 p-2 bg-gray-800 text-white rounded font-mono">wsl --shutdown</code>
                            Se não funcionar, <strong>reinicie seu computador</strong>.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={runSetup}
                  disabled={!allRequirementsMet}
                  className="flex-1 bg-blue-600 text-white py-4 px-6 rounded-2xl hover:bg-blue-700 transition shadow-xl shadow-blue-200 disabled:bg-gray-200 disabled:shadow-none font-bold"
                >
                  Configurar Ambiente Agora
                </button>
                <button
                  onClick={() => window.history.back()}
                  className="px-6 py-4 border-2 border-gray-100 rounded-2xl hover:bg-gray-50 transition text-gray-500 font-bold"
                >
                  Voltar
                </button>
              </div>
            </>
          ) : (
            <div className="py-10 text-center">
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-2xl">
                  🚀
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Configurando</h2>
              <p className="text-gray-500 mb-8">{message}</p>

              <div className="max-w-xs mx-auto mb-8">
                <div className="flex justify-between mb-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Progresso</span>
                  <span className="text-lg font-black text-blue-600">{progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-500 shadow-lg shadow-blue-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-2xl inline-flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <p className="text-yellow-800 text-xs font-medium">
                  Não feche esta janela durante o processo.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
