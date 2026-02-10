#!/usr/bin/env node

/**
 * 🧪 Script de Teste do Sistema Android Emulator
 * Verifica se todas as dependências estão instaladas e funcionando
 */

import { spawn, exec } from 'child_process';
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
  test: (msg) => console.log(`${colors.cyan}[TEST]${colors.reset} ${msg}`)
};

// Função para executar comando e capturar output
function executeCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args);
    
    let stdout = '';
    let stderr = '';
    
    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    process.on('close', (code) => {
      resolve({
        code,
        stdout: stdout.trim(),
        stderr: stderr.trim()
      });
    });
    
    process.on('error', (error) => {
      reject(error);
    });
  });
}

// Verificar se comando existe
async function commandExists(command) {
  try {
    const result = await executeCommand(command, ['--version']);
    return result.code === 0;
  } catch (error) {
    return false;
  }
}

// Teste de dependências do sistema
async function testSystemDependencies() {
  log.info('🔍 Testando dependências do sistema...');
  
  const dependencies = [
    { name: 'QEMU', command: 'qemu-system-x86_64', args: ['--version'] },
    { name: 'websockify', command: 'websockify', args: ['--version'] },
    { name: 'ADB', command: 'adb', args: ['version'] },
    { name: 'Git', command: 'git', args: ['--version'] },
    { name: 'Node.js', command: 'node', args: ['--version'] },
    { name: 'NPM', command: 'npm', args: ['--version'] }
  ];
  
  const results = [];
  
  for (const dep of dependencies) {
    log.test(`Testando ${dep.name}...`);
    
    try {
      const result = await executeCommand(dep.command, dep.args);
      
      if (result.code === 0) {
        const version = result.stdout.split('\n')[0];
        log.success(`✅ ${dep.name}: ${version}`);
        results.push({ name: dep.name, status: 'ok', version });
      } else {
        log.error(`❌ ${dep.name}: Comando falhou (código ${result.code})`);
        results.push({ name: dep.name, status: 'error', error: result.stderr });
      }
    } catch (error) {
      log.error(`❌ ${dep.name}: ${error.message}`);
      results.push({ name: dep.name, status: 'not_found', error: error.message });
    }
  }
  
  return results;
}

// Teste de diretórios necessários
async function testDirectories() {
  log.info('📁 Testando estrutura de diretórios...');
  
  const directories = [
    'emulator-data',
    'emulator-data/android-images',
    'emulator-data/virtual-disks',
    'emulator-data/configs',
    'emulator-data/logs',
    'emulator-data/screenshots'
  ];
  
  const results = [];
  
  for (const dir of directories) {
    try {
      await fs.access(dir);
      log.success(`✅ Diretório existe: ${dir}`);
      results.push({ directory: dir, status: 'exists' });
    } catch (error) {
      log.warning(`⚠️  Criando diretório: ${dir}`);
      try {
        await fs.mkdir(dir, { recursive: true });
        log.success(`✅ Diretório criado: ${dir}`);
        results.push({ directory: dir, status: 'created' });
      } catch (createError) {
        log.error(`❌ Falha ao criar diretório ${dir}: ${createError.message}`);
        results.push({ directory: dir, status: 'error', error: createError.message });
      }
    }
  }
  
  return results;
}

// Teste de noVNC
async function testNoVNC() {
  log.info('🌐 Testando noVNC...');
  
  const novncPaths = [
    '/usr/share/novnc',
    '/usr/local/share/novnc',
    './novnc'
  ];
  
  for (const novncPath of novncPaths) {
    try {
      await fs.access(novncPath);
      log.success(`✅ noVNC encontrado em: ${novncPath}`);
      
      // Verificar arquivos principais
      const files = ['vnc.html', 'app/ui.js', 'core/rfb.js'];
      let allFilesExist = true;
      
      for (const file of files) {
        try {
          await fs.access(path.join(novncPath, file));
        } catch {
          allFilesExist = false;
          break;
        }
      }
      
      if (allFilesExist) {
        log.success(`✅ noVNC completo em: ${novncPath}`);
        return { status: 'ok', path: novncPath };
      } else {
        log.warning(`⚠️  noVNC incompleto em: ${novncPath}`);
      }
    } catch (error) {
      // Diretório não existe, continuar procurando
    }
  }
  
  log.error('❌ noVNC não encontrado');
  return { status: 'not_found' };
}

// Teste de KVM (Linux apenas)
async function testKVM() {
  if (process.platform !== 'linux') {
    log.info('⏭️  Teste KVM pulado (não é Linux)');
    return { status: 'skipped', reason: 'not_linux' };
  }
  
  log.info('🚀 Testando suporte KVM...');
  
  try {
    await fs.access('/dev/kvm');
    log.success('✅ KVM disponível em /dev/kvm');
    
    // Verificar permissões
    try {
      const stats = await fs.stat('/dev/kvm');
      log.info(`Permissões KVM: ${stats.mode.toString(8)}`);
      return { status: 'ok', device: '/dev/kvm' };
    } catch (error) {
      log.warning(`⚠️  Erro ao verificar permissões KVM: ${error.message}`);
      return { status: 'permission_error', error: error.message };
    }
  } catch (error) {
    log.error('❌ KVM não disponível');
    return { status: 'not_available', error: error.message };
  }
}

// Teste de portas disponíveis
async function testPorts() {
  log.info('🔌 Testando disponibilidade de portas...');
  
  const net = await import('net');
  
  const testPort = (port) => {
    return new Promise((resolve) => {
      const server = net.default.createServer();
      
      server.listen(port, () => {
        server.close(() => {
          resolve(true); // Porta disponível
        });
      });
      
      server.on('error', () => {
        resolve(false); // Porta em uso
      });
    });
  };
  
  const portRanges = [
    { name: 'VNC', start: 5900, end: 5910 },
    { name: 'ADB', start: 5555, end: 5565 },
    { name: 'WebSocket', start: 6080, end: 6090 }
  ];
  
  const results = [];
  
  for (const range of portRanges) {
    log.test(`Testando portas ${range.name} (${range.start}-${range.end})...`);
    
    let availablePorts = 0;
    
    for (let port = range.start; port <= range.end; port++) {
      const available = await testPort(port);
      if (available) {
        availablePorts++;
      }
    }
    
    if (availablePorts > 0) {
      log.success(`✅ ${range.name}: ${availablePorts} portas disponíveis`);
      results.push({ range: range.name, available: availablePorts, status: 'ok' });
    } else {
      log.error(`❌ ${range.name}: Nenhuma porta disponível`);
      results.push({ range: range.name, available: 0, status: 'blocked' });
    }
  }
  
  return results;
}

// Teste de criação de disco virtual
async function testVirtualDisk() {
  log.info('💾 Testando criação de disco virtual...');
  
  const testDiskPath = path.join('emulator-data', 'virtual-disks', 'test.qcow2');
  
  try {
    // Criar disco virtual de teste (1MB)
    const result = await executeCommand('qemu-img', [
      'create',
      '-f', 'qcow2',
      testDiskPath,
      '1M'
    ]);
    
    if (result.code === 0) {
      log.success('✅ Disco virtual criado com sucesso');
      
      // Verificar se arquivo foi criado
      try {
        const stats = await fs.stat(testDiskPath);
        log.success(`✅ Arquivo criado: ${testDiskPath} (${stats.size} bytes)`);
        
        // Limpar arquivo de teste
        await fs.unlink(testDiskPath);
        log.success('✅ Arquivo de teste removido');
        
        return { status: 'ok', size: stats.size };
      } catch (error) {
        log.error(`❌ Erro ao verificar arquivo: ${error.message}`);
        return { status: 'file_error', error: error.message };
      }
    } else {
      log.error(`❌ qemu-img falhou: ${result.stderr}`);
      return { status: 'command_error', error: result.stderr };
    }
  } catch (error) {
    log.error(`❌ Erro ao executar qemu-img: ${error.message}`);
    return { status: 'execution_error', error: error.message };
  }
}

// Teste de backend
async function testBackend() {
  log.info('🔧 Testando backend...');
  
  // Verificar se arquivo do backend existe
  const backendPath = path.join('backend', 'src', 'services', 'AndroidEmulatorBackend.js');
  
  try {
    await fs.access(backendPath);
    log.success(`✅ Backend encontrado: ${backendPath}`);
    
    // Verificar se pode importar o backend
    try {
      const { AndroidEmulatorBackend } = await import(path.resolve(backendPath));
      log.success('✅ Backend pode ser importado');
      
      // Criar instância de teste
      const backend = new AndroidEmulatorBackend();
      log.success('✅ Instância do backend criada');
      
      // Testar verificação de dependências
      const dependencies = await backend.checkSystemDependencies();
      log.success('✅ Verificação de dependências executada');
      
      return { status: 'ok', dependencies };
    } catch (error) {
      log.error(`❌ Erro ao importar backend: ${error.message}`);
      return { status: 'import_error', error: error.message };
    }
  } catch (error) {
    log.error(`❌ Backend não encontrado: ${backendPath}`);
    return { status: 'not_found', path: backendPath };
  }
}

// Teste de frontend
async function testFrontend() {
  log.info('⚛️  Testando frontend...');
  
  // Verificar arquivos principais do frontend
  const frontendFiles = [
    'src/modules/AndroidEmulator/services/EmulatorService.ts',
    'src/modules/AndroidEmulator/components/VNCViewer.tsx',
    'src/modules/AndroidEmulator/components/AndroidImageManager.tsx'
  ];
  
  const results = [];
  
  for (const file of frontendFiles) {
    try {
      await fs.access(file);
      log.success(`✅ Arquivo encontrado: ${file}`);
      results.push({ file, status: 'exists' });
    } catch (error) {
      log.error(`❌ Arquivo não encontrado: ${file}`);
      results.push({ file, status: 'not_found' });
    }
  }
  
  // Verificar package.json
  try {
    const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
    log.success(`✅ package.json válido: ${packageJson.name}@${packageJson.version}`);
    results.push({ file: 'package.json', status: 'valid', name: packageJson.name });
  } catch (error) {
    log.error(`❌ Erro no package.json: ${error.message}`);
    results.push({ file: 'package.json', status: 'error', error: error.message });
  }
  
  return results;
}

// Gerar relatório final
function generateReport(testResults) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 RELATÓRIO FINAL DE TESTES');
  console.log('='.repeat(60));
  
  let totalTests = 0;
  let passedTests = 0;
  let warnings = 0;
  let errors = 0;
  
  // Analisar resultados
  Object.entries(testResults).forEach(([testName, result]) => {
    console.log(`\n${colors.cyan}${testName.toUpperCase()}:${colors.reset}`);
    
    if (Array.isArray(result)) {
      result.forEach(item => {
        totalTests++;
        if (item.status === 'ok' || item.status === 'exists' || item.status === 'created' || item.status === 'valid') {
          passedTests++;
          console.log(`  ✅ ${item.name || item.file || item.directory || 'OK'}`);
        } else if (item.status === 'skipped') {
          warnings++;
          console.log(`  ⏭️  ${item.name || 'Pulado'}: ${item.reason || ''}`);
        } else {
          errors++;
          console.log(`  ❌ ${item.name || item.file || item.directory || 'Erro'}: ${item.error || 'Falhou'}`);
        }
      });
    } else {
      totalTests++;
      if (result.status === 'ok') {
        passedTests++;
        console.log(`  ✅ OK`);
      } else if (result.status === 'skipped') {
        warnings++;
        console.log(`  ⏭️  Pulado: ${result.reason || ''}`);
      } else {
        errors++;
        console.log(`  ❌ Erro: ${result.error || 'Falhou'}`);
      }
    }
  });
  
  // Resumo
  console.log('\n' + '='.repeat(60));
  console.log('📈 RESUMO:');
  console.log(`Total de testes: ${totalTests}`);
  console.log(`${colors.green}Passou: ${passedTests}${colors.reset}`);
  console.log(`${colors.yellow}Avisos: ${warnings}${colors.reset}`);
  console.log(`${colors.red}Erros: ${errors}${colors.reset}`);
  
  const successRate = Math.round((passedTests / totalTests) * 100);
  console.log(`Taxa de sucesso: ${successRate}%`);
  
  // Recomendações
  console.log('\n' + '='.repeat(60));
  console.log('💡 RECOMENDAÇÕES:');
  
  if (errors === 0) {
    console.log(`${colors.green}🎉 Sistema pronto para uso!${colors.reset}`);
    console.log('1. Execute: cd backend && npm start');
    console.log('2. Execute: npm run dev');
    console.log('3. Acesse: http://localhost:5173');
  } else if (errors <= 2) {
    console.log(`${colors.yellow}⚠️  Sistema quase pronto${colors.reset}`);
    console.log('1. Corrija os erros listados acima');
    console.log('2. Execute este teste novamente');
  } else {
    console.log(`${colors.red}❌ Sistema precisa de configuração${colors.reset}`);
    console.log('1. Execute: ./scripts/install-dependencies.sh');
    console.log('2. Instale as dependências faltantes');
    console.log('3. Execute este teste novamente');
  }
  
  console.log('='.repeat(60));
  
  return { totalTests, passedTests, warnings, errors, successRate };
}

// Função principal
async function main() {
  console.log(`${colors.magenta}🧪 TESTE COMPLETO DO SISTEMA ANDROID EMULATOR${colors.reset}`);
  console.log('='.repeat(60));
  
  const testResults = {};
  
  try {
    // Executar todos os testes
    testResults.systemDependencies = await testSystemDependencies();
    testResults.directories = await testDirectories();
    testResults.novnc = await testNoVNC();
    testResults.kvm = await testKVM();
    testResults.ports = await testPorts();
    testResults.virtualDisk = await testVirtualDisk();
    testResults.backend = await testBackend();
    testResults.frontend = await testFrontend();
    
    // Gerar relatório
    const summary = generateReport(testResults);
    
    // Salvar relatório em arquivo
    const reportPath = 'test-report.json';
    await fs.writeFile(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary,
      results: testResults
    }, null, 2));
    
    log.success(`📄 Relatório salvo em: ${reportPath}`);
    
    // Exit code baseado no resultado
    process.exit(summary.errors > 0 ? 1 : 0);
    
  } catch (error) {
    log.error(`❌ Erro durante os testes: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  testSystemDependencies,
  testDirectories,
  testNoVNC,
  testKVM,
  testPorts,
  testVirtualDisk,
  testBackend,
  testFrontend
};