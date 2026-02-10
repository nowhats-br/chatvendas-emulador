import express from 'express';
import { getDatabase } from '../database/init.js';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

const router = express.Router();

// GET /api/reports/campaigns - Relatórios de campanhas
router.get('/campaigns', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      dateFrom,
      dateTo,
      campaignId,
      status,
      messageType,
      interactionType,
      keyword
    } = req.query;

    const offset = (page - 1) * limit;
    const db = getDatabase();

    let query = `
      SELECT 
        c.*,
        COALESCE(SUM(CASE WHEN ci.interaction_type = 'button_click' THEN 1 ELSE 0 END), 0) as button_clicks,
        COALESCE(SUM(CASE WHEN ci.interaction_type = 'list_selection' THEN 1 ELSE 0 END), 0) as list_selections,
        COALESCE(SUM(CASE WHEN ci.interaction_type = 'carousel_click' THEN 1 ELSE 0 END), 0) as carousel_clicks,
        COALESCE(SUM(CASE WHEN ci.interaction_type = 'keyword_response' THEN 1 ELSE 0 END), 0) as keyword_responses,
        COALESCE(SUM(CASE WHEN ci.interaction_type = 'poll_vote' THEN 1 ELSE 0 END), 0) as poll_votes,
        COALESCE(c.messages_delivered * 1.0 / NULLIF(c.messages_sent, 0), 0) as delivery_rate,
        COALESCE(c.messages_read * 1.0 / NULLIF(c.messages_sent, 0), 0) as read_rate,
        COALESCE(COUNT(ci.id) * 1.0 / NULLIF(c.messages_sent, 0), 0) as interaction_rate
      FROM campaigns c
      LEFT JOIN campaign_interactions ci ON c.id = ci.campaign_id
    `;

    let countQuery = 'SELECT COUNT(DISTINCT c.id) as total FROM campaigns c';
    const params = [];
    const conditions = [];

    // Filtros
    if (dateFrom) {
      conditions.push('c.created_at >= ?');
      params.push(dateFrom);
    }

    if (dateTo) {
      conditions.push('c.created_at <= ?');
      params.push(dateTo + ' 23:59:59');
    }

    if (campaignId) {
      conditions.push('c.id = ?');
      params.push(campaignId);
    }

    if (status) {
      conditions.push('c.status = ?');
      params.push(status);
    }

    if (messageType) {
      conditions.push('c.message_type = ?');
      params.push(messageType);
    }

    if (interactionType) {
      conditions.push('ci.interaction_type = ?');
      params.push(interactionType);
    }

    if (keyword) {
      conditions.push('ci.keyword LIKE ?');
      params.push(`%${keyword}%`);
    }

    if (conditions.length > 0) {
      const whereClause = ' WHERE ' + conditions.join(' AND ');
      query += whereClause;
      countQuery += whereClause.replace('ci.interaction_type', 'EXISTS (SELECT 1 FROM campaign_interactions ci WHERE ci.campaign_id = c.id AND ci.interaction_type');
      if (interactionType) {
        countQuery = countQuery.replace('ci.interaction_type = ?', 'EXISTS (SELECT 1 FROM campaign_interactions ci WHERE ci.campaign_id = c.id AND ci.interaction_type = ?)');
      }
      if (keyword) {
        countQuery = countQuery.replace('ci.keyword LIKE ?', 'EXISTS (SELECT 1 FROM campaign_interactions ci WHERE ci.campaign_id = c.id AND ci.keyword LIKE ?)');
      }
    }

    query += ' GROUP BY c.id ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
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
    console.error('❌ Erro ao buscar relatórios de campanhas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET /api/reports/campaigns/stats - Estatísticas resumidas
router.get('/campaigns/stats', async (req, res) => {
  try {
    const { dateFrom, dateTo, campaignId } = req.query;
    const db = getDatabase();

    let conditions = [];
    let params = [];

    if (dateFrom) {
      conditions.push('c.created_at >= ?');
      params.push(dateFrom);
    }

    if (dateTo) {
      conditions.push('c.created_at <= ?');
      params.push(dateTo + ' 23:59:59');
    }

    if (campaignId) {
      conditions.push('c.id = ?');
      params.push(campaignId);
    }

    const whereClause = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';

    // Estatísticas gerais
    const generalStats = await db.get(`
      SELECT 
        COUNT(DISTINCT c.id) as totalCampaigns,
        COALESCE(SUM(c.messages_sent), 0) as totalMessages,
        COALESCE(COUNT(ci.id), 0) as totalInteractions,
        COALESCE(AVG(c.messages_delivered * 1.0 / NULLIF(c.messages_sent, 0)), 0) as averageDeliveryRate,
        COALESCE(AVG(c.messages_read * 1.0 / NULLIF(c.messages_sent, 0)), 0) as averageReadRate
      FROM campaigns c
      LEFT JOIN campaign_interactions ci ON c.id = ci.campaign_id
      ${whereClause}
    `, params);

    // Taxa de interação média
    const interactionRate = await db.get(`
      SELECT 
        COALESCE(
          COUNT(ci.id) * 1.0 / NULLIF(SUM(c.messages_sent), 0), 
          0
        ) as averageInteractionRate
      FROM campaigns c
      LEFT JOIN campaign_interactions ci ON c.id = ci.campaign_id
      ${whereClause}
    `, params);

    // Top palavras-chave
    const topKeywords = await db.all(`
      SELECT 
        ci.keyword,
        COUNT(*) as count
      FROM campaign_interactions ci
      JOIN campaigns c ON c.id = ci.campaign_id
      WHERE ci.keyword IS NOT NULL AND ci.keyword != ''
      ${conditions.length > 0 ? ' AND ' + conditions.join(' AND ') : ''}
      GROUP BY ci.keyword
      ORDER BY count DESC
      LIMIT 10
    `, params);

    // Interações por tipo
    const interactionsByType = await db.all(`
      SELECT 
        ci.interaction_type as type,
        COUNT(*) as count
      FROM campaign_interactions ci
      JOIN campaigns c ON c.id = ci.campaign_id
      ${whereClause.replace('c.', 'c.')}
      GROUP BY ci.interaction_type
      ORDER BY count DESC
    `, params);

    res.json({
      ...generalStats,
      averageInteractionRate: interactionRate.averageInteractionRate,
      topKeywords,
      interactionsByType
    });

  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas de campanhas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET /api/reports/campaigns/:id/interactions - Detalhes de interações
router.get('/campaigns/:id/interactions', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 50,
      dateFrom,
      dateTo,
      interactionType,
      keyword
    } = req.query;

    const offset = (page - 1) * limit;
    const db = getDatabase();

    let query = `
      SELECT 
        ci.*,
        c.name as campaign_name,
        cont.name as contact_name,
        cont.phone as contact_phone
      FROM campaign_interactions ci
      JOIN campaigns c ON c.id = ci.campaign_id
      JOIN contacts cont ON cont.id = ci.contact_id
      WHERE ci.campaign_id = ?
    `;

    let countQuery = `
      SELECT COUNT(*) as total
      FROM campaign_interactions ci
      WHERE ci.campaign_id = ?
    `;

    const params = [id];
    const conditions = [];

    if (dateFrom) {
      conditions.push('ci.created_at >= ?');
      params.push(dateFrom);
    }

    if (dateTo) {
      conditions.push('ci.created_at <= ?');
      params.push(dateTo + ' 23:59:59');
    }

    if (interactionType) {
      conditions.push('ci.interaction_type = ?');
      params.push(interactionType);
    }

    if (keyword) {
      conditions.push('ci.keyword LIKE ?');
      params.push(`%${keyword}%`);
    }

    if (conditions.length > 0) {
      const additionalWhere = ' AND ' + conditions.join(' AND ');
      query += additionalWhere;
      countQuery += additionalWhere;
    }

    query += ' ORDER BY ci.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const interactions = await db.all(query, params);
    const { total } = await db.get(countQuery, params.slice(0, -2));

    res.json({
      data: interactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar detalhes de interações:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET /api/reports/campaigns/export - Exportar relatório
router.get('/campaigns/export', async (req, res) => {
  try {
    const {
      format = 'excel',
      includeDetails = 'true',
      includeCharts = 'true',
      dateFrom,
      dateTo,
      campaignId,
      status,
      messageType
    } = req.query;

    const db = getDatabase();

    // Buscar dados das campanhas
    let query = `
      SELECT 
        c.*,
        COALESCE(SUM(CASE WHEN ci.interaction_type = 'button_click' THEN 1 ELSE 0 END), 0) as button_clicks,
        COALESCE(SUM(CASE WHEN ci.interaction_type = 'list_selection' THEN 1 ELSE 0 END), 0) as list_selections,
        COALESCE(SUM(CASE WHEN ci.interaction_type = 'carousel_click' THEN 1 ELSE 0 END), 0) as carousel_clicks,
        COALESCE(SUM(CASE WHEN ci.interaction_type = 'keyword_response' THEN 1 ELSE 0 END), 0) as keyword_responses,
        COALESCE(SUM(CASE WHEN ci.interaction_type = 'poll_vote' THEN 1 ELSE 0 END), 0) as poll_votes,
        COALESCE(c.messages_delivered * 1.0 / NULLIF(c.messages_sent, 0), 0) as delivery_rate,
        COALESCE(c.messages_read * 1.0 / NULLIF(c.messages_sent, 0), 0) as read_rate,
        COALESCE(COUNT(ci.id) * 1.0 / NULLIF(c.messages_sent, 0), 0) as interaction_rate
      FROM campaigns c
      LEFT JOIN campaign_interactions ci ON c.id = ci.campaign_id
    `;

    const params = [];
    const conditions = [];

    if (dateFrom) {
      conditions.push('c.created_at >= ?');
      params.push(dateFrom);
    }

    if (dateTo) {
      conditions.push('c.created_at <= ?');
      params.push(dateTo + ' 23:59:59');
    }

    if (campaignId) {
      conditions.push('c.id = ?');
      params.push(campaignId);
    }

    if (status) {
      conditions.push('c.status = ?');
      params.push(status);
    }

    if (messageType) {
      conditions.push('c.message_type = ?');
      params.push(messageType);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY c.id ORDER BY c.created_at DESC';

    const campaigns = await db.all(query, params);

    if (format === 'excel') {
      // Gerar Excel
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Relatório de Campanhas');

      // Cabeçalhos
      worksheet.columns = [
        { header: 'Nome da Campanha', key: 'name', width: 30 },
        { header: 'Descrição', key: 'description', width: 40 },
        { header: 'Tipo de Mensagem', key: 'message_type', width: 15 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Data de Criação', key: 'created_at', width: 20 },
        { header: 'Total de Contatos', key: 'total_contacts', width: 15 },
        { header: 'Mensagens Enviadas', key: 'messages_sent', width: 18 },
        { header: 'Mensagens Entregues', key: 'messages_delivered', width: 18 },
        { header: 'Mensagens Lidas', key: 'messages_read', width: 15 },
        { header: 'Mensagens Falharam', key: 'messages_failed', width: 18 },
        { header: 'Cliques em Botões', key: 'button_clicks', width: 15 },
        { header: 'Seleções de Lista', key: 'list_selections', width: 15 },
        { header: 'Cliques em Carrossel', key: 'carousel_clicks', width: 18 },
        { header: 'Respostas por Palavra-chave', key: 'keyword_responses', width: 25 },
        { header: 'Votos em Enquetes', key: 'poll_votes', width: 15 },
        { header: 'Taxa de Entrega (%)', key: 'delivery_rate', width: 15 },
        { header: 'Taxa de Leitura (%)', key: 'read_rate', width: 15 },
        { header: 'Taxa de Interação (%)', key: 'interaction_rate', width: 18 }
      ];

      // Dados
      campaigns.forEach(campaign => {
        worksheet.addRow({
          ...campaign,
          created_at: new Date(campaign.created_at).toLocaleDateString('pt-BR'),
          delivery_rate: (campaign.delivery_rate * 100).toFixed(2),
          read_rate: (campaign.read_rate * 100).toFixed(2),
          interaction_rate: (campaign.interaction_rate * 100).toFixed(2)
        });
      });

      // Estilizar cabeçalho
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF059669' }
      };

      // Incluir detalhes se solicitado
      if (includeDetails === 'true') {
        const detailsWorksheet = workbook.addWorksheet('Detalhes de Interações');

        // Buscar todas as interações
        const interactions = await db.all(`
          SELECT 
            ci.*,
            c.name as campaign_name,
            cont.name as contact_name,
            cont.phone as contact_phone
          FROM campaign_interactions ci
          JOIN campaigns c ON c.id = ci.campaign_id
          JOIN contacts cont ON cont.id = ci.contact_id
          ${conditions.length > 0 ? 'WHERE ' + conditions.map(c => c.replace('c.', 'c.')).join(' AND ') : ''}
          ORDER BY ci.created_at DESC
        `, params);

        detailsWorksheet.columns = [
          { header: 'Campanha', key: 'campaign_name', width: 30 },
          { header: 'Contato', key: 'contact_name', width: 25 },
          { header: 'Telefone', key: 'contact_phone', width: 15 },
          { header: 'Tipo de Interação', key: 'interaction_type', width: 20 },
          { header: 'Texto do Botão', key: 'button_text', width: 25 },
          { header: 'Opção da Lista', key: 'list_option_text', width: 25 },
          { header: 'Palavra-chave', key: 'keyword', width: 20 },
          { header: 'Resposta', key: 'response_text', width: 40 },
          { header: 'Data/Hora', key: 'created_at', width: 20 }
        ];

        interactions.forEach(interaction => {
          detailsWorksheet.addRow({
            ...interaction,
            created_at: new Date(interaction.created_at).toLocaleString('pt-BR')
          });
        });

        detailsWorksheet.getRow(1).font = { bold: true };
        detailsWorksheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF3B82F6' }
        };
      }

      // Gerar buffer
      const buffer = await workbook.xlsx.writeBuffer();

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=relatorio-campanhas-${new Date().toISOString().split('T')[0]}.xlsx`);
      res.send(buffer);

    } else if (format === 'pdf') {
      // Gerar PDF
      const doc = new PDFDocument();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=relatorio-campanhas-${new Date().toISOString().split('T')[0]}.pdf`);

      doc.pipe(res);

      // --- Estilos e Cores ---
      const primaryColor = '#1e293b'; // Azul escuro
      const secondaryColor = '#3b82f6'; // Azul vibrante
      const accentColor = '#059669'; // Verde
      const lightBg = '#f8fafc';

      // --- Cabeçalho Premium ---
      doc.rect(0, 0, 612, 80).fill(primaryColor);
      doc.fontSize(24).fillColor('white').text('Relatório de Performance', 50, 30, { align: 'left' });
      doc.fontSize(10).fillColor('#94a3b8').text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 400, 35, { align: 'right' });

      doc.moveDown(4);
      doc.fillColor(primaryColor);

      // --- Resumo Global ---
      doc.fontSize(16).text('📊 Resumo da Seleção', 50, 100);
      doc.rect(50, 120, 512, 1).fill('#e2e8f0');
      doc.moveDown(1);

      doc.fontSize(12).fillColor('#475569');
      doc.text(`Total de Campanhas Analisadas: ${campaigns.length}`, 60, 135);
      doc.moveDown(2);

      // --- Dados das campanhas ---
      campaigns.forEach((campaign, index) => {
        if (index > 0) doc.addPage();

        // Cabeçalho da Campanha
        doc.rect(50, 50, 512, 40).fill(lightBg);
        doc.fontSize(18).fillColor(primaryColor).text(`🚀 ${index + 1}. ${campaign.name}`, 60, 62);

        doc.fontSize(10).fillColor('#64748b').text(`ID: ${campaign.id}`, 400, 67, { align: 'right' });

        doc.moveDown(2);
        doc.fontSize(11).fillColor('#334155');
        doc.text(`📝 Descrição: ${campaign.description || 'N/A'}`, { width: 490 });
        doc.moveDown(0.5);

        // Grid de Status
        const statusY = doc.y;
        doc.fontSize(10).fillColor('#64748b').text('Tipo:', 60, statusY);
        doc.fontSize(10).fillColor(primaryColor).text(campaign.message_type, 100, statusY);

        doc.fontSize(10).fillColor('#64748b').text('Status:', 200, statusY);
        doc.fontSize(10).fillColor(accentColor).text(campaign.status, 240, statusY);

        doc.fontSize(10).fillColor('#64748b').text('Data:', 350, statusY);
        doc.fontSize(10).fillColor(primaryColor).text(new Date(campaign.created_at).toLocaleDateString('pt-BR'), 380, statusY);

        doc.moveDown(2);

        // Quadro de Métricas
        const metricsY = doc.y;
        doc.rect(50, metricsY, 512, 80).fill('#f1f5f9');
        doc.fillColor(primaryColor);

        // Coluna 1: Envios
        doc.fontSize(10).fillColor('#64748b').text('ENVIADAS', 70, metricsY + 15);
        doc.fontSize(14).fillColor(secondaryColor).text(campaign.messages_sent.toString(), 70, metricsY + 30);

        // Coluna 2: Entregues
        doc.fontSize(10).fillColor('#64748b').text('ENTREGUES', 180, metricsY + 15);
        doc.fontSize(14).fillColor(accentColor).text(`${campaign.messages_delivered} (${(campaign.delivery_rate * 100).toFixed(1)}%)`, 180, metricsY + 30);

        // Coluna 3: Lidas
        doc.fontSize(10).fillColor('#64748b').text('LIDAS', 320, metricsY + 15);
        doc.fontSize(14).fillColor('#f59e0b').text(`${campaign.messages_read} (${(campaign.read_rate * 100).toFixed(1)}%)`, 320, metricsY + 30);

        // Coluna 4: Engajamento
        doc.fontSize(10).fillColor('#64748b').text('ENGAJAMENTO', 450, metricsY + 15);
        doc.fontSize(14).fillColor('#ef4444').text(`${(campaign.interaction_rate * 100).toFixed(1)}%`, 450, metricsY + 30);

        doc.moveDown(6);

        // Seção de Interações
        doc.fontSize(12).fillColor(primaryColor).text('⚡ Detalhes de Interação:', 60);
        doc.rect(60, doc.y + 2, 120, 1).fill(secondaryColor);
        doc.moveDown(1);

        const interactions = [
          { label: '🔘 Cliques em Botões', value: campaign.button_clicks },
          { label: '📋 Seleções de Lista', value: campaign.list_selections },
          { label: 'Carousel Cliques', value: campaign.carousel_clicks },
          { label: '🔑 Respostas (Keyword)', value: campaign.keyword_responses },
          { label: '📊 Votos em Enquete', value: campaign.poll_votes }
        ];

        interactions.forEach(item => {
          doc.fontSize(10).fillColor('#475569').text(item.label, 80);
          doc.fontSize(10).fillColor(primaryColor).text(item.value.toString(), 250, doc.y - 12, { align: 'left' });
          doc.moveDown(0.3);
        });

        // Rodapé da Página
        doc.fontSize(8).fillColor('#94a3b8').text('Página ' + (index + 1), 50, 750, { align: 'center' });
      });

      doc.end();
    }

  } catch (error) {
    console.error('❌ Erro ao exportar relatório:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET /api/reports/keywords - Top palavras-chave
router.get('/keywords', async (req, res) => {
  try {
    const { dateFrom, dateTo, campaignId, limit = 20 } = req.query;
    const db = getDatabase();

    let query = `
      SELECT 
        ci.keyword,
        COUNT(*) as count,
        GROUP_CONCAT(DISTINCT c.name) as campaigns
      FROM campaign_interactions ci
      JOIN campaigns c ON c.id = ci.campaign_id
      WHERE ci.keyword IS NOT NULL AND ci.keyword != ''
    `;

    const params = [];

    if (dateFrom) {
      query += ' AND ci.created_at >= ?';
      params.push(dateFrom);
    }

    if (dateTo) {
      query += ' AND ci.created_at <= ?';
      params.push(dateTo + ' 23:59:59');
    }

    if (campaignId) {
      query += ' AND c.id = ?';
      params.push(campaignId);
    }

    query += ' GROUP BY ci.keyword ORDER BY count DESC LIMIT ?';
    params.push(parseInt(limit));

    const keywords = await db.all(query, params);

    // Processar campanhas
    const processedKeywords = keywords.map(keyword => ({
      ...keyword,
      campaigns: keyword.campaigns ? keyword.campaigns.split(',') : []
    }));

    res.json(processedKeywords);

  } catch (error) {
    console.error('❌ Erro ao buscar palavras-chave:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// DELETE /api/reports/campaigns/:id - Excluir relatório de uma campanha
router.delete('/campaigns/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    // Iniciar transação para garantir integridade
    await db.run('BEGIN TRANSACTION');

    try {
      // Excluir interações
      await db.run('DELETE FROM campaign_interactions WHERE campaign_id = ?', [id]);

      // Excluir envios
      await db.run('DELETE FROM campaign_sends WHERE campaign_id = ?', [id]);

      // Excluir a campanha
      await db.run('DELETE FROM campaigns WHERE id = ?', [id]);

      await db.run('COMMIT');
      res.json({ message: 'Relatório excluído com sucesso' });
    } catch (err) {
      await db.run('ROLLBACK');
      throw err;
    }
  } catch (error) {
    console.error('❌ Erro ao excluir relatório:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// DELETE /api/reports/campaigns - Excluir todos os relatórios filtrados
router.delete('/campaigns', async (req, res) => {
  try {
    const { dateFrom, dateTo, status } = req.query;
    const db = getDatabase();

    let query = 'SELECT id FROM campaigns c';
    let params = [];
    let conditions = [];

    if (dateFrom) {
      conditions.push('c.created_at >= ?');
      params.push(dateFrom);
    }
    if (dateTo) {
      conditions.push('c.created_at <= ?');
      params.push(dateTo + ' 23:59:59');
    }
    if (status) {
      conditions.push('c.status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const campaignsToDelete = await db.all(query, params);
    const ids = campaignsToDelete.map(c => c.id);

    if (ids.length === 0) {
      return res.json({ message: 'Nenhum relatório encontrado para excluir' });
    }

    await db.run('BEGIN TRANSACTION');
    try {
      const placeholders = ids.map(() => '?').join(',');
      await db.run(`DELETE FROM campaign_interactions WHERE campaign_id IN (${placeholders})`, ids);
      await db.run(`DELETE FROM campaign_sends WHERE campaign_id IN (${placeholders})`, ids);
      await db.run(`DELETE FROM campaigns WHERE id IN (${placeholders})`, ids);

      await db.run('COMMIT');
      res.json({ message: `${ids.length} relatórios excluídos com sucesso` });
    } catch (err) {
      await db.run('ROLLBACK');
      throw err;
    }
  } catch (error) {
    console.error('❌ Erro ao excluir relatórios:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

export default router;