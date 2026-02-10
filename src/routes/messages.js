import express from 'express';
import { getDatabase } from '../database/init.js';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { existsSync, createReadStream, readFileSync } from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';

ffmpeg.setFfmpegPath(ffmpegPath);

const router = express.Router();

// Configurar multer para upload de arquivos
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'messages');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 }, // 10MB
  fileFilter: (req, file, cb) => {
    // Permitir se a extensão ou o mimetype for válido
    const allowedExtensions = /jpeg|jpg|png|gif|mp4|webm|mp3|wav|ogg|m4a|pdf|doc|docx|txt|xlsx|xls|csv|zip|rar|webp|ogg/;
    const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());

    // Mimetypes comuns para os arquivos acima
    // Adicionado application/octet-stream pois alguns navegadores enviam áudio assim
    const allowedMimeTypes = /image|video|audio|pdf|document|sheet|excel|text|plain|csv|zip|rar|webp|msword|officedocument|octet-stream/;
    const mimetype = allowedMimeTypes.test(file.mimetype);

    if (mimetype || extname) {
      return cb(null, true);
    } else {
      console.error(`❌ Upload rejeitado: Mimetype=${file.mimetype}, OriginalName=${file.originalname}`);
      cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype}`));
    }
  }
});

// GET /api/messages/tickets/:ticketId - Listar mensagens de um ticket
router.get('/tickets/:ticketId', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const db = getDatabase();

    // Verificar se o ticket existe
    const ticket = await db.get('SELECT * FROM tickets WHERE id = ?', [ticketId]);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }

    const messages = await db.all(`
      SELECT 
        m.*,
        c.name as contact_name,
        quoted.content as quoted_content,
        quoted.type as quoted_type
      FROM messages m
      JOIN contacts c ON c.id = m.contact_id
      LEFT JOIN messages quoted ON quoted.id = m.quoted_message_id
      WHERE m.ticket_id = ?
      ORDER BY m.timestamp ASC
      LIMIT ? OFFSET ?
    `, [ticketId, parseInt(limit), offset]);

    const { total } = await db.get(
      'SELECT COUNT(*) as total FROM messages WHERE ticket_id = ?',
      [ticketId]
    );

    res.json({
      data: messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Erro ao listar mensagens:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/messages/send-followup - Envio de mensagem de follow-up com criação automática de ticket
router.post('/send-followup', async (req, res) => {
  try {
    const { contactId, contactPhone, messageType, content, followUpTaskId } = req.body;

    if (!contactId || !contactPhone || !messageType || !content) {
      return res.status(400).json({
        error: 'contactId, contactPhone, messageType e content são obrigatórios'
      });
    }

    const db = getDatabase();

    // Buscar uma instância conectada
    let instance;
    if (messageType === 'buttons' || messageType === 'list') {
      // Priorizar Whaileys para mensagens interativas
      instance = await db.get(`
        SELECT * FROM instances 
        WHERE status = 'connected' AND provider = 'whaileys'
        ORDER BY last_seen DESC LIMIT 1
      `);
    }

    if (!instance) {
      // Buscar qualquer instância conectada
      instance = await db.get(`
        SELECT * FROM instances 
        WHERE status = 'connected'
        ORDER BY last_seen DESC LIMIT 1
      `);
    }

    if (!instance) {
      return res.status(400).json({ error: 'Nenhuma instância conectada disponível' });
    }

    // Buscar contato
    let contact = await db.get('SELECT * FROM contacts WHERE id = ?', [contactId]);
    
    if (!contact) {
      // Buscar por telefone se não encontrar por ID
      const normalizedPhone = contactPhone.replace(/\D/g, '');
      contact = await db.get('SELECT * FROM contacts WHERE phone = ?', [normalizedPhone]);
      
      if (!contact) {
        return res.status(404).json({ error: 'Contato não encontrado' });
      }
    }

    // Criar ticket com origem follow-up
    const ticketId = uuidv4();
    const now = new Date().toISOString();

    await db.run(`
      INSERT INTO tickets (
        id, contact_id, instance_id, status, subject, priority,
        origin, tags, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      ticketId, contact.id, instance.id, 'pending', 'Follow-up Respondido', 'normal',
      'followup', JSON.stringify(['follow-up']), now, now
    ]);

    const messageId = uuidv4();
    const timestamp = new Date();
    const remoteJid = contact.whatsapp_id || `${contact.phone.replace(/\D/g, '')}@s.whatsapp.net`;

    // Preparar mensagem para WhatsApp baseada no tipo
    let waMessage = {};
    let messageContent = '';

    switch (messageType) {
      case 'text':
        waMessage = { text: content.text };
        messageContent = content.text;
        break;

      case 'image':
        waMessage = {
          image: { url: content.imageUrl },
          caption: content.caption || ''
        };
        messageContent = JSON.stringify(content);
        break;

      case 'video':
        waMessage = {
          video: { url: content.videoUrl },
          caption: content.caption || ''
        };
        messageContent = JSON.stringify(content);
        break;

      case 'audio':
        waMessage = {
          audio: { url: content.audioUrl },
          mimetype: 'audio/ogg; codecs=opus',
          ptt: true
        };
        messageContent = JSON.stringify(content);
        break;

      case 'buttons':
        if (instance.provider === 'whaileys') {
          const whaileysButtons = content.buttons.map((btn, index) => ({
            buttonId: btn.id || btn.buttonId || `id${index + 1}`,
            buttonText: { displayText: btn.text },
            type: 1
          }));

          waMessage = {
            text: content.text,
            footer: content.footer || '',
            buttons: whaileysButtons
          };
        } else {
          waMessage = {
            text: `${content.text}\n\n${content.buttons.map((btn, i) => `${i + 1}. ${btn.text}`).join('\n')}`
          };
        }
        messageContent = JSON.stringify(content);
        break;

      case 'list':
        if (instance.provider === 'whaileys') {
          const whaileysSections = content.sections.map(section => ({
            title: section.title,
            rows: section.rows.map(row => ({
              rowId: row.id,
              title: row.title,
              description: row.description || ''
            }))
          }));

          waMessage = {
            text: content.text,
            footer: content.footer || '',
            title: content.title || '',
            buttonText: content.buttonText || 'Abrir Menu',
            sections: whaileysSections
          };
        } else {
          let textFallback = content.text + '\n\n';
          content.sections.forEach(section => {
            textFallback += `*${section.title}*\n`;
            section.rows.forEach((row, i) => {
              textFallback += `${i + 1}. ${row.title}`;
              if (row.description) textFallback += ` - ${row.description}`;
              textFallback += '\n';
            });
            textFallback += '\n';
          });
          waMessage = { text: textFallback };
        }
        messageContent = JSON.stringify(content);
        break;

      default:
        return res.status(400).json({ error: 'Tipo de mensagem não suportado' });
    }

    try {
      // Enviar mensagem via WhatsApp
      let sentMessage;
      if (messageType === 'buttons' && instance.provider === 'whaileys') {
        sentMessage = await req.waManager.sendButtons(
          instance.id,
          remoteJid,
          content.text,
          content.footer,
          content.buttons
        );
      } else if (messageType === 'list' && instance.provider === 'whaileys') {
        sentMessage = await req.waManager.sendListMessage(
          instance.id,
          remoteJid,
          content.text,
          content.buttonText,
          content.sections,
          content.footer
        );
      } else {
        sentMessage = await req.waManager.sendMessage(instance.id, remoteJid, waMessage);
      }

      // Salvar mensagem no banco
      await db.run(`
        INSERT INTO messages (
          id, ticket_id, contact_id, instance_id, type, content, 
          wa_message_id, wa_remote_jid, from_me,
          timestamp, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        messageId, ticketId, contact.id, instance.id, messageType, messageContent,
        sentMessage.key?.id || messageId, sentMessage.key?.remoteJid || remoteJid, true,
        timestamp.toISOString(), 'sent'
      ]);

      // Notificar via WebSocket sobre o novo ticket
      const newTicket = await db.get(`
        SELECT 
          t.*,
          c.name as contact_name,
          c.phone as contact_phone,
          c.profile_picture as contact_avatar,
          i.name as instance_name,
          i.provider as instance_provider
        FROM tickets t
        JOIN contacts c ON c.id = t.contact_id
        JOIN instances i ON i.id = t.instance_id
        WHERE t.id = ?
      `, [ticketId]);

      if (newTicket) {
        newTicket.tags = newTicket.tags ? JSON.parse(newTicket.tags) : [];
        req.wsManager.broadcast('ticket_created', newTicket);
      }

      console.log(`✅ Mensagem de follow-up enviada para ${contactPhone} via ${instance.name} - Ticket ${ticketId} criado`);

      res.status(201).json({
        messageId,
        ticketId,
        status: 'sent',
        instanceUsed: instance.name,
        provider: instance.provider
      });

    } catch (waError) {
      console.error('❌ Erro ao enviar mensagem de follow-up via WhatsApp:', waError);

      // Remover ticket se falhou o envio
      await db.run('DELETE FROM tickets WHERE id = ?', [ticketId]);

      return res.status(500).json({
        error: 'Erro ao enviar mensagem',
        details: waError.message
      });
    }

  } catch (error) {
    console.error('❌ Erro ao processar envio de follow-up:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/messages/send-quick - Envio rápido de mensagem (FollowUp)
router.post('/send-quick', async (req, res) => {
  try {
    const { phoneNumber, messageType, content } = req.body;

    if (!phoneNumber || !messageType || !content) {
      return res.status(400).json({
        error: 'phoneNumber, messageType e content são obrigatórios'
      });
    }

    const db = getDatabase();

    // Buscar uma instância conectada (priorizar Whaileys para botões/listas)
    let instance;
    if (messageType === 'buttons' || messageType === 'list') {
      // Priorizar Whaileys para mensagens interativas
      instance = await db.get(`
        SELECT * FROM instances 
        WHERE status = 'connected' AND provider = 'whaileys'
        ORDER BY last_seen DESC LIMIT 1
      `);
    }

    if (!instance) {
      // Buscar qualquer instância conectada
      instance = await db.get(`
        SELECT * FROM instances 
        WHERE status = 'connected'
        ORDER BY last_seen DESC LIMIT 1
      `);
    }

    if (!instance) {
      return res.status(400).json({ error: 'Nenhuma instância conectada disponível' });
    }

    // Buscar ou criar contato
    const normalizedPhone = phoneNumber.replace(/\D/g, '');
    let contact = await db.get('SELECT * FROM contacts WHERE phone = ?', [normalizedPhone]);

    if (!contact) {
      // Criar contato temporário
      const contactId = uuidv4();
      await db.run(`
        INSERT INTO contacts (id, name, phone, whatsapp_id)
        VALUES (?, ?, ?, ?)
      `, [contactId, normalizedPhone, normalizedPhone, `${normalizedPhone}@s.whatsapp.net`]);

      contact = { id: contactId, phone: normalizedPhone, whatsapp_id: `${normalizedPhone}@s.whatsapp.net` };
    }

    // Buscar ou criar ticket para mensagens rápidas
    let ticket = await db.get(`
      SELECT * FROM tickets 
      WHERE contact_id = ? AND instance_id = ? AND status != 'closed'
      ORDER BY created_at DESC LIMIT 1
    `, [contact.id, instance.id]);

    if (!ticket) {
      // Criar ticket temporário para mensagem rápida
      const ticketId = uuidv4();
      await db.run(`
        INSERT INTO tickets (id, contact_id, instance_id, status, subject)
        VALUES (?, ?, ?, 'open', 'Mensagem Rápida')
      `, [ticketId, contact.id, instance.id]);

      ticket = { id: ticketId, contact_id: contact.id, instance_id: instance.id };
    }

    const messageId = uuidv4();
    const timestamp = new Date();
    const remoteJid = contact.whatsapp_id || `${normalizedPhone}@s.whatsapp.net`;

    // Preparar mensagem para WhatsApp baseada no tipo
    let waMessage = {};
    let messageContent = '';

    switch (messageType) {
      case 'text':
        waMessage = { text: content.text };
        messageContent = content.text;
        break;

      case 'buttons':
        if (instance.provider === 'whaileys') {
          // Usar EXATAMENTE a estrutura do button_whaileys que funciona
          const whaileysButtons = content.buttons.map((btn, index) => ({
            buttonId: btn.id || btn.buttonId || `id${index + 1}`,
            buttonText: { displayText: btn.text },
            type: 1
          }));

          waMessage = {
            text: content.text,
            footer: content.footer || '',
            buttons: whaileysButtons
          };
        } else {
          // Fallback para texto simples no Baileys
          waMessage = {
            text: `${content.text}\n\n${content.buttons.map((btn, i) => `${i + 1}. ${btn.text}`).join('\n')}`
          };
        }
        messageContent = JSON.stringify(content);
        break;

      case 'list':
        if (instance.provider === 'whaileys') {
          // Usar EXATAMENTE a estrutura do button_whaileys que funciona
          const whaileysSections = content.sections.map(section => ({
            title: section.title,
            rows: section.rows.map(row => ({
              rowId: row.id,
              title: row.title,
              description: row.description || ''
            }))
          }));

          waMessage = {
            text: content.text,
            footer: content.footer || '',
            title: content.title || '',
            buttonText: content.buttonText || 'Abrir Menu',
            sections: whaileysSections
          };
        } else {
          // Fallback para texto simples no Baileys
          let textFallback = content.text + '\n\n';
          content.sections.forEach(section => {
            textFallback += `*${section.title}*\n`;
            section.rows.forEach((row, i) => {
              textFallback += `${i + 1}. ${row.title}`;
              if (row.description) textFallback += ` - ${row.description}`;
              textFallback += '\n';
            });
            textFallback += '\n';
          });
          waMessage = { text: textFallback };
        }
        messageContent = JSON.stringify(content);
        break;

      default:
        return res.status(400).json({ error: 'Tipo de mensagem não suportado' });
    }

    try {
      // Enviar mensagem via WhatsApp
      let sentMessage;
      if (messageType === 'buttons' && instance.provider === 'whaileys') {
        sentMessage = await req.waManager.sendButtons(
          instance.id,
          remoteJid,
          content.text,
          content.footer,
          content.buttons
        );
      } else if (messageType === 'list' && instance.provider === 'whaileys') {
        sentMessage = await req.waManager.sendListMessage(
          instance.id,
          remoteJid,
          content.text,
          content.buttonText,
          content.sections,
          content.footer
        );
      } else {
        sentMessage = await req.waManager.sendMessage(instance.id, remoteJid, waMessage);
      }

      // Salvar mensagem no banco (opcional para envios rápidos)
      await db.run(`
        INSERT INTO messages (
          id, ticket_id, contact_id, instance_id, type, content, 
          wa_message_id, wa_remote_jid, from_me,
          timestamp, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        messageId, ticket.id, contact.id, instance.id, messageType, messageContent,
        sentMessage.key?.id || messageId, sentMessage.key?.remoteJid || remoteJid, true,
        timestamp.toISOString(), 'sent'
      ]);

      console.log(`✅ Mensagem rápida enviada para ${phoneNumber} via ${instance.name}`);

      res.status(201).json({
        messageId,
        status: 'sent',
        instanceUsed: instance.name,
        provider: instance.provider
      });

    } catch (waError) {
      console.error('❌ Erro ao enviar mensagem rápida via WhatsApp:', waError);

      return res.status(500).json({
        error: 'Erro ao enviar mensagem',
        details: waError.message
      });
    }

  } catch (error) {
    console.error('❌ Erro ao processar envio rápido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/messages/send - Enviar mensagem
router.post('/send', upload.single('media'), async (req, res) => {
  console.log('\n🟢 ========== ROTA /send CHAMADA ==========');
  console.log('⏰ Timestamp:', new Date().toISOString());

  try {
    const {
      instanceId,
      contactId,
      ticketId,
      type = 'text',
      content,
      quotedMessageId
    } = req.body;

    console.log('📥 Dados recebidos:', { instanceId, contactId, ticketId, type, hasFile: !!req.file });

    if (!instanceId || !contactId) {
      return res.status(400).json({ error: 'instanceId e contactId são obrigatórios' });
    }

    if (type === 'text' && !content) {
      return res.status(400).json({ error: 'Conteúdo é obrigatório para mensagens de texto' });
    }

    const db = getDatabase();

    // Verificar se a instância está conectada
    const instance = await db.get('SELECT * FROM instances WHERE id = ? AND status = ?', [instanceId, 'connected']);
    if (!instance) {
      return res.status(400).json({ error: 'Instância não conectada' });
    }

    // Buscar contato
    const contact = await db.get('SELECT * FROM contacts WHERE id = ?', [contactId]);
    if (!contact) {
      return res.status(404).json({ error: 'Contato não encontrado' });
    }

    // Buscar ou criar ticket
    let ticket;
    if (ticketId) {
      ticket = await db.get('SELECT * FROM tickets WHERE id = ?', [ticketId]);
    } else {
      // Buscar ticket aberto existente
      ticket = await db.get(`
        SELECT * FROM tickets 
        WHERE contact_id = ? AND instance_id = ? AND status != 'closed'
        ORDER BY created_at DESC LIMIT 1
      `, [contactId, instanceId]);

      // Criar novo ticket se não existir
      if (!ticket) {
        const newTicketId = uuidv4();
        await db.run(`
          INSERT INTO tickets (id, contact_id, instance_id, status)
          VALUES (?, ?, ?, 'open')
        `, [newTicketId, contactId, instanceId]);

        ticket = { id: newTicketId, contact_id: contactId, instance_id: instanceId };
      }
    }

    const messageId = uuidv4();
    const timestamp = new Date();
    let mediaUrl = null;
    let mediaFilename = null;
    let mediaMimetype = null;
    let mediaSize = null;

    // Processar arquivo de mídia se enviado
    if (req.file) {
      mediaUrl = `/uploads/messages/${req.file.filename}`;
      mediaFilename = req.file.originalname;
      mediaMimetype = req.file.mimetype;
      mediaSize = req.file.size;
    }

    // Preparar mensagem para WhatsApp
    let waMessage = {};

    // Lógica para determinar o JID correto de envio
    let remoteJid;
    if (contact.whatsapp_id && contact.whatsapp_id.includes('@')) {
      // Se já temos um JID salvo (pode ser @s.whatsapp.net ou @lid), usar ele
      remoteJid = contact.whatsapp_id;
    } else {
      // Fallback para o número de telefone
      const phoneNumber = contact.phone.replace(/\D/g, '');
      remoteJid = `${phoneNumber}@s.whatsapp.net`;
    }

    console.log(`\n🔵 ========== PROCESSANDO MENSAGEM ==========`);
    console.log(`📋 Tipo: ${type}`);
    console.log(`📞 Contato phone: ${contact.phone}`);
    console.log(`📞 Contato whatsapp_id: ${contact.whatsapp_id || 'não definido'}`);
    console.log(`📞 RemoteJid final: ${remoteJid}`);
    console.log(`📋 Instância: ${instanceId}`);
    console.log(`📋 Tem arquivo: ${!!req.file}`);
    if (req.file) {
      console.log(`📎 Arquivo recebido:`);
      console.log(`   - Nome: ${req.file.originalname}`);
      console.log(`   - Tipo: ${req.file.mimetype}`);
      console.log(`   - Tamanho: ${req.file.size}`);
      console.log(`   - Caminho: ${req.file.path}`);
    }
    console.log(`🔵 ==========================================\n`);

    switch (type) {
      case 'text':
        waMessage = { text: content };
        break;

      case 'image':
        if (!req.file) {
          console.error('❌ Upload de imagem falhou: req.file ausente');
          return res.status(400).json({ error: 'Arquivo de imagem é obrigatório' });
        }
        console.log(`🖼️ Processando imagem: ${req.file.path}`);

        // Usar Buffer para garantir que o Baileys consiga ler o arquivo independentemente do caminho
        const imageBuffer = await fs.readFile(req.file.path);

        waMessage = {
          image: imageBuffer,
          caption: content || ''
        };
        break;

      case 'video':
        if (!req.file) {
          console.error('❌ Upload de vídeo falhou: req.file ausente');
          return res.status(400).json({ error: 'Arquivo de vídeo é obrigatório' });
        }
        console.log(`🎥 Processando vídeo: ${req.file.path}`);
        waMessage = {
          video: { url: path.resolve(req.file.path) },
          caption: content || ''
        };
        break;

      case 'audio':
        if (!req.file) {
          return res.status(400).json({ error: 'Arquivo de áudio é obrigatório' });
        }

        console.log(`🎵 Processando áudio:`);
        console.log(`   - Arquivo original: ${req.file.originalname}`);
        console.log(`   - Mimetype original: ${req.file.mimetype}`);
        console.log(`   - Caminho: ${req.file.path}`);

        const inputAudioPath = req.file.path;
        const extension = path.extname(req.file.originalname).toLowerCase();

        // Se o mimetype for octet-stream, mas a extensão for áudio, corrigimos o mimetype internamente
        let effectiveMimetype = req.file.mimetype;
        if (effectiveMimetype === 'application/octet-stream') {
          if (extension === '.ogg') effectiveMimetype = 'audio/ogg';
          else if (extension === '.mp3') effectiveMimetype = 'audio/mpeg';
          else if (extension === '.wav') effectiveMimetype = 'audio/wav';
          else if (extension === '.webm') effectiveMimetype = 'audio/webm';
        }

        const isAlreadyOgg = effectiveMimetype.includes('ogg') || effectiveMimetype.includes('opus') || extension === '.ogg';
        const isWebM = effectiveMimetype.includes('webm') || extension === '.webm';

        // Se já é OGG ou WebM, usar direto sem converter
        if (isAlreadyOgg || isWebM) {
          console.log(`✅ Arquivo já está em formato compatível (${effectiveMimetype}), usando direto`);

          waMessage = {
            audio: { url: path.resolve(inputAudioPath) },
            mimetype: isAlreadyOgg ? 'audio/ogg; codecs=opus' : effectiveMimetype,
            ptt: true // SEMPRE true para OGG/WebM
          };
        } else {
          // Precisa converter para OGG
          const outputOggFilename = `${path.parse(req.file.filename).name}.ogg`;
          const outputOggPath = path.join(path.dirname(inputAudioPath), outputOggFilename);

          try {
            console.log(`🔄 Convertendo ${req.file.mimetype} para OGG Opus: ${inputAudioPath} -> ${outputOggPath}`);

            await new Promise((resolve, reject) => {
              ffmpeg(inputAudioPath)
                .toFormat('ogg')
                .audioCodec('libopus')
                .audioChannels(1)
                .audioFrequency(16000)
                .on('error', (err) => {
                  console.error('❌ Erro FFmpeg:', err.message);
                  reject(err);
                })
                .on('end', () => {
                  console.log('✅ Conversão OGG concluída');
                  resolve();
                })
                .save(outputOggPath);
            });

            // Atualizar para usar o arquivo convertido
            mediaUrl = `/uploads/messages/${outputOggFilename}`;
            mediaMimetype = 'audio/ogg; codecs=opus';

            waMessage = {
              audio: { url: path.resolve(outputOggPath) },
              mimetype: 'audio/ogg; codecs=opus',
              ptt: true
            };

            console.log(`✅ Áudio convertido e pronto para envio como PTT`);

          } catch (conversionError) {
            console.error('❌ Falha na conversão:', conversionError.message);
            console.log('⚠️ Enviando arquivo original como áudio (não PTT)');

            // Fallback: enviar arquivo original como áudio normal
            waMessage = {
              audio: { url: path.resolve(inputAudioPath) },
              mimetype: req.file.mimetype,
              ptt: false // Não PTT se conversão falhou
            };
          }
        }
        break;

      case 'document':
        if (!req.file) {
          console.error('❌ Upload de documento falhou: req.file ausente');
          return res.status(400).json({ error: 'Arquivo é obrigatório' });
        }
        console.log(`📄 Processando documento: ${req.file.path} (${req.file.mimetype})`);
        waMessage = {
          document: { url: path.resolve(req.file.path) },
          mimetype: req.file.mimetype,
          fileName: req.file.originalname,
          caption: content || ''
        };
        break;

      case 'location':
        try {
          const locData = typeof content === 'string' ? JSON.parse(content) : content;
          if (locData.latitude === undefined || locData.longitude === undefined) {
            return res.status(400).json({ error: 'Latitude e longitude são obrigatórios para localização' });
          }
          waMessage = {
            location: {
              degreesLatitude: Number(locData.latitude),
              degreesLongitude: Number(locData.longitude),
              name: locData.name || 'Minha Localização',
              address: locData.address || ''
            }
          };
        } catch (e) {
          return res.status(400).json({ error: 'Conteúdo de localização inválido' });
        }
        break;

      case 'poll':
        try {
          // No caso de enquete, o content virá como objeto JSON (stringificado pelo body-parser se for application/json)
          const pollData = typeof content === 'string' ? JSON.parse(content) : content;
          if (!pollData.name || !pollData.options) {
            return res.status(400).json({ error: 'Nome e opções da enquete são obrigatórios' });
          }

          const sentPoll = await req.waManager.sendPoll(
            instanceId,
            remoteJid,
            pollData.name,
            pollData.options,
            pollData.selectableOptionsCount || 1
          );

          // Salvar no banco
          await db.run(`
            INSERT INTO messages (
              id, ticket_id, contact_id, instance_id, type, content,
              wa_message_id, wa_remote_jid, from_me, timestamp, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            messageId, ticket.id, contactId, instanceId, 'poll', JSON.stringify(pollData),
            sentPoll.key.id, sentPoll.key.remoteJid, true, timestamp.toISOString(), 'sent'
          ]);

          const savedPollMsg = await db.get('SELECT * FROM messages WHERE id = ?', [messageId]);

          // Notificar via WebSocket
          req.wsManager.broadcast('message_sent', {
            ticketId: ticket.id,
            message: savedPollMsg
          });

          return res.json(savedPollMsg);
        } catch (pollErr) {
          console.error('❌ Erro ao enviar enquete via /send:', pollErr);
          return res.status(500).json({ error: 'Erro ao enviar enquete', details: pollErr.message });
        }
        break;

      case 'carousel':
        try {
          const cards = typeof content === 'string' ? JSON.parse(content) : content;
          if (!Array.isArray(cards)) {
            return res.status(400).json({ error: 'Cards devem ser um array para carrossel' });
          }

          const sentCarousel = await req.waManager.sendCarousel(
            instanceId,
            remoteJid,
            cards
          );

          // Salvar no banco
          await db.run(`
            INSERT INTO messages (
              id, ticket_id, contact_id, instance_id, type, content,
              wa_message_id, wa_remote_jid, from_me, timestamp, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            messageId, ticket.id, contactId, instanceId, 'carousel', JSON.stringify(cards),
            sentCarousel.key.id, sentCarousel.key.remoteJid, true, timestamp.toISOString(), 'sent'
          ]);

          const savedCarouselMsg = await db.get('SELECT * FROM messages WHERE id = ?', [messageId]);

          // Notificar via WebSocket
          req.wsManager.broadcast('message_sent', {
            ticketId: ticket.id,
            message: savedCarouselMsg
          });

          return res.json(savedCarouselMsg);
        } catch (carError) {
          console.error('❌ Erro ao enviar carrossel via /send:', carError);
          return res.status(500).json({ error: 'Erro ao enviar carrossel', details: carError.message });
        }
        break;

      default:
        return res.status(400).json({ error: 'Tipo de mensagem não suportado' });
    }

    // Adicionar mensagem citada se especificada
    if (quotedMessageId) {
      const quotedMessage = await db.get('SELECT * FROM messages WHERE id = ?', [quotedMessageId]);
      if (quotedMessage) {
        waMessage.quoted = {
          key: {
            id: quotedMessage.wa_message_id,
            remoteJid: quotedMessage.wa_remote_jid,
            fromMe: quotedMessage.from_me
          }
        };
      }
    }

    console.log(`✉️ Preparando envio: Tipo=${type}, Contact=${contactId}, Instance=${instanceId}`);
    console.log('📦 Conteúdo da mensagem WA:', JSON.stringify(waMessage, null, 2));

    // Verificação especial para áudio
    if (type === 'audio' && waMessage.audio) {
      const audioPath = waMessage.audio.url;
      console.log(`🎵 Verificando arquivo de áudio: ${audioPath}`);

      try {
        const fs = await import('fs/promises');
        const stats = await fs.default.stat(audioPath);
        console.log(`✅ Arquivo existe: ${stats.size} bytes`);

        // Verificar se é um arquivo válido (não vazio)
        if (stats.size === 0) {
          console.error('❌ Arquivo de áudio está vazio!');
          return res.status(400).json({ error: 'Arquivo de áudio está vazio' });
        }

        // Verificar se o arquivo é legível
        await fs.default.access(audioPath, fs.default.constants.R_OK);
        console.log(`✅ Arquivo é legível`);

        // Verificar se é um arquivo de áudio válido (verificação básica)
        const buffer = await fs.default.readFile(audioPath);
        if (buffer.length < 100) { // Arquivo muito pequeno para ser áudio válido
          console.error('❌ Arquivo de áudio muito pequeno para ser válido');
          return res.status(400).json({ error: 'Arquivo de áudio inválido' });
        }

        console.log(`✅ Arquivo de áudio validado: ${buffer.length} bytes`);

      } catch (fileError) {
        console.error('❌ Erro ao verificar arquivo de áudio:', fileError);
        return res.status(400).json({
          error: 'Arquivo de áudio não encontrado ou ilegível',
          details: fileError.message
        });
      }
    }

    try {
      // Enviar mensagem via WhatsApp
      console.log(`🚀 Enviando mensagem via WhatsApp Manager...`);
      console.log(`📋 Tipo da mensagem: ${type}`);
      console.log(`📋 Instância: ${instanceId}`);
      console.log(`📋 Contato: ${remoteJid}`);

      // Para áudio, tentar usar método específico sendAudio se disponível
      let sentMessage;
      if (type === 'audio' && waMessage.audio && typeof req.waManager.sendAudio === 'function') {
        console.log(`🎵 Usando método sendAudio específico`);
        console.log(`🎵 Arquivo de áudio: ${waMessage.audio.url}`);

        sentMessage = await req.waManager.sendAudio(
          instanceId,
          remoteJid,
          waMessage.audio.url,
          {
            ptt: waMessage.ptt || false,
            mimetype: waMessage.mimetype
          }
        );
      } else {
        console.log(`📤 Usando método sendMessage genérico`);
        console.log(`📤 Conteúdo da mensagem:`, JSON.stringify(waMessage, null, 2));
        sentMessage = await req.waManager.sendMessage(instanceId, remoteJid, waMessage);
      }

      console.log('✅ Mensagem enviada com sucesso ao WhatsApp Manager');
      console.log('📨 Resposta do WhatsApp:', JSON.stringify(sentMessage, null, 2));

      // Salvar mensagem no banco
      await db.run(`
        INSERT INTO messages (
          id, ticket_id, contact_id, instance_id, type, content, 
          media_url, media_filename, media_mimetype, media_size,
          wa_message_id, wa_remote_jid, from_me, quoted_message_id,
          timestamp, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        messageId, ticket.id, contactId, instanceId, type, content,
        mediaUrl, mediaFilename, mediaMimetype, mediaSize,
        sentMessage.key.id, sentMessage.key.remoteJid, true, quotedMessageId,
        timestamp.toISOString(), 'sent'
      ]);

      const savedMessage = await db.get('SELECT * FROM messages WHERE id = ?', [messageId]);

      // Notificar via WebSocket
      req.wsManager.broadcast('message_sent', {
        ticketId: ticket.id,
        message: savedMessage
      });

      res.status(201).json(savedMessage);

    } catch (waError) {
      console.error('❌ Erro ao enviar mensagem via WhatsApp:', waError);

      // Salvar mensagem com status de erro
      await db.run(`
        INSERT INTO messages (
          id, ticket_id, contact_id, instance_id, type, content,
          media_url, media_filename, media_mimetype, media_size,
          from_me, quoted_message_id, timestamp, status, error_message
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        messageId, ticket.id, contactId, instanceId, type, content,
        mediaUrl, mediaFilename, mediaMimetype, mediaSize,
        true, quotedMessageId, timestamp.toISOString(), 'failed', waError.message
      ]);

      return res.status(500).json({
        error: 'Erro ao enviar mensagem',
        details: waError.message
      });
    }

  } catch (error) {
    console.error('❌ Erro ao processar envio de mensagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/messages/:id - Buscar mensagem por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const message = await db.get(`
      SELECT 
        m.*,
        c.name as contact_name,
        t.subject as ticket_subject,
        i.name as instance_name
      FROM messages m
      JOIN contacts c ON c.id = m.contact_id
      JOIN tickets t ON t.id = m.ticket_id
      JOIN instances i ON i.id = m.instance_id
      WHERE m.id = ?
    `, [id]);

    if (!message) {
      return res.status(404).json({ error: 'Mensagem não encontrada' });
    }

    res.json(message);

  } catch (error) {
    console.error('❌ Erro ao buscar mensagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/messages/:id/status - Atualizar status da mensagem
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'sent', 'delivered', 'read', 'failed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    const db = getDatabase();

    await db.run(
      'UPDATE messages SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );

    const updatedMessage = await db.get('SELECT * FROM messages WHERE id = ?', [id]);

    if (!updatedMessage) {
      return res.status(404).json({ error: 'Mensagem não encontrada' });
    }

    // Notificar via WebSocket
    req.wsManager.broadcast('message_status_updated', {
      messageId: id,
      status,
      message: updatedMessage
    });

    res.json(updatedMessage);

  } catch (error) {
    console.error('❌ Erro ao atualizar status da mensagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/messages/search - Buscar mensagens
router.get('/search', async (req, res) => {
  try {
    const {
      q,
      instanceId,
      contactId,
      type,
      fromMe,
      dateFrom,
      dateTo,
      page = 1,
      limit = 20
    } = req.query;

    if (!q || q.length < 3) {
      return res.status(400).json({ error: 'Termo de busca deve ter pelo menos 3 caracteres' });
    }

    const offset = (page - 1) * limit;
    const db = getDatabase();

    let query = `
      SELECT 
        m.*,
        c.name as contact_name,
        c.phone as contact_phone,
        t.subject as ticket_subject,
        i.name as instance_name
      FROM messages m
      JOIN contacts c ON c.id = m.contact_id
      JOIN tickets t ON t.id = m.ticket_id
      JOIN instances i ON i.id = m.instance_id
      WHERE m.content LIKE ?
    `;

    const params = [`%${q}%`];

    // Filtros adicionais
    if (instanceId) {
      query += ' AND m.instance_id = ?';
      params.push(instanceId);
    }

    if (contactId) {
      query += ' AND m.contact_id = ?';
      params.push(contactId);
    }

    if (type) {
      query += ' AND m.type = ?';
      params.push(type);
    }

    if (fromMe !== undefined) {
      query += ' AND m.from_me = ?';
      params.push(fromMe === 'true' ? 1 : 0);
    }

    if (dateFrom) {
      query += ' AND m.timestamp >= ?';
      params.push(dateFrom);
    }

    if (dateTo) {
      query += ' AND m.timestamp <= ?';
      params.push(dateTo);
    }

    query += ' ORDER BY m.timestamp DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const messages = await db.all(query, params);

    // Contar total para paginação
    let countQuery = query.replace(/SELECT.*?FROM/, 'SELECT COUNT(*) as total FROM');
    countQuery = countQuery.replace(/ORDER BY.*?LIMIT.*?OFFSET.*?$/, '');
    const { total } = await db.get(countQuery, params.slice(0, -2));

    res.json({
      data: messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar mensagens:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/messages/:id - Editar mensagem
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const db = getDatabase();

    const message = await db.get('SELECT * FROM messages WHERE id = ?', [id]);
    if (!message) {
      return res.status(404).json({ error: 'Mensagem não encontrada' });
    }

    if (!message.from_me || message.type !== 'text') {
      return res.status(400).json({ error: 'Apenas mensagens de texto enviadas por você podem ser editadas.' });
    }

    // Editar no WhatsApp
    if (req.waManager) {
      const key = {
        remoteJid: message.wa_remote_jid,
        id: message.wa_message_id,
        fromMe: true
      };
      await req.waManager.editMessage(message.instance_id, message.wa_remote_jid, key, content);
    }

    // Atualizar no banco
    await db.run('UPDATE messages SET content = ? WHERE id = ?', [content, id]);

    // Notificar via WebSocket
    req.wsManager.broadcast('message_updated', {
      ticketId: message.ticket_id,
      message: { id, content }
    });

    res.json({ success: true, content });

  } catch (error) {
    console.error('❌ Erro ao editar mensagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/messages/:id - Remover mensagem
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const message = await db.get('SELECT * FROM messages WHERE id = ?', [id]);
    if (!message) {
      return res.status(404).json({ error: 'Mensagem não encontrada' });
    }

    // Tentar deletar no WhatsApp
    if (req.waManager && message.wa_message_id) {
      try {
        const key = {
          remoteJid: message.wa_remote_jid,
          id: message.wa_message_id,
          fromMe: !!message.from_me
        };
        await req.waManager.deleteMessage(message.instance_id, message.wa_remote_jid, key);
      } catch (waError) {
        console.warn('⚠️ Falha ao deletar mensagem no WhatsApp:', waError);
      }
    }

    // Remover arquivo de mídia se existir
    if (message.media_url) {
      try {
        const filePath = path.join(process.cwd(), message.media_url);
        await fs.unlink(filePath);
      } catch (fileError) {
        console.warn('⚠️ Erro ao remover arquivo de mídia:', fileError);
      }
    }

    await db.run('DELETE FROM messages WHERE id = ?', [id]);

    // Notificar via WebSocket
    req.wsManager.broadcast('message_deleted', { messageId: id });

    res.json({ message: 'Mensagem removida com sucesso' });

  } catch (error) {
    console.error('❌ Erro ao remover mensagem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;