import express from 'express';
import { getDatabase } from '../database/init.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// GET /api/finance/transactions - Listar transações
router.get('/transactions', async (req, res) => {
  try {
    const { page = 1, limit = 20, type, category, dateFrom, dateTo } = req.query;
    const offset = (page - 1) * limit;
    const db = getDatabase();

    let query = 'SELECT * FROM transactions';
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

    if (dateFrom) {
      conditions.push('transaction_date >= ?');
      params.push(dateFrom);
    }

    if (dateTo) {
      conditions.push('transaction_date <= ?');
      params.push(dateTo);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY transaction_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const transactions = await db.all(query, params);
    res.json({ data: transactions });

  } catch (error) {
    console.error('❌ Erro ao listar transações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/finance/transactions - Criar transação
router.post('/transactions', async (req, res) => {
  try {
    const { type, category, amount, description, transactionDate } = req.body;

    if (!type || !category || !amount || !description) {
      return res.status(400).json({ error: 'Campos obrigatórios: type, category, amount, description' });
    }

    const db = getDatabase();
    const transactionId = uuidv4();

    await db.run(`
      INSERT INTO transactions (id, type, category, amount, description, transaction_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [transactionId, type, category, amount, description, transactionDate || new Date().toISOString().split('T')[0]]);

    const newTransaction = await db.get('SELECT * FROM transactions WHERE id = ?', [transactionId]);
    res.status(201).json(newTransaction);

  } catch (error) {
    console.error('❌ Erro ao criar transação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/finance/dashboard - Dashboard financeiro
router.get('/dashboard', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const db = getDatabase();

    let dateFilter = '';
    if (period === 'today') {
      dateFilter = "AND transaction_date = date('now')";
    } else if (period === 'week') {
      dateFilter = "AND transaction_date >= date('now', '-7 days')";
    } else if (period === 'month') {
      dateFilter = "AND transaction_date >= date('now', 'start of month')";
    } else if (period === 'year') {
      dateFilter = "AND transaction_date >= date('now', 'start of year')";
    }

    const summary = await db.get(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as net_profit
      FROM transactions
      WHERE status = 'completed' ${dateFilter}
    `);

    // Receitas por categoria
    const incomeByCategory = await db.all(`
      SELECT category, SUM(amount) as total
      FROM transactions
      WHERE type = 'income' AND status = 'completed' ${dateFilter}
      GROUP BY category
      ORDER BY total DESC
    `);

    // Despesas por categoria
    const expensesByCategory = await db.all(`
      SELECT category, SUM(amount) as total
      FROM transactions
      WHERE type = 'expense' AND status = 'completed' ${dateFilter}
      GROUP BY category
      ORDER BY total DESC
    `);

    res.json({
      summary,
      incomeByCategory,
      expensesByCategory
    });

  } catch (error) {
    console.error('❌ Erro ao obter dashboard financeiro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;