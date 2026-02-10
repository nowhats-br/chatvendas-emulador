import express from 'express';
import { getDatabase } from '../database/init.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// GET /api/orders - Listar pedidos
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, contactId, dateFrom, dateTo } = req.query;
    const offset = (page - 1) * limit;
    const db = getDatabase();

    let query = `
      SELECT o.*, c.name as contact_name, c.phone as contact_phone
      FROM orders o
      JOIN contacts c ON c.id = o.contact_id
    `;
    const params = [];
    const conditions = [];

    if (status) {
      conditions.push('o.status = ?');
      params.push(status);
    }

    if (contactId) {
      conditions.push('o.contact_id = ?');
      params.push(contactId);
    }

    if (dateFrom) {
      conditions.push('o.created_at >= ?');
      params.push(dateFrom);
    }

    if (dateTo) {
      conditions.push('o.created_at <= ?');
      params.push(dateTo);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const orders = await db.all(query, params);

    // Buscar itens para cada pedido
    for (const order of orders) {
      const items = await db.all(`
        SELECT oi.*, p.name as product_name
        FROM order_items oi
        LEFT JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = ?
      `, [order.id]);
      order.items = items;
    }

    res.json({ data: orders });

  } catch (error) {
    console.error('❌ Erro ao listar pedidos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/orders - Criar pedido
router.post('/', async (req, res) => {
  try {
    const { contactId, items, deliveryType = 'pickup', notes } = req.body;

    if (!contactId || !items || items.length === 0) {
      return res.status(400).json({ error: 'Contact ID e itens são obrigatórios' });
    }

    const db = getDatabase();
    const orderId = uuidv4();
    const orderNumber = `PED-${Date.now()}`;

    // Calcular totais
    let subtotal = 0;
    for (const item of items) {
      subtotal += item.unitPrice * item.quantity;
    }

    await db.run(`
      INSERT INTO orders (
        id, order_number, contact_id, status, subtotal, total_amount,
        delivery_type, notes
      ) VALUES (?, ?, ?, 'pending', ?, ?, ?, ?)
    `, [orderId, orderNumber, contactId, subtotal, subtotal, deliveryType, notes]);

    // Inserir itens
    for (const item of items) {
      await db.run(`
        INSERT INTO order_items (
          id, order_id, product_id, product_name, unit_price, quantity, total_price
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        uuidv4(), orderId, item.productId, item.productName,
        item.unitPrice, item.quantity, item.unitPrice * item.quantity
      ]);
    }

    const newOrder = await db.get('SELECT * FROM orders WHERE id = ?', [orderId]);
    res.status(201).json(newOrder);

  } catch (error) {
    console.error('❌ Erro ao criar pedido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/orders/:id/status - Atualizar status do pedido
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    const db = getDatabase();
    await db.run('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

    const updatedOrder = await db.get('SELECT * FROM orders WHERE id = ?', [id]);
    
    // Notificar via WebSocket
    req.wsManager.broadcast('order_status_updated', { orderId: id, status });

    res.json(updatedOrder);

  } catch (error) {
    console.error('❌ Erro ao atualizar status do pedido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;