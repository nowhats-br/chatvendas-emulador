import express from 'express';
import { getDatabase } from '../database/init.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// GET /api/templates - Listar templates
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, type, category, search } = req.query;
    const offset = (page - 1) * limit;
    const db = getDatabase();

    let query = 'SELECT * FROM message_templates';
    const params = [];
    const conditions = [];

    if (type) {
      conditions.push('type = ?');
      params.push(type);
    }

    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }

    if (search) {
      conditions.push('(name LIKE ? OR description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    conditions.push('is_active = 1');

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY usage_count DESC, created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const templates = await db.all(query, params);

    // Processar variáveis JSON
    const processedTemplates = templates.map(template => ({
      ...template,
      variables: template.variables ? JSON.parse(template.variables) : []
    }));

    res.json({ data: processedTemplates });

  } catch (error) {
    console.error('❌ Erro ao listar templates:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/templates - Criar template
router.post('/', async (req, res) => {
  try {
    const { name, description, type, category, content, variables = [] } = req.body;

    if (!name || !type || !content) {
      return res.status(400).json({ error: 'Nome, tipo e conteúdo são obrigatórios' });
    }

    const db = getDatabase();
    const templateId = uuidv4();

    await db.run(`
      INSERT INTO message_templates (id, name, description, type, category, content, variables)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [templateId, name, description, type, category, content, JSON.stringify(variables)]);

    const newTemplate = await db.get('SELECT * FROM message_templates WHERE id = ?', [templateId]);
    res.status(201).json(newTemplate);

  } catch (error) {
    console.error('❌ Erro ao criar template:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/templates/quick-replies - Listar respostas rápidas
router.get('/quick-replies', async (req, res) => {
  try {
    const db = getDatabase();
    const quickReplies = await db.all(`
      SELECT * FROM quick_replies 
      WHERE is_active = 1 
      ORDER BY usage_count DESC, created_at DESC
    `);

    res.json({ data: quickReplies });

  } catch (error) {
    console.error('❌ Erro ao listar respostas rápidas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/templates/quick-replies - Criar resposta rápida
router.post('/quick-replies', async (req, res) => {
  try {
    const { shortcut, title, content } = req.body;

    if (!shortcut || !title || !content) {
      return res.status(400).json({ error: 'Atalho, título e conteúdo são obrigatórios' });
    }

    const db = getDatabase();
    const quickReplyId = uuidv4();

    await db.run(`
      INSERT INTO quick_replies (id, shortcut, title, content)
      VALUES (?, ?, ?, ?)
    `, [quickReplyId, shortcut, title, content]);

    const newQuickReply = await db.get('SELECT * FROM quick_replies WHERE id = ?', [quickReplyId]);
    res.status(201).json(newQuickReply);

  } catch (error) {
    console.error('❌ Erro ao criar resposta rápida:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;