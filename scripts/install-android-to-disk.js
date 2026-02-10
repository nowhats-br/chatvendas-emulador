import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script para instalar Android no disco virtual automaticamente
 * Este é o CORAÇÃO do sistema - sem isso o Android nunca funciona!
 * 
 * Processo:
 * 1. Cria disco virtual vazio
 * 2. Inicia QEMU com ISO do Android
 * 3. Automatiza a instalação completa via comandos de teclado
 * 4. Instala Android no disco (particionamento, formatação, GRUB)
 * 5. Resultado: Disco pronto para boot direto
 */
class AndroidDiskInstaller {
  constructor(options = {}) {
    this.rootPath = process.cwd();
    this.baseDir = path.join(this.rootPath, 'backend', 'emulator-data');
    this.dependenciesDir = path.join(this.rootPath, 'backend', 'android-dependencies');
    this.binDir = path.join(this.dependenciesDir, 'bin');
    
    // Configurações
    this.instanceId = options.instanceId || `install-${Date.now()}`;
    this.isoPath = options.isoPath;
    this.diskPath = options.diskPath || path.join(this.baseDir, 'virtual-disks', `${this.instanceId}.qcow2`);
    this.diskSize = options.diskSize || 8; // GB
    this.memory = options.memory || 2048; // MB
    this.cpuCores = options.cpuCores || 2;
    
    // Caminhos dos executáveis
    this.setupPaths();
  }

  setupPaths() {
    const isWin = process.platform === 'win32';
    
    // QEMU
    const qemuSearchPaths = [
      this.binDir,
      path.join(this.dependenciesDir, 'qemu'),
      'C:\\Program Files\\qemu'
    ];
    
    for (const qemuPath of qemuSearchPaths) {
      const qemuExe = path.join(qemuPath, isWin ? 'qemu-system-x86_64.exe' : 'qemu-system-x86_64');
      const qemuImgExe = path.join(qemuPath, isWin ? 'qemu-img.exe' : 'qemu-img');
      
      try {
        if (require('fs').existsSync(qemuExe)) {
          this.qemuPath = qemuExe;
          this.qemuImgPath = qemuImgExe;
          console.log(`✅ QEMU encontrado: ${qemuPath}`);
          break;
        }
      } catch (e) {}
    }
    
    if (!this.qemuPath) {
      this.qemuPath = isWin ? 'qemu-system-x86_64.exe' : 'qemu-system-x86_64';
      this.qemuImgPath = isWin ? 'qemu-img.exe' : 'qemu-img';
    }
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📝',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      step: '🔧'
    }[level] || '📝';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async createBlankDisk() {
    this.log(`Criando disco virtual vazio (${this.diskSize}GB)...`, 'step');
    
    // Garantir que o diretório existe
    await fs.mkdir(path.dirname(this.diskPath), { recursive: true });
    
    return new Promise((resolve, reject) => {
      const args = [
        'create',
        '-f', 'qcow2',
        this.diskPath,
        `${this.diskSize}G`
      ];
      
      this.log(`Comando: ${this.qemuImgPath} ${args.join(' ')}`, 'info');
      
      const process = spawn(this.qemuImgPath, args);
      
      let stderr = '';
      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          this.log(`Disco criado: ${this.diskPath}`, 'success');
          resolve(this.diskPath);
        } else {
          this.log(`Erro ao criar disco: ${stderr}`, 'error');
          reject(new Error(`qemu-img failed: ${stderr}`));
        }
      });
      
      process.on('error', (error) => {
        this.log(`Erro ao executar qemu-img: ${error.message}`, 'error');
        reject(error);
      });
    });
  }

  async installAndroidToDisk(progressCallback) {
    this.log('🚀 INICIANDO INSTALAÇÃO AUTOMÁTICA DO ANDROID NO DISCO', 'step');
    this.log(`📀 ISO: ${this.isoPath}`, 'info');
    this.log(`💾 Disco: ${this.diskPath}`, 'info');
    
    const isWin = process.platform === 'win32';
    
    // Argumentos QEMU para instalação
    const args = [
      // Aceleração
      ...(isWin ? ['-accel', 'whpx'] : ['-enable-kvm']),
      '-cpu', isWin ? 'qemu64,+ssse3,+sse4.1,+sse4.2' : 'host',
      '-machine', 'q35',
      
      // Recursos
      '-m', `${this.memory}M`,
      '-smp', this.cpuCores.toString(),
      
      // Discos
      '-drive', `file=${this.diskPath},format=qcow2,if=ide,index=0,cache=writeback`,
      '-drive', `file=${this.isoPath},media=cdrom,readonly=on,if=ide,index=2`,
      
      // Rede
      '-netdev', 'user,id=net0',
      '-device', 'e1000,netdev=net0',
      
      // Display (headless com VNC para debug se necessário)
      '-display', 'none',
      '-vga', 'std',
      
      // Audio desabilitado
      '-audiodev', 'none,id=none',
      
      // USB
      '-usb',
      '-device', 'usb-tablet',
      '-device', 'usb-kbd',
      
      // Boot do CD
      '-boot', 'order=d,menu=off',
      '-rtc', 'base=localtime,clock=host',
      
      // Monitor para enviar comandos
      '-monitor', 'stdio',
      
      // Sem reboot automático
      '-no-reboot',
      '-no-shutdown'
    ];
    
    this.log(`Comando: ${this.qemuPath} ${args.join(' ')}`, 'info');
    
    return new Promise((resolve, reject) => {
      const qemuProcess = spawn(this.qemuPath, args, {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let installStep = 0;
      let installComplete = false;
      
      // Sequência de instalação automática
      const installSteps = [
        { delay: 8000, action: () => {
          this.log('[PASSO 1/12] Aguardando boot do ISO...', 'step');
          if (progressCallback) progressCallback(8, 'Aguardando boot do ISO...');
        }},
        { delay: 3000, action: () => {
          this.log('[PASSO 2/12] Navegando para "Install Android-x86 to harddisk"...', 'step');
          if (progressCallback) progressCallback(16, 'Navegando para instalação...');
          qemuProcess.stdin.write('sendkey down\n');
        }},
        { delay: 500, action: () => {
          qemuProcess.stdin.write('sendkey down\n');
        }},
        { delay: 1000, action: () => {
          this.log('[PASSO 3/12] Selecionando instalação no disco...', 'step');
          if (progressCallback) progressCallback(25, 'Selecionando instalação...');
          qemuProcess.stdin.write('sendkey ret\n');
        }},
        { delay: 4000, action: () => {
          this.log('[PASSO 4/12] Escolhendo partição (Create/Modify)...', 'step');
          if (progressCallback) progressCallback(33, 'Criando partição...');
          qemuProcess.stdin.write('sendkey ret\n');
        }},
        { delay: 2000, action: () => {
          this.log('[PASSO 5/12] Confirmando criação de partição...', 'step');
          if (progressCallback) progressCallback(41, 'Confirmando partição...');
          qemuProcess.stdin.write('sendkey ret\n');
        }},
        { delay: 2000, action: () => {
          this.log('[PASSO 6/12] Selecionando partição primária...', 'step');
          if (progressCallback) progressCallback(50, 'Partição primária...');
          qemuProcess.stdin.write('sendkey ret\n');
        }},
        { delay: 2000, action: () => {
          this.log('[PASSO 7/12] Confirmando tamanho da partição...', 'step');
          if (progressCallback) progressCallback(58, 'Tamanho da partição...');
          qemuProcess.stdin.write('sendkey ret\n');
        }},
        { delay: 2000, action: () => {
          this.log('[PASSO 8/12] Marcando como bootável...', 'step');
          if (progressCallback) progressCallback(66, 'Marcando bootável...');
          qemuProcess.stdin.write('sendkey ret\n');
        }},
        { delay: 2000, action: () => {
          this.log('[PASSO 9/12] Gravando partição no disco...', 'step');
          if (progressCallback) progressCallback(75, 'Gravando partição...');
          qemuProcess.stdin.write('sendkey left\n');
          setTimeout(() => qemuProcess.stdin.write('sendkey ret\n'), 500);
        }},
        { delay: 3000, action: () => {
          this.log('[PASSO 10/12] Selecionando sistema de arquivos ext4...', 'step');
          if (progressCallback) progressCallback(83, 'Formatando ext4...');
          qemuProcess.stdin.write('sendkey ret\n');
        }},
        { delay: 2000, action: () => {
          this.log('[PASSO 11/12] Confirmando formatação...', 'step');
          if (progressCallback) progressCallback(91, 'Confirmando formatação...');
          qemuProcess.stdin.write('sendkey left\n');
          setTimeout(() => qemuProcess.stdin.write('sendkey ret\n'), 500);
        }},
        { delay: 8000, action: () => {
          this.log('[PASSO 12/12] Instalando GRUB bootloader...', 'step');
          if (progressCallback) progressCallback(95, 'Instalando GRUB...');
          qemuProcess.stdin.write('sendkey ret\n');
        }},
        { delay: 3000, action: () => {
          this.log('[FINAL] Finalizando instalação...', 'step');
          if (progressCallback) progressCallback(98, 'Finalizando...');
          qemuProcess.stdin.write('sendkey ret\n');
        }},
        { delay: 5000, action: () => {
          this.log('✅ INSTALAÇÃO COMPLETA! Desligando QEMU...', 'success');
          if (progressCallback) progressCallback(100, 'Instalação completa!');
          installComplete = true;
          
          // Desligar QEMU
          try {
            qemuProcess.stdin.write('quit\n');
          } catch (e) {}
          
          setTimeout(() => {
            if (qemuProcess.pid) {
              try {
                process.kill(qemuProcess.pid, 'SIGTERM');
              } catch (e) {}
            }
          }, 2000);
        }}
      ];
      
      // Executar sequência de instalação
      let totalDelay = 0;
      installSteps.forEach(step => {
        totalDelay += step.delay;
        setTimeout(step.action, totalDelay);
      });
      
      // Logs do processo
      qemuProcess.stdout.on('data', (data) => {
        const output = data.toString().trim();
        if (output) {
          console.log(`[QEMU] ${output}`);
        }
      });
      
      qemuProcess.stderr.on('data', (data) => {
        const output = data.toString().trim();
        if (output) {
          console.log(`[QEMU] ${output}`);
        }
      });
      
      qemuProcess.on('exit', async (code) => {
        this.log(`QEMU encerrado (código: ${code})`, 'info');
        
        // Verificar se a instalação foi bem-sucedida
        try {
          const stats = await fs.stat(this.diskPath);
          const sizeMB = Math.round(stats.size / 1024 / 1024);
          
          this.log(`Tamanho do disco após instalação: ${sizeMB}MB`, 'info');
          
          if (sizeMB > 500) {
            this.log('✅ ANDROID INSTALADO COM SUCESSO NO DISCO!', 'success');
            resolve({
              success: true,
              diskPath: this.diskPath,
              diskSize: sizeMB,
              message: 'Android instalado e pronto para uso'
            });
          } else {
            this.log('⚠️ Disco ainda pequeno - instalação pode estar incompleta', 'warning');
            resolve({
              success: false,
              diskPath: this.diskPath,
              diskSize: sizeMB,
              message: 'Instalação incompleta - disco muito pequeno'
            });
          }
        } catch (error) {
          this.log(`Erro ao verificar disco: ${error.message}`, 'error');
          reject(error);
        }
      });
      
      qemuProcess.on('error', (error) => {
        this.log(`Erro no processo QEMU: ${error.message}`, 'error');
        reject(error);
      });
      
      // Timeout de segurança (10 minutos)
      setTimeout(() => {
        if (!installComplete) {
          this.log('⏱️ Timeout atingido - forçando encerramento', 'warning');
          try {
            qemuProcess.stdin.write('quit\n');
            setTimeout(() => {
              if (qemuProcess.pid) {
                process.kill(qemuProcess.pid, 'SIGKILL');
              }
            }, 2000);
          } catch (e) {}
        }
      }, 600000); // 10 minutos
    });
  }

  async install(progressCallback) {
    try {
      // Verificar se o ISO existe
      try {
        await fs.access(this.isoPath);
        this.log(`ISO encontrado: ${this.isoPath}`, 'success');
      } catch (error) {
        throw new Error(`ISO não encontrado: ${this.isoPath}`);
      }
      
      // Criar disco vazio
      await this.createBlankDisk();
      
      // Instalar Android no disco
      const result = await this.installAndroidToDisk(progressCallback);
      
      return result;
      
    } catch (error) {
      this.log(`Erro na instalação: ${error.message}`, 'error');
      throw error;
    }
  }
}

// Exportar para uso em outros módulos
export { AndroidDiskInstaller };

// Se executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const installer = new AndroidDiskInstaller({
    isoPath: process.argv[2] || path.join(process.cwd(), 'backend', 'emulator-data', 'android-images', 'android-x86_64-9.0-r2.iso'),
    diskSize: 8
  });
  
  installer.install((progress, message) => {
    console.log(`📊 Progresso: ${progress}% - ${message}`);
  }).then(result => {
    console.log('\n🎉 RESULTADO:', result);
    process.exit(result.success ? 0 : 1);
  }).catch(error => {
    console.error('\n❌ ERRO:', error);
    process.exit(1);
  });
}
