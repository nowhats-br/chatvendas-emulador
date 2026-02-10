import express from 'express';
import { getDatabase } from '../database/init.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// GET /api/products - Listar produtos
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, categoryId, isActive } = req.query;
    const offset = (page - 1) * limit;
    const db = getDatabase();

    let query = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM products p';
    const params = [];
    const conditions = [];

    if (search) {
      conditions.push('(p.name LIKE ? OR p.description LIKE ? OR p.sku LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (categoryId) {
      conditions.push('p.category_id = ?');
      params.push(categoryId);
    }

    if (isActive !== undefined) {
      conditions.push('p.is_active = ?');
      params.push(isActive === 'true' ? 1 : 0);
    }

    if (conditions.length > 0) {
      const whereClause = ' WHERE ' + conditions.join(' AND ');
      query += whereClause;
      countQuery += whereClause;
    }

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const products = await db.all(query, params);
    const { total } = await db.get(countQuery, params.slice(0, -2));

    // Processar dados JSON
    const processedProducts = products.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      dimensions: product.dimensions ? JSON.parse(product.dimensions) : null,
      tags: product.tags ? JSON.parse(product.tags) : []
    }));

    res.json({
      data: processedProducts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Erro ao listar produtos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/products - Criar produto
router.post('/', async (req, res) => {
  try {
    const {
      name, description, sku, price, categoryId, stockQuantity = 0,
      images = [], isActive = true, weight, dimensions, tags = []
    } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
    }

    const db = getDatabase();
    const productId = uuidv4();

    await db.run(`
      INSERT INTO products (
        id, name, description, sku, price, category_id, stock_quantity,
        images, is_active, weight, dimensions, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      productId, name, description, sku, price, categoryId, stockQuantity,
      JSON.stringify(images), isActive, weight, JSON.stringify(dimensions), JSON.stringify(tags)
    ]);

    const newProduct = await db.get('SELECT * FROM products WHERE id = ?', [productId]);
    res.status(201).json(newProduct);

  } catch (error) {
    console.error('❌ Erro ao criar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/products/categories - Listar categorias
router.get('/categories', async (req, res) => {
  try {
    const db = getDatabase();
    const categories = await db.all('SELECT * FROM categories ORDER BY name');
    res.json(categories);
  } catch (error) {
    console.error('❌ Erro ao listar categorias:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;