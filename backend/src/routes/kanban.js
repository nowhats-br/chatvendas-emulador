import express from 'express';
import { getDatabase } from '../database/init.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// GET /api/kanban/stages - Listar estágios
router.get('/stages', async (req, res) => {
    try {
        const db = getDatabase();
        const stages = await db.all('SELECT * FROM kanban_stages ORDER BY sort_order ASC');
        res.json(stages);
    } catch (error) {
        console.error('❌ Erro ao listar estágios kanban:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// POST /api/kanban/stages - Criar novo estágio
router.post('/stages', async (req, res) => {
    try {
        const { label, color, sort_order } = req.body;
        if (!label) {
            return res.status(400).json({ error: 'Rótulo é obrigatório' });
        }

        const db = getDatabase();
        const id = uuidv4();

        await db.run(`
            INSERT INTO kanban_stages (id, label, color, sort_order)
            VALUES (?, ?, ?, ?)
        `, [id, label, color || 'border-blue-500', sort_order || 0]);

        const newStage = await db.get('SELECT * FROM kanban_stages WHERE id = ?', [id]);

        // Notificar via WebSocket
        if (req.wsManager) {
            req.wsManager.broadcast('kanban_stage_created', newStage);
        }

        res.status(201).json(newStage);
    } catch (error) {
        console.error('❌ Erro ao criar estágio kanban:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// PUT /api/kanban/stages/:id - Atualizar estágio
router.put('/stages/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { label, color, sort_order } = req.body;

        const db = getDatabase();
        const stage = await db.get('SELECT * FROM kanban_stages WHERE id = ?', [id]);

        if (!stage) {
            return res.status(404).json({ error: 'Estágio não encontrado' });
        }

        await db.run(`
            UPDATE kanban_stages 
            SET label = ?, color = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [label || stage.label, color || stage.color, sort_order ?? stage.sort_order, id]);

        const updatedStage = await db.get('SELECT * FROM kanban_stages WHERE id = ?', [id]);

        // Notificar via WebSocket
        if (req.wsManager) {
            req.wsManager.broadcast('kanban_stage_updated', updatedStage);
        }

        res.json(updatedStage);
    } catch (error) {
        console.error('❌ Erro ao atualizar estágio kanban:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// DELETE /api/kanban/stages/:id - Remover estágio
router.delete('/stages/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const db = getDatabase();

        const stage = await db.get('SELECT * FROM kanban_stages WHERE id = ?', [id]);
        if (!stage) {
            return res.status(404).json({ error: 'Estágio não encontrado' });
        }

        if (stage.is_system) {
            // return res.status(403).json({ error: 'Não é possível remover estágios do sistema' });
        }

        // Verificar se há contatos neste estágio
        const contactCount = await db.get('SELECT COUNT(*) as count FROM contacts WHERE stage = ?', [id]);
        if (contactCount.count > 0) {
            return res.status(409).json({ error: 'Não é possível remover um estágio que possui contatos' });
        }

        await db.run('DELETE FROM kanban_stages WHERE id = ?', [id]);

        // Notificar via WebSocket
        if (req.wsManager) {
            req.wsManager.broadcast('kanban_stage_deleted', { id });
        }

        res.json({ message: 'Estágio removido com sucesso' });
    } catch (error) {
        console.error('❌ Erro ao remover estágio kanban:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// PUT /api/kanban/reorder - Reordenar estágios
router.put('/reorder', async (req, res) => {
    try {
        const { stages } = req.body; // Array de { id, sort_order }
        const db = getDatabase();

        const queries = stages.map(s =>
            db.run('UPDATE kanban_stages SET sort_order = ? WHERE id = ?', [s.sort_order, s.id])
        );

        await Promise.all(queries);

        res.json({ message: 'Ordenação atualizada' });
    } catch (error) {
        console.error('❌ Erro ao reordenar estágios kanban:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

export default router;
