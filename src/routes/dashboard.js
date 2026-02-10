import express from 'express';
import { getDatabase } from '../database/init.js';

const router = express.Router();

/**
 * GET /api/dashboard/stats
 * Retorna estatísticas principais do dashboard
 */
router.get('/stats', async (req, res) => {
  try {
    const db = getDatabase();

    // Receita total (soma de todos os pedidos concluídos)
    const revenueResult = await db.get(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN DATE(created_at) = DATE('now') THEN total_amount ELSE 0 END), 0) as today_revenue
      FROM orders 
      WHERE status = 'completed'
    `);

    // Atendimentos (tickets)
    const ticketsResult = await db.get(`
      SELECT 
        COUNT(*) as total_tickets,
        COUNT(CASE WHEN status IN ('open', 'pending') THEN 1 END) as active_tickets,
        COUNT(CASE WHEN DATE(created_at) = DATE('now') THEN 1 END) as today_tickets
      FROM messages
    `);

    // Pedidos
    const ordersResult = await db.get(`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN DATE(created_at) = DATE('now') THEN 1 END) as today_orders
      FROM orders
    `);

    // Contatos/Clientes
    const contactsResult = await db.get(`
      SELECT 
        COUNT(*) as total_contacts,
        COUNT(CASE WHEN DATE(created_at) = DATE('now') THEN 1 END) as today_contacts
      FROM contacts
    `);

    // Calcular tendências (comparar com período anterior)
    const yesterdayRevenue = await db.get(`
      SELECT COALESCE(SUM(total_amount), 0) as yesterday_revenue
      FROM orders 
      WHERE status = 'completed' AND DATE(created_at) = DATE('now', '-1 day')
    `);

    const yesterdayTickets = await db.get(`
      SELECT COUNT(*) as yesterday_tickets
      FROM messages
      WHERE DATE(created_at) = DATE('now', '-1 day')
    `);

    const yesterdayOrders = await db.get(`
      SELECT COUNT(*) as yesterday_orders
      FROM orders
      WHERE DATE(created_at) = DATE('now', '-1 day')
    `);

    const yesterdayContacts = await db.get(`
      SELECT COUNT(*) as yesterday_contacts
      FROM contacts
      WHERE DATE(created_at) = DATE('now', '-1 day')
    `);

    // Calcular percentuais de crescimento
    const calculateTrend = (today, yesterday) => {
      if (yesterday === 0) return today > 0 ? 100 : 0;
      return ((today - yesterday) / yesterday * 100).toFixed(1);
    };

    const stats = {
      revenue: {
        total: revenueResult.total_revenue,
        today: revenueResult.today_revenue,
        trend: calculateTrend(revenueResult.today_revenue, yesterdayRevenue.yesterday_revenue),
        trendDirection: revenueResult.today_revenue >= yesterdayRevenue.yesterday_revenue ? 'up' : 'down'
      },
      tickets: {
        total: ticketsResult.total_tickets,
        active: ticketsResult.active_tickets,
        today: ticketsResult.today_tickets,
        trend: calculateTrend(ticketsResult.today_tickets, yesterdayTickets.yesterday_tickets),
        trendDirection: ticketsResult.today_tickets >= yesterdayTickets.yesterday_tickets ? 'up' : 'down'
      },
      orders: {
        total: ordersResult.total_orders,
        pending: ordersResult.pending_orders,
        today: ordersResult.today_orders,
        trend: calculateTrend(ordersResult.today_orders, yesterdayOrders.yesterday_orders),
        trendDirection: ordersResult.today_orders >= yesterdayOrders.yesterday_orders ? 'up' : 'down'
      },
      contacts: {
        total: contactsResult.total_contacts,
        today: contactsResult.today_contacts,
        trend: calculateTrend(contactsResult.today_contacts, yesterdayContacts.yesterday_contacts),
        trendDirection: contactsResult.today_contacts >= yesterdayContacts.yesterday_contacts ? 'up' : 'down'
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas do dashboard:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/dashboard/charts/weekly
 * Retorna dados para o gráfico semanal
 */
router.get('/charts/weekly', async (req, res) => {
  try {
    const db = getDatabase();

    // Dados dos últimos 7 dias
    const weeklyData = await db.all(`
      SELECT 
        DATE(created_at) as date,
        COUNT(CASE WHEN EXISTS(SELECT 1 FROM orders WHERE orders.contact_id = messages.contact_id) THEN 1 END) as sales,
        COUNT(*) as tickets
      FROM messages
      WHERE DATE(created_at) >= DATE('now', '-7 days')
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    // Preencher dias faltantes com zero
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayData = weeklyData.find(d => d.date === dateStr);
      last7Days.push({
        date: dateStr,
        dayName: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
        sales: dayData ? dayData.sales : 0,
        tickets: dayData ? dayData.tickets : 0
      });
    }

    res.json(last7Days);
  } catch (error) {
    console.error('Erro ao buscar dados semanais:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/dashboard/charts/categories
 * Retorna dados para o gráfico de categorias
 */
router.get('/charts/categories', async (req, res) => {
  try {
    const db = getDatabase();

    // Usar dados disponíveis no sistema
    const categoryData = await db.all(`
      SELECT 
        'Campanhas' as category,
        COUNT(*) as quantity,
        0 as revenue
      FROM campaigns
      WHERE status = 'completed'
      UNION ALL
      SELECT 
        'Atendimentos' as category,
        COUNT(*) as quantity,
        0 as revenue
      FROM messages
      UNION ALL
      SELECT 
        'Contatos' as category,
        COUNT(*) as quantity,
        0 as revenue
      FROM contacts
      UNION ALL
      SELECT 
        'Pedidos' as category,
        COUNT(*) as quantity,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM orders
      WHERE status = 'completed'
    `);

    res.json(categoryData.filter(d => d.quantity > 0));
  } catch (error) {
    console.error('Erro ao buscar dados de categorias:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/dashboard/recent-orders
 * Retorna pedidos recentes
 */
router.get('/recent-orders', async (req, res) => {
  try {
    const db = getDatabase();
    const limit = parseInt(req.query.limit) || 5;

    const recentOrders = await db.all(`
      SELECT 
        o.id,
        o.status,
        o.total_amount,
        o.created_at,
        c.name as customer_name,
        c.phone as customer_phone
      FROM orders o
      LEFT JOIN contacts c ON o.contact_id = c.id
      ORDER BY o.created_at DESC
      LIMIT ?
    `, [limit]);

    // Se não houver pedidos, usar dados de mensagens como fallback
    if (recentOrders.length === 0) {
      const recentMessages = await db.all(`
        SELECT 
          'MSG-' || substr(id, 1, 8) as id,
          'completed' as status,
          0 as total_amount,
          created_at,
          'Cliente' as customer_name,
          contact_id as customer_phone
        FROM messages 
        ORDER BY created_at DESC
        LIMIT ?
      `, [limit]);

      res.json(recentMessages);
    } else {
      res.json(recentOrders);
    }
  } catch (error) {
    console.error('Erro ao buscar pedidos recentes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/dashboard/instances-status
 * Retorna status das instâncias WhatsApp
 */
router.get('/instances-status', async (req, res) => {
  try {
    const db = getDatabase();

    const instances = await db.all(`
      SELECT 
        id,
        name,
        phone_number,
        status,
        last_seen,
        provider
      FROM instances
      ORDER BY created_at DESC
    `);

    const summary = {
      total: instances.length,
      connected: instances.filter(i => i.status === 'connected').length,
      disconnected: instances.filter(i => i.status === 'disconnected').length,
      scanning: instances.filter(i => i.status === 'scanning' || i.status === 'qr_ready').length
    };

    res.json({
      summary,
      instances
    });
  } catch (error) {
    console.error('Erro ao buscar status das instâncias:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;