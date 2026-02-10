const API_BASE = import.meta.env.DEV ? '/api' : 'http://127.0.0.1:3010/api';

export interface DashboardStats {
  revenue: {
    total: number;
    today: number;
    trend: string;
    trendDirection: 'up' | 'down';
  };
  tickets: {
    total: number;
    active: number;
    today: number;
    trend: string;
    trendDirection: 'up' | 'down';
  };
  orders: {
    total: number;
    pending: number;
    today: number;
    trend: string;
    trendDirection: 'up' | 'down';
  };
  contacts: {
    total: number;
    today: number;
    trend: string;
    trendDirection: 'up' | 'down';
  };
}

export interface WeeklyData {
  date: string;
  dayName: string;
  sales: number;
  tickets: number;
}

export interface CategoryData {
  category: string;
  quantity: number;
  revenue: number;
}

export interface RecentOrder {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  customer_name: string;
  customer_phone: string;
}

export interface InstancesStatus {
  summary: {
    total: number;
    connected: number;
    disconnected: number;
    scanning: number;
  };
  instances: Array<{
    id: string;
    name: string;
    phone_number: string;
    status: string;
    last_seen: string;
    provider: string;
  }>;
}

class DashboardService {
  /**
   * Busca estatísticas principais do dashboard
   */
  async getStats(): Promise<DashboardStats> {
    try {
      const response = await fetch(`${API_BASE}/dashboard/stats`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }

  /**
   * Busca dados para o gráfico semanal
   */
  async getWeeklyData(): Promise<WeeklyData[]> {
    try {
      const response = await fetch(`${API_BASE}/dashboard/charts/weekly`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar dados semanais:', error);
      throw error;
    }
  }

  /**
   * Busca dados para o gráfico de categorias
   */
  async getCategoryData(): Promise<CategoryData[]> {
    try {
      const response = await fetch(`${API_BASE}/dashboard/charts/categories`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar dados de categorias:', error);
      throw error;
    }
  }

  /**
   * Busca pedidos recentes
   */
  async getRecentOrders(limit: number = 5): Promise<RecentOrder[]> {
    try {
      const response = await fetch(`${API_BASE}/dashboard/recent-orders?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar pedidos recentes:', error);
      throw error;
    }
  }

  /**
   * Busca status das instâncias WhatsApp
   */
  async getInstancesStatus(): Promise<InstancesStatus> {
    try {
      const response = await fetch(`${API_BASE}/dashboard/instances-status`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar status das instâncias:', error);
      throw error;
    }
  }

  /**
   * Formata valor monetário
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  /**
   * Formata número com separadores
   */
  formatNumber(value: number): string {
    return new Intl.NumberFormat('pt-BR').format(value);
  }

  /**
   * Formata data relativa
   */
  formatRelativeDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Agora mesmo';
    } else if (diffInHours < 24) {
      return `${diffInHours}h atrás`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d atrás`;
    }
  }

  /**
   * Obtém cor baseada no status
   */
  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'completed': 'green',
      'pending': 'yellow',
      'cancelled': 'red',
      'processing': 'blue',
      'connected': 'green',
      'disconnected': 'red',
      'scanning': 'yellow',
      'qr_ready': 'blue'
    };
    return colors[status] || 'gray';
  }

  /**
   * Obtém texto do status em português
   */
  getStatusText(status: string): string {
    const statusTexts: { [key: string]: string } = {
      'completed': 'Concluído',
      'pending': 'Pendente',
      'cancelled': 'Cancelado',
      'processing': 'Processando',
      'connected': 'Conectado',
      'disconnected': 'Desconectado',
      'scanning': 'Conectando',
      'qr_ready': 'QR Code'
    };
    return statusTexts[status] || status;
  }
}

export default new DashboardService();