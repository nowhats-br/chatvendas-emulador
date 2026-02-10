/**
 * Rotas para gerenciamento de Android via Nuvem
 */

import express from 'express';
import CloudAndroidManager from '../services/CloudAndroidManager.js';

const router = express.Router();
const manager = new CloudAndroidManager();

/**
 * Verificar status do setup
 */
router.get('/setup/status', async (req, res) => {
  try {
    const status = await manager.checkSetupStatus().catch(() => ({
      wsl2Installed: false,
      distroInstalled: false,
      setupComplete: false,
      ready: false,
      cloudMode: true
    }));

    res.json(status);
  } catch (error) {
    console.error('Erro em /setup/status:', error.message);
    // Retornar resposta padrão em vez de crashar
    res.json({
      wsl2Installed: false,
      distroInstalled: false,
      setupComplete: false,
      ready: false,
      cloudMode: true,
      error: 'Erro ao verificar status'
    });
  }
});

/**
 * Verificar requisitos do sistema
 */
router.get('/setup/requirements', async (req, res) => {
  try {
    const requirements = await manager.checkRequirements().catch(() => ({
      windows10: false,
      virtualization: false,
      diskSpace: false,
      ram: false
    }));
    res.json(requirements);
  } catch (error) {
    console.error('Erro em /setup/requirements:', error.message);
    res.json({
      windows10: false,
      virtualization: false,
      diskSpace: false,
      ram: false,
      error: 'Erro ao verificar requisitos'
    });
  }
});

/**
 * Fix Kernel WSL (Admin)
 */
router.post('/setup/fix-kernel', async (req, res) => {
  try {
    await manager.fixWSLKernel();
    res.json({ success: true, message: 'Kernel do WSL atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Instalar WSL (Admin)
 */
router.post('/setup/install-wsl-admin', async (req, res) => {
  try {
    const result = await manager.installWSL2(() => { });
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Executar setup automático (SSE para progresso em tempo real)
 */
router.get('/setup/run', async (req, res) => {
  let heartbeat;
  
  try {
    // Configurar SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // Enviar heartbeat a cada 15 segundos
    heartbeat = setInterval(() => {
      try {
        res.write(': heartbeat\n\n');
      } catch (e) {
        clearInterval(heartbeat);
      }
    }, 15000);

    // Cleanup quando cliente desconectar
    req.on('close', () => {
      if (heartbeat) clearInterval(heartbeat);
    });

    // Executar setup com timeout de 10 minutos
    const setupPromise = manager.autoSetup((message, progress) => {
      try {
        res.write(`data: ${JSON.stringify({ message, progress })}\n\n`);
      } catch (e) {
        console.error('Erro ao enviar progresso SSE:', e.message);
      }
    });

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Setup timeout após 10 minutos')), 600000)
    );

    const result = await Promise.race([setupPromise, timeoutPromise]);

    if (heartbeat) clearInterval(heartbeat);

    // Enviar resultado final
    res.write(`data: ${JSON.stringify({ done: true, result })}\n\n`);
    res.end();

  } catch (error) {
    console.error('Erro no setup automático:', error);
    if (heartbeat) clearInterval(heartbeat);
    
    try {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    } catch (e) {
      // Cliente já desconectou
    }
  }
});

/**
 * Criar nova instância Android
 */
router.post('/instance/create', async (req, res) => {
  try {
    const { name, profile } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Nome da instância é obrigatório' });
    }

    // Obter próxima porta VNC disponível
    const instances = await manager.listInstances().catch(() => []);
    const vncPort = instances.length + 1;

    const instance = await manager.createInstance(name, vncPort, profile || 'med');

    res.json(instance);
  } catch (error) {
    console.error('Erro ao criar instância:', error.message);
    // Não crashar o backend, retornar erro
    res.status(500).json({ 
      error: error.message,
      details: 'Verifique se WSL2 e Ubuntu estão instalados'
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
    const instances = await manager.listInstances().catch(() => []);
    res.json({ success: true, instances });
  } catch (error) {
    console.error('Erro ao listar instâncias:', error.message);
    res.json({ success: true, instances: [], error: error.message });
  }
});

/**
 * Obter IP do WSL2
 */
router.get('/wsl/ip', async (req, res) => {
  try {
    const ip = await manager.getWSLIP();
    res.json({ ip });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    console.error('API Input Error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
