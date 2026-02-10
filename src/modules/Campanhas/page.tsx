import React from 'react';
import { CampaignService, Campaign } from '../../services/CampaignService';
import { WhatsAppService } from '../../services/WhatsAppService';
import { AudienceSelector } from './components/AudienceSelector';
import { InstanceSelector } from './components/InstanceSelector';
import { ScheduleModalFixed as ScheduleModal } from '../Atendimentos/components/ScheduleModalFixed';
import { ActiveCampaignCard } from './components/ActiveCampaignCard';
import { cn } from '../../lib/utils';
import { useToast } from '../../hooks/useToast';
import { useErrorHandler } from '../../hooks/useErrorHandler';

// Componentes de ícones usando React.createElement
const Plus = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M5 12h14' }),
    React.createElement('path', { d: 'M12 5v14' }));

const Send = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'm22 2-7 20-4-9-9-4Z' }),
    React.createElement('path', { d: 'M22 2 11 13' }));

const Settings = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z' }),
    React.createElement('circle', { cx: '12', cy: '12', r: '3' }));

const Clock = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('circle', { cx: '12', cy: '12', r: '10' }),
    React.createElement('polyline', { points: '12,6 12,12 16,14' }));

const Smartphone = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('rect', { width: '14', height: '20', x: '5', y: '2', rx: '2', ry: '2' }),
    React.createElement('path', { d: 'm12 18 0 0' }));

const Shuffle = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22' }),
    React.createElement('path', { d: 'm18 2 4 4-4 4' }),
    React.createElement('path', { d: 'M2 6h1.9c1.5 0 2.9.9 3.6 2.2' }),
    React.createElement('path', { d: 'M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8' }),
    React.createElement('path', { d: 'm18 14 4 4-4 4' }));

const Play = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  }, React.createElement('polygon', { points: '6,3 20,12 6,21' }));

const CheckCircle = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' }),
    React.createElement('path', { d: 'm9 11 3 3L22 4' }));

const RefreshCw = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8' }),
    React.createElement('path', { d: 'M21 3v5h-5' }),
    React.createElement('path', { d: 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16' }),
    React.createElement('path', { d: 'M8 16H3v5' }));

const XCircle = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('circle', { cx: '12', cy: '12', r: '10' }),
    React.createElement('path', { d: 'm15 9-6 6' }),
    React.createElement('path', { d: 'm9 9 6 6' }));

const Search = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('circle', { cx: '11', cy: '11', r: '8' }),
    React.createElement('path', { d: 'm21 21-4.35-4.35' }));

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

export default function CampanhasPage() {
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [isNewCampaignMode, setIsNewCampaignMode] = React.useState(false);
  const [connectedInstancesCount, setConnectedInstancesCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);
  const [instances, setInstances] = React.useState<any[]>([]);

  // New Campaign State
  const [step, setStep] = React.useState(1);
  const [audienceStats, setAudienceStats] = React.useState({ valid: 0, invalid: 0, total: 0 });
  const [messageData, setMessageData] = React.useState<any>(null);
  const [campaignName, setCampaignName] = React.useState('');
  const [selectedInstances, setSelectedInstances] = React.useState<string[]>([]);
  const [messagesPerInstance, setMessagesPerInstance] = React.useState(2); // Default 2 mensagens
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [audienceData, setAudienceData] = React.useState<any>(null);

  // Configuração de Envio
  const [sendConfig, setSendConfig] = React.useState({
    minDelay: 10, // Default mais rápido para teste
    maxDelay: 20,
    messagesPerInstance: 50
  });

  // Modal Composer
  const [isComposerOpen, setIsComposerOpen] = React.useState(false);

  const { success: showSuccess, error: showError } = useToast();
  const { handleError } = useErrorHandler();

  // Função para mapear tipos de mensagem do ScheduleModal para o banco
  const mapMessageType = (scheduleType: string): string => {
    const typeMap: Record<string, string> = {
      'text': 'text',
      'media': 'image', // ScheduleModal usa 'media', banco espera 'image'
      'audio': 'audio',
      'buttons': 'buttons', // AGORA CORRETO: preserva o tipo buttons
      'list': 'list', // AGORA CORRETO: preserva o tipo list
      'carousel': 'carousel',
      'poll': 'poll',
      'video': 'video',
      'document': 'document',
      'template': 'template'
    };

    return typeMap[scheduleType] || 'text';
  };

  // Função helper para compatibilidade
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    switch (type) {
      case 'success':
        showSuccess(message);
        break;
      case 'error':
        showError(message);
        break;
      case 'info':
        showSuccess(message);
        break;
      case 'warning':
        showError(message);
        break;
    }
  };

  React.useEffect(() => {
    loadData(true);
    const interval = setInterval(() => loadData(false), 5000);
    window.addEventListener('campaign-update', () => loadData(false));
    return () => {
      clearInterval(interval);
      window.removeEventListener('campaign-update', () => loadData(false));
    };
  }, []);

  const loadData = async (showLoading = false) => {
    try {
      if (showLoading) {
        setIsInitialLoading(true);
      }
      const [campaignsData, instancesData] = await Promise.all([
        CampaignService.getAll(),
        WhatsAppService.getAll()
      ]);

      setCampaigns(campaignsData);
      setInstances(instancesData);
      const connectedInstances = instancesData.filter((i: any) => i.status === 'connected');
      setConnectedInstancesCount(connectedInstances.length);
    } catch (error) {
      handleError(error, 'Erro ao carregar dados das campanhas');
    } finally {
      if (showLoading) {
        setIsInitialLoading(false);
      }
    }
  };

  const handleStartCampaign = async () => {
    if (!campaignName || audienceStats.valid === 0 || !messageData || selectedInstances.length === 0) {
      showToast('Preencha todos os dados obrigatórios e selecione pelo menos uma instância', 'error');
      return;
    }

    if (connectedInstancesCount === 0) {
      showToast('Nenhuma instância conectada disponível', 'error');
      return;
    }

    try {
      setIsLoading(true);

      const currentConnectedInstances = instances
        .filter((i: any) => i.status === 'connected')
        .map((i: any) => i.id);

      const validSelectedInstances = selectedInstances.filter((id: string) =>
        currentConnectedInstances.includes(id)
      );

      if (validSelectedInstances.length === 0) {
        showToast('Nenhuma das instâncias selecionadas está conectada', 'error');
        setIsLoading(false);
        return;
      }

      // Preparar dados da campanha
      const finalMessageType = mapMessageType(messageData.type);

      let finalMessageContent = '';
      if (finalMessageType === 'text') {
        finalMessageContent = messageData.content?.text || '';
      } else {
        finalMessageContent = JSON.stringify(messageData.content);
      }

      const campaignData = {
        name: campaignName,
        description: `Campanha criada em ${new Date().toLocaleDateString()}`,
        messageType: finalMessageType,
        messageContent: finalMessageContent,
        mediaUrl: messageData.content?.image?.url || messageData.content?.video?.url || messageData.content?.url,
        mediaFiles: messageData.content?.mediaFiles || [],
        targetType: (audienceData?.type === 'contacts' || audienceData?.type === 'numbers') ? 'list' : 'all',
        contactList: (audienceData?.type === 'contacts' || audienceData?.type === 'numbers') ? audienceData.list : [],
        instances: validSelectedInstances,
        minDelay: sendConfig.minDelay * 1000,
        maxDelay: sendConfig.maxDelay * 1000,
        delayBetweenMessages: sendConfig.minDelay * 1000,
        delayBetweenInstances: 30000,
        maxMessagesPerInstance: selectedInstances.length > 1 ? messagesPerInstance : sendConfig.messagesPerInstance
      };

      console.log('🚀 Criando campanha com dados:', campaignData);

      const newCampaign = await CampaignService.create(campaignData);

      console.log('✅ Campanha criada:', newCampaign);
      showToast('Campanha criada com sucesso!', 'success');

      console.log('🎯 Iniciando campanha:', newCampaign.id);
      await CampaignService.startSending(newCampaign.id);
      showToast('Campanha iniciada!', 'success');

      setIsNewCampaignMode(false);
      setStep(1);
      setCampaignName('');
      setMessageData(null);
      setSelectedInstances([]);
      setMessagesPerInstance(2);
      setAudienceStats({ valid: 0, invalid: 0, total: 0 });

      loadData(false);

    } catch (error) {
      console.error('❌ Erro detalhado ao criar/iniciar campanha:', error);
      handleError(error, 'Erro ao criar campanha');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePause = async (id: string) => {
    try {
      await CampaignService.pause(id);
      showToast('Campanha pausada', 'success');
      loadData(false);
    } catch (error) {
      handleError(error, 'Erro ao pausar campanha');
    }
  };

  const handleResume = async (id: string) => {
    try {
      await CampaignService.resume(id);
      showToast('Campanha retomada', 'success');
      loadData(false);
    } catch (error) {
      handleError(error, 'Erro ao retomar campanha');
    }
  };

  const handleStop = async (id: string) => {
    if (!confirm('Tem certeza que deseja PARAR e EXCLUIR esta campanha? Esta ação não pode ser desfeita.')) return;

    try {
      // Primeiro, pausar a campanha se estiver em execução
      const campaign = campaigns.find(c => c.id === id);
      if (campaign && (campaign.status === 'running' || campaign.status === 'scheduled')) {
        console.log('🔄 Pausando campanha antes de excluir...');
        await CampaignService.pause(id);

        // Aguardar um pouco para garantir que a campanha foi pausada
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Depois, excluir a campanha
      console.log('🗑️ Excluindo campanha...');
      const success = await CampaignService.delete(id);
      if (success) {
        showToast('Campanha parada e excluída com sucesso', 'success');
        loadData(false);
      } else {
        showToast('Erro ao excluir campanha', 'error');
      }
    } catch (error: any) {
      console.error('❌ Erro ao parar/excluir campanha:', error);

      // Se o erro for sobre campanha em execução, tentar pausar primeiro
      if (error.message?.includes('execução') || error.message?.includes('running')) {
        try {
          console.log('🔄 Tentando pausar campanha primeiro...');
          await CampaignService.pause(id);
          await new Promise(resolve => setTimeout(resolve, 1500));

          // Tentar excluir novamente
          const success = await CampaignService.delete(id);
          if (success) {
            showToast('Campanha parada e excluída com sucesso', 'success');
            loadData(false);
          } else {
            showToast('Erro ao excluir campanha após pausar', 'error');
          }
        } catch (retryError) {
          handleError(retryError, 'Erro ao pausar e excluir campanha');
        }
      } else {
        handleError(error, 'Erro ao excluir campanha');
      }
    }
  };

  const handleDelete = async (id: string, campaignName: string) => {
    if (!confirm(`Tem certeza que deseja excluir a campanha "${campaignName}"? Esta ação não pode ser desfeita.`)) return;

    try {
      // Primeiro, pausar a campanha se estiver em execução
      const campaign = campaigns.find(c => c.id === id);
      if (campaign && (campaign.status === 'running' || campaign.status === 'scheduled')) {
        console.log('🔄 Pausando campanha antes de excluir...');
        await CampaignService.pause(id);

        // Aguardar um pouco para garantir que a campanha foi pausada
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Depois, excluir a campanha
      const success = await CampaignService.delete(id);
      if (success) {
        showToast('Campanha excluída com sucesso', 'success');
        loadData(false);
      } else {
        showToast('Erro ao excluir campanha', 'error');
      }
    } catch (error: any) {
      console.error('❌ Erro ao excluir campanha:', error);

      // Se o erro for sobre campanha em execução, tentar pausar primeiro
      if (error.message?.includes('execução') || error.message?.includes('running')) {
        try {
          console.log('🔄 Tentando pausar campanha primeiro...');
          await CampaignService.pause(id);
          await new Promise(resolve => setTimeout(resolve, 1500));

          // Tentar excluir novamente
          const success = await CampaignService.delete(id);
          if (success) {
            showToast('Campanha excluída com sucesso', 'success');
            loadData(false);
          } else {
            showToast('Erro ao excluir campanha após pausar', 'error');
          }
        } catch (retryError) {
          handleError(retryError, 'Erro ao pausar e excluir campanha');
        }
      } else {
        handleError(error, 'Erro ao excluir campanha');
      }
    }
  };

  // Separa campanhas ativas das finalizadas com filtros
  const filteredCampaigns = campaigns.filter((c: Campaign) => {
    const matchesSearch = searchTerm === '' ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const activeCampaigns = filteredCampaigns.filter((c: Campaign) => ['running', 'paused'].includes(c.status));
  const historyCampaigns = filteredCampaigns.filter((c: Campaign) => ['completed', 'failed'].includes(c.status));

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">

      <ScheduleModal
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        selectedInstances={selectedInstances}
        instances={instances}
        allowInteractive={selectedInstances.every((id: string) => {
          const instance = instances.find((i: any) => i.id === id);
          return instance?.provider === 'whaileys';
        })}
        onConfirm={(data) => {
          setMessageData(data);
          setIsComposerOpen(false);
        }}
      />

      {/* Header */}
      <div className="p-8 pb-4 shrink-0">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Campanhas</h1>
            <p className="text-gray-500 mt-1">Dispare mensagens em massa com segurança e rotação.</p>
          </div>
          {!isNewCampaignMode && (
            <button
              onClick={() => setIsNewCampaignMode(true)}
              className="bg-emerald-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition shadow-sm font-medium"
            >
              <Plus size={20} />
              Nova Campanha
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">

        {isNewCampaignMode ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 mb-8">
            {/* ... (Steps Header e Conteúdo mantidos iguais, omitindo para brevidade, focando nas mudanças) ... */}
            <div className="bg-gray-50 border-b border-gray-200 px-8 py-4 flex justify-between items-center">
              <div className="flex gap-4">
                {[1, 2, 3, 4, 5].map(s => (
                  <div key={s} className={`flex items-center gap-2 ${step >= s ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= s ? 'border-emerald-600 bg-emerald-50' : 'border-gray-300'}`}>
                      {s}
                    </div>
                    <span className="hidden md:inline">
                      {s === 1 ? 'Público' : s === 2 ? 'Instâncias' : s === 3 ? 'Mensagem' : s === 4 ? 'Configuração' : 'Revisão'}
                    </span>
                  </div>
                ))}
              </div>
              <button onClick={() => setIsNewCampaignMode(false)} className="text-gray-500 hover:text-red-500 font-medium">Cancelar</button>
            </div>

            <div className="p-8">
              {/* STEP 1: Público */}
              {step === 1 && (
                <div className="max-w-3xl mx-auto">
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nome da Campanha</label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="Ex: Oferta de Black Friday"
                      value={campaignName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCampaignName(e.target.value)}
                    />
                  </div>
                  <AudienceSelector onUpdate={(v, i, t, data) => {
                    setAudienceStats({ valid: v, invalid: i, total: t });
                    setAudienceData(data);
                  }} />
                  <div className="mt-8 flex justify-end">
                    <button
                      disabled={audienceStats.valid === 0 || !campaignName}
                      onClick={() => setStep(2)}
                      className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Próximo: Mensagem
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Seleção de Instâncias */}
              {step === 2 && (
                <div className="max-w-4xl mx-auto">
                  <InstanceSelector
                    instances={instances}
                    selectedInstances={selectedInstances}
                    onSelectionChange={setSelectedInstances}
                    messagesPerInstance={messagesPerInstance}
                    onMessagesPerInstanceChange={setMessagesPerInstance}
                    className="mb-8"
                  />
                  <div className="flex justify-between">
                    <button onClick={() => setStep(1)} className="text-gray-500 font-medium">Voltar</button>
                    <button
                      disabled={selectedInstances.length === 0}
                      onClick={() => setStep(3)}
                      className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Próximo: Mensagem
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Mensagem */}
              {step === 3 && (
                <div className="max-w-2xl mx-auto text-center py-10">
                  <div className="mb-8">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {messageData ? 'Mensagem Configurada!' : 'Conteúdo da Campanha'}
                    </h3>
                    <p className="text-gray-500">
                      {messageData ? 'Sua mensagem foi criada com sucesso.' : 'Crie mensagens ricas com botões, listas ou mídia.'}
                    </p>
                  </div>

                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => setStep(2)}
                      className="text-gray-500 hover:text-gray-800 font-medium"
                    >
                      Voltar
                    </button>

                    {!messageData ? (
                      <button
                        onClick={() => {
                          console.log('🔘 Botão "Abrir Construtor" clicado!');
                          setIsComposerOpen(true);
                        }}
                        className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-700 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
                      >
                        Abrir Construtor de Mensagem
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            console.log('🔘 Botão "Editar Mensagem" clicado!');
                            setMessageData(null);
                            setIsComposerOpen(true);
                          }}
                          className="text-emerald-600 hover:text-emerald-700 font-medium px-4 py-2 border border-emerald-600 rounded-lg hover:bg-emerald-50 transition"
                        >
                          Editar Mensagem
                        </button>
                        <button
                          onClick={() => setStep(4)}
                          className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-700 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
                        >
                          Próximo: Configurações
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 4: Configurações de Envio */}
              {step === 4 && (
                <div className="max-w-3xl mx-auto">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Settings className="text-emerald-600" /> Configurações de Disparo
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Delay */}
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                      <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <Clock size={18} /> Intervalo entre Envios
                      </h4>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mínimo (seg)</label>
                          <input
                            type="number"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={sendConfig.minDelay}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSendConfig({ ...sendConfig, minDelay: parseInt(e.target.value) })}
                          />
                        </div>
                        <span className="text-gray-400 font-bold mt-4">até</span>
                        <div className="flex-1">
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Máximo (seg)</label>
                          <input
                            type="number"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={sendConfig.maxDelay}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSendConfig({ ...sendConfig, maxDelay: parseInt(e.target.value) })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Campo de mensagens por instância removido conforme solicitado */}
                  </div>

                  <div className="mt-8 flex justify-between">
                    <button onClick={() => setStep(3)} className="text-gray-500 font-medium">Voltar</button>
                    <button
                      onClick={() => setStep(5)}
                      className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-700 transition"
                    >
                      Próximo: Revisão
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: Revisão */}
              {step === 5 && (
                <div className="max-w-3xl mx-auto">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Resumo da Campanha</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">Nome</p>
                      <p className="font-medium text-lg">{campaignName}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">Público Alvo</p>
                      <p className="font-medium text-lg text-emerald-600">{audienceStats.valid} contatos válidos</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">Instâncias Selecionadas</p>
                      <p className="font-medium text-lg text-blue-600">{selectedInstances.length} instância{selectedInstances.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">Rotação</p>
                      <p className="font-medium text-lg text-purple-600">
                        {selectedInstances.length > 1 ? `${messagesPerInstance} msg/instância` : 'Sem rotação'}
                      </p>
                    </div>
                  </div>

                  {/* Mostrar instâncias selecionadas */}
                  {selectedInstances.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <h4 className="font-bold text-blue-800 text-sm mb-2">Instâncias que serão utilizadas:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedInstances.map((id: string) => {
                          const instance = instances.find((i: any) => i.id === id);
                          return instance ? (
                            <span
                              key={id}
                              className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                            >
                              <Smartphone size={12} />
                              {instance.name}
                              <span className="text-xs opacity-75">({instance.provider})</span>
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                    <button onClick={() => setStep(4)} className="text-gray-500 hover:text-gray-800 font-medium">Voltar</button>
                    <button
                      onClick={handleStartCampaign}
                      disabled={isLoading || connectedInstancesCount === 0 || selectedInstances.length === 0}
                      className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-700 shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Criando...
                        </>
                      ) : (
                        <>
                          <Play size={20} /> Iniciar Disparo
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Filtros e Busca */}
            {!isNewCampaignMode && campaigns.length > 0 && (
              <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Busca */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Buscar campanhas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  {/* Filtro de Status */}
                  <div className="md:w-48">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="all">Todos os Status</option>
                      <option value="running">Em Execução</option>
                      <option value="paused">Pausadas</option>
                      <option value="completed">Concluídas</option>
                      <option value="failed">Falharam</option>
                      <option value="draft">Rascunhos</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Estatísticas Rápidas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                <div className="text-2xl font-bold text-emerald-600">{campaigns.filter((c: Campaign) => c.status === 'running').length}</div>
                <div className="text-xs text-gray-500 uppercase font-bold">Ativas</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                <div className="text-2xl font-bold text-blue-600">{campaigns.filter((c: Campaign) => c.status === 'completed').length}</div>
                <div className="text-xs text-gray-500 uppercase font-bold">Concluídas</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                <div className="text-2xl font-bold text-purple-600">{connectedInstancesCount}</div>
                <div className="text-xs text-gray-500 uppercase font-bold">Instâncias</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                <div className="text-2xl font-bold text-gray-600">{campaigns.reduce((acc: number, c: Campaign) => acc + (c.sentCount || c.messagesSent || 0), 0)}</div>
                <div className="text-xs text-gray-500 uppercase font-bold">Mensagens</div>
              </div>
            </div>

            {/* Seção de Campanhas Ativas (Multi-Thread) */}
            {activeCampaigns.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <RefreshCw className="animate-spin text-emerald-600" size={20} />
                  Em Execução ({activeCampaigns.length})
                </h2>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {activeCampaigns.map((camp: Campaign) => (
                    <ActiveCampaignCard
                      key={camp.id}
                      campaign={camp}
                      onPause={handlePause}
                      onResume={handleResume}
                      onStop={handleStop}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Histórico */}
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CheckCircle className="text-gray-400" size={20} />
                Histórico Recente
              </h2>
              <div className="grid gap-4">
                {historyCampaigns.map((camp: Campaign) => (
                  <div key={camp.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow opacity-80 hover:opacity-100">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${camp.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                        {camp.status === 'completed' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">{camp.name}</h4>
                        <div className="flex gap-3 text-xs text-gray-500 mt-1">
                          <span>{new Date(camp.createdAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="capitalize">{camp.type}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Enviados</p>
                        <p className="font-bold text-emerald-600">{camp.sentCount}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Falhas</p>
                        <p className="font-bold text-red-500">{camp.failedCount}</p>
                      </div>
                      <button
                        onClick={() => handleDelete(camp.id, camp.name)}
                        className="w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors"
                        title="Excluir campanha"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
