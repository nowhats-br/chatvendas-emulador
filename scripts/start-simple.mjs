#!/usr/bin/env node

/**
 * 🚀 Script Simples de Inicialização - Android Emulator
 * Versão simplificada que funciona melhor no Windows
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
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
const activeProcesses = [];

// Função para executar comando
function executeCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    log.info(`Executando: ${command} ${args.join(' ')}`);
    
    const process = spawn(command, args, {
      stdio: options.silent ? 'pipe' : 'inherit',
      cwd: options.cwd || process.cwd(),
      shell: true, // Importante para Windows
      env: { ...process.env, ...options.env }
    });
    
    let stdout = '';
    let stderr = '';
    
    if (options.silent) {
      process.stdout?.on('data', (data) => {
        stdout += data.toString();
      });
      
      process.stderr?.on('data', (data) => {
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
  });
}

// Função para verificar se comando existe
async function commandExists(command) {
  try {
    await executeCommand(command, ['--version'], { silent: true });
    return true;
  } catch (error) {
    return false;
  }
}

// Verificar dependências básicas
async function checkBasicDependencies() {
  log.info('🔍 Verificando dependências básicas...');
  
  const dependencies = [
    { name: 'Node.js', command: 'node' },
    { name: 'NPM', command: 'npm' }
  ];
  
  for (const dep of dependencies) {
    if (await commandExists(dep.command)) {
      try {
        const result = await executeCommand(dep.command, ['--version'], { silent: true });
        log.success(`✅ ${dep.name}: ${result.stdout.trim()}`);
      } catch (error) {
        log.success(`✅ ${dep.name} disponível`);
      }
    } else {
      log.error(`❌ ${dep.name} não encontrado`);
      return false;
    }
  }
  
  return true;
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
    'emulator-data/screenshots'
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
  try {
    await fs.access('backend/package.json');
    try {
      await fs.access('backend/node_modules');
      log.success('✅ Dependências do backend já instaladas');
    } catch (error) {
      log.info('Instalando dependências do backend...');
      await executeCommand('npm', ['install'], { cwd: 'backend' });
      log.success('✅ Dependências do backend instaladas');
    }
  } catch (error) {
    log.warning('⚠️  Backend não encontrado');
  }
  
  // Frontend
  try {
    await fs.access('package.json');
    try {
      await fs.access('node_modules');
      log.success('✅ Dependências do frontend já instaladas');
    } catch (error) {
      log.info('Instalando dependências do frontend...');
      await executeCommand('npm', ['install']);
      log.success('✅ Dependências do frontend instaladas');
    }
  } catch (error) {
    log.warning('⚠️  Frontend não encontrado');
  }
}

// Iniciar backend
async function startBackend() {
  log.info('🔧 Iniciando backend...');
  
  try {
    await fs.access('backend/package.json');
  } catch (error) {
    log.error('❌ Backend não encontrado');
    return null;
  }
  
  return new Promise((resolve) => {
    const backendProcess = spawn('npm', ['start'], {
      cwd: 'backend',
      stdio: 'inherit',
      shell: true
    });
    
    backendProcess.on('spawn', () => {
      activeProcesses.push(backendProcess);
      log.success(`✅ Backend iniciado (PID: ${backendProcess.pid})`);
      resolve(backendProcess);
    });
    
    backendProcess.on('error', (error) => {
      log.error(`❌ Erro ao iniciar backend: ${error.message}`);
      resolve(null);
    });
    
    backendProcess.on('exit', (code) => {
      log.warning(`⚠️  Backend terminou com código: ${code}`);
      const index = activeProcesses.indexOf(backendProcess);
      if (index > -1) {
        activeProcesses.splice(index, 1);
      }
    });
  });
}

// Iniciar frontend
async function startFrontend() {
  log.info('⚛️  Iniciando frontend...');
  
  try {
    await fs.access('package.json');
  } catch (error) {
    log.error('❌ Frontend não encontrado');
    return null;
  }
  
  return new Promise((resolve) => {
    const frontendProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true
    });
    
    frontendProcess.on('spawn', () => {
      activeProcesses.push(frontendProcess);
      log.success(`✅ Frontend iniciado (PID: ${frontendProcess.pid})`);
      resolve(frontendProcess);
    });
    
    frontendProcess.on('error', (error) => {
      log.error(`❌ Erro ao iniciar frontend: ${error.message}`);
      resolve(null);
    });
    
    frontendProcess.on('exit', (code) => {
      log.warning(`⚠️  Frontend terminou com código: ${code}`);
      const index = activeProcesses.indexOf(frontendProcess);
      if (index > -1) {
        activeProcesses.splice(index, 1);
      }
    });
  });
}

// Aguardar um tempo
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Exibir informações do sistema
function displaySystemInfo() {
  console.log(`\n${colors.magenta}🚀 ANDROID EMULATOR - SISTEMA INICIADO${colors.reset}`);
  console.log('='.repeat(60));
  console.log(`${colors.cyan}🌐 SERVIÇOS DISPONÍVEIS:${colors.reset}`);
  console.log('Backend API: http://localhost:3002');
  console.log('Frontend: http://localhost:5173');
  console.log('API Status: http://localhost:3002/api/android-emulator/system/status');
  console.log('');
  console.log(`${colors.cyan}🎮 COMANDOS ÚTEIS:${colors.reset}`);
  console.log('Ctrl+C: Parar todos os serviços');
  console.log('='.repeat(60));
}

// Configurar cleanup
function setupCleanup() {
  const cleanup = () => {
    log.info('🧹 Parando serviços...');
    
    activeProcesses.forEach(proc => {
      if (!proc.killed) {
        proc.kill('SIGTERM');
      }
    });
    
    setTimeout(() => {
      activeProcesses.forEach(proc => {
        if (!proc.killed) {
          proc.kill('SIGKILL');
        }
      });
      process.exit(0);
    }, 5000);
  };
  
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('exit', cleanup);
}

// Função principal
async function main() {
  try {
    console.log(`${colors.magenta}🚀 INICIANDO SISTEMA ANDROID EMULATOR${colors.reset}`);
    console.log('='.repeat(60));
    
    // Configurar cleanup
    setupCleanup();
    
    // Verificações iniciais
    if (!(await checkBasicDependencies())) {
      log.error('❌ Dependências básicas não encontradas');
      process.exit(1);
    }
    
    await ensureDirectories();
    await installDependencies();
    
    console.log('');
    log.info('🚀 Iniciando serviços...');
    
    // Iniciar serviços
    const backendProcess = await startBackend();
    
    // Aguardar um pouco antes de iniciar o frontend
    await sleep(3000);
    
    const frontendProcess = await startFrontend();
    
    // Aguardar estabilizar
    await sleep(5000);
    
    // Exibir informações
    displaySystemInfo();
    
    if (backendProcess || frontendProcess) {
      log.success('🎉 Sistema iniciado!');
      log.info('Os serviços estão rodando. Pressione Ctrl+C para parar.');
      
      // Manter processo vivo
      process.stdin.resume();
    } else {
      log.error('❌ Nenhum serviço foi iniciado');
      process.exit(1);
    }
    
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