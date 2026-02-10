#!/usr/bin/env node

/**
 * 🚀 Script de Inicialização Completa - Android Emulator
 * Inicia todo o sistema em modo produção
 */

import { spawn, exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cores para output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
  system: (msg) => console.log(`${colors.magenta}[SYSTEM]${colors.reset} ${msg}`)
};

// Processos ativos
const activeProcesses = new Map();

// Função para executar comando
function executeCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      stdio: options.silent ? 'pipe' : 'inherit',
      cwd: options.cwd || process.cwd(),
      env: { ...process.env, ...options.env }
    });
    
    let stdout = '';
    let stderr = '';
    
    if (options.silent) {
      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });
    }
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve({ code, stdout, stderr });
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr || stdout}`));
      }
    });
    
    process.on('error', (error) => {
      reject(error);
    });
    
    return process;
  });
}

// Função para iniciar processo em background
function startBackgroundProcess(name, command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    log.info(`Iniciando ${name}...`);
    
    const process = spawn(command, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      cwd: options.cwd || process.cwd(),
      env: { ...process.env, ...options.env },
      detached: options.detached || false
    });
    
    let started = false;
    let stdout = '';
    let stderr = '';
    
    process.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      
      if (options.onOutput) {
        options.onOutput(output);
      }
      
      // Verificar indicadores de inicialização bem-sucedida
      if (!started && options.startIndicators) {
        for (const indicator of options.startIndicators) {
          if (output.includes(indicator)) {
            started = true;
            activeProcesses.set(name, process);
            log.success(`✅ ${name} iniciado (PID: ${process.pid})`);
            resolve(process);
            break;
          }
        }
      }
    });
    
    process.stderr.on('data', (data) => {
      const error = data.toString();
      stderr += error;
      
      if (options.onError) {
        options.onError(error);
      }
      
      // Alguns processos enviam status para stderr
      if (!started && options.startIndicators) {
        for (const indicator of options.startIndicators) {
          if (error.includes(indicator)) {
            started = true;
            activeProcesses.set(name, process);
            log.success(`✅ ${name} iniciado (PID: ${process.pid})`);
            resolve(process);
            break;
          }
        }
      }
    });
    
    process.on('error', (error) => {
      log.error(`❌ Erro ao iniciar ${name}: ${error.message}`);
      reject(error);
    });
    
    process.on('exit', (code, signal) => {
      log.warning(`⚠️  ${name} terminou: code=${code}, signal=${signal}`);
      activeProcesses.delete(name);
    });
    
    // Timeout para inicialização
    setTimeout(() => {
      if (!started) {
        if (options.assumeStarted) {
          started = true;
          activeProcesses.set(name, process);
          log.success(`✅ ${name} assumido como iniciado (PID: ${process.pid})`);
          resolve(process);
        } else {
          process.kill();
          reject(new Error(`${name} não iniciou dentro do timeout`));
        }
      }
    }, options.timeout || 10000);
  });
}

// Verificar se porta está disponível
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = http.createServer();
    
    server.listen(port, () => {
      server.close(() => {
        resolve(true);
      });
    });
    
    server.on('error', () => {
      resolve(false);
    });
  });
}

// Aguardar serviço estar disponível
function waitForService(url, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const check = () => {
      http.get(url, (res) => {
        if (res.statusCode === 200) {
          resolve();
        } else {
          setTimeout(check, 1000);
        }
      }).on('error', () => {
        if (Date.now() - startTime > timeout) {
          reject(new Error(`Service not available at ${url} within timeout`));
        } else {
          setTimeout(check, 1000);
        }
      });
    };
    
    check();
  });
}

// Verificar dependências do sistema
async function checkSystemDependencies() {
  log.info('🔍 Verificando dependências do sistema...');
  
  const dependencies = [
    { name: 'Node.js', command: 'node' },
    { name: 'NPM', command: 'npm' },
    { name: 'QEMU', command: 'qemu-system-x86_64' },
    { name: 'websockify', command: 'websockify' },
    { name: 'ADB', command: 'adb' }
  ];
  
  const missing = [];
  
  for (const dep of dependencies) {
    try {
      await executeCommand(dep.command, ['--version'], { silent: true });
      log.success(`✅ ${dep.name} disponível`);
    } catch (error) {
      log.error(`❌ ${dep.name} não encontrado`);
      missing.push(dep.name);
    }
  }
  
  if (missing.length > 0) {
    log.error(`❌ Dependências faltantes: ${missing.join(', ')}`);
    log.info('Execute: ./scripts/install-dependencies.sh');
    process.exit(1);
  }
  
  log.success('✅ Todas as dependências estão disponíveis');
}

// Verificar estrutura de diretórios
async function ensureDirectories() {
  log.info('📁 Verificando estrutura de diretórios...');
  
  const directories = [
    'emulator-data',
    'emulator-data/android-images',
    'emulator-data/virtual-disks',
    'emulator-data/configs',
    'emulator-data/logs',
    'emulator-data/screenshots',
    'backend/logs'
  ];
  
  for (const dir of directories) {
    try {
      await fs.access(dir);
    } catch (error) {
      log.info(`Criando diretório: ${dir}`);
      await fs.mkdir(dir, { recursive: true });
    }
  }
  
  log.success('✅ Estrutura de diretórios verificada');
}

// Instalar dependências npm
async function installDependencies() {
  log.info('📦 Verificando dependências npm...');
  
  // Backend
  if (await fs.access('backend/package.json').then(() => true).catch(() => false)) {
    try {
      await fs.access('backend/node_modules');
      log.success('✅ Dependências do backend já instaladas');
    } catch (error) {
      log.info('Instalando dependências do backend...');
      await executeCommand('npm', ['install'], { cwd: 'backend' });
      log.success('✅ Dependências do backend instaladas');
    }
  }
  
  // Frontend
  if (await fs.access('package.json').then(() => true).catch(() => false)) {
    try {
      await fs.access('node_modules');
      log.success('✅ Dependências do frontend já instaladas');
    } catch (error) {
      log.info('Instalando dependências do frontend...');
      await executeCommand('npm', ['install']);
      log.success('✅ Dependências do frontend instaladas');
    }
  }
}

// Verificar portas disponíveis
async function checkPorts() {
  log.info('🔌 Verificando portas disponíveis...');
  
  const ports = [
    { name: 'Backend API', port: 3010 },
    { name: 'Frontend Dev', port: 5173 },
    { name: 'VNC Base', port: 5900 },
    { name: 'WebSocket Base', port: 6080 }
  ];
  
  for (const { name, port } of ports) {
    const available = await isPortAvailable(port);
    if (available) {
      log.success(`✅ ${name}: Porta ${port} disponível`);
    } else {
      log.warning(`⚠️  ${name}: Porta ${port} em uso`);
    }
  }
}

// Iniciar backend
async function startBackend() {
  log.info('🔧 Iniciando backend...');
  
  const backendProcess = await startBackgroundProcess(
    'Backend',
    'npm',
    ['start'],
    {
      cwd: 'backend',
      startIndicators: ['Server running on port', 'listening on port'],
      timeout: 15000,
      onOutput: (output) => {
        if (output.includes('ERROR') || output.includes('Error')) {
          log.error(`Backend Error: ${output.trim()}`);
        }
      }
    }
  );
  
  // Aguardar API estar disponível
  log.info('Aguardando API estar disponível...');
  await waitForService('http://localhost:3010/api/android-emulator/test');
  log.success('✅ Backend API disponível');
  
  return backendProcess;
}

// Iniciar frontend
async function startFrontend() {
  log.info('⚛️  Iniciando frontend...');
  
  const frontendProcess = await startBackgroundProcess(
    'Frontend',
    'npm',
    ['run', 'dev'],
    {
      startIndicators: ['Local:', 'ready in', 'Local:   http://localhost:5173'],
      timeout: 20000,
      onOutput: (output) => {
        if (output.includes('Local:') && output.includes('5173')) {
          log.success('🌐 Frontend disponível em: http://localhost:5173');
        }
      }
    }
  );
  
  return frontendProcess;
}

// Testar sistema
async function testSystem() {
  log.info('🧪 Testando sistema...');
  
  try {
    // Testar API do backend
    const response = await new Promise((resolve, reject) => {
      const req = http.get('http://localhost:3010/api/android-emulator/system/status', (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, data }));
      });
      req.on('error', reject);
      req.setTimeout(5000, () => reject(new Error('Request timeout')));
    });
    
    if (response.statusCode === 200) {
      const result = JSON.parse(response.data);
      log.success('✅ API do backend funcionando');
      log.info(`Status: ${result.status}`);
    } else {
      log.error(`❌ API retornou status ${response.statusCode}`);
    }
  } catch (error) {
    log.error(`❌ Erro ao testar API: ${error.message}`);
  }
  
  // Testar frontend
  try {
    const response = await new Promise((resolve, reject) => {
      const req = http.get('http://localhost:5173', (res) => {
        resolve({ statusCode: res.statusCode });
      });
      req.on('error', reject);
      req.setTimeout(5000, () => reject(new Error('Request timeout')));
    });
    
    if (response.statusCode === 200) {
      log.success('✅ Frontend funcionando');
    } else {
      log.error(`❌ Frontend retornou status ${response.statusCode}`);
    }
  } catch (error) {
    log.error(`❌ Erro ao testar frontend: ${error.message}`);
  }
}

// Monitorar processos
function monitorProcesses() {
  log.info('📊 Iniciando monitoramento de processos...');
  
  setInterval(() => {
    const processCount = activeProcesses.size;
    if (processCount > 0) {
      log.system(`📊 Processos ativos: ${processCount}`);
      
      for (const [name, process] of activeProcesses.entries()) {
        if (process.killed) {
          log.warning(`⚠️  Processo ${name} foi terminado`);
          activeProcesses.delete(name);
        }
      }
    }
  }, 30000); // A cada 30 segundos
}

// Configurar handlers de sinal
function setupSignalHandlers() {
  const cleanup = async () => {
    log.info('🧹 Limpando processos...');
    
    for (const [name, process] of activeProcesses.entries()) {
      log.info(`Terminando ${name}...`);
      process.kill('SIGTERM');
      
      // Aguardar um pouco e forçar se necessário
      setTimeout(() => {
        if (!process.killed) {
          process.kill('SIGKILL');
        }
      }, 5000);
    }
    
    log.success('✅ Limpeza concluída');
    process.exit(0);
  };
  
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('exit', cleanup);
}

// Exibir informações do sistema
function displaySystemInfo() {
  console.log(`${colors.magenta}🚀 ANDROID EMULATOR - SISTEMA INICIADO${colors.reset}`);
  console.log('='.repeat(60));
  console.log(`${colors.cyan}📋 INFORMAÇÕES DO SISTEMA:${colors.reset}`);
  console.log(`Platform: ${process.platform}`);
  console.log(`Architecture: ${process.arch}`);
  console.log(`Node.js: ${process.version}`);
  console.log(`PID: ${process.pid}`);
  console.log(`Working Directory: ${process.cwd()}`);
  console.log('');
  console.log(`${colors.cyan}🌐 SERVIÇOS DISPONÍVEIS:${colors.reset}`);
  console.log(`Backend API: http://localhost:3010`);
  console.log(`Frontend: http://localhost:5173`);
  console.log(`API Status: http://localhost:3010/api/android-emulator/system/status`);
  console.log('');
  console.log(`${colors.cyan}🎮 COMANDOS ÚTEIS:${colors.reset}`);
  console.log(`Ctrl+C: Parar todos os serviços`);
  console.log(`./scripts/test-system.js: Testar sistema`);
  console.log('='.repeat(60));
}

// Função principal
async function main() {
  try {
    console.log(`${colors.magenta}🚀 INICIANDO SISTEMA ANDROID EMULATOR${colors.reset}`);
    console.log('='.repeat(60));
    
    // Configurar handlers
    setupSignalHandlers();
    
    // Verificações iniciais
    await checkSystemDependencies();
    await ensureDirectories();
    await installDependencies();
    await checkPorts();
    
    console.log('');
    log.info('🚀 Iniciando serviços...');
    
    // Iniciar serviços
    await startBackend();
    await startFrontend();
    
    // Aguardar um pouco para estabilizar
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Testar sistema
    await testSystem();
    
    // Iniciar monitoramento
    monitorProcesses();
    
    // Exibir informações
    displaySystemInfo();
    
    log.success('🎉 Sistema iniciado com sucesso!');
    log.info('Pressione Ctrl+C para parar todos os serviços');
    
    // Manter processo vivo
    process.stdin.resume();
    
  } catch (error) {
    log.error(`❌ Erro durante inicialização: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  startBackend,
  startFrontend,
  testSystem,
  checkSystemDependencies
};