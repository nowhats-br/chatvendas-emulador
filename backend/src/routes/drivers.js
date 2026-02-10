import express from 'express';
import { getDatabase } from '../database/init.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// GET /api/drivers - Listar entregadores
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (page - 1) * limit;
    const db = getDatabase();

    let query = 'SELECT * FROM drivers';
    const params = [];
    const conditions = [];

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (search) {
      conditions.push('(name LIKE ? OR phone LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const drivers = await db.all(query, params);
    res.json({ data: drivers });

  } catch (error) {
    console.error('❌ Erro ao listar entregadores:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/drivers - Criar entregador
router.post('/', async (req, res) => {
  try {
    const { name, phone, vehicleType, vehiclePlate } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
    }

    const db = getDatabase();
    const driverId = uuidv4();

    await db.run(`
      INSERT INTO drivers (id, name, phone, vehicle_type, vehicle_plate, status)
      VALUES (?, ?, ?, ?, ?, 'inactive')
    `, [driverId, name, phone, vehicleType, vehiclePlate]);

    const newDriver = await db.get('SELECT * FROM drivers WHERE id = ?', [driverId]);
    res.status(201).json(newDriver);

  } catch (error) {
    console.error('❌ Erro ao criar entregador:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/drivers/:id/status - Atualizar status do entregador
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['active', 'inactive', 'busy', 'offline'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    const db = getDatabase();
    await db.run('UPDATE drivers SET status = ? WHERE id = ?', [status, id]);

    const updatedDriver = await db.get('SELECT * FROM drivers WHERE id = ?', [id]);
    res.json(updatedDriver);

  } catch (error) {
    console.error('❌ Erro ao atualizar status do entregador:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;