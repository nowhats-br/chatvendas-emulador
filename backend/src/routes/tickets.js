import express from 'express';
import { getDatabase } from '../database/init.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// GET /api/tickets - Listar tickets
router.get('/', async (req, res) => {
  try {
    const {
      status,
      department,
      priority,
      assigned_to,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const offset = (page - 1) * limit;
    const db = getDatabase();

    let query = `
      SELECT 
        t.*,
        c.name as contact_name,
        c.phone as contact_phone,
        c.profile_picture as contact_avatar,
        c.whatsapp_id as contact_whatsapp_id,
        c.stage as contact_stage,
        c.total_spent as contact_total_spent,
        c.tags as contact_tags,
        c.last_seen as contact_last_seen,
        i.name as instance_name,
        i.provider as instance_provider,
        (
          SELECT COUNT(*) 
          FROM messages m 
          WHERE m.ticket_id = t.id AND m.from_me = 0 AND m.status != 'read'
        ) as unread_count,
        (
          SELECT m.content 
          FROM messages m 
          WHERE m.ticket_id = t.id 
          ORDER BY m.timestamp DESC 
          LIMIT 1
        ) as last_message,
        (
          SELECT m.timestamp 
          FROM messages m 
          WHERE m.ticket_id = t.id 
          ORDER BY m.timestamp DESC 
          LIMIT 1
        ) as last_message_time,
        (
          SELECT m.from_me 
          FROM messages m 
          WHERE m.ticket_id = t.id 
          ORDER BY m.timestamp DESC 
          LIMIT 1
        ) as last_message_from_me
      FROM tickets t
      JOIN contacts c ON c.id = t.contact_id
      JOIN instances i ON i.id = t.instance_id
      WHERE 1=1
    `;

    const params = [];

    // Filtros
    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }

    if (department) {
      query += ' AND t.department = ?';
      params.push(department);
    }

    if (priority) {
      query += ' AND t.priority = ?';
      params.push(priority);
    }

    if (assigned_to) {
      query += ' AND t.assigned_to = ?';
      params.push(assigned_to);
    }

    if (search) {
      query += ' AND (c.name LIKE ? OR c.phone LIKE ? OR t.subject LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Ordenação: tickets com mensagens não lidas primeiro, depois por última atividade
    query += `
      ORDER BY 
        CASE WHEN t.status = 'pending' THEN 0 ELSE 1 END,
        unread_count DESC,
        COALESCE(last_message_time, t.updated_at) DESC
      LIMIT ? OFFSET ?
    `;
    params.push(parseInt(limit), offset);

    const tickets = await db.all(query, params);

    // Processar tags JSON
    const processedTickets = tickets.map(ticket => ({
      ...ticket,
      tags: ticket.tags ? JSON.parse(ticket.tags) : []
    }));

    // Contar total para paginação
    let countQuery = `
      SELECT COUNT(*) as total
      FROM tickets t
      JOIN contacts c ON c.id = t.contact_id
      JOIN instances i ON i.id = t.instance_id
      WHERE 1=1
    `;

    const countParams = [];
    if (status) {
      countQuery += ' AND t.status = ?';
      countParams.push(status);
    }
    if (department) {
      countQuery += ' AND t.department = ?';
      countParams.push(department);
    }
    if (priority) {
      countQuery += ' AND t.priority = ?';
      countParams.push(priority);
    }
    if (assigned_to) {
      countQuery += ' AND t.assigned_to = ?';
      countParams.push(assigned_to);
    }
    if (search) {
      countQuery += ' AND (c.name LIKE ? OR c.phone LIKE ? OR t.subject LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const { total } = await db.get(countQuery, countParams);

    res.json({
      data: processedTickets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Erro ao listar tickets:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/tickets/:id - Buscar ticket por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const ticket = await db.get(`
      SELECT 
        t.*,
        c.name as contact_name,
        c.phone as contact_phone,
        c.profile_picture as contact_avatar,
        c.whatsapp_id as contact_whatsapp_id,
        c.email as contact_email,
        c.notes as contact_notes,
        c.last_seen as contact_last_seen,
        i.name as instance_name,
        i.provider as instance_provider,
        (
          SELECT COUNT(*) 
          FROM messages m 
          WHERE m.ticket_id = t.id AND m.from_me = 0 AND m.status != 'read'
        ) as unread_count
      FROM tickets t
      JOIN contacts c ON c.id = t.contact_id
      JOIN instances i ON i.id = t.instance_id
      WHERE t.id = ?
    `, [id]);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }

    // Processar tags JSON
    ticket.tags = ticket.tags ? JSON.parse(ticket.tags) : [];

    res.json(ticket);

  } catch (error) {
    console.error('❌ Erro ao buscar ticket:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/tickets - Criar novo ticket
router.post('/', async (req, res) => {
  try {
    const {
      contact_id,
      instance_id,
      subject,
      priority = 'normal',
      department,
      assigned_to,
      tags = []
    } = req.body;

    if (!contact_id || !instance_id) {
      return res.status(400).json({
        error: 'contact_id e instance_id são obrigatórios'
      });
    }

    const db = getDatabase();

    // Verificar se contato e instância existem
    const contact = await db.get('SELECT * FROM contacts WHERE id = ?', [contact_id]);
    if (!contact) {
      return res.status(404).json({ error: 'Contato não encontrado' });
    }

    const instance = await db.get('SELECT * FROM instances WHERE id = ?', [instance_id]);
    if (!instance) {
      return res.status(404).json({ error: 'Instância não encontrada' });
    }

    // Verificar se já existe um ticket aberto/pendente para este contato nesta instância
    const activeTicket = await db.get(`
      SELECT * FROM tickets 
      WHERE contact_id = ? AND instance_id = ? AND status != 'closed'
      LIMIT 1
    `, [contact_id, instance_id]);

    if (activeTicket) {
      console.log(`ℹ️ POST /tickets: Já existe um ticket ativo (${activeTicket.id}). Retornando o existente.`);

      const ticket = await db.get(`
        SELECT 
          t.*,
          c.name as contact_name,
          c.phone as contact_phone,
          c.profile_picture as contact_avatar,
          c.last_seen as contact_last_seen,
          i.name as instance_name,
          i.provider as instance_provider
        FROM tickets t
        JOIN contacts c ON c.id = t.contact_id
        JOIN instances i ON i.id = t.instance_id
        WHERE t.id = ?
      `, [activeTicket.id]);

      ticket.tags = ticket.tags ? JSON.parse(ticket.tags) : [];
      return res.json(ticket);
    }

    const ticketId = uuidv4();
    const now = new Date().toISOString();

    await db.run(`
      INSERT INTO tickets (
        id, contact_id, instance_id, status, subject, priority,
        department, assigned_to, tags, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      ticketId, contact_id, instance_id, 'open', subject, priority,
      department, assigned_to, JSON.stringify(tags), now, now
    ]);

    const newTicket = await db.get(`
      SELECT 
        t.*,
        c.name as contact_name,
        c.phone as contact_phone,
        c.profile_picture as contact_avatar,
        c.last_seen as contact_last_seen,
        i.name as instance_name,
        i.provider as instance_provider
      FROM tickets t
      JOIN contacts c ON c.id = t.contact_id
      JOIN instances i ON i.id = t.instance_id
      WHERE t.id = ?
    `, [ticketId]);

    // Processar tags JSON
    newTicket.tags = newTicket.tags ? JSON.parse(newTicket.tags) : [];

    // Notificar via WebSocket
    req.wsManager.broadcast('ticket_created', newTicket);

    res.status(201).json(newTicket);

  } catch (error) {
    console.error('❌ Erro ao criar ticket:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/tickets/:id - Atualizar ticket
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      subject,
      priority,
      department,
      assigned_to,
      tags,
      status
    } = req.body;

    const db = getDatabase();

    // Verificar se ticket existe
    const existingTicket = await db.get('SELECT * FROM tickets WHERE id = ?', [id]);
    if (!existingTicket) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }

    const updates = [];
    const params = [];

    if (subject !== undefined) {
      updates.push('subject = ?');
      params.push(subject);
    }

    if (priority !== undefined) {
      updates.push('priority = ?');
      params.push(priority);
    }

    if (department !== undefined) {
      updates.push('department = ?');
      params.push(department);
    }

    if (assigned_to !== undefined) {
      updates.push('assigned_to = ?');
      params.push(assigned_to);
    }

    if (tags !== undefined) {
      updates.push('tags = ?');
      params.push(JSON.stringify(tags));
    }

    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);

      // Se fechando o ticket, definir closed_at
      if (status === 'closed') {
        updates.push('closed_at = ?');
        params.push(new Date().toISOString());
      } else if (existingTicket.status === 'closed' && status !== 'closed') {
        // Se reabrindo o ticket, limpar closed_at
        updates.push('closed_at = NULL');

        // Verificar duplicidade ao reabrir
        const otherActiveTicket = await db.get(`
          SELECT * FROM tickets 
          WHERE contact_id = ? AND instance_id = ? AND status != 'closed' AND id != ?
          LIMIT 1
        `, [existingTicket.contact_id, existingTicket.instance_id, id]);

        if (otherActiveTicket) {
          console.log(`🔄 PUT /tickets/:id: Mesclando ticket ${id} no ticket ativo ${otherActiveTicket.id}`);

          // Mover mensagens
          await db.run('UPDATE messages SET ticket_id = ? WHERE ticket_id = ?', [otherActiveTicket.id, id]);

          // Mover pedidos
          await db.run('UPDATE orders SET ticket_id = ? WHERE ticket_id = ?', [otherActiveTicket.id, id]);

          // Notificar que o ticket antigo foi deletado/mesclado
          req.wsManager.broadcast('ticket_deleted', { ticketId: id, mergedInto: otherActiveTicket.id });

          // Deletar o ticket antigo
          await db.run('DELETE FROM tickets WHERE id = ?', [id]);

          // Buscar o ticket ativo atualizado para retornar
          const finalTicket = await db.get(`
            SELECT 
              t.*,
              c.name as contact_name,
              c.phone as contact_phone,
              c.profile_picture as contact_avatar,
              c.last_seen as contact_last_seen,
              i.name as instance_name,
              i.provider as instance_provider
            FROM tickets t
            JOIN contacts c ON c.id = t.contact_id
            JOIN instances i ON i.id = t.instance_id
            WHERE t.id = ?
          `, [otherActiveTicket.id]);

          if (finalTicket) {
            finalTicket.tags = finalTicket.tags ? JSON.parse(finalTicket.tags) : [];
          }

          return res.json(finalTicket);
        }
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    updates.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(id);

    await db.run(`
      UPDATE tickets SET ${updates.join(', ')} WHERE id = ?
    `, params);

    const updatedTicket = await db.get(`
      SELECT 
        t.*,
        c.name as contact_name,
        c.phone as contact_phone,
        c.profile_picture as contact_avatar,
        c.last_seen as contact_last_seen,
        i.name as instance_name,
        i.provider as instance_provider
      FROM tickets t
      JOIN contacts c ON c.id = t.contact_id
      JOIN instances i ON i.id = t.instance_id
      WHERE t.id = ?
    `, [id]);

    // Processar tags JSON
    updatedTicket.tags = updatedTicket.tags ? JSON.parse(updatedTicket.tags) : [];

    // Notificar via WebSocket
    req.wsManager.broadcast('ticket_updated', updatedTicket);

    res.json(updatedTicket);

  } catch (error) {
    console.error('❌ Erro ao atualizar ticket:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/tickets/:id/status - Atualizar apenas status do ticket
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['open', 'pending', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    const db = getDatabase();

    // Verificar se ticket existe
    const existingTicket = await db.get('SELECT * FROM tickets WHERE id = ?', [id]);
    if (!existingTicket) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }

    const updates = ['status = ?', 'updated_at = ?'];
    const params = [status, new Date().toISOString()];

    // Se fechando o ticket, definir closed_at
    if (status === 'closed') {
      updates.push('closed_at = ?');
      params.push(new Date().toISOString());
    } else if (existingTicket.status === 'closed' && status !== 'closed') {
      // Se reabrindo o ticket, limpar closed_at
      updates.push('closed_at = NULL');

      // Verificar duplicidade ao reabrir
      const otherActiveTicket = await db.get(`
        SELECT * FROM tickets 
        WHERE contact_id = ? AND instance_id = ? AND status != 'closed' AND id != ?
        LIMIT 1
      `, [existingTicket.contact_id, existingTicket.instance_id, id]);

      if (otherActiveTicket) {
        console.log(`🔄 Mesclando ticket ${id} no ticket ativo ${otherActiveTicket.id}`);

        // Mover mensagens
        await db.run('UPDATE messages SET ticket_id = ? WHERE ticket_id = ?', [otherActiveTicket.id, id]);

        // Mover pedidos
        await db.run('UPDATE orders SET ticket_id = ? WHERE ticket_id = ?', [otherActiveTicket.id, id]);

        // Notificar que o ticket antigo foi deletado/mesclado
        req.wsManager.broadcast('ticket_deleted', { ticketId: id, mergedInto: otherActiveTicket.id });

        // Deletar o ticket antigo
        await db.run('DELETE FROM tickets WHERE id = ?', [id]);

        // Buscar o ticket ativo atualizado para retornar
        const finalTicket = await db.get(`
          SELECT 
            t.*,
            c.name as contact_name,
            c.phone as contact_phone,
            c.profile_picture as contact_avatar,
            c.last_seen as contact_last_seen,
            i.name as instance_name,
            i.provider as instance_provider
          FROM tickets t
          JOIN contacts c ON c.id = t.contact_id
          JOIN instances i ON i.id = t.instance_id
          WHERE t.id = ?
        `, [otherActiveTicket.id]);

        if (finalTicket) {
          finalTicket.tags = finalTicket.tags ? JSON.parse(finalTicket.tags) : [];
        }

        return res.json(finalTicket);
      }
    }

    params.push(id);

    await db.run(`
      UPDATE tickets SET ${updates.join(', ')} WHERE id = ?
    `, params);

    const updatedTicket = await db.get(`
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
    `, [id]);

    // Processar tags JSON
    updatedTicket.tags = updatedTicket.tags ? JSON.parse(updatedTicket.tags) : [];

    // Notificar via WebSocket
    req.wsManager.broadcast('ticket_status_updated', {
      ticketId: id,
      status,
      ticket: updatedTicket
    });

    res.json(updatedTicket);

  } catch (error) {
    console.error('❌ Erro ao atualizar status do ticket:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/tickets/:id - Remover ticket
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    // Verificar se ticket existe
    const ticket = await db.get('SELECT * FROM tickets WHERE id = ?', [id]);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }

    // Remover mensagens associadas primeiro
    await db.run('DELETE FROM messages WHERE ticket_id = ?', [id]);

    // Remover ticket
    await db.run('DELETE FROM tickets WHERE id = ?', [id]);

    // Notificar via WebSocket
    req.wsManager.broadcast('ticket_deleted', { ticketId: id });

    res.json({ message: 'Ticket removido com sucesso' });

  } catch (error) {
    console.error('❌ Erro ao remover ticket:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/tickets/stats - Estatísticas dos tickets
router.get('/stats', async (req, res) => {
  try {
    const { department, assigned_to, dateFrom, dateTo } = req.query;
    const db = getDatabase();

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (department) {
      whereClause += ' AND t.department = ?';
      params.push(department);
    }

    if (assigned_to) {
      whereClause += ' AND t.assigned_to = ?';
      params.push(assigned_to);
    }

    if (dateFrom) {
      whereClause += ' AND t.created_at >= ?';
      params.push(dateFrom);
    }

    if (dateTo) {
      whereClause += ' AND t.created_at <= ?';
      params.push(dateTo + ' 23:59:59');
    }

    // Estatísticas por status
    const statusStats = await db.all(`
      SELECT 
        t.status,
        COUNT(*) as count
      FROM tickets t
      ${whereClause}
      GROUP BY t.status
    `, params);

    // Estatísticas por prioridade
    const priorityStats = await db.all(`
      SELECT 
        t.priority,
        COUNT(*) as count
      FROM tickets t
      ${whereClause}
      GROUP BY t.priority
    `, params);

    // Estatísticas por departamento
    const departmentStats = await db.all(`
      SELECT 
        t.department,
        COUNT(*) as count
      FROM tickets t
      ${whereClause}
      AND t.department IS NOT NULL
      GROUP BY t.department
    `, params);

    // Tempo médio de resolução (em horas)
    const { avgResolutionTime } = await db.get(`
      SELECT 
        AVG(
          (julianday(t.closed_at) - julianday(t.created_at)) * 24
        ) as avgResolutionTime
      FROM tickets t
      ${whereClause}
      AND t.status = 'closed'
      AND t.closed_at IS NOT NULL
    `, params) || { avgResolutionTime: 0 };

    res.json({
      statusStats,
      priorityStats,
      departmentStats,
      avgResolutionTime: Math.round(avgResolutionTime || 0)
    });

  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas dos tickets:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
