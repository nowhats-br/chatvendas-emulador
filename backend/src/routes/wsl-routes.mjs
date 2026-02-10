import express from 'express';
import { WSLInstaller } from '../services/wsl-installer.mjs';

const router = express.Router();

// Instância global do instalador
let installer = null;
let installationProgress = {
  status: 'idle',
  progress: 0,
  message: '',
  error: null,
  startTime: null,
  endTime: null
};

// Clientes SSE conectados
const sseClients = new Set();

// Broadcast para todos os clientes SSE
function broadcastProgress(data) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach(client => {
    try {
      client.write(message);
    } catch (error) {
      sseClients.delete(client);
    }
  });
}

// SSE para updates em tempo real
router.get('/install/status', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Nginx compatibility

  // Enviar status atual imediatamente
  res.write(`data: ${JSON.stringify(installationProgress)}\n\n`);

  // Adicionar cliente à lista
  sseClients.add(res);

  // Heartbeat para manter conexão viva
  const heartbeatInterval = setInterval(() => {
    res.write(`: heartbeat\n\n`);
  }, 15000);

  // Cleanup quando cliente desconectar
  req.on('close', () => {
    clearInterval(heartbeatInterval);
    sseClients.delete(res);
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

    // Verificar se já está instalado
    const tempInstaller = new WSLInstaller();
    const isInstalled = await tempInstaller.isInstalled();
    
    if (isInstalled) {
      return res.json({
        success: false,
        message: 'WSL2 e Ubuntu já estão instalados'
      });
    }

    // Criar nova instância do instalador
    installer = new WSLInstaller();

    // Registrar callback para updates
    installer.onStatusUpdate((update) => {
      installationProgress = {
        ...installationProgress,
        status: update.status,
        progress: update.progress,
        message: update.message,
        error: update.status === 'error' ? update.message : null
      };

      // Broadcast para todos os clientes conectados
      broadcastProgress(installationProgress);
    });

    // Iniciar instalação em background
    installationProgress = {
      status: 'installing',
      progress: 0,
      message: 'Iniciando instalação automática...',
      error: null,
      startTime: new Date().toISOString(),
      endTime: null
    };

    // Responder imediatamente
    res.json({
      success: true,
      message: 'Instalação iniciada com sucesso'
    });

    // Executar instalação em background
    (async () => {
      try {
        const result = await installer.install();

        if (result.success) {
          installationProgress = {
            status: 'complete',
            progress: 100,
            message: result.message || 'Instalação concluída com sucesso!',
            error: null,
            startTime: installationProgress.startTime,
            endTime: new Date().toISOString()
          };
        } else {
          installationProgress = {
            status: 'error',
            progress: installationProgress.progress,
            message: result.error || 'Erro desconhecido',
            error: result.error,
            startTime: installationProgress.startTime,
            endTime: new Date().toISOString()
          };
        }

        broadcastProgress(installationProgress);

      } catch (error) {
        console.error('Erro fatal na instalação:', error);
        installationProgress = {
          status: 'error',
          progress: installationProgress.progress,
          message: error.message,
          error: error.message,
          startTime: installationProgress.startTime,
          endTime: new Date().toISOString()
        };

        broadcastProgress(installationProgress);
      }
    })();

  } catch (error) {
    console.error('Erro ao iniciar instalação:', error);
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Cancelar instalação
router.post('/install/cancel', async (req, res) => {
  try {
    if (installationProgress.status !== 'installing') {
      return res.json({
        success: false,
        message: 'Nenhuma instalação em andamento'
      });
    }

    // Tentar cancelar processos WSL
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    try {
      await execAsync('wsl --shutdown', { timeout: 5000 });
    } catch {}

    installationProgress = {
      status: 'cancelled',
      progress: installationProgress.progress,
      message: 'Instalação cancelada pelo usuário',
      error: null,
      startTime: installationProgress.startTime,
      endTime: new Date().toISOString()
    };

    broadcastProgress(installationProgress);

    res.json({
      success: true,
      message: 'Instalação cancelada'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Obter progresso atual
router.get('/install/progress', (req, res) => {
  res.json({
    success: true,
    ...installationProgress
  });
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
      error: error.message,
      installed: false
    });
  }
});

// Obter informações detalhadas
router.get('/info', async (req, res) => {
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    const info = {
      wsl: {},
      ubuntu: {},
      system: {}
    };

    // Informações do WSL
    try {
      const { stdout: wslVersion } = await execAsync('wsl --version', { timeout: 5000 });
      info.wsl.version = wslVersion.trim();
    } catch {
      info.wsl.version = 'Não instalado';
    }

    try {
      const { stdout: wslList } = await execAsync('wsl --list --verbose', { timeout: 5000 });
      info.wsl.distributions = wslList.split('\n').filter(line => line.trim());
    } catch {
      info.wsl.distributions = [];
    }

    // Informações do Ubuntu
    try {
      const { stdout: ubuntuVersion } = await execAsync('wsl -d Ubuntu-22.04 -- lsb_release -a', { timeout: 5000 });
      info.ubuntu.version = ubuntuVersion.trim();
    } catch {
      info.ubuntu.version = 'Não instalado';
    }

    try {
      const { stdout: qemuVersion } = await execAsync('wsl -d Ubuntu-22.04 -- qemu-system-x86_64 --version', { timeout: 5000 });
      info.ubuntu.qemu = qemuVersion.split('\n')[0].trim();
    } catch {
      info.ubuntu.qemu = 'Não instalado';
    }

    // Informações do sistema
    try {
      const { stdout: systemInfo } = await execAsync('systeminfo', { timeout: 10000 });
      const lines = systemInfo.split('\n');
      
      info.system.os = lines.find(l => l.includes('OS Name'))?.split(':')[1]?.trim() || 'Desconhecido';
      info.system.version = lines.find(l => l.includes('OS Version'))?.split(':')[1]?.trim() || 'Desconhecido';
      info.system.memory = lines.find(l => l.includes('Total Physical Memory'))?.split(':')[1]?.trim() || 'Desconhecido';
      
      const virtLine = lines.find(l => l.includes('Virtualization Enabled In Firmware'));
      info.system.virtualization = virtLine ? virtLine.includes('Yes') : false;
    } catch {
      info.system = { error: 'Não foi possível obter informações do sistema' };
    }

    res.json({
      success: true,
      info
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Reiniciar WSL
router.post('/restart', async (req, res) => {
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    await execAsync('wsl --shutdown', { timeout: 10000 });
    
    // Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Tentar iniciar novamente
    await execAsync('wsl -d Ubuntu-22.04 -- echo "OK"', { timeout: 10000 });

    res.json({
      success: true,
      message: 'WSL reiniciado com sucesso'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Desinstalar WSL e Ubuntu
router.post('/uninstall', async (req, res) => {
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    // Desligar WSL
    await execAsync('wsl --shutdown', { timeout: 5000 });

    // Desregistrar Ubuntu
    const distributions = ['Ubuntu', 'Ubuntu-22.04', 'Ubuntu-20.04'];
    for (const distro of distributions) {
      try {
        await execAsync(`wsl --unregister ${distro}`, { timeout: 10000 });
      } catch {
        // Ignorar se não existir
      }
    }

    res.json({
      success: true,
      message: 'Ubuntu desinstalado com sucesso'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Executar comando no WSL
router.post('/exec', async (req, res) => {
  try {
    const { command } = req.body;

    if (!command) {
      return res.status(400).json({
        success: false,
        error: 'Comando não fornecido'
      });
    }

    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    const { stdout, stderr } = await execAsync(
      `wsl -d Ubuntu-22.04 -- ${command}`,
      { timeout: 30000 }
    );

    res.json({
      success: true,
      stdout: stdout.trim(),
      stderr: stderr.trim()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stdout: error.stdout?.trim() || '',
      stderr: error.stderr?.trim() || ''
    });
  }
});

// Obter logs de instalação
router.get('/logs', async (req, res) => {
  try {
    const { readFile } = await import('fs/promises');
    const { tmpdir } = await import('os');
    const { join } = await import('path');

    const logPath = join(tmpdir(), 'wsl-install.log');
    
    try {
      const logs = await readFile(logPath, 'utf-8');
      res.json({
        success: true,
        logs: logs.split('\n').filter(line => line.trim())
      });
    } catch {
      res.json({
        success: true,
        logs: [],
        message: 'Nenhum log disponível'
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Limpar logs
router.delete('/logs', async (req, res) => {
  try {
    const { unlink } = await import('fs/promises');
    const { tmpdir } = await import('os');
    const { join } = await import('path');

    const logPath = join(tmpdir(), 'wsl-install.log');
    
    try {
      await unlink(logPath);
      res.json({
        success: true,
        message: 'Logs limpos com sucesso'
      });
    } catch {
      res.json({
        success: true,
        message: 'Nenhum log para limpar'
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check específico do WSL
router.get('/health', async (req, res) => {
  try {
    const installer = new WSLInstaller();
    const isInstalled = await installer.isInstalled();
    const status = await installer.getStatus();

    res.json({
      success: true,
      healthy: isInstalled && status.running,
      installed: isInstalled,
      running: status.running,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      healthy: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
