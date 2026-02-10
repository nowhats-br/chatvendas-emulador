import { LogService } from './LogService';
import { Metrics } from './MetricsService';

export interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'failed' | 'paused';
  type: 'text' | 'media' | 'buttons' | 'list' | 'carousel';
  totalLeads: number;
  sentCount: number;
  failedCount: number;
  createdAt: string;
  scheduledFor?: string;

  // Configurações de Envio Avançadas
  minDelay: number; // Segundos
  maxDelay: number; // Segundos
  rotateInstances: boolean;
  messagesPerInstance: number;
  currentInstanceId?: string; // Para rastreio visual

  // Configurações da Mensagem
  message?: string;
  mediaUrl?: string;
  buttons?: Array<{ id: string; text: string }>;
  listSections?: Array<{ title: string; rows: Array<{ id: string; title: string; description?: string }> }>;

  // Configurações de Audiência
  audienceType: 'all' | 'segment' | 'custom';
  audienceFilters?: {
    tags?: string[];
    lastInteraction?: number; // dias
    purchaseHistory?: boolean;
  };

  // Campos do backend
  description?: string;
  messageType?: string;
  messageContent?: string;
  targetType?: string;
  targetCriteria?: any;
  contactList?: string[];
  instances?: string[];
  delayBetweenMessages?: number;
  delayBetweenInstances?: number;
  maxMessagesPerInstance?: number;
  totalContacts?: number;
  messagesSent?: number;
  messagesFailed?: number;
  startedAt?: string;
  completedAt?: string;
}

export interface CampaignStats {
  total: number;
  active: number;
  completed: number;
  failed: number;
  totalSent: number;
  totalLeads: number;
  successRate: number;
}

export interface CreateCampaignData {
  name: string;
  description?: string;
  messageType: string;
  messageContent: string;
  mediaUrl?: string;
  targetType?: string;
  targetCriteria?: any;
  contactList?: string[];
  instances: string[];
  delayBetweenMessages?: number;
  minDelay?: number;
  maxDelay?: number;
  delayBetweenInstances?: number;
  maxMessagesPerInstance?: number;
  scheduledAt?: string;
}

class CampaignServiceClass {
  private apiUrl: string;
  private campaigns: Campaign[] = [];

  constructor() {
    // Detectar se está rodando no Electron ou browser
    console.log('🔧 CampaignService: Inicializando...');
    console.log('🔧 CampaignService: window disponível:', typeof window !== 'undefined');
    console.log('🔧 CampaignService: chatVendasAPI disponível:', typeof window !== 'undefined' && !!(window as any).chatVendasAPI);

    if (typeof window !== 'undefined' && (window as any).chatVendasAPI) {
      const config = (window as any).chatVendasAPI.getLocalConfig();
      this.apiUrl = config.apiUrl;
      console.log('🔧 CampaignService: Usando API URL do Electron:', this.apiUrl);
      console.log('🔧 CampaignService: Config completo:', config);
    } else {
      // Fallback para desenvolvimento web
      this.apiUrl = 'http://127.0.0.1:3010/api';
      console.log('🔧 CampaignService: Usando API URL fallback:', this.apiUrl);
    }

    this.loadInitialData();
  }

  private async apiCall<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const url = `${this.apiUrl}${endpoint}`;
      console.log('🌐 CampaignService.apiCall:', url, options.method || 'GET');

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      console.log('📡 CampaignService.apiCall response:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ CampaignService.apiCall success:', endpoint, data);
      return data;
    } catch (error) {
      console.error('❌ CampaignService.apiCall error:', endpoint, error);
      LogService.error('Campaign API Error', 'CampaignService', { endpoint, error });
      throw error;
    }
  }

  private loadInitialData() {
    // Manter dados locais como fallback
    const stored = localStorage.getItem('chatvendas_campaigns');
    if (stored) {
      this.campaigns = JSON.parse(stored);
    }
  }

  private save(notify = true) {
    localStorage.setItem('chatvendas_campaigns', JSON.stringify(this.campaigns));
    if (notify) {
      window.dispatchEvent(new Event('campaign-update'));
    }
  }

  async getAll(): Promise<Campaign[]> {
    try {
      console.log('🔍 CampaignService.getAll: Iniciando busca de campanhas...');
      console.log('🔍 CampaignService.getAll: URL da API:', this.apiUrl);

      const response = await this.apiCall<{ data: any[] }>('/campaigns');
      console.log('🔍 CampaignService.getAll: Resposta recebida:', response);

      // Mapear dados do backend para o formato do frontend
      this.campaigns = (response.data || []).map(c => this.mapBackendToFrontend(c));
      console.log('🔍 CampaignService.getAll: Campanhas mapeadas:', this.campaigns.length);

      this.save(false);
      return this.campaigns;
    } catch (error) {
      console.error('❌ CampaignService.getAll: Erro detalhado:', error);
      LogService.warn('Failed to fetch campaigns from API, using local data', 'CampaignService');
      console.log('🔍 CampaignService.getAll: Usando dados locais:', this.campaigns.length);
      return this.campaigns;
    }
  }

  async getById(id: string): Promise<Campaign | undefined> {
    try {
      const campaign = await this.apiCall<any>(`/campaigns/${id}`);
      return this.mapBackendToFrontend(campaign);
    } catch (error) {
      return this.campaigns.find(c => c.id === id);
    }
  }

  // Método para mapear dados do backend para o frontend
  private mapBackendToFrontend(backendCampaign: any): Campaign {
    return {
      id: backendCampaign.id,
      name: backendCampaign.name,
      status: this.mapBackendStatus(backendCampaign.status),
      type: backendCampaign.message_type || 'text',
      totalLeads: backendCampaign.total_contacts || 0,
      sentCount: backendCampaign.messages_sent || 0,
      failedCount: backendCampaign.messages_failed || 0,
      createdAt: backendCampaign.created_at,
      scheduledFor: backendCampaign.scheduled_at,
      minDelay: (backendCampaign.min_delay || backendCampaign.delay_between_messages || 10000) / 1000,
      maxDelay: (backendCampaign.max_delay || backendCampaign.delay_between_messages || 15000) / 1000,
      rotateInstances: (backendCampaign.instances || []).length > 1,
      messagesPerInstance: backendCampaign.max_messages_per_instance || 50,
      message: backendCampaign.message_content,
      mediaUrl: backendCampaign.media_url,
      audienceType: backendCampaign.target_type || 'all',
      // Campos do backend mantidos para compatibilidade
      description: backendCampaign.description,
      messageType: backendCampaign.message_type,
      messageContent: backendCampaign.message_content,
      targetType: backendCampaign.target_type,
      targetCriteria: backendCampaign.target_criteria,
      contactList: backendCampaign.contact_list || [],
      instances: backendCampaign.instances || [],
      delayBetweenMessages: backendCampaign.delay_between_messages,
      delayBetweenInstances: backendCampaign.delay_between_instances,
      maxMessagesPerInstance: backendCampaign.max_messages_per_instance,
      totalContacts: backendCampaign.total_contacts,
      messagesSent: backendCampaign.messages_sent,
      messagesFailed: backendCampaign.messages_failed,
      startedAt: backendCampaign.started_at,
      completedAt: backendCampaign.completed_at
    };
  }

  // Mapear status do backend para o frontend
  private mapBackendStatus(backendStatus: string): Campaign['status'] {
    switch (backendStatus) {
      case 'draft': return 'draft';
      case 'scheduled': return 'scheduled';
      case 'running': return 'running';
      case 'completed': return 'completed';
      case 'failed': return 'failed';
      case 'paused': return 'paused';
      default: return 'draft';
    }
  }

  async getStats(): Promise<CampaignStats> {
    try {
      const campaigns = await this.getAll();
      const total = campaigns.length;
      const active = campaigns.filter(c => c.status === 'running' || c.status === 'scheduled').length;
      const completed = campaigns.filter(c => c.status === 'completed').length;
      const failed = campaigns.filter(c => c.status === 'failed').length;
      const totalSent = campaigns.reduce((acc, c) => acc + (c.sentCount || c.messagesSent || 0), 0);
      const totalLeads = campaigns.reduce((acc, c) => acc + (c.totalLeads || c.totalContacts || 0), 0);
      const totalFailed = campaigns.reduce((acc, c) => acc + (c.failedCount || c.messagesFailed || 0), 0);
      const successRate = totalSent > 0 ? ((totalSent - totalFailed) / totalSent) * 100 : 0;

      return {
        total,
        active,
        completed,
        failed,
        totalSent,
        totalLeads,
        successRate: Math.round(successRate * 100) / 100
      };
    } catch (error) {
      LogService.error('Failed to calculate campaign stats', 'CampaignService', error);
      return {
        total: 0,
        active: 0,
        completed: 0,
        failed: 0,
        totalSent: 0,
        totalLeads: 0,
        successRate: 0
      };
    }
  }

  async create(data: CreateCampaignData): Promise<Campaign> {
    try {
      LogService.info('Creating new campaign', 'CampaignService', { name: data.name });
      Metrics.userAction('create_campaign', 'CampaignService');

      console.log('📤 CampaignService.create - Dados recebidos:', data);
      console.log('📡 CampaignService.create - URL da API:', `${this.apiUrl}/campaigns`);

      const backendCampaign = await this.apiCall<any>('/campaigns', {
        method: 'POST',
        body: JSON.stringify(data)
      });

      console.log('📥 CampaignService.create - Resposta do backend:', backendCampaign);

      // Mapear resposta do backend para o formato do frontend
      const campaign = this.mapBackendToFrontend(backendCampaign);

      // Atualizar cache local
      this.campaigns.unshift(campaign);
      this.save();

      console.log('✅ CampaignService.create - Campanha mapeada:', campaign);

      return campaign;
    } catch (error) {
      console.error('❌ CampaignService.create - Erro detalhado:', error);
      LogService.error('Failed to create campaign', 'CampaignService', error);
      throw error;
    }
  }

  async update(id: string, data: Partial<Campaign>): Promise<Campaign | null> {
    try {
      const campaign = await this.apiCall<Campaign>(`/campaigns/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });

      // Atualizar cache local
      const index = this.campaigns.findIndex(c => c.id === id);
      if (index !== -1) {
        this.campaigns[index] = campaign;
        this.save(false);
      }

      return campaign;
    } catch (error) {
      LogService.error('Failed to update campaign', 'CampaignService', { id, error });
      return null;
    }
  }

  async uploadMedia(files: File[]): Promise<any[]> {
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));

      const response = await fetch(`${this.apiUrl}/campaigns/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer upload das mídias');
      }

      const data = await response.json();
      return data.files;
    } catch (error) {
      LogService.error('Failed to upload campaign media', 'CampaignService', error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.apiCall(`/campaigns/${id}`, {
        method: 'DELETE'
      });

      // Remover do cache local
      this.campaigns = this.campaigns.filter(c => c.id !== id);
      this.save();

      LogService.info('Campaign deleted', 'CampaignService', { id });
      return true;
    } catch (error: any) {
      if (error.message === 'Campanha não encontrada') {
        // Se já não existe no banco, removemos do cache local silenciosamente
        this.campaigns = this.campaigns.filter(c => c.id !== id);
        this.save();
        return true;
      }
      LogService.error('Failed to delete campaign', 'CampaignService', { id, error });
      return false;
    }
  }

  async startSending(id: string, onProgress?: (sent: number, total: number, currentInstance: string) => void): Promise<void> {
    try {
      LogService.info('Starting campaign', 'CampaignService', { id });
      Metrics.userAction('start_campaign', 'CampaignService');

      console.log('🎯 CampaignService.startSending - Iniciando campanha:', id);
      console.log('📡 CampaignService.startSending - URL da API:', `${this.apiUrl}/campaigns/${id}/start`);

      await this.apiCall(`/campaigns/${id}/start`, {
        method: 'POST'
      });

      console.log('✅ CampaignService.startSending - Campanha iniciada com sucesso');

      // Atualizar status local
      const campaign = this.campaigns.find(c => c.id === id);
      if (campaign) {
        campaign.status = 'running';
        this.save();
      }

      // Simular progresso para compatibilidade com UI existente
      if (onProgress && campaign) {
        this.simulateProgress(campaign, onProgress);
      }

    } catch (error) {
      console.error('❌ CampaignService.startSending - Erro detalhado:', error);
      LogService.error('Failed to start campaign', 'CampaignService', { id, error });
      throw error;
    }
  }

  async pause(id: string): Promise<boolean> {
    try {
      await this.apiCall(`/campaigns/${id}/pause`, {
        method: 'POST'
      });

      // Atualizar status local
      const campaign = this.campaigns.find(c => c.id === id);
      if (campaign) {
        campaign.status = 'paused';
        this.save();
      }

      LogService.info('Campaign paused', 'CampaignService', { id });
      return true;
    } catch (error) {
      LogService.error('Failed to pause campaign', 'CampaignService', { id, error });
      return false;
    }
  }

  async resume(id: string): Promise<boolean> {
    try {
      await this.apiCall(`/campaigns/${id}/resume`, {
        method: 'POST'
      });

      // Atualizar status local
      const campaign = this.campaigns.find(c => c.id === id);
      if (campaign) {
        campaign.status = 'running';
        this.save();
      }

      LogService.info('Campaign resumed', 'CampaignService', { id });
      return true;
    } catch (error) {
      LogService.error('Failed to resume campaign', 'CampaignService', { id, error });
      return false;
    }
  }

  async schedule(id: string, scheduledFor: string): Promise<boolean> {
    try {
      const campaign = await this.update(id, {
        status: 'scheduled',
        scheduledFor
      });

      return campaign !== null;
    } catch (error) {
      LogService.error('Failed to schedule campaign', 'CampaignService', { id, error });
      return false;
    }
  }

  async duplicate(id: string): Promise<Campaign | null> {
    try {
      const original = await this.getById(id);
      if (!original) return null;

      const duplicatedData: CreateCampaignData = {
        name: `${original.name} (Cópia)`,
        description: original.description,
        messageType: original.messageType || original.type,
        messageContent: original.messageContent || original.message || '',
        mediaUrl: original.mediaUrl,
        targetType: original.targetType || original.audienceType,
        targetCriteria: original.targetCriteria || original.audienceFilters,
        contactList: original.contactList,
        instances: original.instances || [],
        delayBetweenMessages: original.delayBetweenMessages || (original.minDelay * 1000),
        delayBetweenInstances: original.delayBetweenInstances,
        maxMessagesPerInstance: original.maxMessagesPerInstance || original.messagesPerInstance
      };

      return await this.create(duplicatedData);
    } catch (error) {
      LogService.error('Failed to duplicate campaign', 'CampaignService', { id, error });
      return null;
    }
  }

  getByStatus(status: Campaign['status']): Campaign[] {
    return this.campaigns.filter(c => c.status === status);
  }

  getRecent(limit: number = 5): Campaign[] {
    return [...this.campaigns]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  // Método para simular progresso (compatibilidade com UI existente)
  private simulateProgress(campaign: Campaign, onProgress: (sent: number, total: number, currentInstance: string) => void) {
    let sent = campaign.sentCount || 0;
    const total = campaign.totalLeads || campaign.totalContacts || 0;

    const interval = setInterval(async () => {
      // Buscar status atualizado da campanha
      try {
        const updated = await this.getById(campaign.id);
        if (updated) {
          sent = updated.sentCount || updated.messagesSent || sent;
          onProgress(sent, total, updated.currentInstanceId || 'Instância Ativa');

          if (updated.status !== 'running' || sent >= total) {
            clearInterval(interval);
          }
        }
      } catch (error) {
        clearInterval(interval);
      }
    }, 2000);
  }

  // Método para envio rápido de mensagens (FollowUp)
  async sendQuickMessage(phoneNumber: string, messageData: any): Promise<void> {
    try {
      LogService.info('CampaignService', `Enviando mensagem rápida para ${phoneNumber}`);

      const response = await fetch(`${this.baseUrl}/messages/send-quick`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          messageType: messageData.type,
          content: messageData.content
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const result = await response.json();
      LogService.info('CampaignService', `Mensagem rápida enviada com sucesso: ${result.messageId}`);

      Metrics.increment('quick_messages_sent');

    } catch (error) {
      LogService.error('CampaignService', `Erro ao enviar mensagem rápida: ${error}`);
      Metrics.increment('quick_messages_failed');
      throw error;
    }
  }
}

export const CampaignService = new CampaignServiceClass();
