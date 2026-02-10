/**
 * Rotas para gerenciamento de Android na Nuvem
 * Modo Cloud - Sem WSL2/QEMU
 */

import express from 'express';
import CloudAndroidManager from '../services/CloudAndroidManager.js';

const router = express.Router();

// NÃO instanciar o manager aqui! Será instanciado sob demanda
let manager = null;

// Função para obter o manager (lazy loading)
function getManager() {
  if (!manager) {
    manager = new CloudAndroidManager();
  }
  return manager;
}

/**
 * Verificar status (sempre pronto no modo cloud)
 */
router.get('/setup/status', async (req, res) => {
  try {
    const status = await getManager().checkSetupStatus();
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

    const instance = await getManager().createInstance(name, null, profile || 'med');
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

    await getManager().stopInstance(name);
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
    await getManager().deleteInstance(name);
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
    const instances = await getManager().listInstances();
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

    await getManager().sendInput(name, command);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Erro ao enviar input:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
