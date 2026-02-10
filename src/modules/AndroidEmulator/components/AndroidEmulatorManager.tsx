import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { SmartphoneFrame } from './SmartphoneFrame';
import { useEmulator } from '../hooks/useEmulator';
import { RefreshCw, Plus } from 'lucide-react';

// Interface para eventos de progresso
interface ProgressEvent {
  type: 'progress' | 'progress_start' | 'progress_update' | 'progress_complete' | 'heartbeat' | 'progress_cancelled';
  instanceId: string;
  operation?: string;
  stage?: string;
  percentage?: number;
  message?: string;
  elapsed?: number;
  estimatedTimeRemaining?: number;
  success?: boolean;
  duration?: number;
  timestamp: number;
}

// Interface para estado de progresso por instância
interface InstanceProgress {
  instanceId: string;
  operation: string;
  stage: string;
  percentage: number;
  message: string;
  isActive: boolean;
  success?: boolean;
  lastHeartbeat: number;
}

export function AndroidEmulatorManager() {
  const {
    instances,
    loading,
    error,
    createInstance,
    startInstance,
    stopInstance,
    deleteInstance,
    refresh,
    clearError
  } = useEmulator();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<any>(null);

  // Estado para rastrear progresso de cada instância
  const [progressMap, setProgressMap] = useState<Map<string, InstanceProgress>>(new Map());
  const wsRef = useRef<WebSocket | null>(null);

  // Configurar WebSocket para receber eventos de progresso
  useEffect(() => {
    // Conectar ao WebSocket do backend
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//127.0.0.1:3010`;

    console.log(`🔌 Conectando ao WebSocket: ${wsUrl}`);

    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log('✅ WebSocket conectado para eventos de progresso');
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data) as ProgressEvent;

            // Filtrar apenas eventos de progresso do Android Emulator
            if (data.type === 'progress' || data.type === 'progress_start' ||
              data.type === 'progress_update' || data.type === 'progress_complete' ||
              data.type === 'heartbeat' || data.type === 'progress_cancelled') {
              handleProgressEvent(data);
            }
          } catch (error) {
            console.error('❌ Erro ao processar mensagem WebSocket:', error);
          }
        };

        ws.onerror = (error) => {
          console.warn('⚠️ Erro no WebSocket (tentando reconectar...):', error);
        };

        ws.onclose = () => {
          console.log('🔌 WebSocket desconectado - reconectando em 3s...');

          // Tentar reconectar após 3 segundos
          reconnectTimeout = setTimeout(() => {
            console.log('🔄 Tentando reconectar WebSocket...');
            connect();
          }, 3000);
        };

        wsRef.current = ws;
      } catch (error) {
        console.error('❌ Erro ao criar WebSocket:', error);

        // Tentar reconectar após 3 segundos
        reconnectTimeout = setTimeout(() => {
          console.log('🔄 Tentando reconectar WebSocket...');
          connect();
        }, 3000);
      }
    };

    connect();

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Handler para eventos de progresso
  const handleProgressEvent = (event: ProgressEvent) => {
    setProgressMap((prev) => {
      const newMap = new Map(prev);

      if (event.type === 'progress_start') {
        newMap.set(event.instanceId, {
          instanceId: event.instanceId,
          operation: event.operation || 'operation',
          stage: 'starting',
          percentage: 0,
          message: 'Iniciando operação...',
          isActive: true,
          lastHeartbeat: Date.now()
        });
      } else if (event.type === 'progress_update') {
        const existing = newMap.get(event.instanceId);
        newMap.set(event.instanceId, {
          instanceId: event.instanceId,
          operation: event.operation || existing?.operation || 'operation',
          stage: event.stage || 'processing',
          percentage: event.percentage || 0,
          message: event.message || 'Processando...',
          isActive: true,
          lastHeartbeat: Date.now()
        });
      } else if (event.type === 'progress_complete') {
        const existing = newMap.get(event.instanceId);
        newMap.set(event.instanceId, {
          instanceId: event.instanceId,
          operation: event.operation || existing?.operation || 'operation',
          stage: 'complete',
          percentage: 100,
          message: event.message || 'Concluído',
          isActive: false,
          success: event.success,
          lastHeartbeat: Date.now()
        });

        // Remover progresso após 3 segundos
        setTimeout(() => {
          setProgressMap((prev) => {
            const newMap = new Map(prev);
            newMap.delete(event.instanceId);
            return newMap;
          });
          // Atualizar lista de instâncias
          refresh();
        }, 3000);
      } else if (event.type === 'heartbeat') {
        const existing = newMap.get(event.instanceId);
        if (existing) {
          newMap.set(event.instanceId, {
            ...existing,
            lastHeartbeat: Date.now()
          });
        }
      } else if (event.type === 'progress_cancelled') {
        newMap.delete(event.instanceId);
      }

      return newMap;
    });
  };

  useEffect(() => {
    if (selectedInstance) {
      const updated = instances.find(i => i.id === selectedInstance.id);
      if (updated) setSelectedInstance(updated);
    }
  }, [instances]);

  const handleCreateInstance = async (name: string, options?: any) => {
    try {
      await createInstance(name, options);
      setShowCreateModal(false);
    } catch (err) { }
  };

  const handleTogglePower = async (id: string, currentStatus: string) => {
    // Verificar se a instância está em instalação
    const progress = progressMap.get(id);
    const isInstalling = progress?.isActive && progress?.operation === 'pre-installation';

    // Bloquear ação se estiver instalando
    if (isInstalling) {
      console.log('⚠️ Não é possível ligar/desligar durante a pré-instalação');
      return;
    }

    if (currentStatus === 'running') {
      await stopInstance(id);
      setSelectedInstance(null);
    } else {
      // Abrir o frame imediatamente para ver o boot
      const instance = instances.find(i => i.id === id);
      if (instance) setSelectedInstance(instance);
      await startInstance(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-800">Gerenciador de Dispositivos</h2>
            <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
              ☁️ MODO NUVEM
            </span>
          </div>
          <p className="text-sm text-gray-500">Android 13 rodando na nuvem via Easypanel</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refresh}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl shadow-lg font-bold"
          >
            <Plus className="w-5 h-5" />
            Novo Android
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700">
          <span className="text-xl">⚠️</span>
          <p className="text-sm font-medium flex-1">{error}</p>
          <button onClick={clearError} className="text-xs font-bold hover:underline">Dispensar</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && instances.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400">
            <RefreshCw className="w-10 h-10 animate-spin mb-4" />
            <p>Carregando dispositivos...</p>
          </div>
        ) : instances.map(instance => {
          const progress = progressMap.get(instance.id);
          const isInstalling = progress?.isActive && progress?.operation === 'pre-installation';

          return (
            <Card key={instance.id} className="overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all group">
              <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500" />
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-bold">{instance.name}</CardTitle>
                  <div className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${instance.status === 'running' ? 'bg-green-100 text-green-700' :
                    instance.status === 'starting' ? 'bg-blue-100 text-blue-700 animate-pulse' :
                      isInstalling ? 'bg-yellow-100 text-yellow-700 animate-pulse' :
                        'bg-gray-100 text-gray-500'
                    }`}>
                    {isInstalling ? 'INSTALANDO' : instance.status}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Barra de progresso durante instalação */}
                  {isInstalling && progress && (
                    <ProgressBar progress={progress} />
                  )}

                  {/* Mensagem de sucesso após instalação */}
                  {progress && !progress.isActive && progress.success && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
                      <span className="text-lg">✅</span>
                      <span className="text-xs font-bold text-green-700">{progress.message}</span>
                    </div>
                  )}

                  {/* Mensagem de erro após instalação */}
                  {progress && !progress.isActive && progress.success === false && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                      <span className="text-lg">⚠️</span>
                      <span className="text-xs font-bold text-red-700">{progress.message}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-gray-400">
                    <div>
                      <span className="block opacity-50">VNC PORT</span>
                      <span className="text-gray-700">{instance.vncPort || '---'}</span>
                    </div>
                    <div>
                      <span className="block opacity-50">ADB PORT</span>
                      <span className="text-gray-700">{instance.adbPort || '---'}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTogglePower(instance.id, instance.status)}
                      disabled={instance.status === 'starting' || isInstalling}
                      className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${instance.status === 'running'
                        ? 'bg-red-50 text-red-600'
                        : 'bg-green-600 text-white shadow-lg'
                        }`}
                    >
                      {isInstalling ? 'Instalando...' : instance.status === 'running' ? 'Desligar' : 'Ligar Agora'}
                    </button>

                    {instance.status === 'running' && !isInstalling && (
                      <button
                        onClick={() => setSelectedInstance(instance)}
                        className="px-4 bg-blue-600 text-white rounded-xl shadow-lg"
                      >
                        <span className="text-xl">📱</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (confirm('Excluir este Android?')) {
                          deleteInstance(instance.id);
                        }
                      }}
                      disabled={isInstalling}
                      className="p-3 text-gray-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {!loading && !error && instances.length === 0 && (
          <div className="col-span-full py-20 bg-gray-50 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-center px-6">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-6 text-4xl">
              📱
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Nenhum Dispositivo</h3>
            <p className="text-gray-500 max-w-xs mb-8">
              Crie seu primeiro smartphone virtual para começar.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl"
            >
              Criar Primeiro Android
            </button>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateInstance}
          loading={loading}
        />
      )}

      {selectedInstance && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center overflow-hidden">
          {(() => {
            // Verificar se a instância está em instalação
            const progress = progressMap.get(selectedInstance.id);
            const isInstalling = progress?.isActive && progress?.operation === 'pre-installation';

            if (isInstalling) {
              // Mostrar tela de instalação em vez da UI do emulador
              return (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="max-w-2xl w-full p-8">
                    <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-3xl p-8 shadow-2xl border border-white/10">
                      <div className="text-center mb-8">
                        <div className="w-24 h-24 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
                          <span className="text-5xl">📱</span>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">
                          Instalando Android
                        </h2>
                        <p className="text-blue-200">
                          {selectedInstance.name}
                        </p>
                      </div>

                      {/* Barra de progresso grande */}
                      <div className="space-y-4 mb-8">
                        <div className="flex items-center justify-between text-white">
                          <span className="text-lg font-bold">
                            {getStageLabel(progress.stage)}
                          </span>
                          <span className="text-2xl font-bold">
                            {Math.round(progress.percentage)}%
                          </span>
                        </div>

                        <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden shadow-inner">
                          <div
                            className={`h-full ${getStageColor(progress.stage)} transition-all duration-500 ease-out rounded-full`}
                            style={{ width: `${progress.percentage}%` }}
                          />
                        </div>

                        <p className="text-blue-200 text-center">
                          {progress.message}
                        </p>
                      </div>

                      {/* Informações adicionais */}
                      <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-blue-200 text-sm">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>A interface do emulador será liberada após a conclusão da instalação</span>
                        </div>
                      </div>

                      {/* Botão para fechar */}
                      <button
                        onClick={() => setSelectedInstance(null)}
                        className="w-full mt-6 py-3 bg-white/10 text-white rounded-xl backdrop-blur-md border border-white/10 font-bold hover:bg-white/20 transition-colors"
                      >
                        Fechar e Aguardar em Segundo Plano
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            // Mostrar UI normal do emulador
            return (
              <>
                <div className="absolute top-6 left-6 z-[110] flex items-center gap-4">
                  <button
                    onClick={() => setSelectedInstance(null)}
                    className="px-6 py-2 bg-white/10 text-white rounded-xl backdrop-blur-md border border-white/10 font-bold"
                  >
                    ⬅ Sair do Android
                  </button>
                  <div className="text-white">
                    <span className="text-xs text-white/50 block font-bold">DISPOSITIVO</span>
                    <span className="font-bold">{selectedInstance.name}</span>
                  </div>
                </div>

                <div className="w-full h-full pt-20 flex gap-4">
                  {/* Tela do Android */}
                  <div className="w-full">
                    <SmartphoneFrame
                      instance={{
                        ...selectedInstance,
                        network: {
                          vncPort: selectedInstance.vncPort,
                          adbPort: selectedInstance.adbPort
                        }
                      }}
                      onPowerToggle={() => {
                        handleTogglePower(selectedInstance.id, selectedInstance.status);
                      }}
                    />
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// Componente de barra de progresso
function ProgressBar({ progress }: { progress: InstanceProgress }) {
  const getStageLabel = (stage: string) => {
    const labels: Record<string, string> = {
      'disk-creation': '💾 Criando disco virtual',
      'boot': '🚀 Iniciando sistema',
      'installation': '📦 Instalando Android',
      'verification': '✅ Verificando instalação',
      'starting': '⏳ Preparando...',
      'complete': '✅ Concluído'
    };
    return labels[stage] || stage;
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      'disk-creation': 'bg-blue-500',
      'boot': 'bg-purple-500',
      'installation': 'bg-yellow-500',
      'verification': 'bg-green-500',
      'starting': 'bg-gray-500',
      'complete': 'bg-green-600'
    };
    return colors[stage] || 'bg-blue-500';
  };

  return (
    <div className="space-y-2 p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
          <span className="text-xs font-bold text-blue-900">
            {getStageLabel(progress.stage)}
          </span>
        </div>
        <span className="text-xs font-bold text-blue-700">
          {Math.round(progress.percentage)}%
        </span>
      </div>

      {/* Barra de progresso */}
      <div className="w-full bg-white rounded-full h-2 overflow-hidden shadow-inner">
        <div
          className={`h-full ${getStageColor(progress.stage)} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${progress.percentage}%` }}
        />
      </div>

      {/* Mensagem de progresso */}
      <p className="text-[10px] text-blue-700 font-medium">
        {progress.message}
      </p>

      {/* Indicador de heartbeat */}
      {progress.isActive && (
        <div className="flex items-center gap-1 text-[9px] text-blue-500">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
          <span>Sistema ativo</span>
        </div>
      )}
    </div>
  );
}

// Funções auxiliares para labels e cores (usadas na tela de instalação fullscreen)
function getStageLabel(stage: string) {
  const labels: Record<string, string> = {
    'disk-creation': '💾 Criando disco virtual',
    'boot': '🚀 Iniciando sistema',
    'installation': '📦 Instalando Android',
    'verification': '✅ Verificando instalação',
    'starting': '⏳ Preparando...',
    'complete': '✅ Concluído'
  };
  return labels[stage] || stage;
}

function getStageColor(stage: string) {
  const colors: Record<string, string> = {
    'disk-creation': 'bg-blue-500',
    'boot': 'bg-purple-500',
    'installation': 'bg-yellow-500',
    'verification': 'bg-green-500',
    'starting': 'bg-gray-500',
    'complete': 'bg-green-600'
  };
  return colors[stage] || 'bg-blue-500';
}

function CreateModal({ onClose, onSubmit, loading }: any) {
  const [name, setName] = useState('');
  const [profile, setProfile] = useState<'low' | 'med' | 'high'>('med');

  const handleSubmit = () => {
    onSubmit(name, { profile });
  };

  const profiles = [
    { id: 'low', label: 'Econômico (Leve)', desc: '1.5GB RAM, 2 CPUs. Ideal para máquinas lentas.', icon: '⚡' },
    { id: 'med', label: 'Equilibrado', desc: '2.5GB RAM, 3 CPUs. Recomendado para uso geral.', icon: '⚖️' },
    { id: 'high', label: 'Alta Performance', desc: '4GB RAM, 4 CPUs. Muito fluido e rápido.', icon: '🚀' },
  ];

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-none shadow-2xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-blue-600 to-purple-600" />
        <CardHeader>
          <CardTitle className="text-2xl">📱 Novo Android (WSL2)</CardTitle>
          <p className="text-sm text-gray-500">Android x86 no ambiente WSL2</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Nome do Dispositivo</label>
            <input
              autoFocus
              className="w-full p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-medium text-lg"
              placeholder="Ex: WhatsApp Comercial"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-700">Perfil de Desempenho</label>
            <div className="grid grid-cols-1 gap-2">
              {profiles.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setProfile(p.id as any)}
                  className={`flex items-start gap-3 p-3 rounded-xl border-2 transition-all text-left ${profile === p.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                >
                  <span className="text-2xl mt-1">{p.icon}</span>
                  <div>
                    <p className={`font-bold text-sm ${profile === p.id ? 'text-blue-700' : 'text-gray-700'}`}>
                      {p.label}
                    </p>
                    <p className="text-[10px] text-gray-500">{p.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !name}
              className="flex-[2] py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Criando...</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>Criar Dispositivo</span>
                </>
              )}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

