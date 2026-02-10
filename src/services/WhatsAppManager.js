import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  Browsers,
  downloadMediaMessage
} from '@whiskeysockets/baileys';
import pino from 'pino';
import { Boom } from '@hapi/boom';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';
import { getDatabase } from '../database/init.js';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class WhatsAppManager {
  constructor(wsManager) {
    this.wsManager = wsManager;
    this.instances = new Map(); // instanceId -> socket
    this.stores = new Map(); // instanceId -> store
    this.sessionsPath = process.env.WA_SESSION_PATH || path.join(__dirname, '../../sessions');
  }

  async initialize() {
    try {
      await fs.mkdir(this.sessionsPath, { recursive: true });
      console.log('✅ Baileys Manager inicializado');
    } catch (error) {
      console.error('❌ Erro ao inicializar Baileys Manager:', error);
      throw error;
    }
  }

  async connectInstance(instanceId, generateQR = true) {
    console.log(`⚡ Baileys: Tentando conectar instância ${instanceId}`);
    try {
      const db = getDatabase();
      const instance = await db.get('SELECT * FROM instances WHERE id = ?', [instanceId]);

      if (!instance) {
        throw new Error('Instância não encontrada');
      }

      // Se já está conectada, retornar
      if (this.instances.has(instanceId)) {
        const socket = this.instances.get(instanceId);
        if (socket.user) {
          console.log(`✅ Instância ${instanceId} já está conectada`);
          return { status: 'already_connected' };
        } else {
          // Socket existe mas não está conectado, remover
          console.log(`🔄 Removendo socket inativo da instância ${instanceId}`);
          this.instances.delete(instanceId);
          this.stores.delete(instanceId);
        }
      }

      await this.updateInstanceStatus(instanceId, 'connecting');

      const sessionPath = path.join(this.sessionsPath, instanceId);

      // Verificar se existe sessão válida
      let hasValidSession = false;
      try {
        const credsPath = path.join(sessionPath, 'creds.json');
        await fs.access(credsPath);
        hasValidSession = true;
        console.log(`✅ Sessão existente encontrada para instância ${instanceId}`);
      } catch (error) {
        console.log(`ℹ️ Nenhuma sessão existente para instância ${instanceId}`);
      }

      const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

      const socket = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        browser: Browsers.macOS('ChatVendas'),
        generateHighQualityLinkPreview: true,
        markOnlineOnConnect: true,
        syncFullHistory: false,
        defaultQueryTimeoutMs: 60000,
        keepAliveIntervalMs: 30000,
        connectTimeoutMs: 60000,
        logger: pino({ level: 'silent' })
      });

      this.instances.set(instanceId, socket);

      // Event handlers
      socket.ev.on('connection.update', async (update) => {
        await this.handleConnectionUpdate(instanceId, update, generateQR && !hasValidSession);
      });

      socket.ev.on('creds.update', saveCreds);

      socket.ev.on('messages.upsert', async (m) => {
        await this.handleMessages(instanceId, m);
      });

      socket.ev.on('messages.update', async (updates) => {
        await this.handleMessageUpdates(instanceId, updates);
      });

      socket.ev.on('presence.update', async (update) => {
        await this.handlePresenceUpdate(instanceId, update);
      });

      socket.ev.on('contacts.update', async (updates) => {
        await this.handleContactsUpdate(instanceId, updates);
      });

      // Listener adicional para capturar dados do usuário
      socket.ev.on('creds.update', async () => {
        // Verificar se agora temos dados do usuário
        if (socket.user && socket.authState?.creds?.me) {
          const phoneNumber = socket.user.id.split(':')[0];
          const profileName = socket.user.name || socket.authState.creds.me.name || 'Usuário';

          try {
            await db.run(`
              UPDATE instances 
              SET phone_number = ?, profile_name = ?, status = ?, last_seen = CURRENT_TIMESTAMP
              WHERE id = ? AND phone_number IS NULL
            `, [phoneNumber, profileName, 'connected', instanceId]);

            console.log(`📱 Dados do usuário atualizados para instância ${instanceId}: ${phoneNumber}`);
          } catch (error) {
            console.error(`❌ Erro ao atualizar dados do usuário ${instanceId}:`, error);
          }
        }
      });

      this.instances.set(instanceId, socket);

      if (hasValidSession) {
        console.log(`🚀 Instância ${instanceId} conectando automaticamente com sessão existente`);
        return { status: 'connecting_with_session' };
      } else {
        console.log(`📱 Instância ${instanceId} aguardando QR Code`);
        return { status: 'connecting' };
      }

    } catch (error) {
      console.error(`❌ Erro ao conectar instância ${instanceId}:`, error);
      await this.updateInstanceStatus(instanceId, 'disconnected');
      throw error;
    }
  }

  async handleConnectionUpdate(instanceId, update, generateQR) {
    const { connection, lastDisconnect, qr } = update;
    const db = getDatabase();

    try {
      if (qr && generateQR) {
        // Gerar QR Code
        const qrCodeData = await QRCode.toDataURL(qr);
        const expiresAt = new Date(Date.now() + 60000); // 1 minuto

        await db.run(`
          UPDATE instances 
          SET qr_code = ?, qr_expires_at = ?, status = ?
          WHERE id = ?
        `, [qrCodeData, expiresAt.toISOString(), 'qr_ready', instanceId]);

        // Notificar via WebSocket
        this.wsManager.broadcast('qr_code', {
          instanceId,
          qrCode: qrCodeData,
          expiresAt: expiresAt.toISOString()
        });

        console.log(`📱 QR Code gerado para instância ${instanceId}`);
      }

      if (connection === 'close') {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

        console.log(`🔌 Conexão fechada para ${instanceId}:`, lastDisconnect?.error);

        if (shouldReconnect) {
          console.log(`🔄 Reconectando instância ${instanceId}...`);
          setTimeout(() => this.connectInstance(instanceId, false), 5000);
        } else {
          await this.updateInstanceStatus(instanceId, 'disconnected');
          this.instances.delete(instanceId);
          this.stores.delete(instanceId);
        }

      } else if (connection === 'open') {
        console.log(`🔗 Conexão aberta para instância ${instanceId}`);

        const socket = this.instances.get(instanceId);

        // Aguardar um pouco para o socket.user estar disponível
        setTimeout(async () => {
          try {
            if (socket?.user) {
              const phoneNumber = socket.user.id.split(':')[0];
              const profileName = socket.user.name || 'Usuário';

              await db.run(`
                UPDATE instances 
                SET phone_number = ?, profile_name = ?, status = ?, qr_code = NULL, last_seen = CURRENT_TIMESTAMP
                WHERE id = ?
              `, [phoneNumber, profileName, 'connected', instanceId]);

              // Notificar via WebSocket
              this.wsManager.broadcast('instance_connected', {
                instanceId,
                phoneNumber,
                profileName,
                provider: 'baileys'
              });

              // Também disparar evento de status changed
              this.wsManager.broadcast('instance_status_changed', {
                instanceId,
                status: 'connected',
                provider: 'baileys'
              });

              console.log(`✅ Instância ${instanceId} conectada: ${phoneNumber}`);
            } else {
              // Se não tiver user ainda, marcar como conectado mesmo assim
              console.log(`⚠️ Instância ${instanceId} conectada mas sem dados do usuário ainda`);

              await db.run(`
                UPDATE instances 
                SET status = ?, qr_code = NULL, last_seen = CURRENT_TIMESTAMP
                WHERE id = ?
              `, ['connected', instanceId]);

              // Notificar via WebSocket
              this.wsManager.broadcast('instance_connected', {
                instanceId,
                phoneNumber: 'Conectado',
                profileName: 'WhatsApp',
                provider: 'baileys'
              });

              this.wsManager.broadcast('instance_status_changed', {
                instanceId,
                status: 'connected',
                provider: 'baileys'
              });

              console.log(`✅ Instância ${instanceId} conectada (aguardando dados do usuário)`);
            }
          } catch (error) {
            console.error(`❌ Erro ao processar conexão da instância ${instanceId}:`, error);
          }
        }, 2000); // Aguardar 2 segundos
      }

    } catch (error) {
      console.error(`❌ Erro no handleConnectionUpdate ${instanceId}:`, error);
    }
  }

  async handleMessages(instanceId, { messages, type }) {
    console.log(`🔍 WhatsAppManager: Recebidas ${messages.length} mensagens do tipo ${type} para instância ${instanceId}`);

    if (type !== 'notify') return;

    const db = getDatabase();

    const socket = this.instances.get(instanceId);
    // Normalizar ownJid para comparação (Baileys socket.user.id pode ter :device ou ser puro)
    let ownJid = null;
    if (socket?.user?.id) {
      const userPart = socket.user.id.split(':')[0]; // Remove :23 ou :0
      ownJid = `${userPart}@s.whatsapp.net`;
    }

    for (const message of messages) {
      try {
        console.log(`🔍 WhatsAppManager: Processando mensagem:`, message.key);

        // Ignorar mensagens de status
        if (message.key.remoteJid === 'status@broadcast') {
          console.log(`⏭️ WhatsAppManager: Ignorando mensagem de status`);
          continue;
        }

        // Ignorar mensagens para si mesmo (Note to Self)
        // Comparar remoteJid com ownJid. 
        // remoteJid também pode vir com :device em alguns casos raros, mas geralmente é puro.
        const remoteJidNormalized = message.key.remoteJid.split('@')[0].split(':')[0] + '@s.whatsapp.net';

        if (ownJid && remoteJidNormalized === ownJid) {
          console.log(`⏭️ WhatsAppManager: Ignorando mensagem para si mesmo (Note to Self)`);
          continue;
        }

        const messageId = uuidv4();
        const remoteJid = message.key.remoteJid;
        const contactPhone = remoteJid.split('@')[0];
        const fromMe = message.key.fromMe;
        const timestamp = new Date(message.messageTimestamp * 1000);

        // Buscar ou criar contato - Melhoria: buscar por whatsapp_id primeiro, depois phone
        let contact = await db.get('SELECT * FROM contacts WHERE whatsapp_id = ? OR phone = ?', [remoteJid, contactPhone]);

        if (!contact) {
          const contactId = uuidv4();
          const contactName = message.pushName || contactPhone;

          await db.run(`
            INSERT INTO contacts (id, name, phone, whatsapp_id, customer_since)
            VALUES (?, ?, ?, ?, ?)
          `, [contactId, contactName, contactPhone, remoteJid, new Date().toISOString()]);

          contact = { id: contactId, name: contactName, phone: contactPhone, whatsapp_id: remoteJid };
        } else if (!contact.whatsapp_id || contact.whatsapp_id !== remoteJid) {
          // Se achamos pelo phone mas o whatsapp_id está desatualizado (ex: era LID e agora temos JID novo ou vice-versa)
          await db.run('UPDATE contacts SET whatsapp_id = ? WHERE id = ?', [remoteJid, contact.id]);
        }

        // Buscar ou criar ticket
        // Buscar ou criar ticket - MELHORIA: Busca robusta por telefone para evitar duplicatas
        // Verifica se já existe ticket aberto para este número de telefone (independente do contact_id exato, para cobrir duplicatas de contato)
        let ticket = await db.get(`
          SELECT t.* 
          FROM tickets t
          JOIN contacts c ON c.id = t.contact_id
          WHERE c.phone = ? AND t.instance_id = ? AND t.status != 'closed'
          ORDER BY t.created_at DESC LIMIT 1
        `, [contact.phone, instanceId]);

        if (!ticket) {
          const ticketId = uuidv4();
          await db.run(`
            INSERT INTO tickets (id, contact_id, instance_id, status)
            VALUES (?, ?, ?, 'pending')
          `, [ticketId, contact.id, instanceId]);

          ticket = { id: ticketId, contact_id: contact.id, instance_id: instanceId, status: 'pending' };
          console.log(`✅ WhatsAppManager: Novo ticket criado: ${ticketId} (Contato: ${contact.name})`);

          // Notificar via WebSocket
          this.wsManager.broadcast('new_ticket', {
            instanceId,
            ticket: {
              ...ticket,
              contact_name: contact.name,
              contact_phone: contact.phone
            }
          });
        } else {
          // Se encontrou ticket, mas está associado a outro ID de contato (caso de contatos duplicados),
          // vamos "mover" este ticket para o contato atual ou usar o ticket como está.
          // Para respeitar a regra "unir ao outro", vamos usar este ticket.
          // Opcional: Atualizar o ticket para apontar para o contato atual se for mais recente/correto.
          if (ticket.contact_id !== contact.id) {
            console.log(`⚠️ WhatsAppManager: Ticket encontrado (${ticket.id}) pertence a outro contact_id duplicado. Vinculando mensagens a ele.`);
            // Não alteramos o ticket.contact_id aqui para evitar complexidade, mas garantimos que a mensagem vá para esse ticket.
          }
          console.log(`ℹ️ WhatsAppManager: Usando ticket existente ${ticket.id} (${ticket.status})`);
        }

        // Extrair conteúdo da mensagem
        // Extrair conteúdo da mensagem
        const {
          content,
          type: messageType,
          mediaUrl,
          mediaFilename,
          mediaMimetype,
          mediaSize
        } = await this.extractMessageContent(message);

        // Salvar mensagem
        await db.run(`
          INSERT INTO messages (
            id, ticket_id, contact_id, instance_id, type, content, media_url,
            media_filename, media_mimetype, media_size,
            wa_message_id, wa_remote_jid, from_me, timestamp, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'delivered')
        `, [
          messageId, ticket.id, contact.id, instanceId, messageType, content, mediaUrl,
          mediaFilename, mediaMimetype, mediaSize,
          message.key.id, message.key.remoteJid, fromMe, timestamp.toISOString()
        ]);

        // Notificar via WebSocket
        this.wsManager.broadcast('new_message', {
          instanceId,
          ticketId: ticket.id,
          contactId: contact.id,
          message: {
            id: messageId,
            type: messageType,
            content,
            mediaUrl,
            mediaFilename,
            mediaMimetype,
            mediaSize,
            fromMe,
            timestamp: timestamp.toISOString()
          }
        });

        console.log(`📨 Nova mensagem de ${contact.name} (${instanceId})`);

      } catch (error) {
        console.error('❌ Erro ao processar mensagem:', error);
      }
    }
  }

  async extractMessageContent(message) {
    let msg = message.message;

    // Desembrulhar mensagens temporárias ou view once
    if (msg?.ephemeralMessage) msg = msg.ephemeralMessage.message;
    if (msg?.viewOnceMessage) msg = msg.viewOnceMessage.message;
    if (msg?.viewOnceMessageV2) msg = msg.viewOnceMessageV2.message;

    if (!msg) return { content: '', type: 'text' };

    if (msg.conversation) {
      return { content: msg.conversation, type: 'text' };
    }

    if (msg.extendedTextMessage) {
      return { content: msg.extendedTextMessage.text, type: 'text' };
    }

    // Função auxiliar para download
    const downloadMedia = async (msgContent, type, extension) => {
      try {
        const stream = await downloadMediaMessage(
          message,
          'buffer',
          {},
          {
            logger: console,
            reuploadRequest: (msg) => new Promise((resolve) => resolve(msg))
          }
        );

        if (!stream) {
          console.error(`❌ Falha ao baixar mídia (${type}): Stream vazio/null`);
          return null;
        }

        const fileName = `${uuidv4()}.${extension}`;
        const filePath = path.join(process.cwd(), 'uploads', fileName);

        // Garantir que a pasta uploads existe
        await fs.mkdir(path.join(process.cwd(), 'uploads'), { recursive: true });

        await fs.writeFile(filePath, stream);
        console.log(`✅ Mídia baixada e salva em: ${filePath}`);

        return `/uploads/${fileName}`;
      } catch (error) {
        console.error(`❌ Erro ao baixar ou salvar mídia (${type}):`, error);
        return null;
      }
    };

    if (msg.imageMessage) {
      const mediaUrl = await downloadMedia(msg.imageMessage, 'image', 'jpg');
      return {
        content: msg.imageMessage.caption || '',
        type: 'image',
        mediaUrl: mediaUrl || ''
      };
    }

    if (msg.videoMessage) {
      const mediaUrl = await downloadMedia(msg.videoMessage, 'video', 'mp4');
      return {
        content: msg.videoMessage.caption || '',
        type: 'video',
        mediaUrl: mediaUrl || ''
      };
    }

    if (msg.audioMessage) {
      const extension = msg.audioMessage.mimetype?.includes('mp4') ? 'm4a' : 'ogg';
      const mediaUrl = await downloadMedia(msg.audioMessage, 'audio', extension);
      return {
        content: '',
        type: 'audio',
        mediaUrl: mediaUrl || ''
      };
    }

    if (msg.documentMessage) {
      // Mapa de MimeTypes para extensões
      const mimeMap = {
        'application/pdf': 'pdf',
        'application/vnd.ms-excel': 'xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
        'application/vnd.ms-excel.sheet.macroEnabled.12': 'xlsm',
        'application/msword': 'doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        'application/vnd.ms-powerpoint': 'ppt',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
        'text/plain': 'txt',
        'text/csv': 'csv',
        'application/zip': 'zip',
        'application/x-zip-compressed': 'zip',
        'application/x-rar-compressed': 'rar',
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'audio/mpeg': 'mp3',
        'video/mp4': 'mp4'
      };

      let extension = '';

      // 1. Tentar pegar a extensão do nome do arquivo original
      if (msg.documentMessage.fileName) {
        const parts = msg.documentMessage.fileName.split('.');
        if (parts.length > 1) {
          extension = parts.pop();
        }
      }

      // 2. Se não achou ou é extensão genérica/inválida, tenta pelo MimeType
      if (!extension || extension === 'bin' || extension === 'enc') {
        const mime = msg.documentMessage.mimetype ? msg.documentMessage.mimetype.split(';')[0] : '';
        if (mimeMap[mime]) {
          extension = mimeMap[mime];
        } else if (mime) {
          // Fallback simples para mime desconhecido
          extension = mime.split('/')[1] || 'bin';
        } else {
          extension = 'bin';
        }
      }

      // Limpeza final da extensão
      extension = extension.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

      const mediaUrl = await downloadMedia(msg.documentMessage, 'document', extension);

      if (!mediaUrl) {
        console.warn('⚠️ Documento não pôde ser baixado.');
      }

      return {
        content: msg.documentMessage.fileName || `Arquivo.${extension}`,
        type: 'document',
        mediaUrl: mediaUrl || '',
        mediaFilename: msg.documentMessage.fileName || `Arquivo.${extension}`,
        mediaMimetype: msg.documentMessage.mimetype,
        mediaSize: msg.documentMessage.fileLength ? Number(msg.documentMessage.fileLength) : null
      };
    }

    if (msg.stickerMessage) {
      const mediaUrl = await downloadMedia(msg.stickerMessage, 'sticker', 'webp');
      return {
        content: '',
        type: 'sticker',
        mediaUrl: mediaUrl || ''
      };
    }

    if (msg.locationMessage) {
      const lat = msg.locationMessage.degreesLatitude;
      const lng = msg.locationMessage.degreesLongitude;
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

      const content = JSON.stringify({
        latitude: lat,
        longitude: lng,
        name: msg.locationMessage.name || 'Localização',
        address: msg.locationMessage.address || ''
      });

      return {
        content: content,
        type: 'location',
        mediaUrl: mapsUrl
      };
    }

    if (msg.liveLocationMessage) {
      const lat = msg.liveLocationMessage.degreesLatitude;
      const lng = msg.liveLocationMessage.degreesLongitude;
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

      const content = JSON.stringify({
        latitude: lat,
        longitude: lng,
        name: msg.liveLocationMessage.caption || 'Localização em Tempo Real',
        address: ''
      });

      return {
        content: content,
        type: 'location',
        mediaUrl: mapsUrl
      };
    }

    return { content: '[Mensagem não suportada]', type: 'text' };
  }

  async handleMessageUpdates(instanceId, updates) {
    const db = getDatabase();

    for (const update of updates) {
      try {
        const { key, update: msgUpdate } = update;

        if (msgUpdate.status) {
          // Normalizar status para garantir que bate com o CHECK constraint do banco
          // Baileys pode retornar o status como número (Enum) ou string
          let normalizedStatus;

          if (typeof msgUpdate.status === 'number') {
            // Mapping Baileys WAMessageStatus enum
            // 0: PENDING, 1: SERVER_ACK, 2: DELIVERY_ACK, 3: READ, 4: PLAYED
            const statusMap = {
              0: 'pending',
              1: 'sent',
              2: 'delivered',
              3: 'read',
              4: 'read'
            };
            normalizedStatus = statusMap[msgUpdate.status] || 'pending';
          } else if (typeof msgUpdate.status === 'string') {
            normalizedStatus = msgUpdate.status.toLowerCase();
          }

          const allowedStatuses = ['pending', 'sent', 'delivered', 'read', 'failed'];

          // Mapeamentos comuns do Baileys (legacy/strings)
          if (normalizedStatus === 'append') normalizedStatus = 'pending';
          if (normalizedStatus === 'playing') normalizedStatus = 'read';

          if (!allowedStatuses.includes(normalizedStatus)) {
            console.warn(`⚠️ Status desconhecido recebido do Baileys: ${msgUpdate.status}, mapeando para 'pending'`);
            normalizedStatus = 'pending';
          }

          await db.run(`
            UPDATE messages 
            SET status = ?
            WHERE wa_message_id = ? AND instance_id = ?
          `, [normalizedStatus, key.id, instanceId]);

          this.wsManager.broadcast('message_status_updated', {
            instanceId,
            messageId: key.id,
            status: msgUpdate.status
          });
        }

      } catch (error) {
        console.error('❌ Erro ao atualizar status da mensagem:', error);
      }
    }
  }

  async handlePresenceUpdate(instanceId, update) {
    // Implementar se necessário
  }

  async handleContactsUpdate(instanceId, updates) {
    // Implementar se necessário
  }

  async sendMessage(instanceId, remoteJid, message) {
    try {
      const socket = this.instances.get(instanceId);

      if (!socket || !socket.user) {
        throw new Error('Instância não conectada');
      }

      const sentMessage = await socket.sendMessage(remoteJid, message);

      console.log(`📤 Mensagem enviada via ${instanceId} para ${remoteJid}`);

      return sentMessage;

    } catch (error) {
      console.error(`❌ Erro ao enviar mensagem via ${instanceId}:`, error);
      throw error;
    }
  }

  async editMessage(instanceId, remoteJid, key, newText) {
    try {
      const socket = this.instances.get(instanceId);
      if (!socket) throw new Error('Instância não conectada');

      await socket.sendMessage(remoteJid, {
        text: newText,
        edit: key
      });
      console.log(`✏️ Mensagem editada via ${instanceId}`);
    } catch (error) {
      console.error(`❌ Erro ao editar mensagem:`, error);
      throw error;
    }
  }

  async deleteMessage(instanceId, remoteJid, key) {
    try {
      const socket = this.instances.get(instanceId);
      if (!socket) throw new Error('Instância não conectada');

      await socket.sendMessage(remoteJid, { delete: key });
      console.log(`🗑️ Mensagem deletada via ${instanceId}`);
    } catch (error) {
      console.error(`❌ Erro ao deletar mensagem:`, error);
      throw error;
    }
  }

  async sendButtons(instanceId, remoteJid, text, footer, buttons) {
    console.log(`🔍 DEBUG: sendButtons chamado para ${remoteJid}`);
    console.log(`   Texto: "${text}"`);
    console.log(`   Qtd Botões: ${buttons.length}`);
    console.log(`   Dados brutos botões:`, JSON.stringify(buttons));

    try {
      const socket = this.instances.get(instanceId);

      if (!socket || !socket.user) {
        throw new Error('Instância não conectada');
      }

      // Preparar botões tentando identificar tipos complexos (URL/Call)
      const formattedButtons = buttons.map((btn, i) => {
        // Tentar inferir tipo se vier string do frontend ('cta_url', 'cta_call', 'quick_reply')
        let type = 1;
        if (btn.type === 'cta_url' || btn.type === 2) type = 2;
        if (btn.type === 'cta_call' || btn.type === 3) type = 3;

        // Estrutura base de botão
        const btnObj = {
          buttonId: btn.buttonId || btn.id || `btn_${Date.now()}_${i}`,
          buttonText: {
            displayText: btn.buttonText?.displayText || btn.text || btn.buttonId || 'Botão'
          },
          type: 1 // Forçando type 1 para teste de Reply Button inicialmente, se Whailes suportar outros, mudaremos.
          // NOTA: Se desbloquearmos type 2/3, precisamos passar 'url' ou 'phoneNumber'
        };

        // Se quisermos arriscar types diferentes (o fork whaileys deve suportar se for legacy)
        if (type !== 1) {
          btnObj.type = type;
          if (type === 2) btnObj.url = btn.url;
          if (type === 3) btnObj.phoneNumber = btn.phoneNumber;
        }

        return btnObj;
      });

      // Estrutura EXATA do chatvendas funcional
      const buttonMessage = {
        text,
        footer: footer || '',
        buttons: formattedButtons
      };

      console.log(`🔘 PAYLOAD FINAL (Whaileys):`, JSON.stringify(buttonMessage, null, 2));

      const sentMessage = await socket.sendMessage(remoteJid, buttonMessage);

      console.log(`✅ Botões enviados com sucesso via ${instanceId} (ID: ${sentMessage?.key?.id})`);

      return sentMessage;

    } catch (error) {
      console.error(`❌ Erro ao enviar botões via ${instanceId}:`, error);
      // Fallback para texto simples e LOG do erro
      console.log(`⚠️ Falha no envio de botões. Erro: ${error.message}`);
      throw error; // Não fazer fallback silencioso agora, deixar o usuário ver o erro no console se tiver
    }
  }

  async sendList(instanceId, remoteJid, text, footer, title, buttonText, sections) {
    try {
      const socket = this.instances.get(instanceId);

      if (!socket || !socket.user) {
        throw new Error('Instância não conectada');
      }

      // Estrutura EXATA do chatvendas funcional
      const listMessage = {
        text,
        footer: footer || '',
        title: title || '',
        buttonText: buttonText || 'Ver opções',
        sections: sections.map((section) => ({
          title: section.title || 'Seção',
          rows: (section.rows || []).map((row) => ({
            rowId: row.rowId || row.id || `row_${Date.now()}`,
            title: row.title || 'Opção',
            description: row.description || ''
          }))
        }))
      };

      console.log(`📋 Enviando lista via Baileys ${instanceId}:`, JSON.stringify(listMessage, null, 2));

      const sentMessage = await socket.sendMessage(remoteJid, listMessage);


    } catch (error) {
      console.error(`❌ Erro ao enviar lista via ${instanceId}:`, error);
      // Fallback para texto simples e LOG do erro
      console.log(`⚠️ Falha no envio de lista. Erro: ${error.message}`);
      throw error;
    }
  }

  /* sendCarousel removido: Funcionalidade movida para WhaileysManager */

  async sendPoll(instanceId, remoteJid, name, options, selectableCount = 1) {
    try {
      const socket = this.instances.get(instanceId);
      if (!socket || !socket.user) throw new Error('Instância não conectada');

      const pollMessage = {
        poll: {
          name: name,
          values: options,
          selectableCount: selectableCount
        }
      };

      console.log(`📊 Enviando enquete via Baileys ${instanceId}:`, JSON.stringify(pollMessage, null, 2));
      return await socket.sendMessage(remoteJid, pollMessage);
    } catch (error) {
      console.error(`❌ Erro ao enviar enquete via Baileys ${instanceId}:`, error);
      throw error;
    }
  }

  async sendCarousel(instanceId, remoteJid, cards) {
    console.log(`🔄 WhatsAppManager (Baileys): Convertendo carrossel para mensagens individuais (Fallback)`);
    try {
      const socket = this.instances.get(instanceId);
      if (!socket) throw new Error('Instância não conectada');

      // Normalizar JID 
      const jid = remoteJid.includes('@') ? remoteJid : `${remoteJid.replace(/\D/g, '')}@s.whatsapp.net`;

      for (const [index, card] of cards.entries()) {
        let cardText = `🛍️ *${card.title || `Produto ${index + 1}`}*\n\n`;
        if (card.description) cardText += `${card.description}\n\n`;
        if (card.price) cardText += `💰 *R$ ${card.price.toFixed(2)}*\n\n`;

        // Adicionar texto dos botões como lista no final da legenda
        if (card.buttons && card.buttons.length > 0) {
          cardText += `\nOpções:`;
          card.buttons.forEach((btn, i) => {
            cardText += `\n${i + 1} - ${btn.text || btn.buttonText?.displayText || 'Ver'}`;
          });
        }

        if (card.imageUrl && !card.imageUrl.startsWith('data:')) {
          // Tratar imagem local ou remota
          let imageInput = { url: card.imageUrl };

          // Se for caminho local absoluto ou relativo da raiz
          if (card.imageUrl.startsWith('/') || card.imageUrl.match(/^[a-zA-Z]:\\/)) {
            try {
              const fs = await import('fs/promises');
              const path = await import('path');
              const fullPath = card.imageUrl.startsWith('/')
                ? path.default.join(process.cwd(), card.imageUrl)
                : card.imageUrl;

              const buffer = await fs.default.readFile(fullPath);
              imageInput = buffer;
            } catch (e) {
              console.warn(`⚠️ Imagem local não encontrada para fallback: ${card.imageUrl}`);
            }
          }

          await socket.sendMessage(jid, {
            image: imageInput,
            caption: cardText.trim()
          });
        } else {
          await socket.sendMessage(jid, { text: cardText.trim() });
        }

        // Delay de segurança entre mensagens para evitar banimento (4 segundos)
        if (index < cards.length - 1) await new Promise(r => setTimeout(r, 4000));
      }

      console.log(`✅ Fallback de carrossel enviado com sucesso via ${instanceId}`);
      // Retornar um objeto dummy de mensagem enviada, já que foram várias
      return { key: { id: `fallback_carousel_${Date.now()}`, remoteJid: jid, fromMe: true } };

    } catch (error) {
      console.error(`❌ Erro ao enviar fallback de carrossel via Baileys ${instanceId}:`, error);
      throw error;
    }
  }

  async sendAudio(instanceId, remoteJid, audioPath, optionsSource = {}) {
    // Suporte a legado: se optionsSource for booleano, tratar como ptt
    const options = typeof optionsSource === 'boolean'
      ? { ptt: optionsSource }
      : optionsSource;

    const { ptt = true } = options;
    try {
      const socket = this.instances.get(instanceId);

      if (!socket) {
        throw new Error('Instância não encontrada');
      }

      if (!socket.user) {
        throw new Error('Instância não conectada');
      }

      console.log(`🎵 WhatsAppManager (Baileys): Enviando áudio para ${remoteJid}`);
      console.log('🎵 Arquivo de áudio:', audioPath);

      // Verificar se o arquivo existe
      try {
        await fs.access(audioPath);
      } catch (error) {
        throw new Error(`Arquivo de áudio não encontrado: ${audioPath}`);
      }

      // Normalizar JID para Baileys
      // Se já possui @ (ex: @lid ou @s.whatsapp.net), manter. 
      // Se não, limpar caracteres e adicionar @s.whatsapp.net
      const jid = remoteJid.includes('@') ? remoteJid : `${remoteJid.replace(/\D/g, '')}@s.whatsapp.net`;

      console.log(`🎵 WhatsAppManager: JID final para envio: ${jid}`);

      // Detecção forçada de mimetype para MP4
      let finalMimetype = options.mimetype || 'audio/ogg; codecs=opus';
      if (audioPath.toLowerCase().endsWith('.mp4')) {
        finalMimetype = 'audio/mp4';
      } else if (audioPath.toLowerCase().endsWith('.mp3')) {
        finalMimetype = 'audio/mpeg';
      } else if (audioPath.toLowerCase().endsWith('.ogg')) {
        finalMimetype = 'audio/ogg; codecs=opus';
      } else if (audioPath.toLowerCase().endsWith('.webm')) {
        finalMimetype = 'audio/webm';
      }

      // Enviar áudio
      const audioMessage = {
        audio: { url: audioPath },
        mimetype: finalMimetype,
        ptt: ptt // Push to Talk (mensagem de voz)
      };

      console.log(`📤 WhatsAppManager (Baileys): Enviando mensagem de áudio...`);
      const result = await socket.sendMessage(jid, audioMessage);

      console.log(`✅ WhatsAppManager (Baileys): Áudio enviado com sucesso!`);
      return result;

    } catch (error) {
      console.error(`❌ Erro ao enviar áudio Baileys ${instanceId}:`, error);
      throw error;
    }
  }

  async disconnectInstance(instanceId) {
    try {
      const socket = this.instances.get(instanceId);

      if (socket) {
        console.log(`🔌 WhatsAppManager: Desconectando instância ${instanceId}`);
        try {
          // Tentar deslogar graciosamente se possível
          if (socket.user) {
            console.log(`🔌 Fazendo logout da instância ${instanceId}`);
            await socket.logout().catch(e => console.warn(`⚠️ Logout falhou (normal se já fechado): ${e.message}`));
          }
        } catch (error) {
          console.warn(`⚠️ Erro ao deslogar socket da instância ${instanceId}:`, error.message);
        } finally {
          try {
            socket.end();
          } catch (e) {
            // Ignorar erro ao fechar socket já fechado
          }
          this.instances.delete(instanceId);
          this.stores.delete(instanceId);
        }
      }

      // Limpar arquivos de sessão para forçar nova autenticação
      try {
        const sessionPath = path.join(this.sessionsPath, instanceId);
        console.log(`🗑️ Removendo arquivos de sessão: ${sessionPath}`);
        await fs.rm(sessionPath, { recursive: true, force: true });
        console.log(`✅ Arquivos de sessão removidos para instância ${instanceId}`);
      } catch (sessionError) {
        console.warn(`⚠️ Erro ao remover sessão ${instanceId}:`, sessionError.message);
      }

      await this.updateInstanceStatus(instanceId, 'disconnected');

      console.log(`✅ Instância ${instanceId} desconectada completamente`);

    } catch (error) {
      console.error(`❌ Erro ao desconectar instância ${instanceId}:`, error);
      // Mesmo com erro no socket, tentar atualizar o banco se possível
      try {
        await this.updateInstanceStatus(instanceId, 'disconnected');
      } catch (e) {
        console.error(`❌ Erro ao atualizar status no banco:`, e);
      }
      throw error;
    }
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
      status,
      provider: 'baileys'
    });
  }

  async getAllInstances() {
    const db = getDatabase();
    return await db.all('SELECT * FROM instances ORDER BY created_at DESC');
  }

  async getInstanceById(instanceId) {
    const db = getDatabase();
    return await db.get('SELECT * FROM instances WHERE id = ?', [instanceId]);
  }

  async deleteInstance(instanceId) {
    try {
      // Desconectar se estiver conectada
      await this.disconnectInstance(instanceId);

      // Remover sessão
      const sessionPath = path.join(this.sessionsPath, instanceId);
      await fs.rm(sessionPath, { recursive: true, force: true });

      console.log(`🗑️ Sessão da instância ${instanceId} removida do disco`);

    } catch (error) {
      console.error(`❌ Erro ao remover instância ${instanceId}:`, error);
      throw error;
    }
  }

  async shutdown() {
    console.log('🛑 Encerrando WhatsApp Manager...');

    for (const [instanceId, socket] of this.instances) {
      try {
        await socket.end();
      } catch (error) {
        console.error(`❌ Erro ao encerrar instância ${instanceId}:`, error);
      }
    }

    this.instances.clear();
    this.stores.clear();
  }
}