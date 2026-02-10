import React from 'react';
import { WhatsAppService } from '../../services/WhatsAppService';
import { WhatsAppInstance } from './types';
import { QrCodeModal } from './components/QrCodeModal';
import { NewInstanceModal } from './components/NewInstanceModal';
import { InstanceConfigModal } from './components/InstanceConfigModal';
import { cn } from '../../lib/utils';

// Componentes de ícones usando React.createElement
const Plus = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M5 12h14' }),
    React.createElement('path', { d: 'M12 5v14' }));

const Smartphone = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('rect', { width: '14', height: '20', x: '5', y: '2', rx: '2', ry: '2' }),
    React.createElement('path', { d: 'm12 18 0 0' }));

const QrCode = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('rect', { width: '5', height: '5', x: '3', y: '3', rx: '1' }),
    React.createElement('rect', { width: '5', height: '5', x: '16', y: '3', rx: '1' }),
    React.createElement('rect', { width: '5', height: '5', x: '3', y: '16', rx: '1' }),
    React.createElement('path', { d: 'M21 16h-3a2 2 0 0 0-2 2v3' }),
    React.createElement('path', { d: 'M21 21v.01' }),
    React.createElement('path', { d: 'M12 7v3a2 2 0 0 1-2 2H7' }),
    React.createElement('path', { d: 'M3 12h.01' }),
    React.createElement('path', { d: 'M12 3h.01' }),
    React.createElement('path', { d: 'M12 16v.01' }),
    React.createElement('path', { d: 'M16 12h1' }),
    React.createElement('path', { d: 'M21 12v.01' }),
    React.createElement('path', { d: 'M12 21v-1' }));

const Power = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M12 2v10' }),
    React.createElement('path', { d: 'M18.4 6.6a9 9 0 1 1-12.77.04' }));

const Trash2 = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M3 6h18' }),
    React.createElement('path', { d: 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6' }),
    React.createElement('path', { d: 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2' }),
    React.createElement('line', { x1: '10', x2: '10', y1: '11', y2: '17' }),
    React.createElement('line', { x1: '14', x2: '14', y1: '11', y2: '17' }));

const Battery = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('rect', { width: '16', height: '10', x: '2', y: '7', rx: '2', ry: '2' }),
    React.createElement('line', { x1: '22', x2: '22', y1: '11', y2: '13' }));

const Wifi = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M12 20h.01' }),
    React.createElement('path', { d: 'M2 8.82a15 15 0 0 1 20 0' }),
    React.createElement('path', { d: 'M5 12.859a10 10 0 0 1 14 0' }),
    React.createElement('path', { d: 'M8.5 16.429a5 5 0 0 1 7 0' }));

const RefreshCw = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8' }),
    React.createElement('path', { d: 'M21 3v5h-5' }),
    React.createElement('path', { d: 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16' }),
    React.createElement('path', { d: 'M8 16H3v5' }));

const Settings = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z' }),
    React.createElement('circle', { cx: '12', cy: '12', r: '3' }));

const AlertCircle = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('circle', { cx: '12', cy: '12', r: '10' }),
    React.createElement('line', { x1: '12', x2: '12', y1: '8', y2: '12' }),
    React.createElement('line', { x1: '12', x2: '12.01', y1: '16', y2: '16' }));

const XCircle = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('circle', { cx: '12', cy: '12', r: '10' }),
    React.createElement('path', { d: 'm15 9-6 6' }),
    React.createElement('path', { d: 'm9 9 6 6' }));

export default function InstanciasPage() {
  const [instances, setInstances] = React.useState<WhatsAppInstance[]>([]);
  const [isQrModalOpen, setIsQrModalOpen] = React.useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = React.useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = React.useState(false);
  const [selectedInstance, setSelectedInstance] = React.useState<WhatsAppInstance | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [isCreating, setIsCreating] = React.useState(false);
  const [isConnecting, setIsConnecting] = React.useState<string | null>(null);

  // Debug modal state changes
  React.useEffect(() => {
    console.log('🔍 Modal states changed:', { isNewModalOpen, isQrModalOpen, isConfigModalOpen, isCreating });
  }, [isNewModalOpen, isQrModalOpen, isConfigModalOpen, isCreating]);

  const loadData = async () => {
    try {
      setError(null);
      const data = await WhatsAppService.getAll();
      setInstances(data);
    } catch (err) {
      console.error('Erro ao carregar instâncias:', err);
      setError('Erro ao carregar instâncias. Verifique a conexão com o backend.');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();

    // Escutar eventos do WebSocket para atualização em tempo real
    const handleInstanceUpdate = () => {
      console.log('🔄 Evento de atualização de instância recebido, recarregando dados');
      loadData();
    };

    const handleSocketUpdate = (data: any) => {
      console.log('🔄 Socket update recebido:', data);
      
      // Limpar estado de conexão quando instância conectar
      if (data?.status === 'connected' && isConnecting === data?.id) {
        console.log('✅ Instância conectada, limpando estado de conexão');
        setIsConnecting(null);
      }
      
      loadData();
    };

    // Eventos personalizados (legado/internos)
    window.addEventListener('instances-update', handleInstanceUpdate);

    // Eventos do WhatsAppService (Universal)
    WhatsAppService.on('instanceConnected', handleSocketUpdate);
    WhatsAppService.on('instanceStatusChanged', handleSocketUpdate);

    return () => {
      window.removeEventListener('instances-update', handleInstanceUpdate);
      WhatsAppService.off('instanceConnected', handleSocketUpdate);
      WhatsAppService.off('instanceStatusChanged', handleSocketUpdate);
    };
  }, [isConnecting]); // Adicionar isConnecting como dependência

  // Limpar estado de conexão quando instância mudar de status
  React.useEffect(() => {
    if (isConnecting) {
      const connectingInstance = instances.find((i: WhatsAppInstance) => i.id === isConnecting);
      if (connectingInstance && connectingInstance.status !== 'connecting') {
        console.log('✅ Instância não está mais conectando, limpando estado:', connectingInstance.status);
        setIsConnecting(null);
      }
    }
  }, [instances, isConnecting]);

  const handleCreate = async (name: string, provider: 'baileys' | 'whaileys') => {
    if (isCreating) {
      console.log('⚠️ Criação já em andamento, ignorando');
      return;
    }

    try {
      setIsCreating(true);
      console.log('🔄 handleCreate chamado com:', { name, provider });
      console.log('🔄 Tipo do provider recebido:', typeof provider);
      console.log('🔄 Valor exato do provider:', JSON.stringify(provider));

      await WhatsAppService.createInstance(name, undefined, provider);
      await loadData();
      console.log('✅ Instância criada com sucesso');

      // Fechar modal apenas após sucesso
      setIsNewModalOpen(false);
    } catch (err) {
      console.error('❌ Erro ao criar instância:', err);
      // Propagar erro para o modal tratar
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza? Isso removerá todas as configurações desta instância.')) {
      return;
    }

    try {
      await WhatsAppService.deleteInstance(id);
      await loadData();
    } catch (err) {
      console.error('Erro ao deletar instância:', err);
      alert('Erro ao deletar instância. Tente novamente.');
    }
  };

  const handleConnect = async (instance: WhatsAppInstance) => {
    if (isConnecting === instance.id) {
      console.log('⚠️ Conexão já em andamento para esta instância');
      return;
    }

    try {
      console.log('🔄 handleConnect iniciado para instância:', instance.name);
      console.log('🔄 Provider da instância:', instance.provider);
      console.log('🔄 ID da instância:', instance.id);

      setIsConnecting(instance.id);
      setSelectedInstance(instance);

      // Timeout de segurança para limpar o estado de conexão
      const timeoutId = setTimeout(() => {
        console.log('⏰ Timeout de conexão atingido, limpando estado');
        setIsConnecting(null);
      }, 30000); // 30 segundos

      // Primeiro iniciar a conexão
      console.log('🔄 Chamando WhatsAppService.connect...');
      await WhatsAppService.connect(instance.id);
      console.log('✅ Comando de conexão enviado com sucesso');

      // Aguardar um pouco mais para garantir que o QR seja gerado
      console.log('🔄 Aguardando 1.5s antes de abrir modal...');
      setTimeout(() => {
        console.log('🔄 Abrindo modal QR após conexão iniciada');
        setIsQrModalOpen(true);
        clearTimeout(timeoutId); // Limpar timeout se chegou até aqui
      }, 1500); // Aumentado para 1.5s

    } catch (err: any) {
      console.error('❌ Erro ao conectar instância:', err);
      alert('Erro ao conectar instância: ' + err.message);
      setIsConnecting(null);
    }
  };

  const handleDisconnect = async (id: string) => {
    if (!confirm('Desconectar esta sessão do WhatsApp?')) {
      return;
    }

    try {
      await WhatsAppService.disconnect(id);
      await loadData();
    } catch (err) {
      console.error('Erro ao desconectar instância:', err);
      alert('Erro ao desconectar instância. Tente novamente.');
    }
  };

  // Estatísticas das instâncias
  const stats = React.useMemo(() => {
    const connected = instances.filter((i: WhatsAppInstance) => i.status === 'connected').length;
    const connecting = instances.filter((i: WhatsAppInstance) => i.status === 'connecting').length;
    const disconnected = instances.filter((i: WhatsAppInstance) => i.status === 'disconnected').length;

    return { connected, connecting, disconnected, total: instances.length };
  }, [instances]);

  const handleCloseQrModal = React.useCallback(() => {
    console.log('🔄 Fechando modal QR');
    setIsQrModalOpen(false);
  }, []);

  const handleOpenConfig = (instance: WhatsAppInstance) => {
    console.log('🔄 Abrindo configurações para instância:', instance.name);
    setSelectedInstance(instance);
    setIsConfigModalOpen(true);
  };

  const handleCloseConfig = () => {
    console.log('🔄 Fechando modal de configurações');
    setIsConfigModalOpen(false);
    setSelectedInstance(null);
  };

  const currentSelectedInstance = React.useMemo(() => {
    if (!selectedInstance) return null;
    return instances.find((i: any) => i.id === selectedInstance.id) || selectedInstance;
  }, [instances, selectedInstance]);

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      {/* Modals */}
      {isQrModalOpen && (
        <QrCodeModal
          isOpen={isQrModalOpen}
          onClose={handleCloseQrModal}
          instance={currentSelectedInstance}
        />
      )}

      {isNewModalOpen && (
        <NewInstanceModal
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          onConfirm={handleCreate}
        />
      )}

      {isConfigModalOpen && (
        <InstanceConfigModal
          isOpen={isConfigModalOpen}
          onClose={handleCloseConfig}
          instance={selectedInstance}
          onUpdate={loadData}
        />
      )}

      {/* Header */}
      <div className="p-8 pb-4 shrink-0">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Instâncias WhatsApp</h1>
            <p className="text-gray-500 mt-1">Gerencie suas conexões com a API Whaileys</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="bg-gray-100 text-gray-600 px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition shadow-sm font-medium disabled:opacity-50"
            >
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
              Atualizar
            </button>
            <button
              onClick={() => {
                console.log('🔍 Clicando em Nova Instância (header)');
                setIsNewModalOpen(true);
              }}
              className="bg-emerald-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition shadow-sm font-medium"
            >
              <Plus size={20} />
              Nova Instância
            </button>
          </div>
        </div>

        {/* Dashboard de Estatísticas */}
        {!isLoading && instances.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Total</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Smartphone className="text-blue-600" size={20} />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Conectadas</p>
                  <p className="text-2xl font-bold text-emerald-600">{stats.connected}</p>
                </div>
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Wifi className="text-emerald-600" size={20} />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Conectando</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.connecting}</p>
                </div>
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <RefreshCw className="text-yellow-600 animate-spin" size={20} />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Desconectadas</p>
                  <p className="text-2xl font-bold text-red-600">{stats.disconnected}</p>
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Power className="text-red-600" size={20} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-500" size={20} />
              <div>
                <h3 className="font-bold text-red-800">Erro de Conexão</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
              <button
                onClick={loadData}
                className="ml-auto bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200 transition"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center gap-4">
              <RefreshCw className="animate-spin text-emerald-600" size={32} />
              <p className="text-gray-500">Carregando instâncias...</p>
            </div>
          </div>
        ) : instances.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-white">
            <Smartphone size={48} className="mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-gray-600 mb-2">Nenhuma instância criada</h3>
            <p className="text-gray-500 mb-4 text-center max-w-md">
              Crie sua primeira instância WhatsApp para começar a enviar e receber mensagens através da API Whaileys.
            </p>
            <button
              onClick={() => {
                console.log('🔍 Clicando em Nova Instância (empty state)');
                setIsNewModalOpen(true);
              }}
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-emerald-700 transition shadow-sm flex items-center gap-2"
            >
              <Plus size={20} />
              Criar primeira instância
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {instances.map((instance: WhatsAppInstance) => (
              <div key={instance.id} className={cn(
                "bg-white rounded-xl shadow-sm border transition-all duration-300 relative overflow-hidden group hover:shadow-md",
                instance.status === 'connected' ? "border-emerald-200 ring-1 ring-emerald-100" :
                  instance.status === 'connecting' ? "border-yellow-200 ring-1 ring-yellow-100" : "border-gray-200"
              )}>
                {/* Status Bar Top */}
                <div className={cn(
                  "h-1.5 w-full",
                  instance.status === 'connected' ? "bg-emerald-500" :
                    instance.status === 'connecting' ? "bg-yellow-500 animate-pulse" : "bg-gray-300"
                )} />

                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="relative">
                      {instance.profilePic ? (
                        <img
                          src={instance.profilePic}
                          alt={instance.name}
                          className="w-14 h-14 rounded-full border-2 border-white shadow-sm object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center text-emerald-600 shadow-sm">
                          <Smartphone size={28} />
                        </div>
                      )}
                      <span className={cn(
                        "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white shadow-sm",
                        instance.status === 'connected' ? "bg-emerald-500" :
                          instance.status === 'connecting' ? "bg-yellow-500 animate-pulse" : "bg-red-500"
                      )} />
                    </div>

                    <div className="flex flex-col items-end">
                      <span className={cn(
                        "px-2 py-1 text-[10px] font-bold rounded-full uppercase mb-1",
                        instance.status === 'connected' ? "bg-emerald-100 text-emerald-700" :
                          instance.status === 'connecting' ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"
                      )}>
                        {instance.status === 'connected' ? 'Online' :
                          instance.status === 'connecting' ? 'Conectando...' : 'Offline'}
                      </span>
                      {instance.status === 'connected' && instance.batteryLevel && (
                        <div className="flex items-center gap-1 text-xs text-gray-400" title={`Nível de Bateria: ${instance.batteryLevel}%`}>
                          <Battery size={12} className={instance.batteryLevel < 20 ? "text-red-500" : instance.batteryLevel < 50 ? "text-yellow-500" : "text-emerald-500"} />
                          <span className={instance.batteryLevel < 20 ? "text-red-500" : ""}>{instance.batteryLevel}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="font-bold text-lg text-gray-800 truncate mb-1">{instance.name}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-gray-500 text-sm truncate">
                      {instance.phoneNumber ? `+${instance.phoneNumber}` : 'Aguardando configuração'}
                    </p>
                    {instance.provider && (
                      <span className={cn(
                        "px-2 py-1 text-[10px] font-bold rounded-full uppercase",
                        instance.provider === 'whaileys' ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                      )}>
                        {instance.provider === 'whaileys' ? '🚀 Whaileys' : '⚡ Baileys'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-gray-400">
                      <Wifi size={12} />
                      <span>
                        {instance.status === 'connected' ? 'Sincronizado' :
                          instance.status === 'connecting' ? 'Conectando...' : 'Desconectado'}
                      </span>
                    </div>
                    {instance.lastConnection && (
                      <span className="text-gray-400">
                        {new Date(instance.lastConnection).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex gap-2">
                  {instance.status === 'connected' ? (
                    <>
                      <button 
                        onClick={() => handleOpenConfig(instance)}
                        className="flex-1 bg-white border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
                      >
                        <Settings size={16} />
                        Configurar
                      </button>
                      <button
                        onClick={() => handleDisconnect(instance.id)}
                        className="px-3 py-2.5 bg-red-50 text-red-600 rounded-lg border border-red-100 hover:bg-red-100 transition"
                        title="Desconectar"
                      >
                        <Power size={18} />
                      </button>
                    </>
                  ) : (instance.status === 'connecting' || isConnecting === instance.id) ? (
                    <>
                      <button
                        disabled
                        className="flex-1 bg-yellow-100 text-yellow-700 py-2.5 rounded-lg text-sm font-medium cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <RefreshCw size={16} className="animate-spin" />
                        Conectando...
                      </button>
                      <button
                        onClick={() => handleDisconnect(instance.id)}
                        className="px-3 py-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Cancelar Conexão"
                      >
                        <XCircle size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleConnect(instance)}
                        disabled={isConnecting === instance.id}
                        className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isConnecting === instance.id ? (
                          <>
                            <RefreshCw size={16} className="animate-spin" />
                            Iniciando...
                          </>
                        ) : (
                          <>
                            <QrCode size={16} />
                            Conectar
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(instance.id)}
                        className="px-3 py-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Excluir Instância"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
