import express from 'express';
import { getDatabase } from '../database/init.js';
import { v4 as uuidv4 } from 'uuid';
import { toWhatsAppFormat } from '../utils/phoneUtils.js';
import {
  createButtonMessage,
  createListMessage,
  createButtonMessageWithImage,
  convertButtonsToWhaileyFormat,
  convertSectionsToWhaileyFormat
} from '../utils/interactiveMessages.js';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configurar multer para upload de arquivos de campanha
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'campaigns');
    await fs.mkdir(uploadDir, { recursive: true }).catch(() => { });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `camp-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB
});

// POST /api/campaigns/upload - Upload de múltiplas mídias
router.post('/upload', upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const files = req.files.map(file => ({
      name: file.originalname,
      url: `/uploads/campaigns/${file.filename}`,
      type: file.mimetype.split('/')[0], // image, video, audio, application
      mimetype: file.mimetype,
      size: file.size,
      path: file.path
    }));

    res.json({ files });
  } catch (error) {
    console.error('❌ Erro no upload de mídias da campanha:', error);
    res.status(500).json({ error: 'Erro ao processar upload' });
  }
});

// GET /api/campaigns - Listar campanhas
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const db = getDatabase();

    let query = 'SELECT * FROM campaigns';
    let countQuery = 'SELECT COUNT(*) as total FROM campaigns';
    const params = [];
    const conditions = [];

    // Filtros
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (search) {
      conditions.push('(name LIKE ? OR description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      const whereClause = ' WHERE ' + conditions.join(' AND ');
      query += whereClause;
      countQuery += whereClause;
    }

    // Ordenação
    const validSortFields = ['name', 'created_at', 'started_at', 'messages_sent', 'status'];
    const validSortOrders = ['ASC', 'DESC'];

    if (validSortFields.includes(sortBy) && validSortOrders.includes(sortOrder.toUpperCase())) {
      query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
    } else {
      query += ' ORDER BY created_at DESC';
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const campaigns = await db.all(query, params);
    const { total } = await db.get(countQuery, params.slice(0, -2));

    // Processar dados JSON
    const processedCampaigns = campaigns.map(campaign => ({
      ...campaign,
      instances: campaign.instances ? JSON.parse(campaign.instances) : [],
      target_criteria: campaign.target_criteria ? JSON.parse(campaign.target_criteria) : null,
      contact_list: campaign.contact_list ? JSON.parse(campaign.contact_list) : []
    }));

    res.json({
      data: processedCampaigns,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Erro ao listar campanhas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/campaigns/:id - Buscar campanha por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const campaign = await db.get('SELECT * FROM campaigns WHERE id = ?', [id]);
    if (!campaign) {
      return res.status(404).json({ error: 'Campanha não encontrada' });
    }

    // Buscar estatísticas detalhadas
    const stats = await db.get(`
      SELECT 
        COUNT(*) as total_sends,
        COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_count,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_count,
        COUNT(CASE WHEN status = 'read' THEN 1 END) as read_count,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count
      FROM campaign_sends
      WHERE campaign_id = ?
    `, [id]);

    // Buscar últimos envios
    const recentSends = await db.all(`
      SELECT 
        cs.*,
        c.name as contact_name,
        c.phone as contact_phone,
        i.name as instance_name
      FROM campaign_sends cs
      JOIN contacts c ON c.id = cs.contact_id
      JOIN instances i ON i.id = cs.instance_id
      WHERE cs.campaign_id = ?
      ORDER BY cs.created_at DESC
      LIMIT 10
    `, [id]);

    res.json({
      ...campaign,
      instances: campaign.instances ? JSON.parse(campaign.instances) : [],
      target_criteria: campaign.target_criteria ? JSON.parse(campaign.target_criteria) : null,
      contact_list: campaign.contact_list ? JSON.parse(campaign.contact_list) : [],
      stats,
      recentSends
    });

  } catch (error) {
    console.error('❌ Erro ao buscar campanha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/campaigns - Criar nova campanha
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      messageType,
      messageContent,
      mediaUrl,
      targetType = 'all',
      targetCriteria,
      contactList,
      instances,
      delayBetweenMessages = 5000,
      minDelay,
      maxDelay,
      mediaFiles, // Novo campo: array de URLs ou objetos de mídia
      delayBetweenInstances = 30000,
      maxMessagesPerInstance = 100,
      scheduledAt
    } = req.body;

    if (!name || !messageType || !messageContent) {
      return res.status(400).json({
        error: 'Nome, tipo de mensagem e conteúdo são obrigatórios'
      });
    }

    if (!instances || instances.length === 0) {
      return res.status(400).json({ error: 'Pelo menos uma instância deve ser selecionada' });
    }

    const db = getDatabase();
    const campaignId = uuidv4();

    // Calcular total de contatos baseado no tipo de segmentação
    let totalContacts = 0;

    if (targetType === 'all') {
      const result = await db.get('SELECT COUNT(*) as count FROM contacts WHERE stage != ?', ['inactive']);
      totalContacts = result.count;
    } else if (targetType === 'list' && contactList) {
      totalContacts = contactList.length;
    } else if (targetType === 'segment' && targetCriteria) {
      // Implementar lógica de segmentação baseada nos critérios
      totalContacts = await calculateSegmentSize(db, targetCriteria);
    }

    await db.run(`
      INSERT INTO campaigns (
        id, name, description, message_type, message_content, media_url, media_files,
        target_type, target_criteria, contact_list, instances,
        delay_between_messages, min_delay, max_delay, delay_between_instances, max_messages_per_instance,
        scheduled_at, total_contacts, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      campaignId, name, description, messageType, messageContent, mediaUrl, JSON.stringify(mediaFiles || []),
      targetType, JSON.stringify(targetCriteria), JSON.stringify(contactList), JSON.stringify(instances),
      delayBetweenMessages, minDelay || delayBetweenMessages, maxDelay || minDelay || delayBetweenMessages, delayBetweenInstances, maxMessagesPerInstance,
      scheduledAt, totalContacts, scheduledAt ? 'scheduled' : 'draft'
    ]);

    const newCampaign = await db.get('SELECT * FROM campaigns WHERE id = ?', [campaignId]);

    // Notificar via WebSocket
    req.wsManager.broadcast('campaign_created', newCampaign);

    res.status(201).json({
      ...newCampaign,
      instances: JSON.parse(newCampaign.instances),
      target_criteria: newCampaign.target_criteria ? JSON.parse(newCampaign.target_criteria) : null,
      contact_list: newCampaign.contact_list ? JSON.parse(newCampaign.contact_list) : []
    });

  } catch (error) {
    console.error('❌ Erro ao criar campanha:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// POST /api/campaigns/:id/start - Iniciar campanha
router.post('/:id/start', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const campaign = await db.get('SELECT * FROM campaigns WHERE id = ?', [id]);
    if (!campaign) {
      return res.status(404).json({ error: 'Campanha não encontrada' });
    }

    if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
      return res.status(400).json({ error: 'Campanha não pode ser iniciada neste status' });
    }

    // Atualizar status para running
    await db.run(`
      UPDATE campaigns 
      SET status = 'running', started_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [id]);

    // Iniciar processamento da campanha em background
    processCampaign(id, req.waManager, req.wsManager);

    res.json({ message: 'Campanha iniciada com sucesso' });

  } catch (error) {
    console.error('❌ Erro ao iniciar campanha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/campaigns/:id/pause - Pausar campanha
router.post('/:id/pause', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    await db.run('UPDATE campaigns SET status = ? WHERE id = ? AND status = ?', ['paused', id, 'running']);

    res.json({ message: 'Campanha pausada com sucesso' });

  } catch (error) {
    console.error('❌ Erro ao pausar campanha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/campaigns/:id/resume - Retomar campanha
router.post('/:id/resume', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    await db.run('UPDATE campaigns SET status = ? WHERE id = ? AND status = ?', ['running', id, 'paused']);

    // Retomar processamento
    processCampaign(id, req.waManager, req.wsManager);

    res.json({ message: 'Campanha retomada com sucesso' });

  } catch (error) {
    console.error('❌ Erro ao retomar campanha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/campaigns/:id - Remover campanha
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const campaign = await db.get('SELECT * FROM campaigns WHERE id = ?', [id]);
    if (!campaign) {
      return res.status(404).json({ error: 'Campanha não encontrada' });
    }

    if (campaign.status === 'running') {
      return res.status(400).json({ error: 'Não é possível remover campanha em execução. Pause a campanha primeiro.' });
    }

    // Deletar registros relacionados primeiro
    await db.run('DELETE FROM campaign_sends WHERE campaign_id = ?', [id]);

    await db.run('DELETE FROM campaigns WHERE id = ?', [id]);

    // Notificar via WebSocket
    req.wsManager.broadcast('campaign_deleted', { id });

    res.json({ message: 'Campanha removida com sucesso' });

  } catch (error) {
    console.error('❌ Erro ao remover campanha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/campaigns/:id/sends - Listar envios da campanha
router.get('/:id/sends', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50, status } = req.query;
    const offset = (page - 1) * limit;

    const db = getDatabase();

    let query = `
      SELECT 
        cs.*,
        c.name as contact_name,
        c.phone as contact_phone,
        i.name as instance_name
      FROM campaign_sends cs
      JOIN contacts c ON c.id = cs.contact_id
      JOIN instances i ON i.id = cs.instance_id
      WHERE cs.campaign_id = ?
    `;

    const params = [id];

    if (status) {
      query += ' AND cs.status = ?';
      params.push(status);
    }

    query += ' ORDER BY cs.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const sends = await db.all(query, params);

    // Contar total
    let countQuery = 'SELECT COUNT(*) as total FROM campaign_sends WHERE campaign_id = ?';
    const countParams = [id];

    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    const { total } = await db.get(countQuery, countParams);

    res.json({
      data: sends,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Erro ao listar envios da campanha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Função auxiliar para calcular tamanho do segmento
async function calculateSegmentSize(db, criteria) {
  let query = 'SELECT COUNT(*) as count FROM contacts WHERE 1=1';
  const params = [];

  if (criteria.stage) {
    query += ' AND stage = ?';
    params.push(criteria.stage);
  }

  if (criteria.source) {
    query += ' AND source = ?';
    params.push(criteria.source);
  }

  if (criteria.dateFrom) {
    query += ' AND created_at >= ?';
    params.push(criteria.dateFrom);
  }

  if (criteria.dateTo) {
    query += ' AND created_at <= ?';
    params.push(criteria.dateTo);
  }

  const result = await db.get(query, params);
  return result.count;
}

// Função para processar campanha em background
async function processCampaign(campaignId, waManager, wsManager) {
  try {
    console.log(`🚀 processCampaign: Iniciando processamento da campanha ${campaignId}`);
    console.log(`🔍 processCampaign: waManager disponível:`, !!waManager);
    console.log(`🔍 processCampaign: wsManager disponível:`, !!wsManager);

    const db = getDatabase();
    const campaign = await db.get('SELECT * FROM campaigns WHERE id = ?', [campaignId]);

    if (!campaign || campaign.status !== 'running') {
      console.log(`❌ processCampaign: Campanha ${campaignId} não encontrada ou não está rodando. Status: ${campaign?.status}`);
      return;
    }

    console.log(`📋 processCampaign: Campanha encontrada: ${campaign.name}`);

    const instances = JSON.parse(campaign.instances);
    console.log(`📱 processCampaign: Instâncias selecionadas:`, instances);

    // Verificar se as instâncias estão conectadas
    for (const instanceId of instances) {
      const instance = await db.get('SELECT * FROM instances WHERE id = ?', [instanceId]);
      console.log(`📱 processCampaign: Instância ${instanceId} - Status: ${instance?.status}, Provider: ${instance?.provider}`);

      if (!instance || instance.status !== 'connected') {
        console.warn(`⚠️ processCampaign: Instância ${instanceId} não está conectada. Status: ${instance?.status}`);
      }
    }

    let currentInstanceIndex = 0;
    let messagesInCurrentInstance = 0;

    // Obter lista de contatos baseada no tipo de segmentação
    let contacts = [];

    console.log(`🎯 processCampaign: Tipo de segmentação: ${campaign.target_type}`);

    if (campaign.target_type === 'all') {
      contacts = await db.all('SELECT * FROM contacts WHERE stage != ?', ['inactive']);
    } else if (campaign.target_type === 'list') {
      const contactList = JSON.parse(campaign.contact_list);
      if (contactList && contactList.length > 0) {
        const ids = [];
        const rawNumbers = [];
        contactList.forEach(item => {
          if (/^\d{8,15}$/.test(item)) rawNumbers.push(item);
          else ids.push(item);
        });

        if (ids.length > 0) {
          const placeholders = ids.map(() => '?').join(',');
          const dbContacts = await db.all(`SELECT * FROM contacts WHERE id IN (${placeholders})`, ids);
          contacts = [...contacts, ...dbContacts];
        }

        if (rawNumbers.length > 0) {
          rawNumbers.forEach(num => {
            contacts.push({ id: `manual_${num}`, name: `Manual ${num}`, phone: num });
          });
        }
      }
    } else if (campaign.target_type === 'segment') {
      const criteria = JSON.parse(campaign.target_criteria);
      contacts = await getContactsBySegment(db, criteria);
    }

    console.log(`👥 processCampaign: ${contacts.length} contatos encontrados para envio`);

    if (contacts.length === 0) {
      console.warn(`⚠️ processCampaign: Nenhum contato encontrado para a campanha ${campaignId}`);
      await db.run(`
        UPDATE campaigns 
        SET status = 'completed', completed_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [campaignId]);
      return;
    }

    let sentCount = campaign.messages_sent || 0;
    let failedCount = campaign.messages_failed || 0;

    // DELAY INICIAL DE 10 SEGUNDOS ANTES DO PRIMEIRO ENVIO
    console.log(`⏱️ processCampaign: Aguardando 10 segundos antes de iniciar os envios...`);
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Processar cada contato
    for (let i = 0; i < contacts.length; i++) {
      // Se este contato já foi processado (em caso de retomada), pular
      // Opcional: verificar no campaign_sends se já foi enviado

      const contact = contacts[i];
      console.log(`📤 processCampaign [${campaign.name}]: Processando contato ${i + 1}/${contacts.length}: ${contact.name} (ID: ${contact.id}, Phone: ${contact.phone})`);

      // Verificar se a campanha ainda está rodando
      const currentCampaign = await db.get('SELECT status FROM campaigns WHERE id = ?', [campaignId]);
      if (!currentCampaign || currentCampaign.status !== 'running') {
        console.log(`⏹️ processCampaign [${campaign.name}]: Campanha não está mais rodando. Status: ${currentCampaign?.status}`);
        break;
      }

      // Rotacionar instância se necessário
      if (messagesInCurrentInstance >= campaign.max_messages_per_instance) {
        currentInstanceIndex = (currentInstanceIndex + 1) % instances.length;
        messagesInCurrentInstance = 0;

        console.log(`🔄 processCampaign [${campaign.name}]: Rotacionando para instância ${instances[currentInstanceIndex]}`);

        // Delay entre instâncias
        console.log(`⏱️ processCampaign [${campaign.name}]: Aguardando ${campaign.delay_between_instances}ms entre instâncias`);
        await new Promise(resolve => setTimeout(resolve, campaign.delay_between_instances));
      }

      const instanceId = instances[currentInstanceIndex];
      const sendId = uuidv4();

      console.log(`📱 processCampaign: Usando instância ${instanceId} para envio`);

      try {
        let finalContactId = contact.id;

        // Se for um contato manual, garantir que ele existe no banco de dados (por causa da FK em campaign_sends)
        if (contact.id.startsWith('manual_')) {
          const rawPhone = contact.phone;
          const whatsappJid = toWhatsAppFormat(rawPhone);

          // Verificar se já existe um contato com este telefone
          let dbContact = await db.get('SELECT id FROM contacts WHERE phone = ? OR whatsapp_id = ?', [rawPhone, whatsappJid]);

          if (!dbContact) {
            // Criar novo contato para este número manual
            const newId = uuidv4();
            await db.run(`
              INSERT INTO contacts (id, name, phone, whatsapp_id, stage, source)
              VALUES (?, ?, ?, ?, 'lead', 'campaign_manual')
            `, [newId, contact.name, rawPhone, whatsappJid]);
            finalContactId = newId;
            console.log(`👤 processCampaign: Novo contato criado para número manual: ${newId}`);
          } else {
            finalContactId = dbContact.id;
            console.log(`👤 processCampaign: Contato manual já existia no banco: ${finalContactId}`);
          }
        }

        // Criar registro de envio
        await db.run(`
          INSERT INTO campaign_sends (id, campaign_id, contact_id, instance_id, status)
          VALUES (?, ?, ?, ?, 'pending')
        `, [sendId, campaignId, finalContactId, instanceId]);

        console.log(`📝 processCampaign: Registro de envio criado: ${sendId}`);

        // Preparar mensagem com tratamento CORRETO do número
        const rawPhone = contact.phone;
        const remoteJid = contact.whatsapp_id || toWhatsAppFormat(rawPhone);

        console.log(`📞 processCampaign: Número original: ${rawPhone}`);
        console.log(`📞 processCampaign: WhatsApp JID: ${remoteJid}`);

        // Lista de mensagens a enviar (texto e/ou mídias)
        const messagesToSend = [];

        // Processar mensagem com botões ou lista
        let messageContent = null;
        try {
          messageContent = typeof campaign.message_content === 'string'
            ? JSON.parse(campaign.message_content)
            : campaign.message_content;
        } catch (e) {
          // Se não for JSON, é texto simples
          messageContent = { text: campaign.message_content };
        }

        console.log(`📋 processCampaign: Tipo de mensagem detectado:`, {
          hasButtons: !!messageContent.buttons,
          hasSections: !!messageContent.sections,
          hasText: !!messageContent.text
        });

        // Verificar se é mensagem com botões
        if (messageContent.buttons && Array.isArray(messageContent.buttons)) {
          console.log(`🔘 processCampaign: Preparando mensagem com botões interativos`);
          console.log(`🔘 processCampaign: Botões recebidos:`, JSON.stringify(messageContent.buttons, null, 2));

          // Converter botões para o formato Whaileys se necessário
          let whaileyButtons = messageContent.buttons;

          // Verificar se os botões já estão no formato correto
          const isCorrectFormat = messageContent.buttons.every(btn =>
            btn.buttonId && btn.buttonText && btn.buttonText.displayText && 
            (btn.type === 1 || btn.type === 2 || btn.type === 3)
          );

          if (!isCorrectFormat) {
            console.log(`🔄 processCampaign: Convertendo botões para formato Whaileys`);
            whaileyButtons = convertButtonsToWhaileyFormat(messageContent.buttons);
          }

          console.log(`🔘 processCampaign: Botões no formato Whaileys:`, JSON.stringify(whaileyButtons, null, 2));

          // Verificar waManager
          if (!waManager || typeof waManager.sendMessage !== 'function') {
            throw new Error('waManager não configurado corretamente');
          }

          // USAR waManager.sendButtons DIRETAMENTE
          console.log(`📤 processCampaign: Enviando botões via waManager.sendButtons`);

          // Extrair parâmetros
          const text = messageContent.text || 'Escolha uma opção';
          const footer = messageContent.footer || '';

          // Enviar usando o método dedicado que agora existe no BaseWhatsAppManager
          const sentMessage = await waManager.sendButtons(instanceId, remoteJid, text, footer, whaileyButtons);
          console.log(`✅ processCampaign: Botões enviados com sucesso:`, sentMessage.key.id);

          // Não adicionar a messagesToSend, já foi enviada
        }
        // Verificar se é mensagem com lista
        else if (messageContent.sections && Array.isArray(messageContent.sections)) {
          console.log(`📋 processCampaign: Preparando mensagem com lista interativa`);
          console.log(`📋 processCampaign: Seções recebidas:`, JSON.stringify(messageContent.sections, null, 2));

          // Converter seções para o formato Whaileys se necessário
          let whaleySections = messageContent.sections;

          // Verificar se as seções já estão no formato correto
          const isCorrectFormat = messageContent.sections.every(section =>
            section.title && section.rows && Array.isArray(section.rows) &&
            section.rows.every(row => row.rowId && row.title)
          );

          if (!isCorrectFormat) {
            console.log(`🔄 processCampaign: Convertendo seções para formato Whaileys`);
            whaleySections = convertSectionsToWhaileyFormat(messageContent.sections);
          }

          console.log(`📋 processCampaign: Seções no formato Whaileys:`, JSON.stringify(whaleySections, null, 2));

          // Verificar waManager
          if (!waManager || typeof waManager.sendMessage !== 'function') {
            throw new Error('waManager não configurado corretamente');
          }

          // USAR waManager.sendList DIRETAMENTE
          console.log(`📤 processCampaign: Enviando lista via waManager.sendList`);

          // Extrair parâmetros
          const text = messageContent.text || 'Escolha uma opção';
          const footer = messageContent.footer || '';
          const title = messageContent.title || '';
          const buttonText = messageContent.buttonText || 'Clique aqui';

          // Enviar usando o método dedicado
          const sentMessage = await waManager.sendList(instanceId, remoteJid, text, footer, title, buttonText, whaleySections);
          console.log(`✅ processCampaign: Lista enviada com sucesso:`, sentMessage.key.id);

          // Não adicionar a messagesToSend, já foi enviada
        }
        // Verificar se é mensagem de Enquete (Poll)
        else if (messageContent.name && messageContent.options && Array.isArray(messageContent.options)) {
          console.log(`📊 processCampaign: Enviando enquete via waManager.sendPoll`);

          if (!waManager || typeof waManager.sendPoll !== 'function') {
            throw new Error('waManager não configurado corretamente ou não suporta Enquetes');
          }

          const selectableCount = messageContent.selectableOptionsCount || 1;
          const sentMessage = await waManager.sendPoll(
            instanceId,
            remoteJid,
            messageContent.name,
            messageContent.options,
            selectableCount
          );

          console.log(`✅ processCampaign: Enquete enviada com sucesso:`, sentMessage.key.id);
        }
        // Verificar se é mensagem com Carousel
        else if (messageContent.cards && Array.isArray(messageContent.cards)) {
          console.log(`🎡 processCampaign: Preparando mensagem Carousel com ${messageContent.cards.length} cards`);

          if (!waManager || typeof waManager.sendCarousel !== 'function') {
            throw new Error('waManager não configurado corretamente ou não suporta Carousel');
          }

          console.log(`📤 processCampaign: Enviando Carousel via waManager.sendCarousel`);
          const sentMessage = await waManager.sendCarousel(instanceId, remoteJid, messageContent.cards);
          console.log(`✅ processCampaign: Carousel enviado com sucesso:`, sentMessage.key.id);
        }
        // Verificar se é mensagem de áudio
        else if (messageContent.audioFiles && Array.isArray(messageContent.audioFiles)) {
          console.log(`🎵 processCampaign: Processando mensagem de áudio com ${messageContent.audioFiles.length} arquivos`);

          messageContent.audioFiles.forEach(audio => {
            const msg = {
              audio: { url: path.join(process.cwd(), audio.url.replace(/^\//, '')) },
              mimetype: 'audio/ogg; codecs=opus',
              ptt: true // Marca como mensagem de voz (Push to Talk)
            };

            messagesToSend.push(msg);
          });
        }
        else {
          // CORREÇÃO: Tratar mensagens de mídia do ScheduleModal
          if (messageContent.mediaFiles && Array.isArray(messageContent.mediaFiles)) {
            console.log(`🖼️ processCampaign: Processando mensagem de mídia do ScheduleModal com ${messageContent.mediaFiles.length} arquivos`);

            messageContent.mediaFiles.forEach(media => {
              const mediaType = media.type === 'image' ? 'image' :
                media.type === 'video' ? 'video' :
                  media.type === 'audio' ? 'audio' : 'document';

              const msg = {
                [mediaType]: { url: path.join(process.cwd(), media.url.replace(/^\//, '')) }
              };

              // Adicionar legenda se fornecida
              if (messageContent.caption && messageContent.caption.trim() !== '') {
                msg.caption = messageContent.caption;
              }

              messagesToSend.push(msg);
            });
          }
          // Processar mídia do sistema antigo (media_files)
          else {
            // Adicionar mensagem de texto se existir
            if (campaign.message_content && campaign.message_type === 'text') {
              messagesToSend.push({ text: campaign.message_content });
            }

            // Adicionar mídias
            const mediaFiles = campaign.media_files ? JSON.parse(campaign.media_files) : [];
            if (mediaFiles.length > 0) {
              mediaFiles.forEach(media => {
                const mediaType = media.type === 'image' ? 'image' :
                  media.type === 'video' ? 'video' :
                    media.type === 'audio' ? 'audio' : 'document';

                const msg = {
                  [mediaType]: { url: path.join(process.cwd(), media.url.replace(/^\//, '')) }
                };

                // CORREÇÃO: Só adicionar legenda se o usuário inseriu uma, não o nome do arquivo
                if (media.caption && media.caption.trim() !== '' && media.caption !== media.name) {
                  msg.caption = media.caption;
                } else if (messagesToSend.length === 0 && campaign.message_content && campaign.message_content.trim() !== '') {
                  // Se for a primeira mídia e houver conteúdo de texto, enviar como legenda
                  msg.caption = campaign.message_content;
                }

                messagesToSend.push(msg);
              });
            } else if (campaign.media_url) {
              // Fallback para media_url único antigo
              const msg = {
                image: { url: path.join(process.cwd(), campaign.media_url.replace(/^\//, '')) }
              };

              // Só adicionar legenda se houver texto da mensagem
              if (campaign.message_content && campaign.message_content.trim() !== '') {
                msg.caption = campaign.message_content;
              }

              messagesToSend.push(msg);
            }

            // Se ainda não tem nada, mas tem texto, envia texto (fallback)
            if (messagesToSend.length === 0 && campaign.message_content) {
              // CORREÇÃO: Verificar se o message_content não é um JSON de mídia
              let textContent = campaign.message_content;
              try {
                const parsed = JSON.parse(textContent);
                // Se for um objeto com mediaFiles, não enviar como texto
                if (parsed.mediaFiles && Array.isArray(parsed.mediaFiles)) {
                  console.log('⚠️ processCampaign: Detectado JSON de mídia no message_content, ignorando envio de texto');
                  textContent = null;
                }
              } catch (e) {
                // Não é JSON, é texto normal
              }

              if (textContent && textContent.trim() !== '') {
                messagesToSend.push({ text: textContent });
              }
            }
          }

          console.log(`💬 processCampaign: Preparando ${messagesToSend.length} mensagens para ${remoteJid}`);

          // Verificar waManager
          if (!waManager || typeof waManager.sendMessage !== 'function') {
            throw new Error('waManager não configurado corretamente');
          }

          // Enviar cada mensagem sequencialmente
          for (const waMessage of messagesToSend) {
            const sentMessage = await waManager.sendMessage(instanceId, remoteJid, waMessage);
            console.log(`✅ processCampaign: Mensagem/Mídia enviada:`, sentMessage.key.id);

            // Pequeno delay entre mídias da mesma campanha (fixo 2s)
            if (messagesToSend.length > 1) {
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }
        } // Fechar o bloco else

        // Atualizar status do envio
        await db.run(`
          UPDATE campaign_sends 
          SET status = 'sent', sent_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [sendId]);

        messagesInCurrentInstance++;
        sentCount++;

        // Atualizar estatísticas da campanha no banco
        await db.run(`
          UPDATE campaigns 
          SET messages_sent = ?
          WHERE id = ?
        `, [sentCount, campaignId]);

        console.log(`📊 processCampaign [${campaign.name}]: Mensagem enviada com sucesso para ${remoteJid}. Total enviado: ${sentCount}/${contacts.length}`);

        // Notificar progresso via WebSocket
        wsManager.broadcast('campaign_progress', {
          campaignId,
          messagesSent: sentCount,
          totalContacts: contacts.length,
          percentage: Math.round((sentCount / contacts.length) * 100)
        });

      } catch (error) {
        console.error(`❌ processCampaign [${campaign.name}]: Erro ao enviar para ${contact.phone}:`, error.message);
        failedCount++;

        // Log detalhado do erro em arquivo
        const errorLog = `[${new Date().toISOString()}] Campanha: ${campaignId}, Contato: ${contact.id}, Erro: ${error.message}\nStack: ${error.stack}\n\n`;
        await fs.appendFile(path.join(__dirname, '../../campaign_errors.log'), errorLog).catch(e => console.error('Erro ao gravar log:', e));

        // Marcar envio como falhou
        await db.run(`
          UPDATE campaign_sends 
          SET status = 'failed', error_message = ?
          WHERE id = ?
        `, [error.message, sendId]);

        await db.run(`
          UPDATE campaigns 
          SET messages_failed = ?
          WHERE id = ?
        `, [failedCount, campaignId]);
      }

      // Delay aleatório entre as mensagens (CORRIGIDO)
      const min = campaign.min_delay || campaign.delay_between_messages || 10000;
      const max = campaign.max_delay || min + 5000;

      // Garantir que min e max sejam diferentes para ter aleatoriedade
      const finalMin = Math.min(min, max);
      const finalMax = Math.max(min, max);

      // Se min e max forem iguais, adicionar variação de 20%
      const actualMin = finalMin;
      const actualMax = finalMin === finalMax ? finalMax + (finalMax * 0.2) : finalMax;

      const randomDelay = Math.floor(Math.random() * (actualMax - actualMin + 1)) + actualMin;

      console.log(`⏱️ processCampaign: Aguardando delay aleatório de ${randomDelay}ms (configurado: ${actualMin}-${actualMax}ms) entre mensagens`);
      await new Promise(resolve => setTimeout(resolve, randomDelay));
    }

    // Marcar campanha como concluída
    console.log(`🏁 processCampaign: Finalizando campanha ${campaignId}`);
    await db.run(`
      UPDATE campaigns 
      SET status = 'completed', completed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [campaignId]);

    wsManager.broadcast('campaign_completed', { campaignId });
    console.log(`✅ processCampaign: Campanha ${campaignId} concluída com sucesso`);

  } catch (error) {
    console.error(`❌ processCampaign: Erro crítico ao processar campanha ${campaignId}:`, error);
    console.error(`❌ processCampaign: Stack trace:`, error.stack);

    const fatalLog = `[${new Date().toISOString()}] FATAL ERROR Campanha: ${campaignId}, Erro: ${error.message}\nStack: ${error.stack}\n\n`;
    await fs.appendFile(path.join(__dirname, '../../campaign_errors.log'), fatalLog).catch(e => console.error('Erro ao gravar log fatal:', e));

    // Marcar campanha como falhou
    await db.run(`
      UPDATE campaigns 
      SET status = 'failed'
      WHERE id = ?
    `, [campaignId]);
  }
}

// Função auxiliar para obter contatos por segmento
async function getContactsBySegment(db, criteria) {
  let query = 'SELECT * FROM contacts WHERE 1=1';
  const params = [];

  if (criteria.stage) {
    query += ' AND stage = ?';
    params.push(criteria.stage);
  }

  if (criteria.source) {
    query += ' AND source = ?';
    params.push(criteria.source);
  }

  if (criteria.dateFrom) {
    query += ' AND created_at >= ?';
    params.push(criteria.dateFrom);
  }

  if (criteria.dateTo) {
    query += ' AND created_at <= ?';
    params.push(criteria.dateTo);
  }

  return await db.all(query, params);
}

export default router;