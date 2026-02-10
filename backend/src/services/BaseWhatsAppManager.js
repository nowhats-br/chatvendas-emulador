import { WhatsAppManager } from './WhatsAppManager.js';
import { WhaileysManager } from './WhaileysManager.js';
import { getDatabase } from '../database/init.js';
import { v4 as uuidv4 } from 'uuid';

export class BaseWhatsAppManager {
  constructor(wsManager) {
    console.log('🚀 BaseWhatsAppManager: CONSTRUTOR INICIADO');
    this.wsManager = wsManager;
    console.log('🔄 BaseWhatsAppManager: Criando WhatsAppManager...');
    this.baileysManager = new WhatsAppManager(wsManager);
    console.log('🔄 BaseWhatsAppManager: Criando WhaileysManager...');
    this.whaileysManager = new WhaileysManager(wsManager);
    console.log('✅ BaseWhatsAppManager: CONSTRUTOR CONCLUÍDO');
  }

  async initialize() {
    try {
      await this.baileysManager.initialize();
      await this.whaileysManager.initialize();

      // Carregar instâncias existentes do banco
      await this.loadExistingInstances();

      console.log('✅ Base WhatsApp Manager inicializado');
    } catch (error) {
      console.error('❌ Erro ao inicializar Base WhatsApp Manager:', error);
      throw error;
    }
  }

  async loadExistingInstances() {
    const db = getDatabase();
    const instances = await db.all(
      'SELECT * FROM instances WHERE status != ?',
      ['disconnected']
    );

    console.log(`🔄 Carregando ${instances.length} instâncias existentes...`);

    for (const instance of instances) {
      try {
        console.log(`🔄 Verificando instância ${instance.id} (${instance.provider})...`);
        
        // Verificar se tem sessão válida antes de tentar reconectar
        const manager = this.getManagerByProvider(instance.provider);
        let hasValidSession = false;
        
        try {
          // Importar dinamicamente para evitar problemas de ES modules
          const { default: path } = await import('path');
          const { default: fs } = await import('fs/promises');
          
          let sessionPath;
          if (instance.provider === 'whaileys') {
            sessionPath = path.join(manager.sessionsPath || './sessions/whaileys', instance.id);
          } else {
            sessionPath = path.join(manager.sessionsPath || './sessions', instance.id);
          }
          
          const credsPath = path.join(sessionPath, 'creds.json');
          await fs.access(credsPath);
          hasValidSession = true;
          console.log(`✅ Sessão válida encontrada para instância ${instance.id}`);
        } catch (error) {
          console.log(`ℹ️ Nenhuma sessão válida para instância ${instance.id}`);
          // Marcar como desconectada se não tem sessão
          await this.updateInstanceStatus(instance.id, 'disconnected');
          continue;
        }
        
        if (hasValidSession) {
          console.log(`🔄 Reconectando instância ${instance.id} com sessão existente...`);
          await manager.connectInstance(instance.id, false); // Não gerar QR para reconexão automática
          console.log(`✅ Instância ${instance.id} reconectada automaticamente`);
        } else {
          console.log(`⚠️ Instância ${instance.id} sem sessão válida, marcando como desconectada`);
          await this.updateInstanceStatus(instance.id, 'disconnected');
        }
        
      } catch (error) {
        console.error(`❌ Erro ao reconectar instância ${instance.id}:`, error);
        // Marcar como desconectada em caso de erro
        await this.updateInstanceStatus(instance.id, 'disconnected');
      }
    }
    
    console.log(`✅ Processo de carregamento de instâncias concluído`);
  }

  getManagerByProvider(provider) {
    console.log(`🔍 BaseWhatsAppManager: getManagerByProvider chamado com '${provider}'`);

    let manager;
    switch (provider) {
      case 'whaileys':
        manager = this.whaileysManager;
        break;
      case 'baileys':
      default:
        manager = this.baileysManager;
        break;
    }

    console.log(`🔍 BaseWhatsAppManager: Manager selecionado:`, manager);
    console.log(`🔍 BaseWhatsAppManager: Métodos do manager:`, Object.getOwnPropertyNames(Object.getPrototypeOf(manager)));
    console.log(`🔍 BaseWhatsAppManager: Propriedades do manager:`, Object.getOwnPropertyNames(manager));

    return manager;
  }

  async createInstance(name, phoneNumber = null, provider = 'baileys') {
    const instanceId = uuidv4();
    const db = getDatabase();

    try {
      // Criar registro no banco
      await db.run(`
        INSERT INTO instances (id, name, phone_number, provider, status)
        VALUES (?, ?, ?, ?, ?)
      `, [instanceId, name, phoneNumber, provider, 'disconnected']);

      // IMPORTANTE: Não criar instância nos managers aqui, apenas no banco
      // A instância será criada no manager específico apenas quando conectar
      console.log(`✅ Instância criada no banco: ${instanceId} (${name}) - Provider: ${provider}`);

      return {
        id: instanceId,
        name,
        phoneNumber,
        provider,
        status: 'disconnected'
      };

    } catch (error) {
      console.error('❌ Erro ao criar instância:', error);
      throw error;
    }
  }

  async connectInstance(instanceId, generateQR = true) {
    const db = getDatabase();
    const instance = await db.get('SELECT * FROM instances WHERE id = ?', [instanceId]);

    if (!instance) {
      console.error(`❌ BaseWhatsAppManager: Instância ${instanceId} não encontrada`);
      throw new Error('Instância não encontrada');
    }

    const provider = instance.provider || 'baileys';
    console.log(`🚀 BaseWhatsAppManager: Iniciando conexão para '${instance.name}' [${instanceId}]`);
    console.log(`📡 Provider detectado: ${provider.toUpperCase()}`);

    const manager = this.getManagerByProvider(provider);

    if (!manager) {
      console.error(`❌ BaseWhatsAppManager: Manager não encontrado para provider ${provider}`);
      throw new Error(`Manager não disponível para provider ${provider}`);
    }

    return await manager.connectInstance(instanceId, generateQR);
  }

  async disconnectInstance(instanceId) {
    try {
      const db = getDatabase();
      const instance = await db.get('SELECT * FROM instances WHERE id = ?', [instanceId]);

      if (!instance) {
        throw new Error('Instância não encontrada');
      }

      const manager = this.getManagerByProvider(instance.provider);
      await manager.disconnectInstance(instanceId).catch(err => {
        console.warn(`⚠️ BaseWhatsAppManager: Erro ao desconectar instância em ${instance.provider}:`, err.message);
      });

      return { status: 'disconnected', message: 'Desconectado com sucesso' };

    } catch (error) {
      console.error(`❌ Erro crítico ao desconectar instância ${instanceId}:`, error);
      // Retornar sucesso mesmo com erro para não travar o frontend
      return { status: 'error', message: error.message };
    }
  }

  async sendMessage(instanceId, remoteJid, message) {
    try {
      const db = getDatabase();
      const instance = await db.get('SELECT * FROM instances WHERE id = ?', [instanceId]);

      if (!instance) {
        throw new Error('Instância não encontrada');
      }

      const manager = this.getManagerByProvider(instance.provider);
      return await manager.sendMessage(instanceId, remoteJid, message);

    } catch (error) {
      console.error(`❌ Erro ao enviar mensagem via ${instanceId}:`, error);
      throw error;
    }
  }

  async sendAudio(instanceId, remoteJid, audioPath, ptt = true) {
    try {
      const db = getDatabase();
      const instance = await db.get('SELECT * FROM instances WHERE id = ?', [instanceId]);

      if (!instance) {
        throw new Error('Instância não encontrada');
      }

      const manager = this.getManagerByProvider(instance.provider);
      
      // Se o manager tem método sendAudio específico, usar ele
      if (manager.sendAudio) {
        console.log(`🎵 Usando sendAudio específico do ${instance.provider}`);
        return await manager.sendAudio(instanceId, remoteJid, audioPath, ptt);
      } else {
        // Fallback para sendMessage genérico
        console.log(`🎵 Fallback para sendMessage genérico do ${instance.provider}`);
        const audioMessage = {
          audio: { url: audioPath },
          mimetype: 'audio/ogg; codecs=opus',
          ptt: ptt
        };
        return await manager.sendMessage(instanceId, remoteJid, audioMessage);
      }

    } catch (error) {
      console.error(`❌ Erro ao enviar áudio via ${instanceId}:`, error);
      throw error;
    }
  }

  async sendButtons(instanceId, remoteJid, text, footer, buttons) {
    try {
      const db = getDatabase();
      const instance = await db.get('SELECT * FROM instances WHERE id = ?', [instanceId]);

      if (!instance) {
        throw new Error('Instância não encontrada');
      }

      const manager = this.getManagerByProvider(instance.provider);

      // Agora ambos os managers (Baileys e Whaileys) têm o método sendButtons
      if (manager.sendButtons) {
        return await manager.sendButtons(instanceId, remoteJid, text, footer, buttons);
      } else {
        // Fallback apenas se por algum motivo o manager não tiver o método (não deve acontecer)
        console.warn(`⚠️ Manager para ${instance.provider} não tem sendButtons. Usando fallback de texto.`);
        const buttonText = buttons.map((btn, index) => `${index + 1}. ${btn.text || btn.buttonText?.displayText}`).join('\n');
        const fullMessage = `${text}\n${footer ? '\n' + footer : ''}\n${buttonText}`;
        return await manager.sendMessage(instanceId, remoteJid, { text: fullMessage });
      }

    } catch (error) {
      console.error(`❌ Erro ao enviar botões via ${instanceId}:`, error);
      throw error;
    }
  }

  // Manter compatibilidade com nome antigo se necessário, mas redirecionar
  async sendButtonMessage(instanceId, remoteJid, text, buttons) {
    return this.sendButtons(instanceId, remoteJid, text, '', buttons);
  }

  async sendList(instanceId, remoteJid, text, footer, title, buttonText, sections) {
    try {
      const db = getDatabase();
      const instance = await db.get('SELECT * FROM instances WHERE id = ?', [instanceId]);

      if (!instance) {
        throw new Error('Instância não encontrada');
      }

      const manager = this.getManagerByProvider(instance.provider);

      // Agora ambos os managers têm o método sendList
      if (manager.sendList) {
        return await manager.sendList(instanceId, remoteJid, text, footer, title, buttonText, sections);
      } else {
        // Fallback
        console.warn(`⚠️ Manager para ${instance.provider} não tem sendList. Usando fallback de texto.`);
        let listText = `${text}\n`;
        if (title) listText = `*${title}*\n${listText}`;
        if (footer) listText += `\n${footer}\n`;

        sections.forEach((section, sIndex) => {
          listText += `\n*${section.title}*\n`;
          section.rows.forEach((row, rIndex) => {
            listText += `${rIndex + 1}. ${row.title}`;
            if (row.description) listText += ` - ${row.description}`;
            listText += '\n';
          });
        });
        return await manager.sendMessage(instanceId, remoteJid, { text: listText });
      }

    } catch (error) {
      console.error(`❌ Erro ao enviar lista via ${instanceId}:`, error);
      throw error;
    }
  }

  // Manter compatibilidade
  async sendListMessage(instanceId, remoteJid, text, buttonText, sections) {
    return this.sendList(instanceId, remoteJid, text, '', '', buttonText, sections);
  }

  async sendCarousel(instanceId, remoteJid, cards) {
    try {
      const db = getDatabase();
      const instance = await db.get('SELECT * FROM instances WHERE id = ?', [instanceId]);

      if (!instance) {
        throw new Error('Instância não encontrada');
      }

      const manager = this.getManagerByProvider(instance.provider);

      if (manager.sendCarousel) {
        return await manager.sendCarousel(instanceId, remoteJid, cards);
      } else {
        console.warn(`⚠️ Manager para ${instance.provider} não tem sendCarousel.`);
        throw new Error(`Carousel não suportado pelo provedor ${instance.provider}`);
      }

    } catch (error) {
      console.error(`❌ Erro ao enviar carousel via ${instanceId}:`, error);
      throw error;
    }
  }

  async sendPoll(instanceId, remoteJid, name, options, selectableCount = 1) {
    try {
      const db = getDatabase();
      const instance = await db.get('SELECT * FROM instances WHERE id = ?', [instanceId]);

      if (!instance) {
        throw new Error('Instância não encontrada');
      }

      const manager = this.getManagerByProvider(instance.provider);

      if (manager.sendPoll) {
        return await manager.sendPoll(instanceId, remoteJid, name, options, selectableCount);
      } else {
        console.warn(`⚠️ Manager para ${instance.provider} não tem sendPoll.`);
        throw new Error(`Enquetes não suportadas pelo provedor ${instance.provider}`);
      }

    } catch (error) {
      console.error(`❌ Erro ao enviar enquete via ${instanceId}:`, error);
      throw error;
    }
  }

  async deleteInstance(instanceId) {
    try {
      const db = getDatabase();
      const instance = await db.get('SELECT * FROM instances WHERE id = ?', [instanceId]);

      if (!instance) {
        throw new Error('Instância não encontrada');
      }

      const manager = this.getManagerByProvider(instance.provider);
      await manager.deleteInstance(instanceId);

      // Limpar todas as tabelas relacionadas para evitar erro de FOREIGN KEY
      // A ordem importa para tabelas que dependem umas das outras

      console.log(`🧹 Iniciando limpeza de dados da instância ${instanceId}...`);

      const safeRun = async (label, query, params) => {
        try {
          await db.run(query, params);
        } catch (e) {
          console.error(`⚠️ Erro ao limpar ${label} para ${instanceId}:`, e.message);
        }
      };

      // 1. Campanhas e Logs de Envio
      await safeRun('campaign_sends', 'DELETE FROM campaign_sends WHERE instance_id = ?', [instanceId]);

      // 2. Chatbot e Automações
      await safeRun('chatbot_executions', 'DELETE FROM chatbot_executions WHERE instance_id = ?', [instanceId]);
      await safeRun('chatbot_flows', 'DELETE FROM chatbot_flows WHERE instance_id = ?', [instanceId]);
      await safeRun('quick_replies', 'DELETE FROM quick_replies WHERE instance_id = ?', [instanceId]);
      await safeRun('message_templates', 'DELETE FROM message_templates WHERE instance_id = ?', [instanceId]);

      // 3. Mensagens e Tickets (conversas)
      await safeRun('messages_refs', 'UPDATE messages SET quoted_message_id = NULL WHERE instance_id = ?', [instanceId]);
      await safeRun('messages', 'DELETE FROM messages WHERE instance_id = ?', [instanceId]);
      await safeRun('tickets', 'DELETE FROM tickets WHERE instance_id = ?', [instanceId]);

      // 4. Pedidos (Desvincular)
      await safeRun('orders_tickets', 'UPDATE orders SET ticket_id = NULL WHERE ticket_id IN (SELECT id FROM tickets WHERE instance_id = ?)', [instanceId]);
      await safeRun('orders_instances', 'UPDATE orders SET instance_id = NULL WHERE instance_id = ?', [instanceId]);

      // Agora remover a instância do banco
      await db.run('DELETE FROM instances WHERE id = ?', [instanceId]);

      console.log(`🗑️ Instância ${instanceId} removida com sucesso.`);

    } catch (error) {
      console.error(`❌ Erro ao remover instância ${instanceId}:`, error);
      throw error;
    }
  }

  async getAllInstances() {
    const db = getDatabase();
    return await db.all('SELECT * FROM instances ORDER BY created_at DESC');
  }

  async getInstanceById(instanceId) {
    const db = getDatabase();
    return await db.get('SELECT * FROM instances WHERE id = ?', [instanceId]);
  }

  async updateInstanceStatus(instanceId, status) {
    const db = getDatabase();
    await db.run(
      'UPDATE instances SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, instanceId]
    );

    // Notificar via WebSocket
    this.wsManager.broadcast('instance_status_changed', {
      instanceId,
      status
    });
  }

  async shutdown() {
    console.log('🛑 Encerrando Base WhatsApp Manager...');

    await this.baileysManager.shutdown();
    await this.whaileysManager.shutdown();
  }
}