import { WhatsAppInstance, QrCodeData } from '../modules/Instancias/types';

// Tipos para as respostas da API
interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface MessageData {
  type: 'text' | 'image' | 'video' | 'audio' | 'document';
  content: string;
  mediaUrl?: string;
  quotedMessageId?: string;
}

/**
 * WhatsAppService
 * 
 * Serviço central para gerenciar a comunicação com o Backend (Baileys/Whaileys).
 * Integra com o backend local via HTTP e WebSocket.
 */
class WhatsAppServiceClass {
  private apiUrl: string;
  private wsUrl: string;
  private ws: WebSocket | null = null;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    // Detectar se está rodando no Electron ou browser
    if (typeof window !== 'undefined' && (window as any).chatVendasAPI) {
      const config = (window as any).chatVendasAPI.getLocalConfig();
      this.apiUrl = config.apiUrl;
      this.wsUrl = config.wsUrl;
    } else {
      // Fallback para desenvolvimento web
      this.apiUrl = 'http://127.0.0.1:3010/api';
      this.wsUrl = 'ws://127.0.0.1:3010';
    }

    this.initWebSocket();
  }

  private initWebSocket() {
    try {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        console.log('📡 WhatsAppService: WebSocket conectado');

        // Inscrever-se em eventos relevantes
        this.ws?.send(JSON.stringify({
          type: 'subscribe',
          data: {
            events: [
              'qr_code',
              'instance_connected',
              'instance_status_changed',
              'new_message',
              'new_ticket',
              'ticket_created',
              'ticket_updated',
              'ticket_status_updated',
              'ticket_deleted',
              'message_sent',
              'message_status_updated',
              'message_updated',
              'message_deleted',
              'contact_created',
              'contact_updated',
              'contact_stage_changed'
            ]
          }
        }));
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // console.log('📨 WebSocket recebido:', data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('❌ WhatsAppService: Erro ao processar mensagem WebSocket:', error);
        }
      };

      this.ws.onclose = () => {
        console.warn('🔌 WhatsAppService: WebSocket desconectado');
        this.ws = null;
        // Tentar reconectar após 5 segundos
        setTimeout(() => this.initWebSocket(), 5000);
      };

      this.ws.onerror = (error) => {
        console.error('❌ WhatsAppService: Erro WebSocket:', error);
        if (this.ws?.readyState !== WebSocket.CLOSED && this.ws?.readyState !== WebSocket.CLOSING) {
          this.ws?.close();
        }
      };
    } catch (error) {
      console.error('❌ WhatsAppService: Erro ao inicializar WebSocket:', error);
      setTimeout(() => this.initWebSocket(), 5000);
    }
  }

  private handleWebSocketMessage(data: any) {
    const { type, data: payload } = data;
    const provider = payload?.provider || 'baileys';

    // Log mais limpo e informativo
    if (type !== 'client_id') {
      console.log(`📡 [${provider.toUpperCase()}] Evento: ${type}`, payload);
    }

    switch (type) {
      case 'client_id':
        break;
      case 'instance_connected':
      case 'instanceConnected':
        this.emit('instanceConnected', payload);
        break;
      case 'instance_status_changed':
      case 'instance_status':
      case 'instanceStatusChanged':
        this.emit('instanceStatusChanged', payload);
        break;
      case 'qr_code':
      case 'qrCode':
        this.emit('qrCode', payload);
        break;
      case 'new_message':
        this.emit('newMessage', payload);
        break;
      case 'contact_created':
        this.emit('contactCreated', payload);
        break;
      case 'contact_updated':
        this.emit('contactUpdated', payload);
        break;
      case 'contact_stage_changed':
        this.emit('contactStageChanged', payload);
        break;
      case 'new_ticket':
      case 'ticket_created':
        this.emit('newTicket', payload);
        break;
      case 'ticket_updated':
        this.emit('ticketUpdated', payload);
        break;
      case 'ticket_status_updated':
        this.emit('ticketStatusUpdated', payload);
        break;
      case 'ticket_deleted':
        this.emit('ticketDeleted', payload);
        break;
      case 'message_sent':
        this.emit('messageSent', payload);
        break;
      case 'message_status_updated':
        this.emit('messageStatusUpdated', payload);
        break;
      case 'message_updated':
        this.emit('messageUpdated', payload);
        break;
      case 'message_deleted':
        this.emit('messageDeleted', payload);
        break;
      default:
        console.log('📨 WhatsAppService: Mensagem não tratada:', type);
    }
  }

  private emit(event: string, data: any) {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error(`❌ Erro listener ${event}:`, error);
      }
    });

    // Disparar evento no window para compatibilidade com o prefixo antigo se necessário
    window.dispatchEvent(new CustomEvent(`whaileys-${event}`, { detail: data }));
  }

  on(event: string, listener: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  off(event: string, listener: Function) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private async apiCall<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(`${this.apiUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: any = new Error(errorData.error || `Erro ${response.status}`);
        error.status = response.status;
        throw error;
      }

      return await response.json();
    } catch (error) {
      console.error(`❌ API Error ${endpoint}:`, error);
      throw error;
    }
  }

  async getAll(): Promise<WhatsAppInstance[]> {
    try {
      const response = await this.apiCall<PaginatedResponse<WhatsAppInstance>>('/instances');
      return response.data || [];
    } catch (error) {
      return [];
    }
  }

  async createInstance(name: string, phoneNumber?: string, provider: 'baileys' | 'whaileys' = 'baileys'): Promise<WhatsAppInstance> {
    const response = await this.apiCall<WhatsAppInstance>('/instances', {
      method: 'POST',
      body: JSON.stringify({ name, phoneNumber, provider })
    });

    this.emit('instanceCreated', response);
    return response;
  }

  async deleteInstance(id: string): Promise<void> {
    await this.apiCall<ApiResponse>(`/instances/${id}`, {
      method: 'DELETE'
    });
    this.emit('instanceDeleted', { id });
  }

  async connect(id: string): Promise<void> {
    await this.apiCall<ApiResponse>(`/instances/${id}/connect`, {
      method: 'POST'
    });
    this.emit('instanceConnecting', { id });
  }

  async disconnect(id: string): Promise<void> {
    await this.apiCall<ApiResponse>(`/instances/${id}/disconnect`, {
      method: 'POST'
    });
    this.emit('instanceDisconnecting', { id });
  }

  async getQrCode(id: string): Promise<QrCodeData> {
    try {
      const response = await this.apiCall<{ qrCode: string; expiresAt: string }>(`/instances/${id}/qr`);
      return {
        base64: response.qrCode,
        expiresIn: Math.floor((new Date(response.expiresAt).getTime() - Date.now()) / 1000)
      };
    } catch (error) {
      // Se QR não estiver disponível, tentar forçar geração
      if (error instanceof Error && error.message.includes('QR Code não disponível')) {
        console.log('🔄 QR Code não disponível, forçando geração...');
        await this.generateQrCode(id);

        // Aguardar um pouco e tentar novamente
        await new Promise(resolve => setTimeout(resolve, 3000));

        const response = await this.apiCall<{ qrCode: string; expiresAt: string }>(`/instances/${id}/qr`);
        return {
          base64: response.qrCode,
          expiresIn: Math.floor((new Date(response.expiresAt).getTime() - Date.now()) / 1000)
        };
      }
      throw error;
    }
  }

  async generateQrCode(id: string): Promise<void> {
    await this.apiCall<ApiResponse>(`/instances/${id}/generate-qr`, {
      method: 'POST'
    });
  }

  async getInstanceStatus(id: string): Promise<WhatsAppInstance> {
    return await this.apiCall<WhatsAppInstance>(`/instances/${id}/status`);
  }

  async updateInstance(id: string, data: { name?: string; webhookUrl?: string; settings?: any }): Promise<WhatsAppInstance> {
    const response = await this.apiCall<WhatsAppInstance>(`/instances/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    this.emit('instanceUpdated', response);
    return response;
  }

  async sendMessage(instanceId: string, contactId: string, message: MessageData): Promise<any> {
    return await this.apiCall<any>('/messages/send', {
      method: 'POST',
      body: JSON.stringify({ instanceId, contactId, ...message })
    });
  }

  async getMessages(ticketId: string, page = 1, limit = 50): Promise<PaginatedResponse> {
    return await this.apiCall<PaginatedResponse>(`/messages/tickets/${ticketId}?page=${page}&limit=${limit}`);
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  destroy() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.eventListeners.clear();
  }
}

export const WhatsAppService = new WhatsAppServiceClass();
export const WhaileysService = WhatsAppService; // Alias para compatibilidade temporária
