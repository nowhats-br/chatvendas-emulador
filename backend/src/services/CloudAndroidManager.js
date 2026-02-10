/**
 * Cloud Android Manager
 * Gerencia emuladores Android na nuvem via API
 * Substitui WSL2AndroidManager sem crashar o backend
 */

import fetch from 'node-fetch';

class CloudAndroidManager {
  constructor() {
    // URL da API na nuvem (configurável via .env)
    this.cloudApiUrl = process.env.CLOUD_ANDROID_API || 'http://localhost:3011';
    this.setupComplete = true; // Sempre pronto (nuvem já está configurada)
    
    console.log('🔧 CloudAndroidManager inicializado');
    console.log('   URL da API:', this.cloudApiUrl);
  }

  /**
   * Verifica se a API na nuvem está acessível
   */
  async isCloudAvailable() {
    try {
      console.log(`🔍 Testando conexão com: ${this.cloudApiUrl}/health`);
      
      const response = await fetch(`${this.cloudApiUrl}/health`, {
        timeout: 5000
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API na nuvem respondeu:', data);
        return true;
      } else {
        console.error(`❌ API retornou status ${response.status}`);
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao conectar na API:', error.message);
      return false;
    }
  }

  /**
   * Verifica status do setup (sempre OK para nuvem)
   */
  async checkSetupStatus() {
    const cloudAvailable = await this.isCloudAvailable();
    
    return {
      wsl2Installed: true, // Compatibilidade com frontend
      distroInstalled: true,
      setupComplete: cloudAvailable,
      ready: cloudAvailable,
      cloudMode: true,
      cloudUrl: this.cloudApiUrl
    };
  }

  /**
   * Verifica requisitos (sempre OK para nuvem)
   */
  async checkRequirements() {
    return {
      windows10: true,
      virtualization: true,
      diskSpace: true,
      ram: true,
      cloudMode: true
    };
  }

  /**
   * Setup automático (não necessário para nuvem)
   */
  async autoSetup(progressCallback) {
    progressCallback('Verificando conexão com nuvem...', 10);
    
    const available = await this.isCloudAvailable();
    
    if (!available) {
      return {
        success: false,
        error: 'API na nuvem não está disponível',
        instructions: [
          'Verifique se o servidor na nuvem está rodando',
          'Verifique a URL configurada em CLOUD_ANDROID_API',
          'Verifique sua conexão com a internet'
        ]
      };
    }
    
    progressCallback('Conectado à nuvem!', 100);
    
    return {
      success: true,
      cloudMode: true,
      message: 'Pronto para criar emuladores na nuvem!'
    };
  }

  /**
   * Cria nova instância Android na nuvem
   */
  async createInstance(name, vncPort = 1, profile = 'med') {
    try {
      console.log(`🚀 Criando instância ${name} na nuvem...`);
      console.log(`   URL: ${this.cloudApiUrl}/create`);
      console.log(`   Payload: { name: "${name}", profile: "${profile}" }`);
      
      const response = await fetch(`${this.cloudApiUrl}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, profile }),
        timeout: 30000
      });

      console.log(`   Status HTTP: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Erro da API:`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      console.log(`✅ Instância ${name} criada na nuvem`);
      console.log(`   Resposta:`, JSON.stringify(data, null, 2));
      
      return {
        success: true,
        name: data.instance.name,
        id: data.instance.id,
        vncUrl: data.instance.vncUrl,
        status: 'running',
        cloudMode: true
      };
    } catch (error) {
      console.error('❌ Erro ao criar instância na nuvem:', error.message);
      throw new Error(`Falha ao criar instância: ${error.message}`);
    }
  }

  /**
   * Inicia instância (já inicia automaticamente na criação)
   */
  async startInstance(name, vncPort = 1, profile = 'med') {
    // Na nuvem, instâncias já iniciam automaticamente
    return this.createInstance(name, vncPort, profile);
  }

  /**
   * Para instância na nuvem
   */
  async stopInstance(name) {
    try {
      console.log(`⏸️  Parando instância ${name} na nuvem...`);
      
      const response = await fetch(`${this.cloudApiUrl}/instance/${name}/stop`, {
        method: 'POST',
        timeout: 10000
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log(`✅ Instância ${name} parada`);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao parar instância:', error.message);
      throw error;
    }
  }

  /**
   * Deleta instância na nuvem
   */
  async deleteInstance(name) {
    try {
      console.log(`🗑️  Deletando instância ${name} na nuvem...`);
      
      const response = await fetch(`${this.cloudApiUrl}/instance/${name}`, {
        method: 'DELETE',
        timeout: 10000
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log(`✅ Instância ${name} deletada`);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao deletar instância:', error.message);
      throw error;
    }
  }

  /**
   * Lista instâncias na nuvem
   */
  async listInstances() {
    try {
      const response = await fetch(`${this.cloudApiUrl}/instances`, {
        timeout: 10000
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Mapear para formato compatível com frontend
      const instances = data.instances.map(inst => ({
        id: inst.id,
        name: inst.name,
        status: inst.status,
        vncPort: inst.vncPort || 1,
        wsPort: inst.wsPort || 6080,
        vncUrl: inst.vncUrl,
        cloudMode: true
      }));

      return instances;
    } catch (error) {
      console.error('❌ Erro ao listar instâncias:', error.message);
      return [];
    }
  }

  /**
   * Envia input para instância (via API na nuvem)
   */
  async sendInput(instanceName, command) {
    try {
      const response = await fetch(`${this.cloudApiUrl}/instance/${instanceName}/input`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
        timeout: 5000
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao enviar input:', error.message);
      throw error;
    }
  }

  /**
   * Obtém IP da nuvem (URL da API)
   */
  async getCloudURL() {
    return this.cloudApiUrl;
  }

  /**
   * Verifica se setup está completo (sempre true para nuvem)
   */
  async isSetupComplete() {
    return await this.isCloudAvailable();
  }
}

export default CloudAndroidManager;
