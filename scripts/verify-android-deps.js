#!/usr/bin/env node

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Verificador de dependências Android Emulator
 */
class AndroidDependencyVerifier {
  constructor() {
    this.baseDir = path.join(process.cwd(), 'android-dependencies');
    this.emulatorDataDir = path.join(process.cwd(), 'src', 'modules', 'AndroidEmulator', 'data');
    this.binDir = path.join(this.baseDir, 'bin');
    this.platform = process.platform;
  }

  async verify() {
    console.log('🔍 VERIFICADOR ANDROID EMULATOR DEPENDENCIES');
    console.log('=============================================');
    console.log('');

    const results = {
      qemu: await this.checkQEMU(),
      adb: await this.checkADB(),
      websockify: await this.checkWebsockify(),
      androidImages: await this.checkAndroidImages(),
      directories: await this.checkDirectories(),
      environment: await this.checkEnvironment()
    };

    this.printResults(results);
    
    const allGood = Object.values(results).every(result => result.status === 'ok');
    
    if (allGood) {
      console.log('');
      console.log('🎉 TUDO PRONTO PARA ANDROID EMULATOR!');
      console.log('');
      console.log('🚀 PRÓXIMOS PASSOS:');
      console.log('1. Execute: npm run android:start');
      console.log('2. Acesse: http://localhost:5173');
      console.log('3. Vá para: Módulos → Android Emulator');
      console.log('4. Crie uma instância Android');
      console.log('5. Inicie e use o Android REAL!');
      return true;
    } else {
      console.log('');
      console.log('❌ ALGUMAS DEPENDÊNCIAS ESTÃO FALTANDO');
      console.log('');
      console.log('🔧 SOLUÇÕES:');
      
      if (results.qemu.status !== 'ok') {
        console.log('• QEMU: Execute node scripts/install-android-dependencies.js');
      }
      if (results.adb.status !== 'ok') {
        console.log('• ADB: Execute node scripts/install-android-dependencies.js');
      }
      if (results.androidImages.status !== 'ok') {
        console.log('• Imagem Android: Execute node scripts/install-android-dependencies.js');
      }
      
      return false;
    }
  }

  async checkQEMU() {
    try {
      // Verificar no diretório local primeiro
      const qemuExe = this.platform === 'win32' ? 'qemu-system-x86_64.exe' : 'qemu-system-x86_64';
      const localQemu = path.join(this.binDir, qemuExe);
      
      if (await this.fileExists(localQemu)) {
        const version = await this.getVersion(localQemu, ['--version']);
        return {
          status: 'ok',
          location: 'local',
          path: localQemu,
          version: version.split('\n')[0]
        };
      }
      
      // Verificar no PATH do sistema
      const systemVersion = await this.getVersion('qemu-system-x86_64', ['--version']);
      return {
        status: 'ok',
        location: 'system',
        path: 'system PATH',
        version: systemVersion.split('\n')[0]
      };
      
    } catch (error) {
      return {
        status: 'missing',
        error: 'QEMU não encontrado'
      };
    }
  }

  async checkADB() {
    try {
      // Verificar no diretório local primeiro
      const adbExe = this.platform === 'win32' ? 'adb.exe' : 'adb';
      const localAdb = path.join(this.binDir, adbExe);
      
      if (await this.fileExists(localAdb)) {
        const version = await this.getVersion(localAdb, ['version']);
        return {
          status: 'ok',
          location: 'local',
          path: localAdb,
          version: version.split('\n')[0]
        };
      }
      
      // Verificar no PATH do sistema
      const systemVersion = await this.getVersion('adb', ['version']);
      return {
        status: 'ok',
        location: 'system',
        path: 'system PATH',
        version: systemVersion.split('\n')[0]
      };
      
    } catch (error) {
      return {
        status: 'missing',
        error: 'ADB não encontrado'
      };
    }
  }

  async checkWebsockify() {
    try {
      const version = await this.getVersion('websockify', ['--version']);
      return {
        status: 'ok',
        location: 'system',
        path: 'system PATH',
        version: version.trim()
      };
    } catch (error) {
      return {
        status: 'optional',
        error: 'websockify não encontrado (opcional)'
      };
    }
  }

  async checkAndroidImages() {
    try {
      const imagesDir = path.join(this.emulatorDataDir, 'android-images');
      
      if (!await this.fileExists(imagesDir)) {
        return {
          status: 'missing',
          error: 'Diretório de imagens não existe'
        };
      }
      
      const files = await fs.readdir(imagesDir);
      const isoFiles = files.filter(file => file.endsWith('.iso'));
      
      if (isoFiles.length === 0) {
        return {
          status: 'missing',
          error: 'Nenhuma imagem Android (.iso) encontrada'
        };
      }
      
      const images = [];
      for (const file of isoFiles) {
        const filePath = path.join(imagesDir, file);
        const stats = await fs.stat(filePath);
        images.push({
          name: file,
          size: Math.round(stats.size / 1024 / 1024) + 'MB',
          path: filePath
        });
      }
      
      return {
        status: 'ok',
        images,
        count: images.length
      };
      
    } catch (error) {
      return {
        status: 'missing',
        error: error.message
      };
    }
  }

  async checkDirectories() {
    const requiredDirs = [
      path.join(this.emulatorDataDir, 'android-images'),
      path.join(this.emulatorDataDir, 'instances'),
      path.join(this.emulatorDataDir, 'logs'),
      path.join(this.emulatorDataDir, 'virtual-disks'),
      path.join(this.emulatorDataDir, 'configs'),
      this.binDir
    ];

    const results = [];
    let allExist = true;

    for (const dir of requiredDirs) {
      const exists = await this.fileExists(dir);
      results.push({
        path: dir,
        exists
      });
      if (!exists) allExist = false;
    }

    return {
      status: allExist ? 'ok' : 'partial',
      directories: results
    };
  }

  async checkEnvironment() {
    const envScript = this.platform === 'win32' ? 'android-env.bat' : 'android-env.sh';
    const envPath = path.join(this.baseDir, envScript);
    
    const exists = await this.fileExists(envPath);
    
    return {
      status: exists ? 'ok' : 'missing',
      path: envPath,
      exists
    };
  }

  printResults(results) {
    console.log('📋 RESULTADOS DA VERIFICAÇÃO:');
    console.log('');

    // QEMU
    if (results.qemu.status === 'ok') {
      console.log('✅ QEMU: Instalado');
      console.log(`   📍 Local: ${results.qemu.location}`);
      console.log(`   📁 Caminho: ${results.qemu.path}`);
      console.log(`   🏷️ Versão: ${results.qemu.version}`);
    } else {
      console.log('❌ QEMU: Não instalado');
      console.log(`   ⚠️ Erro: ${results.qemu.error}`);
    }
    console.log('');

    // ADB
    if (results.adb.status === 'ok') {
      console.log('✅ ADB: Instalado');
      console.log(`   📍 Local: ${results.adb.location}`);
      console.log(`   📁 Caminho: ${results.adb.path}`);
      console.log(`   🏷️ Versão: ${results.adb.version}`);
    } else {
      console.log('❌ ADB: Não instalado');
      console.log(`   ⚠️ Erro: ${results.adb.error}`);
    }
    console.log('');

    // websockify
    if (results.websockify.status === 'ok') {
      console.log('✅ websockify: Instalado');
      console.log(`   🏷️ Versão: ${results.websockify.version}`);
    } else if (results.websockify.status === 'optional') {
      console.log('⚠️ websockify: Não instalado (opcional)');
    } else {
      console.log('❌ websockify: Erro');
    }
    console.log('');

    // Imagens Android
    if (results.androidImages.status === 'ok') {
      console.log('✅ Imagens Android: Disponíveis');
      console.log(`   📱 Quantidade: ${results.androidImages.count}`);
      results.androidImages.images.forEach(img => {
        console.log(`   📀 ${img.name} (${img.size})`);
      });
    } else {
      console.log('❌ Imagens Android: Não encontradas');
      console.log(`   ⚠️ Erro: ${results.androidImages.error}`);
    }
    console.log('');

    // Diretórios
    if (results.directories.status === 'ok') {
      console.log('✅ Diretórios: Todos criados');
    } else {
      console.log('⚠️ Diretórios: Alguns faltando');
      results.directories.directories.forEach(dir => {
        const status = dir.exists ? '✅' : '❌';
        console.log(`   ${status} ${path.basename(dir.path)}`);
      });
    }
    console.log('');

    // Ambiente
    if (results.environment.status === 'ok') {
      console.log('✅ Ambiente: Configurado');
      console.log(`   📁 Script: ${results.environment.path}`);
    } else {
      console.log('❌ Ambiente: Não configurado');
    }
  }

  async getVersion(command, args) {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, { stdio: 'pipe' });
      
      let stdout = '';
      let stderr = '';
      
      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve(stdout || stderr);
        } else {
          reject(new Error(`Command failed: ${command} ${args.join(' ')}`));
        }
      });
      
      process.on('error', reject);
    });
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

// Executar verificador
if (import.meta.url === `file://${process.argv[1]}`) {
  const verifier = new AndroidDependencyVerifier();
  verifier.verify().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { AndroidDependencyVerifier };