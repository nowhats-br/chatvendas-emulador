import express from 'express';
import { getDatabase } from '../database/init.js';

const router = express.Router();

// GET /api/instances - Listar todas as instâncias
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM instances';
    let countQuery = 'SELECT COUNT(*) as total FROM instances';
    const params = [];
    const conditions = [];

    // Filtros
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (search) {
      conditions.push('(name LIKE ? OR phone_number LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      const whereClause = ' WHERE ' + conditions.join(' AND ');
      query += whereClause;
      countQuery += whereClause;
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const db = getDatabase();
    const instances = await db.all(query, params);
    const { total } = await db.get(countQuery, params.slice(0, -2));

    res.json({
      data: instances,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Erro ao listar instâncias:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/instances/:id - Buscar instância por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const instance = await req.waManager.getInstanceById(id);

    if (!instance) {
      return res.status(404).json({ error: 'Instância não encontrada' });
    }

    res.json(instance);

  } catch (error) {
    console.error('❌ Erro ao buscar instância:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/instances - Criar nova instância
router.post('/', async (req, res) => {
  try {
    const { name, phoneNumber, provider = 'baileys' } = req.body;

    console.log('🔄 Backend recebeu requisição para criar instância:');
    console.log('   Body completo:', req.body);
    console.log('   Name:', name);
    console.log('   PhoneNumber:', phoneNumber);
    console.log('   Provider:', provider);
    console.log('   Tipo do provider:', typeof provider);

    if (!name) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    if (!['baileys', 'whaileys'].includes(provider)) {
      console.log('❌ Provider inválido:', provider);
      return res.status(400).json({ error: 'Provider deve ser "baileys" ou "whaileys"' });
    }

    console.log('✅ Validações passaram, criando instância...');
    const instance = await req.waManager.createInstance(name, phoneNumber, provider);
    console.log('✅ Instância criada:', instance);
    res.status(201).json(instance);

  } catch (error) {
    console.error('❌ Erro ao criar instância:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/instances/:id/connect - Conectar instância
router.post('/:id/connect', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    // Verificar se a instância existe
    const instance = await db.get('SELECT * FROM instances WHERE id = ?', [id]);
    if (!instance) {
      return res.status(404).json({ error: 'Instância não encontrada' });
    }

    console.log(`🔄 Conectando instância ${id} (${instance.provider})`);

    // Se já está conectada, retornar sucesso
    const manager = req.waManager.getManagerByProvider(instance.provider);
    const socket = manager.instances.get(id);
    if (socket && socket.user) {
      console.log(`✅ Instância ${id} já está conectada`);
      return res.json({ status: 'already_connected' });
    }

    // Limpar estado anterior e preparar para nova conexão
    await db.run(`
      UPDATE instances 
      SET qr_code = NULL, qr_expires_at = NULL, status = 'connecting'
      WHERE id = ?
    `, [id]);

    // Desconectar primeiro se houver socket ativo
    try {
      if (socket) {
        console.log(`🔌 Desconectando socket anterior da instância ${id}`);
        await req.waManager.disconnectInstance(id);
        // Aguardar um pouco para garantir desconexão completa
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (err) {
      console.log(`⚠️ Erro ao desconectar socket anterior (normal): ${err.message}`);
    }

    // Iniciar nova conexão
    const result = await req.waManager.connectInstance(id, true);
    
    console.log(`✅ Comando de conexão enviado para instância ${id}`);
    res.json(result);

  } catch (error) {
    console.error('❌ Erro ao conectar instância:', error);
    
    // Marcar como desconectada em caso de erro
    try {
      const db = getDatabase();
      await db.run('UPDATE instances SET status = ? WHERE id = ?', ['disconnected', req.params.id]);
    } catch (dbErr) {
      console.error('❌ Erro ao atualizar status no banco:', dbErr);
    }
    
    res.status(500).json({ error: error.message || 'Erro interno do servidor' });
  }
});

// POST /api/instances/:id/disconnect - Desconectar instância
router.post('/:id/disconnect', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    // Verificar se a instância existe
    const instance = await db.get('SELECT * FROM instances WHERE id = ?', [id]);
    if (!instance) {
      return res.status(404).json({ error: 'Instância não encontrada' });
    }

    console.log(`🔌 Desconectando instância ${id} (${instance.provider})`);

    // Desconectar via manager
    await req.waManager.disconnectInstance(id);

    // Limpar dados de sessão no banco para forçar nova autenticação
    await db.run(`
      UPDATE instances 
      SET qr_code = NULL, qr_expires_at = NULL, status = 'disconnected',
          phone_number = NULL, profile_name = NULL
      WHERE id = ?
    `, [id]);

    console.log(`✅ Instância ${id} desconectada e dados de sessão limpos`);

    res.json({ message: 'Instância desconectada com sucesso' });

  } catch (error) {
    console.error('❌ Erro ao desconectar instância:', error);
    res.status(500).json({ error: error.message || 'Erro interno do servidor' });
  }
});

// POST /api/instances/:id/generate-qr - Forçar geração de QR Code
router.post('/:id/generate-qr', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    // Verificar se a instância existe
    const instance = await db.get('SELECT * FROM instances WHERE id = ?', [id]);
    if (!instance) {
      return res.status(404).json({ error: 'Instância não encontrada' });
    }

    console.log(`🔄 Forçando geração de QR Code para instância ${id} (${instance.provider})`);

    // Desconectar primeiro se estiver conectada
    try {
      await req.waManager.disconnectInstance(id);
      console.log(`🔌 Instância ${id} desconectada`);
    } catch (err) {
      console.log('⚠️ Instância já estava desconectada');
    }

    // Aguardar um pouco para garantir desconexão
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Limpar QR Code antigo
    await db.run(`
      UPDATE instances 
      SET qr_code = NULL, qr_expires_at = NULL, status = 'disconnected'
      WHERE id = ?
    `, [id]);

    // Conectar novamente com QR
    console.log(`🔄 Reconectando instância ${id} com QR Code...`);
    const result = await req.waManager.connectInstance(id, true);

    res.json({
      message: 'QR Code sendo gerado...',
      ...result
    });

  } catch (error) {
    console.error('❌ Erro ao gerar QR Code:', error);
    res.status(500).json({ error: error.message || 'Erro interno do servidor' });
  }
});

// GET /api/instances/:id/qr - Obter QR Code da instância
router.get('/:id/qr', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const instance = await db.get(
      'SELECT qr_code, qr_expires_at FROM instances WHERE id = ?',
      [id]
    );

    if (!instance) {
      return res.status(404).json({ error: 'Instância não encontrada' });
    }

    if (!instance.qr_code) {
      return res.status(404).json({ error: 'QR Code não disponível' });
    }

    // Verificar se o QR ainda é válido
    const expiresAt = new Date(instance.qr_expires_at);
    if (expiresAt < new Date()) {
      return res.status(410).json({ error: 'QR Code expirado' });
    }

    res.json({
      qrCode: instance.qr_code,
      expiresAt: instance.qr_expires_at
    });

  } catch (error) {
    console.error('❌ Erro ao obter QR Code:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/instances/:id - Atualizar instância
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, webhookUrl, settings } = req.body;

    const db = getDatabase();

    // Verificar se a instância existe
    const instance = await db.get('SELECT * FROM instances WHERE id = ?', [id]);
    if (!instance) {
      return res.status(404).json({ error: 'Instância não encontrada' });
    }

    // Atualizar campos
    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }

    if (webhookUrl !== undefined) {
      updates.push('webhook_url = ?');
      params.push(webhookUrl);
    }

    if (settings !== undefined) {
      updates.push('settings = ?');
      params.push(JSON.stringify(settings));
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    await db.run(
      `UPDATE instances SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // Buscar instância atualizada
    const updatedInstance = await db.get('SELECT * FROM instances WHERE id = ?', [id]);

    res.json(updatedInstance);

  } catch (error) {
    console.error('❌ Erro ao atualizar instância:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/instances/:id - Remover instância
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await req.waManager.deleteInstance(id);

    res.json({ message: 'Instância removida com sucesso' });

  } catch (error) {
    console.error('❌ Erro ao remover instância:', error);
    res.status(500).json({ error: error.message || 'Erro interno do servidor' });
  }
});

// GET /api/instances/:id/status - Status detalhado da instância
router.get('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const instance = await db.get('SELECT * FROM instances WHERE id = ?', [id]);
    if (!instance) {
      return res.status(404).json({ error: 'Instância não encontrada' });
    }

    // Verificar se está realmente conectada
    const manager = req.waManager.getManagerByProvider(instance.provider);
    const socket = manager.instances.get(id);
    const isConnected = socket && socket.user;

    // Estatísticas básicas
    const stats = await db.get(`
      SELECT 
        COUNT(DISTINCT t.id) as total_tickets,
        COUNT(DISTINCT CASE WHEN t.status = 'open' THEN t.id END) as open_tickets,
        COUNT(m.id) as total_messages,
        COUNT(CASE WHEN m.from_me = 1 THEN m.id END) as sent_messages,
        COUNT(CASE WHEN m.from_me = 0 THEN m.id END) as received_messages
      FROM instances i
      LEFT JOIN tickets t ON t.instance_id = i.id
      LEFT JOIN messages m ON m.instance_id = i.id
      WHERE i.id = ?
    `, [id]);

    res.json({
      ...instance,
      isConnected,
      stats
    });

  } catch (error) {
    console.error('❌ Erro ao obter status da instância:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;