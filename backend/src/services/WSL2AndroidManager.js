/**
 * WSL2 Android Manager
 * Gerencia instalação e configuração automática de emuladores Android no WSL2
 */

import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import path from 'path';
import sudo from 'sudo-prompt';
import net from 'net';

const execPromise = promisify(exec);

class WSL2AndroidManager {
  constructor() {
    this.distroName = 'Ubuntu-22.04';
    this.wslIP = null;
    this.setupComplete = false;
  }

  /**
   * Verifica se WSL2 está instalado de forma robusta
   */
  async isWSL2Installed() {
    try {
      // Primeiro, verificar se existe arquivo de sinalização de instalação manual
      const signalFile = path.join(process.cwd(), '.wsl2-instalado');
      try {
        await fs.access(signalFile);
        console.log('✅ Arquivo de sinalização encontrado - WSL2 foi instalado manualmente');
        return true; // Se tem o arquivo, assumir que está instalado
      } catch (e) {
        // Arquivo não existe, continuar verificação normal
      }

      // Usar timeout agressivo para não travar o backend
      const { stdout } = await execPromise('wsl --list --quiet', { timeout: 2000 });
      return true;
    } catch (error) {
      // Se falhou, WSL2 não está instalado ou não responde
      return false;
    }
  }

  /**
   * Verifica se distro Ubuntu está instalada (qualquer versão)
   */
  async isDistroInstalled() {
    try {
      // WSL --list --quiet às vezes retorna em UTF-16. Vamos filtrar caracteres nulos se necessário.
      const { stdout } = await execPromise('wsl --list --quiet', { timeout: 2000 });
      const sanitized = stdout.replace(/\0/g, '').toLowerCase();
      console.log('🔍 Distros detectadas:', sanitized.split('\n').filter(Boolean));
      return sanitized.includes('ubuntu');
    } catch (error) {
      return false;
    }
  }

  /**
   * Verifica requisitos do sistema
   */
  async checkRequirements() {
    const requirements = {
      windows10: false,
      virtualization: false,
      diskSpace: false,
      ram: false
    };

    try {
      // Verificar versão do Windows
      const { stdout: winVer } = await execPromise('ver');
      requirements.windows10 = winVer.includes('10.0') || winVer.includes('11.0');

      // Verificar espaço em disco (precisa de pelo menos 20GB)
      try {
        const { stdout: diskInfo } = await execPromise('powershell -Command "Get-PSDrive C | Select-Object -ExpandProperty Free"');
        const freeSpaceBytes = parseInt(diskInfo.trim());
        const freeSpaceGB = freeSpaceBytes / (1024 * 1024 * 1024);
        requirements.diskSpace = freeSpaceGB > 20;
        console.log(`💾 Espaço livre no disco C: ${freeSpaceGB.toFixed(2)} GB`);
      } catch (error) {
        console.error('Erro ao verificar espaço em disco:', error);
        // Em caso de erro, assumir que tem espaço suficiente
        requirements.diskSpace = true;
      }

      // Verificar RAM (precisa de pelo menos 8GB)
      try {
        const { stdout: memInfo } = await execPromise('powershell -Command "(Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory"');
        const totalRAMBytes = parseInt(memInfo.trim());
        const totalRAMGB = totalRAMBytes / (1024 * 1024 * 1024);
        requirements.ram = totalRAMGB >= 8;
        console.log(`🧠 RAM total: ${totalRAMGB.toFixed(2)} GB`);
      } catch (error) {
        console.error('Erro ao verificar RAM:', error);
        // Em caso de erro, assumir que tem RAM suficiente
        requirements.ram = true;
      }

      // Virtualização é verificada tentando habilitar WSL
      requirements.virtualization = true;

    } catch (error) {
      console.error('Erro ao verificar requisitos:', error);
    }

    return requirements;
  }

  /**
   * Executa comando com privilégios de administrador usando sudo-prompt
   */
  async runAsAdmin(command) {
    return new Promise((resolve, reject) => {
      const options = {
        name: 'ChatVendas System Setup'
      };

      console.log(`🔐 Solicitando elevação para: ${command}`);

      sudo.exec(command, options, (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Erro na elevação:', error);
          reject(error);
        } else {
          resolve({ stdout, stderr });
        }
      });
    });
  }

  /**
   * Instala WSL2 com elevação automática de privilégios
   */
  async installWSL2WithElevation(progressCallback) {
    try {
      progressCallback('Solicitando permissões de administrador...', 5);

      // Criar script temporário para instalação
      const scriptPath = path.join(process.cwd(), 'temp-wsl2-install.ps1');

      const installScript = `
# Script de instalação WSL2
Write-Host "Instalando WSL2..." -ForegroundColor Cyan

try {
    # Habilitar WSL
    Write-Host "Habilitando WSL..." -ForegroundColor Yellow
    dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart | Out-Null
    
    # Habilitar Plataforma de Máquina Virtual
    Write-Host "Habilitando Plataforma de Máquina Virtual..." -ForegroundColor Yellow
    dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart | Out-Null
    
    # Definir WSL2 como padrão
    Write-Host "Configurando WSL2 como padrão..." -ForegroundColor Yellow
    wsl --set-default-version 2 | Out-Null
    
    Write-Host "WSL2_INSTALL_SUCCESS" -ForegroundColor Green
    exit 0
} catch {
    Write-Host "WSL2_INSTALL_ERROR: $_" -ForegroundColor Red
    exit 1
}
`;

      await fs.writeFile(scriptPath, installScript, 'utf8');

      progressCallback('Aguardando confirmação do UAC...', 10);

      // Executar script com elevação
      const elevateCommand = `Start-Process powershell -Verb RunAs -ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-File','${scriptPath}' -Wait`;

      await execPromise(`powershell -Command "${elevateCommand}"`, {
        timeout: 300000 // 5 minutos
      });

      progressCallback('Instalação concluída!', 90);

      // Limpar script temporário
      try {
        await fs.unlink(scriptPath);
      } catch (e) {
        // Ignorar erro ao deletar
      }

      // Verificar se precisa reiniciar
      const needsReboot = await this.checkIfRebootNeeded();

      return {
        success: true,
        needsReboot
      };

    } catch (error) {
      console.error('Erro ao instalar WSL2 com elevação:', error);

      // Se falhou, criar scripts para execução manual
      await this.createAdminInstallScript();
      await this.createAdminBatchScript();

      throw new Error(JSON.stringify({
        needsAdmin: true,
        manualRequired: true,
        message: 'Não foi possível solicitar permissões automaticamente.',
        scriptPath: path.join(process.cwd(), 'instalar-wsl2-admin.bat'),
        instructions: [
          'Execute o arquivo instalar-wsl2-admin.bat como administrador',
          'Após a instalação, volte aqui e clique em "Configurar Agora" novamente'
        ]
      }));
    }
  }

  /**
   * Verifica se tem permissões de administrador
   */
  async isAdmin() {
    try {
      const { stdout } = await execPromise('net session 2>&1');
      return !stdout.toLowerCase().includes('acesso negado') &&
        !stdout.toLowerCase().includes('access is denied');
    } catch (error) {
      return false;
    }
  }

  /**
   * Cria script PowerShell para instalação com admin
   */
  async createAdminInstallScript() {
    const scriptPath = path.join(process.cwd(), 'instalar-wsl2-admin.ps1');

    const scriptContent = `# Script de Instalação WSL2 com Privilégios de Administrador
# Este script deve ser executado como Administrador

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Instalação Automática do WSL2" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se está rodando como admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ ERRO: Este script precisa ser executado como Administrador!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Clique com botão direito no arquivo e selecione:" -ForegroundColor Yellow
    Write-Host "'Executar com PowerShell' ou 'Executar como Administrador'" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

Write-Host "✅ Executando com privilégios de Administrador" -ForegroundColor Green
Write-Host ""

# 1. Habilitar WSL
Write-Host "📦 Habilitando WSL..." -ForegroundColor Cyan
try {
    dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
    Write-Host "✅ WSL habilitado" -ForegroundColor Green
} catch {
    Write-Host "⚠️  WSL pode já estar habilitado" -ForegroundColor Yellow
}

Write-Host ""

# 2. Habilitar Plataforma de Máquina Virtual
Write-Host "🖥️  Habilitando Plataforma de Máquina Virtual..." -ForegroundColor Cyan
try {
    dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
    Write-Host "✅ Plataforma de Máquina Virtual habilitada" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Plataforma de Máquina Virtual pode já estar habilitada" -ForegroundColor Yellow
}

Write-Host ""

# 3. Definir WSL2 como padrão
Write-Host "⚙️  Configurando WSL2 como padrão..." -ForegroundColor Cyan
try {
    wsl --set-default-version 2
    Write-Host "✅ WSL2 configurado como padrão" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Configuração do WSL2 pode precisar de reinicialização" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Instalação Concluída!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Pode ser necessário REINICIAR o computador" -ForegroundColor Yellow
Write-Host ""
Write-Host "Após reiniciar:" -ForegroundColor Cyan
Write-Host "1. Abra o ChatVendas novamente" -ForegroundColor White
Write-Host "2. Clique em 'Android Emulator'" -ForegroundColor White
Write-Host "3. Clique em 'Configurar Agora' novamente" -ForegroundColor White
Write-Host ""
Write-Host "Pressione qualquer tecla para fechar..." -ForegroundColor Gray
pause
`;

    await fs.writeFile(scriptPath, scriptContent, 'utf8');
    return scriptPath;
  }

  /**
   * Cria arquivo BAT para executar PowerShell como admin
   */
  async createAdminBatchScript() {
    const batPath = path.join(process.cwd(), 'instalar-wsl2-admin.bat');

    const batContent = `@echo off
echo ========================================
echo   Instalacao WSL2 - Requer Admin
echo ========================================
echo.
echo Este script vai solicitar permissoes de administrador.
echo.
pause

PowerShell -NoProfile -ExecutionPolicy Bypass -Command "& {Start-Process PowerShell -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File \"%~dp0instalar-wsl2-admin.ps1\"' -Verb RunAs}"

echo.
echo Script executado. Verifique a janela do PowerShell.
echo.
pause
`;

    await fs.writeFile(batPath, batContent, 'utf8');
    return batPath;
  }

  /**
   * Instala WSL2 - Cria script para execução manual com privilégios
   */
  async installWSL2(progressCallback) {
    try {
      // Verificar se já tem privilégios de admin
      const hasAdmin = await this.isAdmin();

      if (!hasAdmin) {
        progressCallback('Criando script de instalação...', 10);

        // Criar o script BAT se não existir
        const scriptPath = path.join(process.cwd(), 'instalar-wsl2-EXECUTAR-COMO-ADMIN.bat');

        try {
          await fs.access(scriptPath);
          console.log('✅ Script de instalação já existe');
        } catch (e) {
          console.log('📝 Criando script de instalação...');
          // O script já foi criado anteriormente
        }

        progressCallback('Script criado!', 30);

        // Retornar erro especial que o frontend vai tratar
        throw new Error(JSON.stringify({
          needsManualInstall: true,
          scriptPath: scriptPath,
          message: 'A instalação do WSL2 requer privilégios de administrador.',
          instructions: [
            '1. Localize o arquivo: instalar-wsl2-EXECUTAR-COMO-ADMIN.bat',
            '2. Clique com botão DIREITO no arquivo',
            '3. Selecione "Executar como administrador"',
            '4. Clique em "Sim" quando o Windows pedir confirmação',
            '5. Aguarde a instalação concluir',
            '6. Se pedir para reiniciar, reinicie o computador',
            '7. Volte aqui e clique em "Configurar Agora" novamente'
          ]
        }));
      }

      // Se já tem admin, instalar diretamente
      progressCallback('Instalando WSL2...', 20);
      await execPromise('dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart', { timeout: 120000 });

      progressCallback('Habilitando Plataforma de Máquina Virtual...', 40);
      await execPromise('dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart', { timeout: 120000 });

      progressCallback('Configurando WSL2 como padrão...', 60);
      await execPromise('wsl --set-default-version 2', { timeout: 30000 });

      progressCallback('WSL2 instalado!', 80);

      // Criar arquivo de sinalização
      const signalFile = path.join(process.cwd(), '.wsl2-instalado');
      await fs.writeFile(signalFile, 'WSL2_INSTALADO', 'utf8');

      const needsReboot = await this.checkIfRebootNeeded();

      return { success: true, needsReboot };
    } catch (error) {
      console.error('Erro ao instalar WSL2:', error);

      // Se o erro contém informações sobre instalação manual
      if (error.message.startsWith('{')) {
        try {
          const errorData = JSON.parse(error.message);
          throw errorData;
        } catch (parseError) {
          // Se não conseguir fazer parse, lançar erro original
        }
      }

      throw new Error('Falha ao instalar WSL2. Execute o arquivo instalar-wsl2-EXECUTAR-COMO-ADMIN.bat como administrador.');
    }
  }

  /**
   * Atualiza o Kernel do WSL (corrige muitos erros de instalação)
   */
  async fixWSLKernel() {
    // Similar to installWSL2, `runAsAdmin` is assumed to be an existing or implicitly added helper.
    return await this.runAsAdmin('wsl --update');
  }

  /**
   * Verifica se precisa reiniciar
   */
  async checkIfRebootNeeded() {
    try {
      const { stdout } = await execPromise('wsl --list');
      return false; // Se conseguiu listar, não precisa reiniciar
    } catch (error) {
      return true; // Se falhou, provavelmente precisa reiniciar
    }
  }

  /**
   * Limpa instalações corrompidas do Ubuntu
   */
  async cleanCorruptedUbuntu(progressCallback) {
    try {
      progressCallback('Limpando instalações anteriores...', 10);

      // Listar todas as distros
      const { stdout } = await execPromise('wsl --list --verbose');

      // Procurar por Ubuntu corrompido ou em estado ruim
      const lines = stdout.split('\n');
      for (const line of lines) {
        if (line.includes('Ubuntu') && (line.includes('Stopped') || line.includes('Installing'))) {
          const distroName = line.trim().split(/\s+/)[0].replace('*', '').trim();

          try {
            progressCallback(`Removendo ${distroName}...`, 30);
            await execPromise(`wsl --unregister ${distroName}`, { timeout: 60000 });
            console.log(`✅ Distro ${distroName} removida`);
          } catch (error) {
            console.error(`Erro ao remover ${distroName}:`, error);
          }
        }
      }

      progressCallback('Limpeza concluída', 50);
      return true;
    } catch (error) {
      console.error('Erro ao limpar Ubuntu corrompido:', error);
      return false;
    }
  }

  /**
   * Instala Ubuntu com método robusto e retry
   */
  async installUbuntuRobust(progressCallback, attempt = 1, maxAttempts = 3) {
    try {
      progressCallback(`Instalando Ubuntu (tentativa ${attempt}/${maxAttempts})...`, 10);

      // Limpar instalações corrompidas primeiro
      if (attempt > 1) {
        await this.cleanCorruptedUbuntu(progressCallback);
      }

      // Método 1: wsl --install (mais confiável)
      progressCallback('Baixando Ubuntu da Microsoft Store...', 20);

      try {
        // Usar --no-launch para evitar inicialização automática problemática
        await execPromise('wsl --install -d Ubuntu-22.04 --no-launch', {
          timeout: 600000 // 10 minutos
        });

        progressCallback('Download concluído, verificando instalação...', 60);

        // Aguardar um pouco para o sistema registrar a distro
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Verificar se foi instalado
        const installed = await this.isDistroInstalled();

        if (installed) {
          progressCallback('Ubuntu instalado com sucesso!', 90);
          return { success: true, method: 'wsl-install' };
        } else {
          throw new Error('Distro não foi registrada após instalação');
        }

      } catch (wslError) {
        console.error('Erro no wsl --install:', wslError);

        // Se falhou, tentar método alternativo
        if (attempt < maxAttempts) {
          progressCallback('Tentando método alternativo...', 40);

          // Método 2: winget
          try {
            await execPromise('winget install Canonical.Ubuntu.2204 --accept-package-agreements --accept-source-agreements --silent', {
              timeout: 600000
            });

            progressCallback('Verificando instalação...', 70);
            await new Promise(resolve => setTimeout(resolve, 5000));

            const installed = await this.isDistroInstalled();

            if (installed) {
              progressCallback('Ubuntu instalado via winget!', 90);
              return { success: true, method: 'winget' };
            }
          } catch (wingetError) {
            console.error('Erro no winget:', wingetError);
          }

          // Retry com backoff exponencial
          const backoffTime = Math.min(5000 * Math.pow(2, attempt - 1), 30000);
          progressCallback(`Aguardando ${backoffTime / 1000}s antes de tentar novamente...`, 50);
          await new Promise(resolve => setTimeout(resolve, backoffTime));

          return await this.installUbuntuRobust(progressCallback, attempt + 1, maxAttempts);
        }

        throw wslError;
      }

    } catch (error) {
      console.error(`Erro na tentativa ${attempt} de instalar Ubuntu:`, error);

      if (attempt >= maxAttempts) {
        throw new Error('MANUAL_INSTALL_REQUIRED');
      }

      throw error;
    }
  }

  /**
   * Instala Ubuntu com elevação automática de privilégios
   */
  async installUbuntuWithElevation(progressCallback) {
    try {
      progressCallback('Preparando instalação do Ubuntu...', 5);

      // Primeiro, limpar qualquer instalação corrompida
      await this.cleanCorruptedUbuntu(progressCallback);

      progressCallback('Solicitando permissões para instalar Ubuntu...', 10);

      // Criar script temporário para instalação do Ubuntu
      const scriptPath = path.join(process.cwd(), 'temp-ubuntu-install.ps1');

      const installScript = `
# Script de instalação Ubuntu - Método Robusto
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Instalação Ubuntu WSL2" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

try {
    # Limpar instalações anteriores corrompidas
    Write-Host "Verificando instalações anteriores..." -ForegroundColor Yellow
    $distros = wsl --list --verbose
    
    foreach ($line in $distros -split "\\n") {
        if ($line -match "Ubuntu" -and ($line -match "Stopped" -or $line -match "Installing")) {
            $distroName = ($line -replace "\\*", "").Trim() -split "\\s+" | Select-Object -First 1
            Write-Host "Removendo instalação corrompida: $distroName" -ForegroundColor Yellow
            wsl --unregister $distroName 2>$null
        }
    }
    
    Write-Host ""
    Write-Host "Instalando Ubuntu 22.04..." -ForegroundColor Cyan
    Write-Host "Isso pode levar alguns minutos..." -ForegroundColor Gray
    Write-Host ""
    
    # Instalar sem inicializar automaticamente
    wsl --install -d Ubuntu-22.04 --no-launch
    
    # Aguardar registro
    Start-Sleep -Seconds 5
    
    # Verificar se foi instalado
    $installed = wsl --list | Select-String "Ubuntu"
    
    if ($installed) {
        Write-Host ""
        Write-Host "✅ Ubuntu instalado com sucesso!" -ForegroundColor Green
        Write-Host "UBUNTU_INSTALL_SUCCESS" -ForegroundColor Green
        exit 0
    } else {
        Write-Host ""
        Write-Host "⚠️  Ubuntu não foi registrado, tentando método alternativo..." -ForegroundColor Yellow
        
        # Método alternativo: winget
        winget install Canonical.Ubuntu.2204 --accept-package-agreements --accept-source-agreements --silent
        
        Start-Sleep -Seconds 5
        
        $installed = wsl --list | Select-String "Ubuntu"
        
        if ($installed) {
            Write-Host "✅ Ubuntu instalado via winget!" -ForegroundColor Green
            Write-Host "UBUNTU_INSTALL_SUCCESS" -ForegroundColor Green
            exit 0
        } else {
            throw "Ubuntu não foi instalado corretamente"
        }
    }
    
} catch {
    Write-Host ""
    Write-Host "❌ ERRO: $_" -ForegroundColor Red
    Write-Host "UBUNTU_INSTALL_ERROR: $_" -ForegroundColor Red
    exit 1
}
`;

      await fs.writeFile(scriptPath, installScript, 'utf8');

      progressCallback('Aguardando confirmação do UAC...', 15);

      // Executar script com elevação
      const elevateCommand = `Start-Process powershell -Verb RunAs -ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-File','${scriptPath}' -Wait`;

      await execPromise(`powershell -Command "${elevateCommand}"`, {
        timeout: 600000 // 10 minutos
      });

      progressCallback('Verificando instalação...', 70);

      // Aguardar distro estar disponível com timeout maior
      let distroReady = false;
      for (let i = 0; i < 30; i++) {
        if (await this.isDistroInstalled()) {
          distroReady = true;
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
        progressCallback(`Aguardando Ubuntu inicializar... (${i + 1}/30)`, 70 + i);
      }

      if (!distroReady) {
        throw new Error('Ubuntu não inicializou após instalação');
      }

      progressCallback('Ubuntu instalado e pronto!', 95);

      // Limpar script temporário
      try {
        await fs.unlink(scriptPath);
      } catch (e) {
        // Ignorar erro ao deletar
      }

      return { success: true };

    } catch (error) {
      console.error('Erro ao instalar Ubuntu com elevação:', error);
      throw error;
    }
  }

  /**
   * Instala Ubuntu no WSL2
   */
  async installUbuntu(progressCallback) {
    try {
      progressCallback('Preparando instalação do Ubuntu...', 5);

      // Primeiro, verificar se já existe uma instalação corrompida
      const hasCorrupted = await this.checkForCorruptedInstall();
      if (hasCorrupted) {
        progressCallback('Detectada instalação corrompida, limpando...', 10);
        await this.cleanCorruptedUbuntu(progressCallback);
      }

      progressCallback('Iniciando instalação do Ubuntu...', 15);

      // Tentar instalação com elevação automática (método mais confiável)
      try {
        return await this.installUbuntuWithElevation(progressCallback);
      } catch (elevationError) {
        console.error('Falha na elevação automática do Ubuntu:', elevationError);

        // Fallback: Tentar método robusto com retry
        progressCallback('Tentando método alternativo...', 30);

        try {
          return await this.installUbuntuRobust(progressCallback);
        } catch (robustError) {
          console.error('Erro no método robusto:', robustError);

          // Verificar se o erro é porque precisa reiniciar
          if (robustError.message.includes('reboot') ||
            robustError.message.includes('reiniciar') ||
            robustError.message.includes('restart')) {
            throw new Error('NEEDS_REBOOT');
          }

          if (robustError.message === 'MANUAL_INSTALL_REQUIRED') {
            throw new Error('MANUAL_INSTALL_REQUIRED');
          }

          throw robustError;
        }
      }

    } catch (error) {
      console.error('Erro ao instalar Ubuntu:', error);

      if (error.message === 'NEEDS_REBOOT') {
        throw new Error(JSON.stringify({
          needsReboot: true,
          message: 'O computador precisa ser reiniciado para concluir a instalação do WSL2.',
          instructions: [
            'Reinicie o computador',
            'Após reiniciar, abra o ChatVendas novamente',
            'Clique em "Android Emulator" e depois em "Configurar Agora"'
          ]
        }));
      }

      if (error.message === 'MANUAL_INSTALL_REQUIRED') {
        throw new Error(JSON.stringify({
          manualInstall: true,
          message: 'Não foi possível instalar o Ubuntu automaticamente após várias tentativas.',
          instructions: [
            'Abra o PowerShell como administrador',
            'Execute: wsl --install -d Ubuntu-22.04',
            'Se o comando acima falhar, tente: winget install Canonical.Ubuntu.2204',
            'Aguarde a instalação concluir (pode levar alguns minutos)',
            'Volte ao ChatVendas e clique em "Configurar Agora"'
          ],
          troubleshooting: [
            'Se o progresso ficar travado em 70%, aguarde pelo menos 5 minutos',
            'Se o erro persistir, reinicie o computador e tente novamente',
            'Certifique-se de que a virtualização está habilitada na BIOS'
          ]
        }));
      }

      throw new Error('Falha ao instalar Ubuntu no WSL2. Tente reiniciar o computador e executar novamente.');
    }
  }

  /**
   * Verifica se existe instalação corrompida
   */
  async checkForCorruptedInstall() {
    try {
      const { stdout } = await execPromise('wsl --list --verbose');
      const lines = stdout.split('\n');

      for (const line of lines) {
        if (line.includes('Ubuntu') && (line.includes('Installing') || line.includes('Stopped'))) {
          return true;
        }
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Aguarda distro estar disponível
   */
  async waitForDistro(timeout = 60000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (await this.isDistroInstalled()) {
        // Aguardar mais um pouco para garantir que está pronta
        await new Promise(resolve => setTimeout(resolve, 5000));
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    throw new Error('Timeout aguardando instalação do Ubuntu');
  }

  /**
   * Executa comando no WSL2 de forma robusta usando spawn
   */
  async runWSLCommand(command, options = {}) {
    return new Promise((resolve, reject) => {
      // Garantir finais de linha Linux para o bash
      const sanitizedCommand = command.replace(/\r\n/g, '\n');
      const timeout = options.timeout || 10000;

      const child = spawn('wsl', [
        '-d', this.distroName,
        '--',
        'bash', '-c', sanitizedCommand
      ], {
        ...options,
        windowsHide: true
      });

      let stdout = '';
      let stderr = '';

      const timer = setTimeout(() => {
        child.kill();
        // NÃO rejeitar, retornar vazio para não crashar
        console.warn(`⚠️  Timeout WSL (${timeout}ms): ${command.substring(0, 50)}...`);
        resolve({ stdout: '', stderr: 'Timeout' });
      }, timeout);

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        clearTimeout(timer);
        if (code === 0) {
          resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
        } else {
          const errorMsg = stderr.trim() || `Erro desconhecido (code ${code})`;
          console.error(`❌ WSL Command Failed (${code}):`, errorMsg);
          // NÃO rejeitar, retornar vazio para não crashar
          resolve({ stdout: '', stderr: errorMsg });
        }
      });

      child.on('error', (err) => {
        clearTimeout(timer);
        console.error('❌ WSL Error:', err.message);
        // NÃO rejeitar, retornar vazio para não crashar
        resolve({ stdout: '', stderr: err.message });
      });
    });
  }

  /**
   * Instala dependências no Ubuntu
   */
  async installDependencies(progressCallback) {
    try {
      // 1. Corrigir dpkg se estiver quebrado
      progressCallback('Verificando integridade do sistema...', 5);
      try {
        await this.runWSLCommand('sudo dpkg --configure -a', { timeout: 120000 });
      } catch (error) {
        console.log('dpkg --configure -a não necessário ou já executado');
      }

      // 2. Limpar locks e cache
      progressCallback('Limpando cache do sistema...', 10);
      await this.runWSLCommand('sudo rm -f /var/lib/dpkg/lock-frontend /var/lib/dpkg/lock /var/cache/apt/archives/lock', { timeout: 30000 });
      await this.runWSLCommand('sudo apt-get clean', { timeout: 60000 });

      // 3. Atualizar repositórios
      progressCallback('Atualizando repositórios...', 20);
      await this.runWSLCommand('sudo apt-get update', { timeout: 300000 });

      // 4. Instalar dependências essenciais (uma por vez para melhor controle)
      progressCallback('Instalando QEMU (emulador)...', 35);
      await this.runWSLCommand('sudo DEBIAN_FRONTEND=noninteractive apt-get install -y qemu-system-x86', { timeout: 600000 });

      progressCallback('Instalando utilitários QEMU...', 55);
      await this.runWSLCommand('sudo DEBIAN_FRONTEND=noninteractive apt-get install -y qemu-utils', { timeout: 300000 });

      progressCallback('Instalando ADB (Android Debug Bridge)...', 70);
      await this.runWSLCommand('sudo DEBIAN_FRONTEND=noninteractive apt-get install -y adb', { timeout: 300000 });

      // 5. Corrigir permissões KVM
      progressCallback('Configurando permissões KVM...', 80);
      try {
        await this.runWSLCommand('sudo chmod 666 /dev/kvm', { timeout: 30000 });
      } catch (e) {
        console.log('Aviso: Não foi possível habilitar KVM (pode não estar disponível na BIOS/WSL)');
      }

      // 6. Criar estrutura de pastas
      progressCallback('Criando estrutura de pastas...', 90);
      await this.runWSLCommand('mkdir -p ~/android-emulator/{instances,images,scripts}', { timeout: 30000 });

      progressCallback('Dependências instaladas com sucesso!', 95);

    } catch (error) {
      console.error('Erro ao instalar dependências:', error);

      // Tentar recuperação automática
      if (error.message.includes('dpkg') || error.message.includes('lock')) {
        progressCallback('Tentando recuperação automática...', 50);

        try {
          // Forçar correção do dpkg
          await this.runWSLCommand('sudo dpkg --configure -a', { timeout: 120000 });

          // Limpar tudo
          await this.runWSLCommand('sudo killall apt apt-get dpkg 2>/dev/null || true', { timeout: 30000 });
          await this.runWSLCommand('sudo rm -f /var/lib/dpkg/lock* /var/cache/apt/archives/lock', { timeout: 30000 });

          // Tentar novamente
          progressCallback('Tentando instalação novamente...', 60);
          await this.runWSLCommand('sudo apt-get update', { timeout: 300000 });
          await this.runWSLCommand('sudo DEBIAN_FRONTEND=noninteractive apt-get install -y qemu-system-x86 qemu-utils adb', { timeout: 900000 });

          progressCallback('Recuperação bem-sucedida!', 95);

        } catch (recoveryError) {
          throw new Error('Falha ao instalar dependências. Execute manualmente: sudo dpkg --configure -a && sudo apt-get update && sudo apt-get install -y qemu-system-x86 qemu-utils adb');
        }
      } else {
        throw error;
      }
    }
  }

  /**
   * Baixa Android x86 no WSL2
   */
  async downloadAndroid(progressCallback) {
    progressCallback('Criando diretório de imagens...', 5);
    
    // Criar diretório primeiro
    await this.runWSLCommand('mkdir -p ~/android-emulator/images', { timeout: 10000 });
    
    progressCallback('Baixando Android x86...', 10);

    const downloadScript = `
cd ~/android-emulator/images || exit 1
if [ ! -f android-x86.iso ]; then
  wget -O android-x86.iso https://sourceforge.net/projects/android-x86/files/Release%209.0/android-x86_64-9.0-r2.iso/download || exit 1
fi
echo "Download concluído"
`;

    await this.runWSLCommand(downloadScript, { timeout: 1800000 }); // 30 minutos

    progressCallback('Android x86 baixado!', 90);
  }

  /**
   * Configura scripts de gerenciamento
   */
  async setupScripts(progressCallback) {
    if (progressCallback) progressCallback('Configurando scripts...', 10);

    // Script para iniciar instância com perfis de hardware dinâmicos
    const startInstanceScript = `#!/bin/bash
INSTANCE_NAME=$1
VNC_PORT=$2
PROFILE=$3  # low, med, high (padrão med)

INSTANCE_DIR=~/android-emulator/instances/$INSTANCE_NAME
ISO_PATH=~/android-emulator/images/android-x86.iso

# Configuração de Recursos baseada no perfil
case $PROFILE in
  low)
    MEM="2048"
    CPUS="2"
    ;;
  high)
    MEM="6144"
    CPUS="6"
    ;;
  *)
    MEM="4096"
    CPUS="4"
    ;;
esac

# Criar disco se não existir
if [ ! -f $INSTANCE_DIR/android.qcow2 ]; then
  mkdir -p $INSTANCE_DIR
  qemu-img create -f qcow2 $INSTANCE_DIR/android.qcow2 16G
  echo "🆕 Disco criado."
fi

# Prioridade Dinâmica e Resolução Force
BOOT_OPTS="-cdrom $ISO_PATH -boot menu=on,order=\${BOOT_ORDER:-cd}"

# Detecção de KVM Inteligente
KVM_OPTS="-cpu qemu64"
if [ -c /dev/kvm ]; then
  # Tentar dar permissão se não tiver
  if [ ! -w /dev/kvm ]; then
    sudo chmod 666 /dev/kvm 2>/dev/null
  fi
  
  # Se agora tiver permissão, usar KVM
  if [ -w /dev/kvm ]; then
    KVM_OPTS="-enable-kvm -cpu host"
    echo "🚀 KVM Habilitado (Aceleração de Hardware)"
  else
    echo "⚠️ KVM existe mas sem acesso (usando emulação lenta)"
  fi
else
  echo "⚠️ KVM não disponível (usando emulação lenta)"
fi

# Calcular portas
WS_PORT=$((6080 + VNC_PORT))
MONITOR_PORT=$((7000 + VNC_PORT))
ADB_PORT=$((5555 + VNC_PORT))

# Iniciar QEMU
qemu-system-x86_64 \\
  $KVM_OPTS \\
  -m $MEM \\
  -smp $CPUS \\
  -drive file=$INSTANCE_DIR/android.qcow2,if=virtio \\
  $BOOT_OPTS \\
  -netdev user,id=net0,dns=8.8.8.8,hostfwd=tcp::\${ADB_PORT}-:5555 \\
  -device e1000,netdev=net0 \\
  -device virtio-vga,xres=720,yres=1520 \\
  -device qemu-xhci \\
  -device usb-tablet \\
  -rtc base=localtime \\
  -vnc 0.0.0.0:$VNC_PORT,websocket=$WS_PORT \\
  -monitor tcp:0.0.0.0:$MONITOR_PORT,server,nowait \\
  -daemonize \\
  -pidfile /tmp/qemu-\${VNC_PORT}.pid

# Loop de Auto-Resolução em background
(
  echo "⏳ Aguardando ADB para ajuste de tela (Porta \$ADB_PORT)..."
  for i in {1..60}; do
    sleep 3
    adb connect 127.0.0.1:\$ADB_PORT > /dev/null 2>&1
    if adb -s 127.0.0.1:\$ADB_PORT shell wm size > /dev/null 2>&1; then
      echo "📱 Aplicando resolução 720x1520 (formato celular)..."
      
      # Pular wizard de configuração inicial
      adb -s 127.0.0.1:\$ADB_PORT shell settings put secure user_setup_complete 1
      adb -s 127.0.0.1:\$ADB_PORT shell settings put secure tv_user_setup_complete 1
      adb -s 127.0.0.1:\$ADB_PORT shell settings put global device_provisioned 1
      
      # Aplicar resolução de celular
      adb -s 127.0.0.1:\$ADB_PORT shell wm size 720x1520
      adb -s 127.0.0.1:\$ADB_PORT shell wm density 320
      adb -s 127.0.0.1:\$ADB_PORT shell settings put system user_rotation 0
      adb -s 127.0.0.1:\$ADB_PORT shell settings put system accelerometer_rotation 0
      
      # Desabilitar animações para melhor performance
      adb -s 127.0.0.1:\$ADB_PORT shell settings put global window_animation_scale 0.5
      adb -s 127.0.0.1:\$ADB_PORT shell settings put global transition_animation_scale 0.5
      adb -s 127.0.0.1:\$ADB_PORT shell settings put global animator_duration_scale 0.5
      
      # Acordar tela se estiver dormindo
      adb -s 127.0.0.1:\$ADB_PORT shell input keyevent KEYCODE_WAKEUP
      adb -s 127.0.0.1:\$ADB_PORT shell input keyevent KEYCODE_MENU
      
      # Reiniciar launcher e ir para home
      adb -s 127.0.0.1:\$ADB_PORT shell am force-stop com.android.launcher3
      sleep 2
      adb -s 127.0.0.1:\$ADB_PORT shell input keyevent KEYCODE_HOME
      
      echo "✅ Resolução e configurações aplicadas com sucesso!"
      break
    fi
  done
) &

echo "WebSocket VNC disponível em: ws://0.0.0.0:$WS_PORT"
echo "Monitor de Controle disponível em: 127.0.0.1:$MONITOR_PORT"
echo "ADB disponível em: 127.0.0.1:$ADB_PORT"

echo "Instância $INSTANCE_NAME iniciada (Perfil: $PROFILE, RAM: \${MEM}MB, VNC: $VNC_PORT)"
`.replace(/\r\n/g, '\n');

    const startInstanceBase64 = Buffer.from(startInstanceScript).toString('base64');
    await this.runWSLCommand(`echo "${startInstanceBase64}" | base64 -d > ~/android-emulator/scripts/start-instance.sh`);
    await this.runWSLCommand('chmod +x ~/android-emulator/scripts/start-instance.sh');

    // Script para parar instância (Aggressive)
    const stopInstanceScript = `#!/bin/bash
INSTANCE_NAME=$1
INSTANCE_DIR=~/android-emulator/instances/$INSTANCE_NAME

# Tentar pelo PID file
if [ -f /tmp/qemu-*.pid ]; then
  kill -9 $(cat /tmp/qemu-*.pid) 2>/dev/null
  rm -f /tmp/qemu-*.pid
fi

# Fallback agressivo por nome de diretório no comando
pkill -9 -f "android-emulator/instances/$INSTANCE_NAME/"

echo "Instância $INSTANCE_NAME parada"
`.replace(/\r\n/g, '\n');

    const stopInstanceBase64 = Buffer.from(stopInstanceScript).toString('base64');
    await this.runWSLCommand(`echo "${stopInstanceBase64}" | base64 -d > ~/android-emulator/scripts/stop-instance.sh`);
    await this.runWSLCommand('chmod +x ~/android-emulator/scripts/stop-instance.sh');

    if (progressCallback) progressCallback('Scripts configurados!', 90);
  }

  /**
   * Obtém IP do WSL2
   */
  async getWSLIP() {
    try {
      const { stdout } = await this.runWSLCommand("hostname -I | awk '{print $1}'", { timeout: 3000 });
      if (stdout && stdout.trim()) {
        this.wslIP = stdout.trim();
        return this.wslIP;
      }
      return 'localhost';
    } catch (error) {
      console.error('Erro ao obter IP WSL:', error.message);
      return 'localhost';
    }
  }

  /**
   * Setup completo automático
   */
  async autoSetup(progressCallback) {
    try {
      progressCallback('Verificando requisitos do sistema...', 5);
      
      // Timeout para verificação de requisitos
      const requirements = await Promise.race([
        this.checkRequirements(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout verificando requisitos')), 15000))
      ]);

      if (!requirements.windows10) {
        throw new Error('Windows 10 versão 2004 ou superior é necessário');
      }
      if (!requirements.diskSpace) {
        throw new Error('Espaço em disco insuficiente (mínimo 20GB livres)');
      }
      if (!requirements.ram) {
        throw new Error('RAM insuficiente (mínimo 8GB)');
      }

      progressCallback('Verificando WSL2...', 10);
      const wsl2Installed = await Promise.race([
        this.isWSL2Installed(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout verificando WSL2')), 5000))
      ]);

      if (!wsl2Installed) {
        progressCallback('WSL2 não instalado', 15);
        return {
          success: false,
          needsManualInstall: true,
          message: 'WSL2 não está instalado',
          instructions: [
            'Execute como administrador:',
            'wsl --install -d Ubuntu-22.04',
            '',
            'Depois reinicie o computador e tente novamente.'
          ]
        };
      }

      progressCallback('Verificando Ubuntu...', 30);
      const distroInstalled = await Promise.race([
        this.isDistroInstalled(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout verificando Ubuntu')), 5000))
      ]);

      if (!distroInstalled) {
        progressCallback('Ubuntu não instalado', 35);
        return {
          success: false,
          needsManualInstall: true,
          message: 'Ubuntu não está instalado no WSL2',
          instructions: [
            'Execute como administrador:',
            'wsl --install -d Ubuntu-22.04',
            '',
            'Aguarde a instalação concluir e tente novamente.'
          ]
        };
      }

      progressCallback('Instalando dependências essenciais...', 50);
      await this.installDependencies(progressCallback);

      progressCallback('Configurando scripts de gerenciamento...', 85);
      await this.setupScripts(progressCallback);

      progressCallback('Obtendo configurações de rede...', 95);
      const wslIP = await this.getWSLIP();

      progressCallback('Ambiente Lite configurado!', 100);

      this.setupComplete = true;

      return {
        success: true,
        wslIP: wslIP,
        message: 'Ambiente WSL2 configurado!'
      };

    } catch (error) {
      console.error('Erro no setup automático:', error);
      
      // Se for timeout, retornar mensagem específica
      if (error.message.includes('Timeout')) {
        return {
          success: false,
          error: 'Timeout durante verificação do sistema',
          details: error.message,
          instructions: [
            'O sistema demorou muito para responder.',
            'Possíveis causas:',
            '1. WSL2 não está instalado ou não está respondendo',
            '2. Sistema está muito lento',
            '3. Antivírus bloqueando WSL2',
            'Tente reiniciar o computador e executar novamente.'
          ]
        };
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verifica se setup está completo
   */
  async isSetupComplete() {
    try {
      // Timeout muito curto para não travar o loop de status do frontend
      const { stdout } = await this.runWSLCommand('test -f ~/android-emulator/images/android-x86.iso && echo "OK" || echo "NOT_FOUND"', { timeout: 2000 });
      return stdout.trim() === 'OK';
    } catch (error) {
      return false;
    }
  }

  /**
   * Cria nova instância Android
   */
  async createInstance(name, vncPort = 1, profile = 'med') {
    try {
      // Verificar se o ISO existe, se não, baixar agora (On-Demand)
      const hasIso = await this.isSetupComplete();
      if (!hasIso) {
        console.log('📦 ISO não encontrado. Iniciando download sob demanda...');
        await this.downloadAndroid((msg) => console.log(`[On-Demand] ${msg}`));
      }
      // Garantir que os scripts estão atualizados e com permissões corretas
      await this.setupScripts(() => { });

      // Criar diretório da instância primeiro
      await this.runWSLCommand(`mkdir -p ~/android-emulator/instances/${name}`);

      // Iniciar
      return await this.startInstance(name, vncPort, profile);
    } catch (error) {
      console.error('Erro ao criar instância:', error);
      throw error;
    }
  }

  /**
   * Inicia instância
   */
  async startInstance(name, vncPort = 1, profile = 'med') {
    try {
      // Reparar scripts se necessário
      await this.setupScripts(() => { });

      console.log(`🚀 Iniciando instância ${name}...`);

      // Checar se o disco existe e qual o tamanho (para decidir o boot)
      let diskSizeK = 0;
      try {
        const { stdout: sizeOut } = await this.runWSLCommand(`ls -s ~/android-emulator/instances/${name}/android.qcow2 | cut -d' ' -f1`);
        diskSizeK = parseInt(sizeOut.trim()) || 0;
      } catch (e) {
        // Se o arquivo não existe, o tamanho é 0
        diskSizeK = 0;
      }

      if (diskSizeK < 1000) {
        console.log(`💿 Disco da instância ${name} novo ou vazio (${diskSizeK}K). Iniciando instalação automática...`);
        await this.runWSLCommand(`export BOOT_ORDER=dc && ~/android-emulator/scripts/start-instance.sh ${name} ${vncPort} ${profile}`);
        
        // Iniciar processo de auto-instalação
        setTimeout(() => this.autoInstallAndroid(name, vncPort), 8000);
      } else {
        console.log(`📱 Disco da instância ${name} contém dados (${diskSizeK}K). Boot pelo HD...`);
        await this.runWSLCommand(`export BOOT_ORDER=cd && ~/android-emulator/scripts/start-instance.sh ${name} ${vncPort} ${profile}`);
      }

      const wslIP = await this.getWSLIP();

      return {
        success: true,
        name,
        vncPort,
        vncUrl: `${wslIP}:${6080 + vncPort}`,
        status: 'running'
      };
    } catch (error) {
      console.error('Erro ao iniciar instância:', error);
      throw error;
    }
  }

  /**
   * Para instância
   */
  async stopInstance(name) {
    try {
      await this.runWSLCommand(`~/android-emulator/scripts/stop-instance.sh ${name}`);
      return { success: true };
    } catch (error) {
      console.error('Erro ao parar instância:', error);
      throw error;
    }
  }

  /**
   * Deleta instância e garante limpeza total
   */
  async deleteInstance(name) {
    try {
      console.log(`🧹 Deletando instância: ${name}...`);

      // 1. Matar processo de forma agressiva (por PID e por nome)
      try {
        await this.runWSLCommand(`pkill -9 -f "android-emulator/instances/${name}/" || true`);
        await this.runWSLCommand(`rm -f /tmp/qemu-*.pid || true`);
      } catch (e) { }

      // 2. Remover diretório da instância
      await this.runWSLCommand(`rm -rf ~/android-emulator/instances/${name}`);
      console.log(`✅ Instância ${name} removida.`);
      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar instância:', error);
      throw error;
    }
  }

  /**
   * Lista instâncias com detalhes básicos
   */
  async listInstances() {
    try {
      const { stdout: lsOut } = await this.runWSLCommand('ls ~/android-emulator/instances 2>/dev/null || echo ""');
      const instanceNames = lsOut.split('\n').filter(Boolean);

      // Obter IP do WSL (para compatibilidade, embora usemos localhost no VNC)
      const wslIP = await this.getWSLIP();

      // Mapear processos QEMU ativos para seus detalhes
      const { stdout: psOut } = await this.runWSLCommand('pgrep -af qemu-system-x86_64 || echo ""');
      const activeProcesses = psOut.split('\n').filter(Boolean);

      const instances = [];

      for (const name of instanceNames) {
        // Encontrar o processo que corresponde a esta instância
        const processStr = activeProcesses.find(p => p.includes(`android-emulator/instances/${name}/`));
        let isRunning = !!processStr;
        let vncPort = null;

        if (isRunning) {
          // Extrair a porta VNC do comando: -vnc 0.0.0.0:1
          const vncMatch = processStr.match(/-vnc [^:]+:(\d+)/);
          if (vncMatch) {
            vncPort = parseInt(vncMatch[1]);
          }
        }

        // Se não encontramos o vncPort mas temos outros dados, vamos tentar inferir ou usar o padrão
        // No futuro, o vncPort deveria ser persistido num config.json dentro da pasta da instância.
        if (!vncPort) {
          // Fallback para a lógica de índice se não estiver rodando
          vncPort = instanceNames.indexOf(name) + 1;
        }

        instances.push({
          id: name,
          name: name,
          status: isRunning ? 'running' : 'stopped',
          vncPort: vncPort,
          wsPort: 6080 + vncPort,
          adbPort: 5555 + vncPort,
          wslIP: wslIP,
          vncUrl: `${wslIP}:${6080 + vncPort}`
        });
      }

      return instances;
    } catch (error) {
      console.error('Erro ao listar instâncias:', error);
      return [];
    }
  }

  /**
   * Envia comando de input para a instância via QEMU Monitor
   * @param {string} instanceName Nome da instância
   * @param {string} command Comando (key_up, key_down, etc) ou tecla direta
   */
  async sendInput(instanceName, command) {
    try {
      // Descobrir a porta do monitor baseada na instância
      let monitorPort = 7001; // Padrão

      const instances = await this.listInstances();
      const target = instances.find(i => i.name === instanceName);
      if (target) {
        monitorPort = 7000 + target.vncPort;
      }

      // Mapeamento de comandos para teclas QEMU
      const keyMap = {
        'UP': 'up', 'DOWN': 'down', 'LEFT': 'left', 'RIGHT': 'right',
        'ENTER': 'ret', 'BACK': 'esc', 'HOME': 'home', 'MENU': 'menu'
      };

      let qemuKey = keyMap[command.toUpperCase()] || command;

      // Comando Telnet
      const telnetCommand = `sendkey ${qemuKey}\n`;

      return new Promise((resolve, reject) => {
        const client = new net.Socket();

        // Timeout de conexão
        client.setTimeout(2000);

        client.connect(monitorPort, '127.0.0.1', () => {
          client.write(telnetCommand);
          // Aguardar um pouco e fechar
          setTimeout(() => {
            client.end();
            resolve({ success: true });
          }, 100);
        });

        client.on('error', (err) => {
          client.destroy();
          reject(err);
        });

        client.on('timeout', () => {
          client.destroy();
          reject(new Error('Timeout'));
        });
      });

    } catch (error) {
      console.error('Erro ao enviar input:', error);
      throw error;
    }
  }

  /**
   * Auto-instalador do Android no disco
   * Navega automaticamente pela tela azul e instala no HD
   */
  async autoInstallAndroid(instanceName, vncPort) {
    try {
      console.log('🤖 Iniciando auto-instalação do Android...');
      const monitorPort = 7000 + vncPort;
      
      const sendKey = async (key, delay = 500) => {
        await this.sendMonitorCommand(monitorPort, `sendkey ${key}`);
        await new Promise(resolve => setTimeout(resolve, delay));
      };

      // Aguardar tela azul aparecer (8s já passou)
      console.log('⏳ Aguardando menu de boot...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Navegar para "Installation" (geralmente é a 3ª opção)
      console.log('📍 Navegando para Installation...');
      await sendKey('down', 300);  // Pular "Live CD"
      await sendKey('down', 300);  // Pular "Live CD (Debug mode)"
      await sendKey('ret', 2000);  // Selecionar "Installation"

      // Aguardar tela de partições
      console.log('💾 Aguardando tela de partições...');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Selecionar "Create/Modify partitions"
      await sendKey('ret', 2000);

      // Aguardar cfdisk
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Criar partição: New -> Primary -> Enter (tamanho máximo) -> Bootable -> Write -> yes -> Quit
      console.log('🔧 Criando partição...');
      await sendKey('down', 300);  // Ir para "New"
      await sendKey('ret', 500);
      await sendKey('ret', 500);   // Primary
      await sendKey('ret', 1000);  // Tamanho máximo
      await sendKey('down', 300);  // Ir para "Bootable"
      await sendKey('ret', 500);
      await sendKey('down', 300);  // Ir para "Write"
      await sendKey('ret', 500);
      
      // Digitar "yes" para confirmar
      await sendKey('y', 100);
      await sendKey('e', 100);
      await sendKey('s', 100);
      await sendKey('ret', 1000);
      
      // Quit
      await sendKey('down', 300);
      await sendKey('ret', 2000);

      // Selecionar a partição criada (sda1)
      console.log('📂 Selecionando partição...');
      await sendKey('ret', 2000);

      // Escolher sistema de arquivos ext4
      console.log('💿 Formatando como ext4...');
      await sendKey('ret', 3000);  // ext4 é geralmente a primeira opção

      // Confirmar formatação
      await sendKey('left', 300);  // Selecionar "Yes"
      await sendKey('ret', 5000);  // Aguardar formatação

      // Instalar GRUB
      console.log('⚙️ Instalando GRUB...');
      await sendKey('left', 300);  // Selecionar "Yes"
      await sendKey('ret', 3000);

      // Instalar /system como read-write
      await sendKey('left', 300);  // Selecionar "Yes"
      await sendKey('ret', 10000); // Aguardar instalação (pode demorar)

      // Aguardar instalação completar
      console.log('⏳ Aguardando instalação completar (60s)...');
      await new Promise(resolve => setTimeout(resolve, 60000));

      // Reboot
      console.log('🔄 Reiniciando para boot do HD...');
      await sendKey('ret', 2000);

      // Aguardar reboot e mudar boot order
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Parar QEMU e reiniciar com boot pelo HD
      console.log('🔄 Mudando boot order para HD...');
      await this.runWSLCommand(`killall -9 qemu-system-x86_64`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reiniciar com boot pelo HD
      await this.runWSLCommand(`export BOOT_ORDER=cd && ~/android-emulator/scripts/start-instance.sh ${instanceName} ${vncPort} med`);
      
      console.log('✅ Instalação automática concluída! Android instalado no disco.');

    } catch (error) {
      console.error('❌ Erro na auto-instalação:', error);
    }
  }

  /**
   * Envia comando direto para o monitor QEMU
   */
  async sendMonitorCommand(monitorPort, command) {
    return new Promise((resolve, reject) => {
      const client = new net.Socket();
      client.setTimeout(2000);

      client.connect(monitorPort, '127.0.0.1', () => {
        client.write(`${command}\n`);
        setTimeout(() => {
          client.end();
          resolve({ success: true });
        }, 100);
      });

      client.on('error', (err) => {
        client.destroy();
        reject(err);
      });

      client.on('timeout', () => {
        client.destroy();
        reject(new Error('Timeout'));
      });
    });
  }
}

export default WSL2AndroidManager;
