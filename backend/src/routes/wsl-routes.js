const express = require('express');
const router = express.Router();
const WSLInstaller = require('../services/wsl-installer');

// Instância global do instalador
let installer = null;
let installationProgress = {
  status: 'idle',
  progress: 0,
  message: '',
  error: null
};

// SSE para updates em tempo real
router.get('/install/status', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Enviar status atual
  res.write(`data: ${JSON.stringify(installationProgress)}\n\n`);

  // Manter conexão aberta
  const intervalId = setInterval(() => {
    res.write(`data: ${JSON.stringify(installationProgress)}\n\n`);
  }, 1000);

  req.on('close', () => {
    clearInterval(intervalId);
  });
});

// Iniciar instalação
router.post('/install/start', async (req, res) => {
  try {
    // Verificar se já está instalando
    if (installationProgress.status === 'installing') {
      return res.json({
        success: false,
        message: 'Instalação já em andamento'
      });
    }

    // Criar nova instância do instalador
    installer = new WSLInstaller();

    // Registrar callback para updates
    installer.onStatusUpdate((update) => {
      installationProgress = {
        status: update.status,
        progress: update.progress,
        message: update.message,
        error: null
      };
    });

    // Iniciar instalação em background
    installationProgress = {
      status: 'installing',
      progress: 0,
      message: 'Iniciando instalação...',
      error: null
    };

    res.json({
      success: true,
      message: 'Instalação iniciada'
    });

    // Executar instalação
    const result = await installer.install();

    if (result.success) {
      installationProgress = {
        status: 'complete',
        progress: 100,
        message: result.message,
        error: null
      };
    } else {
      installationProgress = {
        status: 'error',
        progress: 0,
        message: result.error,
        error: result.error
      };
    }

  } catch (error) {
    console.error('Erro na instalação:', error);
    installationProgress = {
      status: 'error',
      progress: 0,
      message: error.message,
      error: error.message
    };

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Verificar status do WSL
router.get('/status', async (req, res) => {
  try {
    const installer = new WSLInstaller();
    const status = await installer.getStatus();

    res.json({
      success: true,
      ...status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Verificar se está instalado
router.get('/check', async (req, res) => {
  try {
    const installer = new WSLInstaller();
    const installed = await installer.isInstalled();

    res.json({
      success: true,
      installed
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
