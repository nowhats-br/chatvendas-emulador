/**
 * Rotas para gerenciamento de Android na Nuvem
 * Modo Cloud - Sem WSL2/QEMU
 */

import express from 'express';
import CloudAndroidManager from '../services/CloudAndroidManager.js';

const router = express.Router();
const manager = new CloudAndroidManager();

/**
 * Verificar status (sempre pronto no modo cloud)
 */
router.get('/setup/status', async (req, res) => {
  try {
    const status = await manager.checkSetupStatus();
    res.json(status);
  } catch (error) {
    console.error('❌ Erro ao verificar status:', error.message);
    res.json({
      ready: false,
      cloudMode: true,
      error: 'API na nuvem não está acessível'
    });
  }
});

/**
 * Criar nova instância Android na nuvem
 */
router.post('/instance/create', async (req, res) => {
  try {
    const { name, profile } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Nome da instância é obrigatório' });
    }

    const instance = await manager.createInstance(name, null, profile || 'med');
    res.json(instance);
  } catch (error) {
    console.error('❌ Erro ao criar instância:', error.message);
    res.status(500).json({ 
      error: error.message,
      details: 'Verifique se a API na nuvem está acessível'
    });
  }
});

/**
 * Parar instância
 */
router.post('/instance/stop', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Nome da instância é obrigatório' });
    }

    await manager.stopInstance(name);
    res.json({ success: true, message: `Instância ${name} parada` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Deletar instância
 */
router.delete('/instance/:name', async (req, res) => {
  try {
    const { name } = req.params;
    await manager.deleteInstance(name);
    res.json({ success: true, message: `Instância ${name} deletada` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Listar instâncias
 */
router.get('/instance/list', async (req, res) => {
  try {
    const instances = await manager.listInstances();
    res.json({ success: true, instances });
  } catch (error) {
    console.error('❌ Erro ao listar instâncias:', error.message);
    res.json({ success: true, instances: [], error: error.message });
  }
});

/**
 * Enviar input para a instância (Teclado/Botões)
 */
router.post('/instance/input', async (req, res) => {
  try {
    const { name, command } = req.body;

    if (!name || !command) {
      return res.status(400).json({ error: 'Nome da instância e comando são obrigatórios' });
    }

    await manager.sendInput(name, command);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Erro ao enviar input:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
