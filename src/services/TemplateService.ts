import { LogService } from './LogService';
import { Metrics } from './MetricsService';

export interface MessageTemplate {
  id: string;
  name: string;
  description?: string;
  type: 'text' | 'buttons' | 'list' | 'carousel' | 'audio' | 'media';
  category?: string;
  content: any; // Estrutura flexível para guardar o payload da mensagem
  variables?: string[];
  usageCount?: number;
  isActive?: boolean;
  createdAt: string;
}

export interface CreateTemplateData {
  name: string;
  description?: string;
  type: string;
  category?: string;
  content: any;
  variables?: string[];
}

class TemplateServiceClass {
  private apiUrl: string;
  private templates: MessageTemplate[] = [];

  constructor() {
    // Detectar se está rodando no Electron ou browser
    if (typeof window !== 'undefined' && (window as any).chatVendasAPI) {
      const config = (window as any).chatVendasAPI.getLocalConfig();
      this.apiUrl = config.apiUrl;
    } else {
      // Fallback para desenvolvimento web
      this.apiUrl = 'http://127.0.0.1:3010/api';
    }

    this.loadInitialData();
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
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      LogService.error('Template API Error', 'TemplateService', { endpoint, error });
      throw error;
    }
  }

  private loadInitialData() {
    // Manter dados locais como fallback
    const stored = localStorage.getItem('chatvendas_templates');
    if (stored) {
      this.templates = JSON.parse(stored);
    } else {
      // Inicializar com array vazio - templates serão criados pelo usuário
      this.templates = [];
      this.save();
    }
  }

  private save() {
    localStorage.setItem('chatvendas_templates', JSON.stringify(this.templates));
    window.dispatchEvent(new Event('template-update'));
  }

  async getAll(): Promise<MessageTemplate[]> {
    try {
      const response = await this.apiCall<{ data: MessageTemplate[] }>('/templates');
      this.templates = response.data || [];
      this.save();
      return this.templates;
    } catch (error) {
      LogService.warn('Failed to fetch templates from API, using local data', 'TemplateService');
      return this.templates;
    }
  }

  async getById(id: string): Promise<MessageTemplate | undefined> {
    try {
      const template = await this.apiCall<MessageTemplate>(`/templates/${id}`);
      return template;
    } catch (error) {
      return this.templates.find(t => t.id === id);
    }
  }

  async getByCategory(category: string): Promise<MessageTemplate[]> {
    try {
      const response = await this.apiCall<{ data: MessageTemplate[] }>(`/templates?category=${category}`);
      return response.data || [];
    } catch (error) {
      return this.templates.filter(t => t.category === category);
    }
  }

  async getByType(type: string): Promise<MessageTemplate[]> {
    try {
      const response = await this.apiCall<{ data: MessageTemplate[] }>(`/templates?type=${type}`);
      return response.data || [];
    } catch (error) {
      return this.templates.filter(t => t.type === type);
    }
  }

  async create(data: CreateTemplateData): Promise<MessageTemplate> {
    try {
      LogService.info('Creating new template', 'TemplateService', { name: data.name });
      Metrics.userAction('create_template', 'TemplateService');

      const template = await this.apiCall<MessageTemplate>('/templates', {
        method: 'POST',
        body: JSON.stringify(data)
      });

      // Atualizar cache local
      this.templates.push(template);
      this.save();

      return template;
    } catch (error) {
      LogService.error('Failed to create template', 'TemplateService', error);

      // Fallback para criação local
      const newTemplate: MessageTemplate = {
        ...data,
        id: `tpl_${Date.now()}`,
        usageCount: 0,
        isActive: true,
        createdAt: new Date().toISOString()
      };

      this.templates.push(newTemplate);
      this.save();
      return newTemplate;
    }
  }

  async update(id: string, data: Partial<MessageTemplate>): Promise<MessageTemplate | null> {
    try {
      const template = await this.apiCall<MessageTemplate>(`/templates/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });

      // Atualizar cache local
      const index = this.templates.findIndex(t => t.id === id);
      if (index !== -1) {
        this.templates[index] = template;
        this.save();
      }

      return template;
    } catch (error) {
      LogService.error('Failed to update template', 'TemplateService', { id, error });

      // Fallback para atualização local
      const index = this.templates.findIndex(t => t.id === id);
      if (index !== -1) {
        this.templates[index] = { ...this.templates[index], ...data };
        this.save();
        return this.templates[index];
      }

      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.apiCall(`/templates/${id}`, {
        method: 'DELETE'
      });

      // Remover do cache local
      this.templates = this.templates.filter(t => t.id !== id);
      this.save();

      LogService.info('Template deleted', 'TemplateService', { id });
      return true;
    } catch (error) {
      LogService.error('Failed to delete template', 'TemplateService', { id, error });

      // Fallback para remoção local
      const initialLength = this.templates.length;
      this.templates = this.templates.filter(t => t.id !== id);
      if (this.templates.length !== initialLength) {
        this.save();
        return true;
      }

      return false;
    }
  }

  async duplicate(id: string): Promise<MessageTemplate | null> {
    try {
      const original = await this.getById(id);
      if (!original) return null;

      const duplicatedData: CreateTemplateData = {
        name: `${original.name} (Cópia)`,
        description: original.description,
        type: original.type,
        category: original.category,
        content: original.content,
        variables: original.variables
      };

      return await this.create(duplicatedData);
    } catch (error) {
      LogService.error('Failed to duplicate template', 'TemplateService', { id, error });
      return null;
    }
  }

  async incrementUsage(id: string): Promise<void> {
    try {
      await this.apiCall(`/templates/${id}/usage`, {
        method: 'POST'
      });

      // Atualizar cache local
      const template = this.templates.find(t => t.id === id);
      if (template) {
        template.usageCount = (template.usageCount || 0) + 1;
        this.save();
      }
    } catch (error) {
      LogService.warn('Failed to increment template usage', 'TemplateService', { id, error });
    }
  }

  async search(query: string): Promise<MessageTemplate[]> {
    try {
      const response = await this.apiCall<{ data: MessageTemplate[] }>(`/templates?search=${encodeURIComponent(query)}`);
      return response.data || [];
    } catch (error) {
      // Fallback para busca local
      const lowerQuery = query.toLowerCase();
      return this.templates.filter(t =>
        t.name.toLowerCase().includes(lowerQuery) ||
        (t.description && t.description.toLowerCase().includes(lowerQuery)) ||
        t.type.toLowerCase().includes(lowerQuery) ||
        (t.category && t.category.toLowerCase().includes(lowerQuery))
      );
    }
  }

  getStats() {
    const total = this.templates.length;
    const byType = this.templates.reduce((acc, t) => {
      acc[t.type] = (acc[t.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byCategory = this.templates.reduce((acc, t) => {
      if (t.category) {
        acc[t.category] = (acc[t.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const totalUsage = this.templates.reduce((acc, t) => acc + (t.usageCount || 0), 0);
    const mostUsed = [...this.templates]
      .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
      .slice(0, 5);

    return {
      total,
      byType,
      byCategory,
      totalUsage,
      mostUsed
    };
  }
}

export const TemplateService = new TemplateServiceClass();
