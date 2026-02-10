/**
 * Serviço de integração com Evolution API
 * Gerencia múltiplas instâncias WhatsApp via VPS
 */

interface EvolutionConfig {
  baseUrl: string;
  apiKey: string;
}

interface WhatsAppInstance {
  instanceName: string;
  status: 'connected' | 'disconnected' | 'connecting';
  qrCode?: string;
  phoneNumber?: string;
}

interface SendMessageParams {
  instanceName: string;
  number: string;
  text: string;
}

export class EvolutionAPIService {
  private config: EvolutionConfig;

  constructor(config: EvolutionConfig) {
    this.config = config;
  }

  /**
   * Headers padrão para todas as requisições
   */
  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'apikey': this.config.apiKey
    };
  }

  /**
   * Criar nova instância WhatsApp
   */
  async createInstance(instanceName: string): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseUrl}/instance/create`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          instanceName: instanceName,
          qrcode: true,
          integration: 'WHATSAPP-BAILEYS'
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ao criar instância: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar instância:', error);
      throw error;
    }
  }

  /**
   * Conectar instância e obter QR Code
   */
  async connectInstance(instanceName: string): Promise<{ qrcode: { base64: string } }> {
    try {
      const response = await fetch(`${this.config.baseUrl}/instance/connect/${instanceName}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erro ao conectar instância: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao conectar instância:', error);
      throw error;
    }
  }

  /**
   * Verificar status da conexão
   */
  async getConnectionState(instanceName: string): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseUrl}/instance/connectionState/${instanceName}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erro ao verificar status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      throw error;
    }
  }

  /**
   * Listar todas as instâncias
   */
  async listInstances(): Promise<any[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}/instance/fetchInstances`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erro ao listar instâncias: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao listar instâncias:', error);
      throw error;
    }
  }

  /**
   * Deletar instância
   */
  async deleteInstance(instanceName: string): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseUrl}/instance/delete/${instanceName}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erro ao deletar instância: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao deletar instância:', error);
      throw error;
    }
  }

  /**
   * Desconectar instância (logout)
   */
  async logoutInstance(instanceName: string): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseUrl}/instance/logout/${instanceName}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erro ao desconectar instância: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao desconectar instância:', error);
      throw error;
    }
  }

  /**
   * Enviar mensagem de texto
   */
  async sendTextMessage(params: SendMessageParams): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseUrl}/message/sendText/${params.instanceName}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          number: params.number,
          text: params.text
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ao enviar mensagem: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  /**
   * Enviar mídia (imagem, vídeo, documento)
   */
  async sendMedia(instanceName: string, number: string, mediaUrl: string, caption?: string): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseUrl}/message/sendMedia/${instanceName}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          number: number,
          mediatype: 'image',
          media: mediaUrl,
          caption: caption || ''
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ao enviar mídia: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao enviar mídia:', error);
      throw error;
    }
  }

  /**
   * Obter informações do perfil
   */
  async getProfileInfo(instanceName: string): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseUrl}/instance/profileInfo/${instanceName}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erro ao obter perfil: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao obter perfil:', error);
      throw error;
    }
  }

  /**
   * Verificar se API está online
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}`, {
        method: 'GET'
      });

      return response.ok;
    } catch (error) {
      console.error('Erro ao verificar saúde da API:', error);
      return false;
    }
  }
}

// Singleton para uso global
let evolutionAPIInstance: EvolutionAPIService | null = null;

export function initializeEvolutionAPI(config: EvolutionConfig): EvolutionAPIService {
  evolutionAPIInstance = new EvolutionAPIService(config);
  return evolutionAPIInstance;
}

export function getEvolutionAPI(): EvolutionAPIService {
  if (!evolutionAPIInstance) {
    throw new Error('Evolution API não foi inicializada. Chame initializeEvolutionAPI() primeiro.');
  }
  return evolutionAPIInstance;
}
