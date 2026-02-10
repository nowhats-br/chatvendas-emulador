import { api } from '../lib/api';

export interface Ticket {
  id: string;
  contact_id: string;
  instance_id: string;
  status: 'open' | 'pending' | 'closed';
  subject?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assigned_to?: string;
  department?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  closed_at?: string;

  // Dados do contato (via JOIN)
  contact_name?: string;
  contact_phone?: string;
  contact_avatar?: string;
  contact_whatsapp_id?: string;
  contact_stage?: string;
  contact_total_spent?: number;
  contact_tags?: string;
  contact_notes?: string;
  contact_last_seen?: string;

  // Dados da instância (via JOIN)
  instance_name?: string;
  instance_provider?: string;

  // Dados calculados
  unread_count?: number;
  last_message?: string;
  last_message_time?: string;
  last_message_from_me?: boolean;
  origin?: string;
}

export interface ChatMessage {
  id: string;
  ticket_id: string;
  contact_id: string;
  instance_id: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'sticker' | 'location' | 'contact' | 'buttons' | 'list' | 'template' | 'carousel';
  content: string;
  media_url?: string;
  media_filename?: string;
  media_mimetype?: string;
  media_size?: number;
  wa_message_id?: string;
  wa_remote_jid?: string;
  from_me: boolean;
  quoted_message_id?: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  error_message?: string;
  timestamp: string;
  created_at: string;

  // Dados do contato (via JOIN)
  contact_name?: string;

  // Dados da mensagem citada (via JOIN)
  quoted_content?: string;
  quoted_type?: string;
}

export interface SendMessageData {
  instanceId: string;
  contactId: string;
  ticketId?: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'poll' | 'location' | 'carousel';
  content: string;
  quotedMessageId?: string;
  media?: File;
}

export interface QuickSendData {
  phoneNumber: string;
  messageType: 'text' | 'buttons' | 'list';
  content: any;
}

class AttendanceService {
  // Buscar tickets com filtros
  async getTickets(params: {
    status?: string;
    department?: string;
    priority?: string;
    assigned_to?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    data: Ticket[];
    pagination: any;
  }> {
    try {
      const searchParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, value.toString());
        }
      });

      const response = await api.get(`/tickets?${searchParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar tickets:', error);
      throw error;
    }
  }

  // Buscar ticket por ID
  async getTicket(ticketId: string): Promise<Ticket> {
    try {
      const response = await api.get(`/tickets/${ticketId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar ticket:', error);
      throw error;
    }
  }

  // Atualizar status do ticket
  async updateTicketStatus(ticketId: string, status: 'open' | 'pending' | 'closed'): Promise<Ticket> {
    try {
      const response = await api.put(`/tickets/${ticketId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar status do ticket:', error);
      throw error;
    }
  }

  // Atualizar ticket
  async updateTicket(ticketId: string, data: Partial<Ticket>): Promise<Ticket> {
    try {
      const response = await api.put(`/tickets/${ticketId}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar ticket:', error);
      throw error;
    }
  }

  // Atualizar contato (CRM)
  async updateContact(contactId: string, data: any): Promise<void> {
    try {
      await api.put(`/contacts/${contactId}`, data);
    } catch (error) {
      console.error('Erro ao atualizar contato:', error);
      throw error;
    }
  }

  // Atualizar estágio do contato no Kanban
  async updateContactStage(contactId: string, stage: string, notes?: string): Promise<void> {
    try {
      // Rota corrigida: endpoint específico não existe, usa-se o endpoint genérico de update
      await api.put(`/contacts/${contactId}`, { stage, notes });
    } catch (error) {
      console.error('Erro ao atualizar estágio do contato:', error);
      throw error;
    }
  }

  // Criar novo contato
  async createContact(data: any): Promise<any> {
    try {
      const response = await api.post('/contacts', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar contato:', error);
      throw error;
    }
  }

  // Criar novo ticket
  async createTicket(data: { contact_id: string, instance_id: string, status?: string, priority?: string, subject?: string }): Promise<Ticket> {
    try {
      const response = await api.post('/tickets', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar ticket:', error);
      throw error;
    }
  }

  // Listar instâncias
  async getInstances(): Promise<any[]> {
    try {
      const response = await api.get('/instances');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar instâncias:', error);
      throw error;
    }
  }

  // Buscar todos os contatos (para seletores e listas)
  async getAllContacts(): Promise<any[]> {
    try {
      // Pega os primeiros 1000 contatos para extrair tags e afins
      const response = await api.get('/contacts?limit=1000');
      return response.data.data;
    } catch (error) {
      console.error('Erro ao buscar contatos:', error);
      return [];
    }
  }

  // Buscar mensagens de um ticket
  async getMessages(ticketId: string, params: {
    page?: number;
    limit?: number;
  } = {}): Promise<{
    data: ChatMessage[];
    pagination: any;
  }> {
    try {
      const searchParams = new URLSearchParams();

      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());

      const response = await api.get(`/messages/tickets/${ticketId}?${searchParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      throw error;
    }
  }

  // Enviar mensagem
  async sendMessage(data: SendMessageData): Promise<ChatMessage> {
    try {
      const formData = new FormData();

      formData.append('instanceId', data.instanceId);
      formData.append('contactId', data.contactId);
      formData.append('type', data.type);
      formData.append('content', data.content);

      if (data.ticketId) formData.append('ticketId', data.ticketId);
      if (data.quotedMessageId) formData.append('quotedMessageId', data.quotedMessageId);
      if (data.media) {
        console.log('📎 AttendanceService: Anexando arquivo ao FormData');
        console.log('   - Nome:', data.media.name);
        console.log('   - Tipo:', data.media.type);
        console.log('   - Tamanho:', data.media.size);
        formData.append('media', data.media);
      }

      console.log('📤 AttendanceService: Enviando mensagem');
      console.log('   - Tipo:', data.type);
      console.log('   - Tem mídia:', !!data.media);

      const response = await api.post('/messages/send', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ AttendanceService: Mensagem enviada com sucesso');
      return response.data;
    } catch (error) {
      console.error('❌ AttendanceService: Erro ao enviar mensagem:', error);
      throw error;
    }
  }



  async editMessage(messageId: string, content: string): Promise<void> {
    await api.put(`/messages/${messageId}`, { content });
  }

  // Envio rápido de mensagem (para FollowUp)
  async sendQuickMessage(data: QuickSendData): Promise<{ messageId: string; status: string }> {
    try {
      const response = await api.post('/messages/send-quick', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao enviar mensagem rápida:', error);
      throw error;
    }
  }

  // Buscar mensagens
  async searchMessages(params: {
    q: string;
    instanceId?: string;
    contactId?: string;
    type?: string;
    fromMe?: boolean;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: ChatMessage[];
    pagination: any;
  }> {
    try {
      const searchParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, value.toString());
        }
      });

      const response = await api.get(`/messages/search?${searchParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      throw error;
    }
  }

  // Atualizar status da mensagem
  async updateMessageStatus(messageId: string, status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'): Promise<ChatMessage> {
    try {
      const response = await api.put(`/messages/${messageId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar status da mensagem:', error);
      throw error;
    }
  }

  // Remover mensagem
  async deleteMessage(messageId: string): Promise<void> {
    try {
      await api.delete(`/messages/${messageId}`);
    } catch (error) {
      console.error('Erro ao remover mensagem:', error);
      throw error;
    }
  }

  // Remover contato
  async deleteContact(contactId: string): Promise<void> {
    try {
      await api.delete(`/contacts/${contactId}`);
    } catch (error) {
      console.error('Erro ao remover contato:', error);
      throw error;
    }
  }
}

export const attendanceService = new AttendanceService();