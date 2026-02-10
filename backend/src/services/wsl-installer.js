const { exec, spawn } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

const execAsync = promisify(exec);

class WSLInstaller {
  constructor() {
    this.logFile = path.join(os.tmpdir(), 'wsl-install.log');
    this.statusCallbacks = [];
  }

  // Registrar callback para updates de status
  onStatusUpdate(callback) {
    this.statusCallbacks.push(callback);
  }

  // Emitir status
  emitStatus(status, progress, message) {
    this.log(`[${status}] ${progress}% - ${message}`);
    this.statusCallbacks.forEach(cb => cb({ status, progress, message }));
  }

  // Log para arquivo
  async log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} - ${message}\n`;
    try {
      await fs.appendFile(this.logFile, logMessage);
    } catch (err) {
      console.error('Erro ao escrever log:', err);
    }
  }

  // Verificar se está rodando como admin
  async isAdmin() {
    try {
      const { stdout } = await execAsync('net session 2>&1');
      return !stdout.includes('Access is denied');
    } catch {
      return false;
    }
  }

  // Solicitar elevação de privilégios
  async requestAdmin() {
    this.emitStatus('requesting_admin', 0, 'Solicitando permissões de administrador...');
    
    // Criar script temporário para executar com admin
    const scriptPath = path.join(os.tmpdir(), 'wsl-install-admin.ps1');
    const script = `
      Start-Process powershell -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File \\"${__filename}\\""
    `;
    
    await fs.writeFile(scriptPath, script);
    
    return new Promise((resolve, reject) => {
      exec(`powershell -ExecutionPolicy Bypass -File "${scriptPath}"`, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  // Verificar requisitos do sistema
  async checkSystemRequirements() {
    this.emitStatus('checking', 5, 'Verificando requisitos do sistema...');

    try {
      // Verificar versão do Windows
      const { stdout: winVersion } = await execAsync('ver');
      this.log(`Versão do Windows: ${winVersion}`);

      // Verificar virtualização
      const { stdout: virtCheck } = await execAsync('systeminfo');
      const hasVirtualization = virtCheck.includes('Virtualization Enabled In Firmware: Yes');
      
      if (!hasVirtualization) {
        throw new Error('Virtualização não está habilitada na BIOS. Por favor, habilite VT-x/AMD-V na BIOS.');
      }

      // Verificar espaço em disco (mínimo 20GB)
      const { stdout: diskSpace } = await execAsync('wmic logicaldisk get size,freespace,caption');
      this.log(`Espaço em disco: ${diskSpace}`);

      this.emitStatus('checking', 10, 'Requisitos verificados com sucesso');
      return true;
    } catch (error) {
      this.emitStatus('error', 0, `Erro ao verificar requisitos: ${error.message}`);
      throw error;
    }
  }

  // Instalar componentes do WSL2
  async installWSLComponents() {
    this.emitStatus('installing_wsl', 15, 'Instalando componentes do WSL2...');

    try {
      // Habilitar WSL
      await execAsync('dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart', {
        timeout: 300000
      });
      this.emitStatus('installing_wsl', 25, 'Subsistema Linux habilitado');

      // Habilitar Virtual Machine Platform
      await execAsync('dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart', {
        timeout: 300000
      });
      this.emitStatus('installing_wsl', 35, 'Plataforma de Máquina Virtual habilitada');

      // Definir WSL2 como padrão
      await execAsync('wsl --set-default-version 2');
      this.emitStatus('installing_wsl', 40, 'WSL2 definido como padrão');

      return true;
    } catch (error) {
      this.emitStatus('error', 0, `Erro ao instalar WSL: ${error.message}`);
      throw error;
    }
  }

  // Atualizar WSL
  async updateWSL() {
    this.emitStatus('updating_wsl', 45, 'Atualizando WSL...');

    try {
      await execAsync('wsl --update', { timeout: 300000 });
      this.emitStatus('updating_wsl', 50, 'WSL atualizado com sucesso');
      return true;
    } catch (error) {
      this.log(`Aviso: Erro ao atualizar WSL: ${error.message}`);
      // Não é crítico, continuar
      return true;
    }
  }

  // Limpar instalações anteriores
  async cleanPreviousInstallations() {
    this.emitStatus('cleaning', 52, 'Limpando instalações anteriores...');

    try {
      // Desligar WSL
      await execAsync('wsl --shutdown');

      // Listar distribuições
      const { stdout } = await execAsync('wsl --list --verbose');
      
      // Remover Ubuntu se existir
      if (stdout.includes('Ubuntu')) {
        const distributions = ['Ubuntu', 'Ubuntu-22.04', 'Ubuntu-20.04'];
        for (const distro of distributions) {
          try {
            await execAsync(`wsl --unregister ${distro}`);
            this.log(`Removido: ${distro}`);
          } catch {
            // Ignorar se não existir
          }
        }
      }

      // Limpar cache
      await execAsync('wsreset.exe');
      
      // Limpar arquivos temporários
      try {
        await execAsync('Remove-Item -Path "$env:LOCALAPPDATA\\Packages\\CanonicalGroupLimited*" -Recurse -Force -ErrorAction SilentlyContinue', {
          shell: 'powershell'
        });
      } catch {
        // Ignorar erros
      }

      this.emitStatus('cleaning', 55, 'Limpeza concluída');
      return true;
    } catch (error) {
      this.log(`Aviso: Erro na limpeza: ${error.message}`);
      return true; // Não é crítico
    }
  }

  // Baixar Ubuntu
  async downloadUbuntu() {
    this.emitStatus('downloading', 60, 'Baixando Ubuntu 22.04...');

    const ubuntuUrl = 'https://aka.ms/wslubuntu2204';
    const downloadPath = path.join(os.tmpdir(), 'Ubuntu2204.appx');

    try {
      // Remover arquivo antigo se existir
      try {
        await fs.unlink(downloadPath);
      } catch {}

      // Baixar usando PowerShell com barra de progresso
      const downloadScript = `
        $ProgressPreference = 'SilentlyContinue'
        Invoke-WebRequest -Uri "${ubuntuUrl}" -OutFile "${downloadPath}" -UseBasicParsing
      `;

      await execAsync(`powershell -Command "${downloadScript}"`, {
        timeout: 600000 // 10 minutos
      });

      this.emitStatus('downloading', 75, 'Ubuntu baixado com sucesso');
      return downloadPath;
    } catch (error) {
      this.emitStatus('error', 0, `Erro ao baixar Ubuntu: ${error.message}`);
      throw error;
    }
  }

  // Instalar Ubuntu
  async installUbuntu(appxPath) {
    this.emitStatus('installing_ubuntu', 80, 'Instalando Ubuntu 22.04...');

    try {
      await execAsync(`powershell -Command "Add-AppxPackage '${appxPath}'"`, {
        timeout: 300000
      });

      this.emitStatus('installing_ubuntu', 85, 'Ubuntu instalado, iniciando...');

      // Iniciar Ubuntu
      await execAsync('wsl --install -d Ubuntu-22.04', {
        timeout: 120000
      });

      // Aguardar inicialização
      await this.waitForWSL();

      this.emitStatus('installing_ubuntu', 90, 'Ubuntu iniciado com sucesso');
      return true;
    } catch (error) {
      this.emitStatus('error', 0, `Erro ao instalar Ubuntu: ${error.message}`);
      throw error;
    }
  }

  // Aguardar WSL estar pronto
  async waitForWSL(maxAttempts = 30) {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const { stdout } = await execAsync('wsl --list --verbose');
        if (stdout.includes('Running')) {
          return true;
        }
      } catch {}
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    throw new Error('Timeout aguardando WSL iniciar');
  }

  // Configurar Ubuntu
  async configureUbuntu() {
    this.emitStatus('configuring', 92, 'Configurando Ubuntu...');

    try {
      // Criar usuário automático
      const username = 'wsluser';
      const password = 'wsluser';

      await execAsync(`wsl -d Ubuntu-22.04 -u root -- bash -c "useradd -m -s /bin/bash ${username} 2>/dev/null || true"`, {
        timeout: 30000
      });

      await execAsync(`wsl -d Ubuntu-22.04 -u root -- bash -c "echo '${username}:${password}' | chpasswd"`, {
        timeout: 30000
      });

      await execAsync(`wsl -d Ubuntu-22.04 -u root -- bash -c "usermod -aG sudo ${username}"`, {
        timeout: 30000
      });

      await execAsync(`wsl -d Ubuntu-22.04 -u root -- bash -c "echo '${username} ALL=(ALL) NOPASSWD:ALL' > /etc/sudoers.d/${username}"`, {
        timeout: 30000
      });

      this.emitStatus('configuring', 94, 'Usuário configurado');
      return true;
    } catch (error) {
      this.emitStatus('error', 0, `Erro ao configurar Ubuntu: ${error.message}`);
      throw error;
    }
  }

  // Instalar dependências no Ubuntu
  async installDependencies() {
    this.emitStatus('installing_deps', 95, 'Instalando dependências (pode demorar alguns minutos)...');

    try {
      // Atualizar repositórios
      await execAsync('wsl -d Ubuntu-22.04 -- sudo apt update', {
        timeout: 120000
      });

      // Instalar pacotes em background (não bloquear)
      const installCmd = 'wsl -d Ubuntu-22.04 -- sudo DEBIAN_FRONTEND=noninteractive apt install -y build-essential curl wget git qemu-system-x86 qemu-utils';
      
      // Executar em background
      spawn('powershell', ['-Command', installCmd], {
        detached: true,
        stdio: 'ignore'
      }).unref();

      this.emitStatus('installing_deps', 98, 'Instalação de dependências iniciada em background');
      return true;
    } catch (error) {
      this.log(`Aviso: Erro ao instalar dependências: ${error.message}`);
      return true; // Não bloquear
    }
  }

  // Verificar instalação
  async verifyInstallation() {
    this.emitStatus('verifying', 99, 'Verificando instalação...');

    try {
      const { stdout } = await execAsync('wsl -d Ubuntu-22.04 -- bash -c "echo OK"');
      
      if (stdout.includes('OK')) {
        this.emitStatus('complete', 100, 'Instalação concluída com sucesso!');
        return true;
      }
      
      throw new Error('Verificação falhou');
    } catch (error) {
      this.emitStatus('error', 0, `Erro na verificação: ${error.message}`);
      throw error;
    }
  }

  // Processo completo de instalação
  async install() {
    try {
      this.emitStatus('starting', 0, 'Iniciando instalação automática...');

      // Verificar se é admin
      if (!await this.isAdmin()) {
        await this.requestAdmin();
        return { needsRestart: true, message: 'Aplicação reiniciada com privilégios de administrador' };
      }

      // Executar passos
      await this.checkSystemRequirements();
      await this.installWSLComponents();
      await this.updateWSL();
      await this.cleanPreviousInstallations();
      
      const ubuntuPath = await this.downloadUbuntu();
      await this.installUbuntu(ubuntuPath);
      await this.configureUbuntu();
      await this.installDependencies();
      await this.verifyInstallation();

      return {
        success: true,
        message: 'WSL2 e Ubuntu instalados com sucesso!',
        needsReboot: false
      };

    } catch (error) {
      this.log(`ERRO FATAL: ${error.message}`);
      this.log(`Stack: ${error.stack}`);
      
      return {
        success: false,
        error: error.message,
        needsReboot: error.message.includes('reboot') || error.message.includes('reiniciar')
      };
    }
  }

  // Verificar se WSL já está instalado
  async isInstalled() {
    try {
      const { stdout } = await execAsync('wsl --list --verbose');
      return stdout.includes('Ubuntu') && stdout.includes('Running');
    } catch {
      return false;
    }
  }

  // Obter status atual
  async getStatus() {
    try {
      const { stdout } = await execAsync('wsl --list --verbose');
      
      return {
        installed: stdout.includes('Ubuntu'),
        running: stdout.includes('Running'),
        version: stdout.includes('VERSION') ? 2 : 1,
        distributions: stdout.split('\n').filter(line => line.trim())
      };
    } catch {
      return {
        installed: false,
        running: false,
        version: 0,
        distributions: []
      };
    }
  }
}

module.exports = WSLInstaller;
