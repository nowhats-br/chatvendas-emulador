// QEMU Android Emulator - Implementação Real
// Emula Android usando QEMU como LDPlayer/BlueStacks
// Funciona apenas em ambiente Electron/Node.js, não no browser

const getNodeModule = (moduleName: string) => {
  if (typeof window !== 'undefined' && (window as any).require) {
    return (window as any).require(moduleName);
  }
  return null;
};

// Node.js modules for Electron environment
const fs = getNodeModule('fs');
const path = getNodeModule('path');
const { spawn } = getNodeModule('child_process') || { spawn: null };

export interface AndroidEmulatorConfig {
  name: string;
  androidVersion: '7.1' | '9.0' | '11.0' | '12.0' | '13.0';
  architecture: 'x86_64';
  memory: number; // MB
  storage: number; // GB
  resolution: string; // '720x1280', '1080x1920'
  enablePlayStore: boolean;
  enableRoot: boolean;
  baseImagePath?: string; // Caminho para a imagem base
  selectedApks?: string[]; // APKs selecionados pelo usuário
}

export interface AndroidEmulatorInstance {
  id: string;
  name: string;
  config: AndroidEmulatorConfig;
  status: 'stopped' | 'starting' | 'running' | 'error';
  qemuProcess?: any; // Electron ChildProcess
  adbPort: number;
  vncPort: number;
  diskPath: string;
  logPath: string;
  pid?: number;
  createdAt: Date;
  lastStarted?: Date;
}

export interface AndroidImage {
  id: string;
  name: string;
  version: string;
  architecture: 'x86' | 'x86_64' | 'arm64';
  size: number; // MB
  path: string;
  uploaded: boolean;
}

export class QEMUAndroidEmulator {
  private instances: Map<string, AndroidEmulatorInstance> = new Map();
  private baseDir: string;
  private androidImagesDir: string;
  private instancesDir: string;
  private logsDir: string;
  private virtualDisksDir: string;

  constructor(baseDir: string = './src/modules/AndroidEmulator/data') {
    this.baseDir = baseDir;
    this.androidImagesDir = path ? path.join(baseDir, 'android-images') : `${baseDir}/android-images`;
    this.instancesDir = path ? path.join(baseDir, 'instances') : `${baseDir}/instances`;
    this.logsDir = path ? path.join(baseDir, 'logs') : `${baseDir}/logs`;
    this.virtualDisksDir = path ? path.join(baseDir, 'virtual-disks') : `${baseDir}/virtual-disks`;
    
    console.log('🔧 QEMUAndroidEmulator: Inicializando sistema limpo');
    console.log('🔧 Diretório base:', this.baseDir);
    console.log('🔧 Imagens Android:', this.androidImagesDir);
    console.log('🔧 Instâncias:', this.instancesDir);
    console.log('🔧 Discos virtuais:', this.virtualDisksDir);
    console.log('🔧 Logs:', this.logsDir);
    
    this.initializeDirectories();
    this.loadExistingInstances();
  }

  private initializeDirectories(): void {
    if (!fs || !path) {
      console.log('🔧 Browser environment: simulando inicialização de diretórios');
      return;
    }

    const dirs = [
      this.baseDir,
      this.androidImagesDir,
      this.instancesDir,
      this.logsDir,
      this.virtualDisksDir
    ];

    dirs.forEach(dir => {
      try {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
          console.log(`📁 Diretório criado: ${dir}`);
        }
      } catch (error) {
        console.warn(`⚠️ Erro ao criar diretório ${dir}:`, error);
      }
    });
  }

  private loadExistingInstances(): void {
    if (!fs) {
      console.log('🔧 Browser environment: simulando carregamento de instâncias');
      return;
    }

    try {
      const instancesFile = path ? path.join(this.baseDir, 'instances.json') : `${this.baseDir}/instances.json`;
      
      if (fs.existsSync(instancesFile)) {
        const data = fs.readFileSync(instancesFile, 'utf8');
        const savedInstances = JSON.parse(data);
        
        savedInstances.forEach((instance: any) => {
          // Converter datas de string para Date
          instance.createdAt = new Date(instance.createdAt);
          if (instance.lastStarted) {
            instance.lastStarted = new Date(instance.lastStarted);
          }
          
          // Garantir que status seja 'stopped' ao carregar
          instance.status = 'stopped';
          instance.qemuProcess = undefined;
          instance.pid = undefined;
          
          this.instances.set(instance.id, instance);
        });
        
        console.log(`📱 ${savedInstances.length} instâncias carregadas do arquivo`);
      }
    } catch (error) {
      console.warn('⚠️ Erro ao carregar instâncias salvas:', error);
    }
  }

  private saveInstances(): void {
    if (!fs) return;

    try {
      const instancesFile = path ? path.join(this.baseDir, 'instances.json') : `${this.baseDir}/instances.json`;
      const instancesArray = Array.from(this.instances.values()).map(instance => ({
        ...instance,
        // Remover propriedades que não devem ser salvas
        qemuProcess: undefined,
        pid: undefined,
        status: 'stopped'
      }));
      
      fs.writeFileSync(instancesFile, JSON.stringify(instancesArray, null, 2));
      console.log(`💾 ${instancesArray.length} instâncias salvas`);
    } catch (error) {
      console.warn('⚠️ Erro ao salvar instâncias:', error);
    }
  }

  async createInstance(config: AndroidEmulatorConfig): Promise<string> {
    const instanceId = `android_${Date.now()}`;
    const diskPath = path ? path.join(this.instancesDir, `${instanceId}.qcow2`) : `${this.instancesDir}/${instanceId}.qcow2`;
    const logPath = path ? path.join(this.logsDir, `${instanceId}.log`) : `${this.logsDir}/${instanceId}.log`;

    console.log('🔥 CRIANDO INSTÂNCIA ANDROID REAL:', config.name);
    console.log('📱 Android', config.androidVersion, '(', config.architecture, ')');
    console.log('💾 RAM:', config.memory + 'MB, Storage:', config.storage + 'GB');
    console.log('📺 Resolução:', config.resolution);

    // Verificar se QEMU está disponível
    if (!await this.checkQEMUAvailable()) {
      throw new Error('QEMU não está instalado. Instale o QEMU para usar o emulador Android.');
    }

    // Encontrar imagem Android base
    const baseImagePath = config.baseImagePath || await this.findBestAndroidImage(config.androidVersion);
    if (!baseImagePath) {
      throw new Error(`Nenhuma imagem Android ${config.androidVersion} encontrada. Faça upload de uma imagem na aba "Imagens Android".`);
    }

    console.log('💿 Usando imagem base:', baseImagePath);

    // Criar disco virtual Android
    await this.createAndroidDisk(instanceId, config, diskPath, baseImagePath);

    const instance: AndroidEmulatorInstance = {
      id: instanceId,
      name: config.name,
      config: { ...config, baseImagePath },
      status: 'stopped',
      adbPort: await this.findAvailablePort(5555),
      vncPort: await this.findAvailablePort(5900),
      diskPath,
      logPath,
      createdAt: new Date()
    };

    this.instances.set(instanceId, instance);
    this.saveInstances();
    
    console.log('✅ Instância Android criada:', instanceId);
    console.log('💾 Disco:', diskPath);
    console.log('🔌 Portas: ADB=' + instance.adbPort + ', VNC=' + instance.vncPort);
    
    return instanceId;
  }

  private async findBestAndroidImage(version: string): Promise<string | null> {
    console.log('🔍 Procurando imagem Android', version);
    
    if (!fs) {
      console.log('🔧 Browser environment: simulando busca de imagem');
      return './android-images/android-x86-' + version + '.iso';
    }

    try {
      if (!fs.existsSync(this.androidImagesDir)) {
        console.log('⚠️ Diretório de imagens não existe:', this.androidImagesDir);
        return null;
      }

      const files = fs.readdirSync(this.androidImagesDir);
      console.log('📁 Arquivos encontrados:', files);

      // Procurar por imagem específica da versão
      const versionFiles = files.filter((file: string) => {
        const fileName = file.toLowerCase();
        return (fileName.includes('.iso') || fileName.includes('.img')) && 
               (fileName.includes(version) || fileName.includes('android-' + version));
      });

      if (versionFiles.length > 0) {
        const selectedFile = versionFiles[0];
        const fullPath = path ? path.join(this.androidImagesDir, selectedFile) : `${this.androidImagesDir}/${selectedFile}`;
        console.log('✅ Imagem encontrada:', fullPath);
        return fullPath;
      }

      // Se não encontrar versão específica, pegar qualquer imagem Android
      const androidFiles = files.filter((file: string) => {
        const fileName = file.toLowerCase();
        return (fileName.includes('.iso') || fileName.includes('.img')) && 
               fileName.includes('android');
      });

      if (androidFiles.length > 0) {
        const selectedFile = androidFiles[0];
        const fullPath = path ? path.join(this.androidImagesDir, selectedFile) : `${this.androidImagesDir}/${selectedFile}`;
        console.log('⚠️ Usando imagem alternativa:', fullPath);
        return fullPath;
      }

      console.log('❌ Nenhuma imagem Android encontrada');
      return null;
    } catch (error) {
      console.error('❌ Erro ao procurar imagens:', error);
      return null;
    }
  }

  private async createAndroidDisk(instanceId: string, config: AndroidEmulatorConfig, diskPath: string, baseImagePath: string): Promise<void> {
    console.log('💾 Criando disco virtual Android...');
    console.log('📀 Imagem base:', baseImagePath);
    console.log('💿 Disco destino:', diskPath);
    
    if (!spawn) {
      console.log('🔧 Browser environment: simulando criação de disco');
      return Promise.resolve();
    }
    
    return new Promise((resolve, reject) => {
      // Criar disco QCOW2 baseado na imagem Android
      const qemuImgArgs = [
        'create',
        '-f', 'qcow2',
        '-b', baseImagePath,
        '-F', 'raw',
        diskPath,
        `${config.storage}G`
      ];

      console.log('🔧 Executando: qemu-img', qemuImgArgs.join(' '));

      const qemuImgProcess = spawn('qemu-img', qemuImgArgs);

      qemuImgProcess.on('close', (code: number | null) => {
        if (code === 0) {
          console.log('✅ Disco virtual criado:', diskPath);
          resolve();
        } else {
          reject(new Error(`Falha ao criar disco virtual (código: ${code})`));
        }
      });

      qemuImgProcess.on('error', (error: Error) => {
        reject(new Error(`Erro ao executar qemu-img: ${error.message}`));
      });
    });
  }

  async getAvailableAndroidImages(): Promise<AndroidImage[]> {
    console.log('🔍 Verificando imagens Android disponíveis...');
    
    if (!fs) {
      console.log('🔧 Browser environment: simulando lista de imagens');
      return [
        {
          id: 'android_11_sim',
          name: 'Android x86 11.0 (Simulado)',
          version: '11.0',
          architecture: 'x86_64',
          size: 1024,
          path: './android-images/android-x86-11.0.iso',
          uploaded: true
        }
      ];
    }

    try {
      if (!fs.existsSync(this.androidImagesDir)) {
        console.log('⚠️ Diretório de imagens não existe');
        return [];
      }

      const files = fs.readdirSync(this.androidImagesDir);
      const images: AndroidImage[] = [];

      for (const file of files) {
        const fileName: string = file.toLowerCase();
        
        // Verificar se é um arquivo de imagem Android
        if (!(fileName.endsWith('.iso') || fileName.endsWith('.img') || fileName.endsWith('.qcow2'))) {
          continue;
        }

        const fullPath = path ? path.join(this.androidImagesDir, file) : `${this.androidImagesDir}/${file}`;
        
        try {
          const stats = fs.statSync(fullPath);
          const sizeInMB = Math.round(stats.size / (1024 * 1024));

          // Detectar versão do Android
          let version = 'Unknown';
          if (fileName.includes('android-9') || fileName.includes('pie')) version = '9.0';
          else if (fileName.includes('android-10') || fileName.includes('q')) version = '10.0';
          else if (fileName.includes('android-11') || fileName.includes('r')) version = '11.0';
          else if (fileName.includes('android-12') || fileName.includes('s')) version = '12.0';
          else if (fileName.includes('android-13') || fileName.includes('t')) version = '13.0';

          // Detectar arquitetura
          let architecture: 'x86' | 'x86_64' | 'arm64' = 'x86_64';
          if (fileName.includes('x86_64') || fileName.includes('x64')) architecture = 'x86_64';
          else if (fileName.includes('x86')) architecture = 'x86';
          else if (fileName.includes('arm64') || fileName.includes('aarch64')) architecture = 'arm64';

          images.push({
            id: `android_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: file.replace(/\.[^/.]+$/, ''),
            version,
            architecture,
            size: sizeInMB,
            path: fullPath,
            uploaded: true
          });

          console.log('📱 Imagem encontrada:', file, '(' + version + ', ' + architecture + ', ' + sizeInMB + 'MB)');
        } catch (error: any) {
          console.warn('⚠️ Erro ao ler arquivo:', file, error);
        }
      }

      console.log('✅ Total de imagens encontradas:', images.length);
      return images;
    } catch (error) {
      console.error('❌ Erro ao listar imagens Android:', error);
      return [];
    }
  }

  async startInstance(instanceId: string): Promise<void> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error('Instância não encontrada');
    }

    if (instance.status === 'running') {
      throw new Error('Instância já está executando');
    }

    console.log('🚀 INICIANDO ANDROID REAL:', instance.name);
    console.log('📱 Versão:', instance.config.androidVersion);
    console.log('💾 RAM:', instance.config.memory + 'MB');
    console.log('📺 Resolução:', instance.config.resolution);
    
    instance.status = 'starting';
    instance.lastStarted = new Date();

    if (!spawn || !fs) {
      console.log('🔧 Browser environment: simulando início do Android');
      instance.status = 'running';
      this.saveInstances();
      return Promise.resolve();
    }

    try {
      // Comando QEMU para iniciar Android
      const qemuArgs = [
        '-enable-kvm', // Aceleração de hardware
        '-m', `${instance.config.memory}M`,
        '-smp', '4', // 4 cores de CPU
        '-hda', instance.diskPath,
        '-boot', 'd',
        '-netdev', `user,id=net0,hostfwd=tcp::${instance.adbPort}-:5555`,
        '-device', 'e1000,netdev=net0',
        '-vnc', `:${instance.vncPort - 5900}`, // VNC display
        '-vga', 'std',
        '-usb', '-device', 'usb-tablet', // Mouse/touch
        '-soundhw', 'ac97', // Audio
        '-rtc', 'base=localtime'
      ];

      // Configurar resolução
      const [width, height] = instance.config.resolution.split('x').map(Number);
      qemuArgs.push('-global', `VGA.xres=${width}`);
      qemuArgs.push('-global', `VGA.yres=${height}`);

      console.log('🔧 Comando QEMU: qemu-system-x86_64', qemuArgs.join(' '));

      // Iniciar processo QEMU
      const qemuProcess = spawn('qemu-system-x86_64', qemuArgs, {
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: false
      });

      instance.qemuProcess = qemuProcess;
      instance.pid = qemuProcess.pid;

      // Log de saída
      const logStream = fs.createWriteStream(instance.logPath, { flags: 'a' });
      qemuProcess.stdout?.pipe(logStream);
      qemuProcess.stderr?.pipe(logStream);

      qemuProcess.on('spawn', () => {
        instance.status = 'running';
        this.saveInstances();
        console.log('✅ Android iniciado: PID', qemuProcess.pid);
        console.log('📱 VNC: localhost:' + instance.vncPort);
        console.log('🔧 ADB: localhost:' + instance.adbPort);
        console.log('📋 Logs:', instance.logPath);
        
        // Configurar ADB após inicialização
        setTimeout(() => {
          this.setupADB(instance);
        }, 30000); // 30 segundos para Android inicializar
      });

      qemuProcess.on('error', (error: Error) => {
        console.error('❌ Erro QEMU:', error.message);
        instance.status = 'error';
        this.saveInstances();
      });

      qemuProcess.on('exit', (code: number | null, signal: string | null) => {
        console.log('🔴 Android parado: código=' + code + ', sinal=' + signal);
        instance.status = 'stopped';
        instance.qemuProcess = undefined;
        instance.pid = undefined;
        this.instances.set(instanceId, instance);
        this.saveInstances();
      });

    } catch (error) {
      instance.status = 'error';
      this.saveInstances();
      throw new Error(`Falha ao iniciar Android: ${error}`);
    }
  }

  private async setupADB(instance: AndroidEmulatorInstance): Promise<void> {
    console.log(`🔗 Configurando ADB para ${instance.name}...`);
    
    if (!spawn) {
      console.log('Browser environment: simulating ADB setup');
      return Promise.resolve();
    }
    
    try {
      // Conectar ADB
      const adbConnect = spawn('adb', ['connect', `localhost:${instance.adbPort}`]);
      
      adbConnect.on('close', (code: number | null) => {
        if (code === 0) {
          console.log(`✅ ADB conectado: localhost:${instance.adbPort}`);
          
          // Configurações iniciais do Android
          this.configureAndroid(instance);
        } else {
          console.warn(`⚠️ Falha na conexão ADB (código: ${code})`);
        }
      });
      
    } catch (error) {
      console.error(`❌ Erro ao configurar ADB: ${error}`);
    }
  }

  private async configureAndroid(instance: AndroidEmulatorInstance): Promise<void> {
    console.log(`⚙️ Configurando Android ${instance.name}...`);
    
    if (!spawn) {
      console.log('Browser environment: simulating Android configuration');
      return Promise.resolve();
    }
    
    const adbDevice = `localhost:${instance.adbPort}`;
    
    // Habilitar opções de desenvolvedor
    spawn('adb', ['-s', adbDevice, 'shell', 'settings', 'put', 'global', 'development_settings_enabled', '1']);
    
    // Habilitar depuração USB
    spawn('adb', ['-s', adbDevice, 'shell', 'settings', 'put', 'global', 'adb_enabled', '1']);
    
    // Configurar resolução
    const [width, height] = instance.config.resolution.split('x').map(Number);
    spawn('adb', ['-s', adbDevice, 'shell', 'wm', 'size', `${width}x${height}`]);
    
    console.log(`✅ Android ${instance.name} configurado!`);
  }

  async stopInstance(instanceId: string): Promise<void> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error('Instância não encontrada');
    }

    if (instance.status !== 'running') {
      throw new Error('Instância não está executando');
    }

    console.log('⏹️ Parando Android:', instance.name);

    if (instance.qemuProcess) {
      // Tentar parada graceful
      instance.qemuProcess.kill('SIGTERM');
      
      // Force kill após 10 segundos se necessário
      setTimeout(() => {
        if (instance.qemuProcess && !instance.qemuProcess.killed) {
          instance.qemuProcess.kill('SIGKILL');
          console.log('🔴 Android forçadamente parado:', instance.name);
        }
      }, 10000);
    }

    instance.status = 'stopped';
    this.saveInstances();
    console.log('✅ Android parado:', instance.name);
  }

  async deleteInstance(instanceId: string): Promise<void> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error('Instância não encontrada');
    }

    // Parar se estiver executando
    if (instance.status === 'running') {
      await this.stopInstance(instanceId);
    }

    console.log('🗑️ Deletando instância:', instance.name);

    // Deletar arquivos
    if (fs) {
      try {
        if (fs.existsSync(instance.diskPath)) {
          fs.unlinkSync(instance.diskPath);
          console.log('🗑️ Disco deletado:', instance.diskPath);
        }
        
        if (fs.existsSync(instance.logPath)) {
          fs.unlinkSync(instance.logPath);
          console.log('🗑️ Log deletado:', instance.logPath);
        }
      } catch (error) {
        console.warn('⚠️ Erro ao deletar arquivos:', error);
      }
    } else {
      console.log('🔧 Browser environment: simulando deleção de arquivos');
    }

    this.instances.delete(instanceId);
    this.saveInstances();
    console.log('✅ Instância deletada:', instance.name);
  }

  async installAPK(instanceId: string, apkPath: string): Promise<boolean> {
    const instance = this.instances.get(instanceId);
    if (!instance || instance.status !== 'running') {
      throw new Error('Instância não está executando');
    }

    console.log(`📦 Instalando APK: ${apkPath}`);
    
    if (!spawn) {
      console.log('Browser environment: simulating APK installation');
      return Promise.resolve(true);
    }
    
    return new Promise((resolve, reject) => {
      if (!spawn) {
        console.log('Browser environment: simulating APK installation');
        resolve(true);
        return;
      }

      const adbDevice = `localhost:${instance.adbPort}`;
      const installProcess = spawn('adb', ['-s', adbDevice, 'install', '-r', apkPath]);
      
      installProcess.on('close', (code: number | null) => {
        if (code === 0) {
          console.log(`✅ APK instalado com sucesso`);
          resolve(true);
        } else {
          console.error(`❌ Falha na instalação do APK (código: ${code})`);
          resolve(false);
        }
      });
      
      installProcess.on('error', (error: Error) => {
        console.error(`❌ Erro ao instalar APK: ${error.message}`);
        reject(error);
      });
    });
  }

  getInstances(): AndroidEmulatorInstance[] {
    return Array.from(this.instances.values());
  }

  getInstance(instanceId: string): AndroidEmulatorInstance | undefined {
    return this.instances.get(instanceId);
  }

  private async checkQEMUAvailable(): Promise<boolean> {
    if (!spawn) {
      console.log('🔧 Browser environment: simulando QEMU check');
      return true;
    }

    return new Promise((resolve) => {
      console.log('🔧 Executando: qemu-system-x86_64 --version');
      const qemuCheck = spawn('qemu-system-x86_64', ['--version']);
      
      qemuCheck.on('close', (code: number | null) => {
        const available = code === 0;
        console.log('🔧 QEMU check result:', available, 'code:', code);
        resolve(available);
      });
      
      qemuCheck.on('error', (error: any) => {
        console.log('🔧 QEMU check error:', error.message);
        resolve(false);
      });
      
      // Timeout para evitar travamento
      setTimeout(() => {
        console.log('🔧 QEMU check timeout');
        resolve(false);
      }, 5000);
    });
  }

  private async findAvailablePort(startPort: number): Promise<number> {
    // Implementação simples - em produção usar biblioteca para verificar portas
    const usedPorts = new Set<number>();
    
    this.instances.forEach(instance => {
      if (instance.status === 'running') {
        usedPorts.add(instance.adbPort);
        usedPorts.add(instance.vncPort);
      }
    });

    for (let port = startPort; port < startPort + 100; port++) {
      if (!usedPorts.has(port)) {
        return port;
      }
    }

    throw new Error(`Nenhuma porta disponível a partir de ${startPort}`);
  }

  async getSystemInfo(): Promise<{
    qemuAvailable: boolean;
    adbAvailable: boolean;
    kvmSupported: boolean;
    androidImages: string[];
    availableImages: AndroidImage[];
  }> {
    console.log('🔧 QEMUAndroidEmulator: Verificando informações do sistema...');
    
    try {
      console.log('🔧 Verificando QEMU...');
      const qemuAvailable = await this.checkQEMUAvailable();
      console.log('🔧 QEMU disponível:', qemuAvailable);
      
      console.log('🔧 Verificando ADB...');
      const adbAvailable = await new Promise<boolean>((resolve) => {
        if (!spawn) {
          console.log('🔧 Browser environment: simulando ADB check');
          resolve(true); // Browser simulation
          return;
        }

        const adbCheck = spawn('adb', ['version']);
        adbCheck.on('close', (code: number | null) => {
          const available = code === 0;
          console.log('🔧 ADB check result:', available);
          resolve(available);
        });
        adbCheck.on('error', (error: any) => {
          console.log('🔧 ADB check error');
          resolve(false);
        });
        
        // Timeout para evitar travamento
        setTimeout(() => {
          console.log('🔧 ADB check timeout');
          resolve(false);
        }, 5000);
      });

      console.log('🔧 Verificando KVM...');
      const kvmSupported = !fs || fs.existsSync('/dev/kvm') || (typeof window !== 'undefined' && navigator.platform.includes('Win'));
      console.log('🔧 KVM suportado:', kvmSupported);
      
      console.log('🔧 Verificando imagens Android...');
      const availableImages = await this.getAvailableAndroidImages();
      const androidImages = availableImages.map(img => img.name);
      console.log('🔧 Imagens Android encontradas:', androidImages);

      const result = {
        qemuAvailable,
        adbAvailable,
        kvmSupported,
        androidImages,
        availableImages
      };
      
      console.log('✅ Informações do sistema carregadas:', result);
      return result;
    } catch (error) {
      console.error('❌ Erro ao obter informações do sistema:', error);
      // Retornar valores padrão em caso de erro
      return {
        qemuAvailable: false,
        adbAvailable: false,
        kvmSupported: false,
        androidImages: [],
        availableImages: []
      };
    }
  }
}

// Instância singleton
export const qemuAndroidEmulator = new QEMUAndroidEmulator();