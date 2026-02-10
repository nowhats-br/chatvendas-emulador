import * as whaileysPkg from 'whaileys';
import QRCode from 'qrcode';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDatabase } from '../database/init.js';
import { v4 as uuidv4 } from 'uuid';
import { downloadMediaMessage as baileysDownloadMediaMessage } from '@whiskeysockets/baileys';
import pino from 'pino';
import { SecurityManager } from '../utils/security-manager.js';
import { WhatsAppPreload } from '../utils/whatsapp-preload.js';

// Helper para extrair propriedades de módulos (interop CJS/ESM)
const getProp = (pkg, prop) => {
  if (pkg[prop] !== undefined) return pkg[prop];
  if (pkg.default && pkg.default[prop] !== undefined) return pkg.default[prop];
  return undefined;
};

const DisconnectReason = getProp(whaileysPkg, 'DisconnectReason');
const useMultiFileAuthState = getProp(whaileysPkg, 'useMultiFileAuthState');
const Browsers = getProp(whaileysPkg, 'Browsers');
const downloadMediaMessage = getProp(whaileysPkg, 'downloadMediaMessage') || baileysDownloadMediaMessage;
const generateWAMessageFromContent = getProp(whaileysPkg, 'generateWAMessageFromContent');
const prepareWAMessageMedia = getProp(whaileysPkg, 'prepareWAMessageMedia');
const jidNormalizedUser = getProp(whaileysPkg, 'jidNormalizedUser') || ((jid) => {
  if (!jid) return '';
  const parts = jid.split('@');
  const user = parts[0].split(':')[0];
  const server = parts[1] || 's.whatsapp.net';
  return `${user}@${server}`;
});

// O makeWASocket (função default)
const makeWASocket = whaileysPkg.default?.default || whaileysPkg.default || whaileysPkg;

console.log('📡 WhaileysManager interop check:', {
  hasMakeWASocket: typeof makeWASocket === 'function',
  hasDisconnectReason: !!DisconnectReason,
  hasUseAuthState: !!useMultiFileAuthState,
  hasBrowsers: !!Browsers,
  hasGenerateWA: !!generateWAMessageFromContent
});

if (typeof makeWASocket !== 'function') {
  console.error('❌ CRITICAL: makeWASocket is not a function! Check whaileys installation.');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class WhaileysManager {
  constructor(wsManager) {
    this.wsManager = wsManager;
    this.instances = new Map(); // instanceId -> socket
    this.stores = new Map(); // instanceId -> store
    this.sessionsPath = path.join(__dirname, '../../sessions/whaileys');
  }

  async initialize() {
    try {
      await fs.mkdir(this.sessionsPath, { recursive: true });
      console.log('✅ Whaileys Manager inicializado');
    } catch (error) {
      console.error('❌ Erro ao inicializar Whaileys Manager:', error);
      throw error;
    }
  }

  async connectInstance(instanceId, generateQR = true) {
    console.log(`🚀 Whaileys: Tentando conectar instância ${instanceId}`);
    try {
      const db = getDatabase();
      const instance = await db.get('SELECT * FROM instances WHERE id = ?', [instanceId]);

      if (!instance) {
        throw new Error('Instância não encontrada');
      }

      if (this.instances.has(instanceId)) {
        console.log(`🔌 Whaileys [${instanceId}]: Encerrando socket existente antes de reconectar...`);
        const oldSocket = this.instances.get(instanceId);
        try {
          oldSocket.ev.removeAllListeners();
          oldSocket.end();
        } catch (e) {
          console.warn(`⚠️ Erro ao encerrar socket antigo ${instanceId}:`, e.message);
        }
        this.instances.delete(instanceId);
      }

      await this.updateInstanceStatus(instanceId, 'connecting');

      const sessionPath = path.join(this.sessionsPath, instanceId);
      console.log(`📂 Whaileys [${instanceId}]: Usando caminho de sessão: ${sessionPath}`);

      let auth;
      try {
        auth = await useMultiFileAuthState(sessionPath);
      } catch (err) {
        console.error(`❌ Whaileys [${instanceId}] Erro ao carregar auth state:`, err);
        throw err;
      }

      const { state, saveCreds } = auth;

      console.log(`🔌 Whaileys [${instanceId}]: Criando socket...`);
      let socket;
      try {
        // Camada 1 & 3: Fingerprinting e Simulação de Hardware
        const browserConfig = await SecurityManager.getBrowserConfiguration(instanceId);

        socket = makeWASocket({
          auth: state,
          printQRInTerminal: false,
          browser: browserConfig,
          logger: pino({ level: 'silent' })
        });

        // Camada 4: Injetar Comportamento Humano em segundo plano
        WhatsAppPreload.injectHumanActivity(socket, instanceId);
      } catch (err) {
        console.error(`❌ Whaileys [${instanceId}] Erro ao criar socket:`, err);
        throw err;
      }

      socket.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        console.log(`📡 Whaileys [${instanceId}] Update:`, {
          connection,
          hasQr: !!qr,
          statusCode: lastDisconnect?.error?.output?.statusCode
        });

        if (qr && generateQR) {
          console.log(`📱 QR Code recebido para ${instanceId}`);
          try {
            const qrCodeData = await QRCode.toDataURL(qr);
            const expiresAt = new Date(Date.now() + 60000);

            await db.run(`
              UPDATE instances 
              SET qr_code = ?, qr_expires_at = ?, status = ?
              WHERE id = ?
            `, [qrCodeData, expiresAt.toISOString(), 'qr_ready', instanceId]);

            this.wsManager.broadcast('qr_code', {
              instanceId,
              qrCode: qrCodeData,
              expiresAt: expiresAt.toISOString()
            });
          } catch (qrErr) {
            console.error(`❌ Whaileys [${instanceId}] Erro ao processar QR:`, qrErr);
          }
        }

        if (connection === 'close') {
          const errorCode = lastDisconnect?.error?.output?.statusCode;
          const errorMessage = lastDisconnect?.error?.message;
          const shouldReconnect = errorCode !== DisconnectReason.loggedOut && errorCode !== 401;

          console.log(`🔌 Conexão Whaileys fechada para ${instanceId}:`, {
            errorCode,
            errorMessage,
            shouldReconnect
          });

          if (shouldReconnect) {
            console.log(`🔄 Whaileys [${instanceId}]: Tentando reconectar em 5s...`);
            setTimeout(() => this.connectInstance(instanceId, generateQR), 5000);
          } else {
            console.log(`❌ Whaileys [${instanceId}]: Desconectado permanentemente (Logout/401)`);
            await this.updateInstanceStatus(instanceId, 'disconnected');
            this.instances.delete(instanceId);
            // Limpar sessão em caso de logout ou erro de autenticação
            await fs.rm(sessionPath, { recursive: true, force: true }).catch(() => { });
          }
        } else if (connection === 'open') {
          console.log(`🔗 Conexão Whaileys aberta para ${instanceId}`);

          setTimeout(async () => {
            try {
              if (socket.user) {
                const phoneNumber = socket.user.id.split(':')[0];
                const profileName = socket.user.name || 'Usuário Whaileys';

                await db.run(`
                  UPDATE instances 
                  SET phone_number = ?, profile_name = ?, status = ?, qr_code = NULL, last_seen = CURRENT_TIMESTAMP
                  WHERE id = ?
                `, [phoneNumber, profileName, 'connected', instanceId]);

                this.wsManager.broadcast('instance_connected', {
                  instanceId,
                  phoneNumber,
                  profileName,
                  provider: 'whaileys'
                });

                this.wsManager.broadcast('instance_status_changed', {
                  instanceId,
                  status: 'connected',
                  provider: 'whaileys'
                });
              } else {
                await db.run(`
                  UPDATE instances 
                  SET status = ?, qr_code = NULL, last_seen = CURRENT_TIMESTAMP
                  WHERE id = ?
                `, ['connected', instanceId]);

                this.wsManager.broadcast('instance_connected', {
                  instanceId,
                  phoneNumber: 'Conectado',
                  profileName: 'Whaileys',
                  provider: 'whaileys'
                });

                this.wsManager.broadcast('instance_status_changed', {
                  instanceId,
                  status: 'connected',
                  provider: 'whaileys'
                });
              }
            } catch (error) {
              console.error(`❌ Erro ao processar conexão Whaileys ${instanceId}:`, error);
            }
          }, 2000);
        }
      });

      socket.ev.on('creds.update', saveCreds);

      socket.ev.on('messages.upsert', async (m) => {
        console.log(`🔔 WhaileysManager: Evento messages.upsert recebido para instância ${instanceId}`);
        console.log(`   Tipo: ${m.type}, Quantidade de mensagens: ${m.messages?.length || 0}`);
        if (m.messages && m.messages.length > 0) {
          console.log(`   Primeira mensagem - Key:`, m.messages[0].key);
          console.log(`   Primeira mensagem - RemoteJid:`, m.messages[0].key?.remoteJid);
        }
        await this.handleMessages(instanceId, m);
      });

      socket.ev.on('messages.update', async (updates) => {
        await this.handleMessageUpdates(instanceId, updates);
      });

      this.instances.set(instanceId, socket);
      return { status: 'connecting' };

    } catch (error) {
      console.error(`❌ Erro ao conectar instância Whaileys ${instanceId}:`, error);
      await this.updateInstanceStatus(instanceId, 'disconnected');
      throw error;
    }
  }

  async disconnectInstance(instanceId) {
    const socket = this.instances.get(instanceId);
    if (socket) {
      console.log(`🔌 WhaileysManager: Solicitando logout para ${instanceId}`);
      try {
        if (socket.user) {
          await socket.logout().catch(e => console.warn(`⚠️ Logout Whaileys falhou: ${e.message}`));
        }
      } catch (error) {
        console.warn(`⚠️ Erro ao deslogar socket Whaileys ${instanceId}:`, error.message);
      } finally {
        try { socket.end(); } catch (e) { }
        this.instances.delete(instanceId);
      }
    }
    await this.updateInstanceStatus(instanceId, 'disconnected');
  }

  async deleteInstance(instanceId) {
    await this.disconnectInstance(instanceId);
    const sessionPath = path.join(this.sessionsPath, instanceId);
    await fs.rm(sessionPath, { recursive: true, force: true });
    // O banco é removido pelo BaseWhatsAppManager
  }

  async handleMessages(instanceId, { messages, type }) {
    console.log(`🔍 WhaileysManager: Recebidas ${messages.length} mensagens do tipo ${type} para instância ${instanceId}`);

    if (type !== 'notify') return;

    const db = getDatabase();

    const socket = this.instances.get(instanceId);
    const ownJid = socket?.user?.id ? jidNormalizedUser(socket.user.id) : null;

    for (const message of messages) {
      try {
        console.log(`🔍 WhaileysManager: Processando mensagem:`, message.key);

        // Ignorar mensagens de status
        if (message.key.remoteJid === 'status@broadcast') {
          console.log(`⏭️ WhaileysManager: Ignorando mensagem de status`);
          continue;
        }

        // Ignorar mensagens para si mesmo (Note to Self)
        if (ownJid && message.key.remoteJid === ownJid) {
          console.log(`⏭️ WhaileysManager: Ignorando mensagem para si mesmo (Note to Self)`);
          continue;
        }

        const messageId = uuidv4();
        const remoteJid = message.key.remoteJid;

        const extractPhoneFromJid = (jid) => {
          if (!jid) return '';
          const parts = jid.split('@')[0];
          const phone = parts.split(':')[0];
          return phone;
        };

        let contactPhone = extractPhoneFromJid(remoteJid);

        if (contactPhone.length > 14) {
          const participant = message.key.participant || message.participant;
          if (participant) {
            const partPhone = extractPhoneFromJid(participant);
            if (partPhone.length >= 10 && partPhone.length < 15) {
              console.log(`🔄 WhaileysManager: Substituindo LID ${contactPhone} pelo número real ${partPhone}`);
              contactPhone = partPhone;
            }
          }
        }

        if (!contactPhone || !/^\d+$/.test(contactPhone)) {
          console.log(`⏭️ WhaileysManager: Ignorando ID não numérico: ${contactPhone}`);
          continue;
        }

        console.log(`📞 WhaileysManager: Processando mensagem de ${contactPhone} (Tamanho: ${contactPhone.length})`);

        const fromMe = message.key.fromMe;
        const timestamp = new Date(message.messageTimestamp * 1000);

        console.log(`📞 WhaileysManager: Processando mensagem de ${contactPhone} (JID original: ${remoteJid})`);

        // Buscar ou criar contato
        let contact = await db.get('SELECT * FROM contacts WHERE phone = ?', [contactPhone]);

        if (!contact) {
          const contactId = uuidv4();
          const contactName = message.pushName || contactPhone;

          await db.run(`
            INSERT INTO contacts (id, name, phone, whatsapp_id, customer_since, stage)
            VALUES (?, ?, ?, ?, ?, NULL)
          `, [contactId, contactName, contactPhone, message.key.remoteJid, new Date().toISOString()]);

          contact = { id: contactId, name: contactName, phone: contactPhone };

          this.syncProfilePicture(instanceId, contact.id, message.key.remoteJid);
        } else if (!contact.profile_picture) {
          this.syncProfilePicture(instanceId, contact.id, contact.whatsapp_id || remoteJid);
        }

        // Buscar ou criar ticket - CORRIGIDO: Busca por contact_id + instance_id
        // Isso garante que cada combinação de contato + instância tenha apenas um ticket ativo
        let ticket = await db.get(`
          SELECT * FROM tickets 
          WHERE contact_id = ? AND instance_id = ? AND status != 'closed'
          ORDER BY created_at DESC LIMIT 1
        `, [contact.id, instanceId]);

        if (!ticket) {
          const ticketId = uuidv4();
          await db.run(`
            INSERT INTO tickets (id, contact_id, instance_id, status)
            VALUES (?, ?, ?, 'pending')
          `, [ticketId, contact.id, instanceId]);

          ticket = { id: ticketId, contact_id: contact.id, instance_id: instanceId, status: 'pending' };
          console.log(`✅ WhaileysManager: Novo ticket criado: ${ticketId} (Contato: ${contact.name}, Instância: ${instanceId})`);

          // Notificar via WebSocket sobre o novo ticket
          this.wsManager.broadcast('new_ticket', {
            instanceId,
            ticket: {
              ...ticket,
              contact_name: contact.name,
              contact_phone: contact.phone
            }
          });
        } else {
          console.log(`ℹ️ WhaileysManager: Usando ticket existente ${ticket.id} (${ticket.status}) para contato ${contact.name} na instância ${instanceId}`);
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

        // Atualizar visto por último se for mensagem recebida
        if (!fromMe) {
          await db.run('UPDATE contacts SET last_seen = ? WHERE id = ?', [timestamp.toISOString(), contact.id]);
        }

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
    if (!msg) return { content: '', type: 'text' };

    // Desembrulhar mensagens temporárias ou view once
    if (msg.ephemeralMessage) msg = msg.ephemeralMessage.message;
    if (msg.viewOnceMessage) msg = msg.viewOnceMessage.message;
    if (msg.viewOnceMessageV2) msg = msg.viewOnceMessageV2.message;

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
          console.error(`❌ Falha ao baixar mídia Whaileys (${type}): Stream vazio/null`);
          return null;
        }

        const fileName = `${uuidv4()}.${extension}`;
        const filePath = path.join(process.cwd(), 'uploads', fileName);

        // Garantir que a pasta uploads existe
        await fs.mkdir(path.join(process.cwd(), 'uploads'), { recursive: true });

        await fs.writeFile(filePath, stream);
        console.log(`✅ Mídia Whaileys baixada e salva em: ${filePath}`);

        return `/uploads/${fileName}`;
      } catch (error) {
        console.error(`❌ Erro ao baixar ou salvar mídia Whaileys (${type}):`, error);
        return null;
      }
    };

    if (msg.imageMessage) {
      const mediaUrl = await downloadMedia(msg.imageMessage, 'image', 'jpg');
      return {
        content: msg.imageMessage.caption || '',
        type: 'image',
        mediaUrl: mediaUrl || '' // Fallback vazio
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
        console.warn('⚠️ Documento Whaileys não pôde ser baixado.');
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
          // Baileys pode retornar o status como número (Enum), string ou undefined
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
            console.warn(`⚠️ Whaileys [${instanceId}] Status desconhecido: ${msgUpdate.status}, mapeando para 'pending'`);
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
            status: normalizedStatus
          });
        }

      } catch (error) {
        console.error('❌ Whaileys: Erro ao atualizar status da mensagem:', error);
      }
    }
  }

  async updateInstanceStatus(instanceId, status) {
    const db = getDatabase();
    await db.run(
      'UPDATE instances SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, instanceId]
    );

    this.wsManager.broadcast('instance_status_changed', {
      instanceId,
      status,
      provider: 'whaileys'
    });
  }

  async sendMessage(instanceId, remoteJid, message) {
    const socket = this.instances.get(instanceId);
    if (!socket || !socket.user) throw new Error('Instância não conectada');

    // Camada 4: Simular digitação humana antes de enviar
    await SecurityManager.simulateHumanTyping(socket, remoteJid);
    await WhatsAppPreload.getRandomDelay(500, 1500);

    return await socket.sendMessage(remoteJid, message);
  }

  async sendButtons(instanceId, remoteJid, text, footer, buttons) {
    const socket = this.instances.get(instanceId);
    if (!socket || !socket.user) throw new Error('Instância não conectada');

    // Verificar se existe algum botão que NÃO seja reply (type 1)
    const hasUrlOrCall = buttons.some(btn => btn.type === 'url' || btn.type === 'call');

    if (hasUrlOrCall) {
      // Se tiver URL ou Call, usar NATIVE FLOW (viewOnceMessage com interactive)
      // O formato HydraTed Template (templateMessage) está deprecado e pode falhar ou virar botão simples

      const nativeButtons = buttons.map((btn, index) => {
        if (btn.type === 'url') {
          return {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
              display_text: btn.buttonText?.displayText || btn.text || 'Link',
              url: btn.url,
              merchant_url: btn.url
            })
          };
        }
        if (btn.type === 'call') {
          return {
            name: "cta_call",
            buttonParamsJson: JSON.stringify({
              display_text: btn.buttonText?.displayText || btn.text || 'Ligar',
              phone_number: btn.phoneNumber
            })
          };
        }
        // Reply
        return {
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: btn.buttonText?.displayText || btn.text || 'Opção',
            id: btn.buttonId || btn.id || `btn_${index}`
          })
        };
      });

      const msg = {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2
            },
            interactiveMessage: {
              body: { text: text },
              footer: { text: footer || '' },
              header: {
                title: "",
                subtitle: "",
                hasMediaAttachment: false
              },
              nativeFlowMessage: {
                buttons: nativeButtons,
                messageParamsJson: ""
              }
            }
          }
        }
      };

      console.log(`🔘 Enviando Native Flow Buttons via Whaileys ${instanceId}:`, JSON.stringify(msg, null, 2));
      return await socket.sendMessage(remoteJid, msg);

    } else {
      // Se for apenas botões de resposta, manter estrutura original (Classic Buttons)
      const buttonMessage = {
        text,
        footer: footer || '',
        buttons: buttons.map((btn) => ({
          buttonId: btn.buttonId || btn.id || `btn_${Date.now()}`,
          buttonText: {
            displayText: btn.buttonText?.displayText || btn.text || btn.buttonId || 'Botão'
          },
          type: 1
        }))
      };

      console.log(`🔘 Enviando Botões (Reply) via Whaileys ${instanceId}:`, JSON.stringify(buttonMessage, null, 2));

      // Camada 4: Simular digitação humana antes de enviar
      await SecurityManager.simulateHumanTyping(socket, remoteJid);
      await WhatsAppPreload.getRandomDelay(500, 1500);

      return await socket.sendMessage(remoteJid, buttonMessage);
    }
  }

  async sendList(instanceId, remoteJid, text, footer, title, buttonText, sections) {
    const socket = this.instances.get(instanceId);
    if (!socket || !socket.user) throw new Error('Instância não conectada');

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

    console.log(`📋 Enviando lista via Whaileys ${instanceId}:`, JSON.stringify(listMessage, null, 2));

    // Camada 4: Simular digitação humana antes de enviar
    await SecurityManager.simulateHumanTyping(socket, remoteJid);
    await WhatsAppPreload.getRandomDelay(500, 1500);

    return await socket.sendMessage(remoteJid, listMessage);
  }


  async sendCarousel(instanceId, remoteJid, cards) {
    try {
      const socket = this.instances.get(instanceId);

      if (!socket || !socket.user) {
        throw new Error('Instância não encontrada ou não conectada');
      }

      console.log(`🎡 WhaileysManager: Enviando carrossel nativo para ${remoteJid}`);

      // Normalizar JID corretamente (evitar duplicação de @s.whatsapp.net)
      const jid = jidNormalizedUser(remoteJid.includes('@') ? remoteJid : `${remoteJid}@s.whatsapp.net`);

      if (!cards || cards.length === 0) {
        throw new Error('Nenhum card fornecido para o carrossel');
      }

      // Preparar cards para o formato nativo do WhatsApp
      const carouselCards = await Promise.all(cards.map(async (card, index) => {
        // Preparar botões do card
        const buttons = [];

        if (card.buttons && Array.isArray(card.buttons)) {
          card.buttons.filter(btn => btn !== null).forEach((btn, btnIdx) => {
            buttons.push({
              name: "quick_reply",
              buttonParamsJson: JSON.stringify({
                display_text: btn.text || `Opção ${btnIdx + 1}`,
                id: btn.id || `card_${index}_btn_${btnIdx}`
              })
            });
          });
        }

        // Adicionar botões padrão se não houver nenhum
        if (buttons.length === 0) {
          buttons.push({
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
              display_text: "Ver Detalhes",
              id: `card_${index}_view`
            })
          });
        }

        const cardObj = {
          header: {
            hasMediaAttachment: !!card.imageUrl
          },
          body: {
            text: `*${card.title || `Produto ${index + 1}`}*\n\n${card.description || ''}`
          },
          footer: {
            text: card.price ? `💰 R$ ${card.price.toFixed(2)}` : ''
          },
          nativeFlowMessage: {
            buttons: buttons
          }
        };

        // Adicionar imagem se disponível (precisa ser preparada/enviada primeiro)
        if (card.imageUrl && !card.imageUrl.startsWith('data:')) {
          try {
            let mediaInput;

            // Verificar se é path local (começa com / ou tem caminho de disco)
            if (card.imageUrl.startsWith('/') || card.imageUrl.match(/^[a-zA-Z]:\\/)) {
              // Tentar ler como arquivo local
              const fullPath = card.imageUrl.startsWith('/')
                ? path.join(process.cwd(), card.imageUrl)
                : card.imageUrl;

              try {
                mediaInput = await fs.readFile(fullPath);
              } catch (e) {
                console.warn(`⚠️ Imagem local não encontrada: ${fullPath}, tentando como URL`);
                mediaInput = { url: card.imageUrl };
              }
            } else {
              // URL remota
              mediaInput = { url: card.imageUrl };
            }

            const media = await prepareWAMessageMedia(
              { image: mediaInput },
              { upload: socket.waUploadToServer }
            );
            cardObj.header.imageMessage = media.imageMessage;
          } catch (imgError) {
            console.warn(`⚠️ Whaileys: Erro ao preparar imagem do card ${index}:`, imgError.message);
          }
        }

        return cardObj;
      }));

      // Montar a estrutura da mensagem interactiva (Carousel)
      const messageContent = {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2
            },
            interactiveMessage: {
              body: { text: "Confira nossas ofertas abaixo:" },
              footer: { text: "ChatVendas" },
              header: {
                hasMediaAttachment: false
              },
              carouselMessage: {
                cards: carouselCards,
                messageVersion: 1
              }
            }
          }
        }
      };

      // Gerar a mensagem usando o "construtor" (generateWAMessageFromContent)
      // O 'userJid' é opcional mas recomendado para mensagens interativas
      const msg = generateWAMessageFromContent(jid, messageContent, {
        userJid: socket.user.id,
        quoted: undefined
      });

      // Camada 4: Simular digitação humana antes de enviar
      await SecurityManager.simulateHumanTyping(socket, jid);
      await WhatsAppPreload.getRandomDelay(500, 1500);

      // Enviar usando relayMessage para garantir entrega de tipos complexos
      await socket.relayMessage(jid, msg.message, {
        messageId: msg.key.id
      });

      console.log('✅ Carrossel nativo enviado com sucesso via relayMessage');
      return { key: msg.key };

    } catch (error) {
      console.error(`❌ Erro ao enviar carrossel nativo Whaileys ${instanceId}:`, error);

      // FALLBACK: Enviar como mensagens individuais se o modo nativo falhar
      console.log('🔄 Tentando fallback para mensagens individuais...');
      try {
        const socket = this.instances.get(instanceId);
        const jid = jidNormalizedUser(remoteJid.includes('@') ? remoteJid : `${remoteJid}@s.whatsapp.net`);

        for (const [index, card] of cards.entries()) {
          let cardText = `🛍️ *${card.title || `Produto ${index + 1}`}*\n\n`;
          if (card.description) cardText += `${card.description}\n\n`;
          if (card.price) cardText += `💰 *R$ ${card.price.toFixed(2)}*\n\n`;

          if (card.imageUrl && !card.imageUrl.startsWith('data:')) {
            await socket.sendMessage(jid, {
              image: { url: card.imageUrl },
              caption: cardText.trim()
            });
          } else {
            await socket.sendMessage(jid, { text: cardText.trim() });
          }

          if (index < cards.length - 1) await new Promise(r => setTimeout(r, 1000));
        }
        return { key: { id: `fallback_${Date.now()}` } };
      } catch (fallbackError) {
        console.error('❌ Erro no fallback do carrossel:', fallbackError);
        throw error;
      }
    }
  }

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

      console.log(`📊 Enviando enquete via Whaileys ${instanceId}:`, JSON.stringify(pollMessage, null, 2));

      // Camada 4: Simular digitação humana antes de enviar
      await SecurityManager.simulateHumanTyping(socket, remoteJid);
      await WhatsAppPreload.getRandomDelay(500, 1500);

      return await socket.sendMessage(remoteJid, pollMessage);
    } catch (error) {
      console.error(`❌ Erro ao enviar enquete via Whaileys ${instanceId}:`, error);
      throw error;
    }
  }

  async syncProfilePicture(instanceId, contactId, remoteJid) {
    try {
      const socket = this.instances.get(instanceId);
      if (!socket) return;

      const jid = remoteJid.includes('@') ? remoteJid : `${remoteJid}@s.whatsapp.net`;
      console.log(`🖼️ Whaileys [${instanceId}]: Solicitando foto de perfil para ${jid}`);

      const ppUrl = await socket.profilePictureUrl(jid, 'image').catch(() => null);

      if (ppUrl) {
        const db = getDatabase();
        await db.run('UPDATE contacts SET profile_picture = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [ppUrl, contactId]);

        const updatedContact = await db.get('SELECT * FROM contacts WHERE id = ?', [contactId]);
        if (updatedContact) {
          updatedContact.tags = updatedContact.tags ? JSON.parse(updatedContact.tags) : [];
          this.wsManager.broadcast('contact_updated', updatedContact);
        }

        console.log(`✅ Whaileys [${instanceId}]: Foto de perfil de ${jid} salva com sucesso`);
      }
    } catch (error) {
      // Ignorar
    }
  }

  async shutdown() {
    for (const [id, socket] of this.instances) {
      try { await socket.end(); } catch (e) { }
    }
    this.instances.clear();
  }
}