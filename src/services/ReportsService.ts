import { api } from '../lib/api';

export interface CampaignReport {
  id: string;
  name: string;
  description: string;
  message_type: string;
  status: string;
  created_at: string;
  started_at: string;
  completed_at: string;
  total_contacts: number;
  messages_sent: number;
  messages_delivered: number;
  messages_read: number;
  messages_failed: number;

  // Estatísticas de interação
  button_clicks: number;
  list_selections: number;
  carousel_clicks: number;
  keyword_responses: number;
  poll_votes: number;

  // Taxa de engajamento
  delivery_rate: number;
  read_rate: number;
  interaction_rate: number;
}

export interface InteractionDetail {
  id: string;
  campaign_name: string;
  contact_name: string;
  contact_phone: string;
  interaction_type: string;
  button_text?: string;
  list_option_text?: string;
  keyword?: string;
  response_text?: string;
  created_at: string;
}

export interface ReportFilters {
  dateFrom?: string;
  dateTo?: string;
  campaignId?: string;
  status?: string;
  messageType?: string;
  interactionType?: string;
  keyword?: string;
}

export interface ExportOptions {
  format: 'excel' | 'pdf';
  includeDetails: boolean;
  includeCharts: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface CampaignStats {
  totalCampaigns: number;
  totalMessages: number;
  totalInteractions: number;
  averageDeliveryRate: number;
  averageReadRate: number;
  averageInteractionRate: number;
  topKeywords: Array<{ keyword: string; count: number }>;
  interactionsByType: Array<{ type: string; count: number }>;
}

class ReportsService {
  // Buscar relatórios de campanhas
  async getCampaignReports(params: ReportFilters & {
    page?: number;
    limit?: number;
  } = {}): Promise<{
    data: CampaignReport[];
    pagination: Pagination;
  }> {
    try {
      const searchParams = new URLSearchParams();

      if (params.dateFrom) searchParams.append('dateFrom', params.dateFrom);
      if (params.dateTo) searchParams.append('dateTo', params.dateTo);
      if (params.campaignId) searchParams.append('campaignId', params.campaignId);
      if (params.status) searchParams.append('status', params.status);
      if (params.messageType) searchParams.append('messageType', params.messageType);
      if (params.interactionType) searchParams.append('interactionType', params.interactionType);
      if (params.keyword) searchParams.append('keyword', params.keyword);
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());

      const response = await api.get(`/reports/campaigns?${searchParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar relatórios de campanhas:', error);
      throw error;
    }
  }

  // Buscar detalhes de interações
  async getInteractionDetails(campaignId: string, params: ReportFilters & {
    page?: number;
    limit?: number;
  } = {}): Promise<{
    data: InteractionDetail[];
    pagination: Pagination;
  }> {
    try {
      const searchParams = new URLSearchParams();

      if (params.dateFrom) searchParams.append('dateFrom', params.dateFrom);
      if (params.dateTo) searchParams.append('dateTo', params.dateTo);
      if (params.interactionType) searchParams.append('interactionType', params.interactionType);
      if (params.keyword) searchParams.append('keyword', params.keyword);
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());

      const response = await api.get(`/reports/campaigns/${campaignId}/interactions?${searchParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar detalhes de interações:', error);
      throw error;
    }
  }

  // Buscar estatísticas resumidas
  async getCampaignStats(filters: ReportFilters = {}): Promise<CampaignStats> {
    try {
      const params = new URLSearchParams();

      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.campaignId) params.append('campaignId', filters.campaignId);

      const response = await api.get(`/reports/campaigns/stats?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas de campanhas:', error);
      throw error;
    }
  }

  // Exportar relatório
  async exportReport(filters: ReportFilters, options: ExportOptions): Promise<Blob> {
    try {
      const params = new URLSearchParams();

      // Filtros
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.campaignId) params.append('campaignId', filters.campaignId);
      if (filters.status) params.append('status', filters.status);
      if (filters.messageType) params.append('messageType', filters.messageType);
      if (filters.interactionType) params.append('interactionType', filters.interactionType);
      if (filters.keyword) params.append('keyword', filters.keyword);

      // Opções de exportação
      params.append('format', options.format);
      params.append('includeDetails', options.includeDetails.toString());
      params.append('includeCharts', options.includeCharts.toString());

      const response = await api.get(`/reports/campaigns/export?${params.toString()}`, {
        responseType: 'blob'
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      throw error;
    }
  }

  // Buscar campanhas para filtro
  async getCampaignsForFilter(): Promise<Array<{ id: string; name: string }>> {
    try {
      const response = await api.get('/campaigns?limit=1000&fields=id,name');
      return response.data.data.map((campaign: any) => ({
        id: campaign.id,
        name: campaign.name
      }));
    } catch (error) {
      console.error('Erro ao buscar campanhas para filtro:', error);
      return [];
    }
  }

  // Buscar palavras-chave mais usadas
  async getTopKeywords(filters: ReportFilters = {}): Promise<Array<{ keyword: string; count: number; campaigns: string[] }>> {
    try {
      const params = new URLSearchParams();

      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.campaignId) params.append('campaignId', filters.campaignId);

      const response = await api.get(`/reports/keywords?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar palavras-chave:', error);
      throw error;
    }
  }

  // Excluir um relatório específico
  async deleteCampaignReport(campaignId: string): Promise<void> {
    try {
      await api.delete(`/reports/campaigns/${campaignId}`);
    } catch (error) {
      console.error('Erro ao excluir relatório:', error);
      throw error;
    }
  }

  // Excluir todos os relatórios filtrados
  async deleteAllCampaignReports(filters: ReportFilters = {}): Promise<void> {
    try {
      const params = new URLSearchParams();
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.status) params.append('status', filters.status);

      await api.delete(`/reports/campaigns?${params.toString()}`);
    } catch (error) {
      console.error('Erro ao excluir todos os relatórios:', error);
      throw error;
    }
  }
}

export const reportsService = new ReportsService();