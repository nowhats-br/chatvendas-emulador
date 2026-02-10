import express from 'express';
import { getDatabase } from '../database/init.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// GET /api/contacts - Listar contatos
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, stage, search } = req.query;
    const offset = (page - 1) * limit;
    const db = getDatabase();

    let query = 'SELECT * FROM contacts';
    const params = [];
    const conditions = [];

    if (stage) {
      conditions.push('stage = ?');
      params.push(stage);
    }

    if (search) {
      conditions.push('(name LIKE ? OR phone LIKE ? OR email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const contacts = await db.all(query, params);

    // Processar tags JSON
    const processedContacts = contacts.map(contact => ({
      ...contact,
      tags: contact.tags ? JSON.parse(contact.tags) : []
    }));

    const countQuery = conditions.length > 0
      ? 'SELECT COUNT(*) as total FROM contacts WHERE ' + conditions.join(' AND ')
      : 'SELECT COUNT(*) as total FROM contacts';

    const countResult = await db.get(countQuery, params.slice(0, -2));
    const total = countResult ? countResult.total : 0;

    res.json({
      data: processedContacts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Erro ao listar contatos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/contacts/:id - Buscar contato por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const contact = await db.get('SELECT * FROM contacts WHERE id = ?', [id]);

    if (!contact) {
      return res.status(404).json({ error: 'Contato não encontrado' });
    }

    contact.tags = contact.tags ? JSON.parse(contact.tags) : [];

    res.json(contact);

  } catch (error) {
    console.error('❌ Erro ao buscar contato:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/contacts - Criar contato
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, stage, tags, notes } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
    }

    const db = getDatabase();
    const contactId = uuidv4();

    await db.run(`
      INSERT INTO contacts (id, name, phone, email, stage, tags, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      contactId,
      name,
      phone.replace(/\D/g, ''),
      email,
      stage || null,
      JSON.stringify(tags || []),
      notes
    ]);

    const newContact = await db.get('SELECT * FROM contacts WHERE id = ?', [contactId]);
    newContact.tags = JSON.parse(newContact.tags);

    // Notificar via WebSocket se estiver disponível
    if (req.wsManager) {
      req.wsManager.broadcast('contact_created', newContact);
    }

    res.status(201).json(newContact);

  } catch (error) {
    console.error('❌ Erro ao criar contato:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Telefone já cadastrado' });
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/contacts/:id - Atualizar contato
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, stage, tags, notes, profile_picture } = req.body;

    const db = getDatabase();
    const existingContact = await db.get('SELECT * FROM contacts WHERE id = ?', [id]);

    if (!existingContact) {
      return res.status(404).json({ error: 'Contato não encontrado' });
    }

    const updates = [];
    const params = [];

    if (name) { updates.push('name = ?'); params.push(name); }
    if (phone) { updates.push('phone = ?'); params.push(phone.replace(/\D/g, '')); }
    if (email !== undefined) { updates.push('email = ?'); params.push(email); }
    if (stage !== undefined) { updates.push('stage = ?'); params.push(stage); }
    if (tags !== undefined) { updates.push('tags = ?'); params.push(JSON.stringify(tags)); }
    if (notes !== undefined) { updates.push('notes = ?'); params.push(notes); }
    if (profile_picture !== undefined) { updates.push('profile_picture = ?'); params.push(profile_picture); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    await db.run(`UPDATE contacts SET ${updates.join(', ')} WHERE id = ?`, params);

    const updatedContact = await db.get('SELECT * FROM contacts WHERE id = ?', [id]);
    updatedContact.tags = JSON.parse(updatedContact.tags);

    // Notificar via WebSocket se estiver disponível
    if (req.wsManager) {
      req.wsManager.broadcast('contact_updated', updatedContact);
    }

    res.json(updatedContact);

  } catch (error) {
    console.error('❌ Erro ao atualizar contato:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/contacts/:id - Remover contato
router.delete('/:id', async (req, res) => {

  const { id } = req.params;
  const db = getDatabase();

  await db.run('BEGIN TRANSACTION');

  try {
    // Deletar dependências primeiro (Cascade manual)
    await db.run('DELETE FROM messages WHERE contact_id = ?', [id]);
    await db.run('DELETE FROM orders WHERE contact_id = ?', [id]);
    // campaigns_interactions e campaign_sends poderiam ser mantidos ou deletados, melhor deletar para limpar
    await db.run('DELETE FROM campaign_interactions WHERE contact_id = ?', [id]);
    await db.run('DELETE FROM campaign_sends WHERE contact_id = ?', [id]);
    await db.run('DELETE FROM tickets WHERE contact_id = ?', [id]);

    // Finalmente deletar o contato
    await db.run('DELETE FROM contacts WHERE id = ?', [id]);

    await db.run('COMMIT');

    // Notificar via WebSocket se estiver disponível
    if (req.wsManager) {
      req.wsManager.broadcast('contact_deleted', { id });
    }

    res.json({ message: 'Contato removido com sucesso' });

  } catch (error) {
    await db.run('ROLLBACK');
    console.error('❌ Erro ao remover contato (Rollback):', error);
    res.status(500).json({ error: 'Erro interno do servidor ao excluir contato' });
  }
});

export default router;