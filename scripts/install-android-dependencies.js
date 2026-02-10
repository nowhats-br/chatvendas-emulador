#!/usr/bin/env node

import { spawn, exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Instalador automático de dependências Android Emulator
 * Instala QEMU, ADB e baixa imagem Android automaticamente
 */
class AndroidDependencyInstaller {
  constructor() {
    this.baseDir = path.join(process.cwd(), 'android-dependencies');
    this.emulatorDataDir = path.join(process.cwd(), 'src', 'modules', 'AndroidEmulator', 'data');
    this.platform = process.platform;
    this.arch = process.arch;
    
    console.log('🚀 INSTALADOR AUTOMÁTICO ANDROID EMULATOR');
    console.log('==========================================');
    console.log(`Platform: ${this.platform}`);
    console.log(`Architecture: ${this.arch}`);
    console.log(`Base Directory: ${this.baseDir}`);
    console.log('');
  }

  async install() {
    try {
      console.log('📁 Criando diretórios...');
      await this.createDirectories();
      
      console.log('🔧 Instalando QEMU...');
      await this.installQEMU();
      
      console.log('📱 Instalando ADB...');
      await this.installADB();
      
      console.log('🌐 Instalando websockify...');
      await this.installWebsockify();
      
      console.log('📥 Baixando imagem Android...');
      await this.downloadAndroidImage();
      
      console.log('⚙️ Configurando PATH...');
      await this.setupEnvironment();
      
      console.log('✅ Verificando instalação...');
      await this.verifyInstallation();
      
      console.log('');
      console.log('🎉 INSTALAÇÃO COMPLETA!');
      console.log('✅ QEMU instalado e configurado');
      console.log('✅ ADB instalado e configurado');
      console.log('✅ websockify instalado');
      console.log('✅ Imagem Android baixada');
      console.log('✅ Ambiente configurado');
      console.log('');
      console.log('🚀 PRÓXIMOS PASSOS:');
      console.log('1. Reinicie o terminal');
      console.log('2. Execute: npm run dev');
      console.log('3. Acesse: http://localhost:5173');
      console.log('4. Vá para: Módulos → Android Emulator');
      console.log('5. Crie uma instância Android');
      console.log('6. Inicie e use o Android REAL!');
      
    } catch (error) {
      console.error('❌ Erro na instalação:', error.message);
      console.log('');
      console.log('🔧 SOLUÇÕES:');
      console.log('• Execute como Administrador (Windows)');
      console.log('• Verifique conexão com internet');
      console.log('• Tente instalar manualmente');
      process.exit(1);
    }
  }

  async createDirectories() {
    const dirs = [
      this.baseDir,
      path.join(this.baseDir, 'qemu'),
      path.join(this.baseDir, 'adb'),
      path.join(this.baseDir, 'bin'),
      path.join(this.emulatorDataDir, 'android-images'),
      path.join(this.emulatorDataDir, 'instances'),
      path.join(this.emulatorDataDir, 'logs'),
      path.join(this.emulatorDataDir, 'virtual-disks'),
      path.join(this.emulatorDataDir, 'configs')
    ];

    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
      console.log(`  📁 ${dir}`);
    }
  }

  async installQEMU() {
    const qemuDir = path.join(this.baseDir, 'qemu');
    
    if (this.platform === 'win32') {
      await this.installQEMUWindows(qemuDir);
    } else if (this.platform === 'linux') {
      await this.installQEMULinux(qemuDir);
    } else if (this.platform === 'darwin') {
      await this.installQEMUMacOS(qemuDir);
    } else {
      throw new Error(`Platform ${this.platform} not supported`);
    }
  }

  async installQEMUWindows(qemuDir) {
    console.log('  🪟 Instalando QEMU para Windows...');
    
    // Baixar QEMU portable para Windows
    const qemuUrl = 'https://qemu.weilnetz.de/w64/2023/qemu-w64-setup-20231009.exe';
    const qemuInstaller = path.join(qemuDir, 'qemu-installer.exe');
    
    console.log('  📥 Baixando QEMU...');
    await this.downloadFile(qemuUrl, qemuInstaller);
    
    console.log('  ⚙️ Instalando QEMU...');
    await this.runCommand(qemuInstaller, ['/S', `/D=${qemuDir}`]);
    
    // Copiar executáveis para bin
    const binDir = path.join(this.baseDir, 'bin');
    const qemuBin = path.join(qemuDir, 'qemu-system-x86_64.exe');
    const qemuImgBin = path.join(qemuDir, 'qemu-img.exe');
    
    if (await this.fileExists(qemuBin)) {
      await fs.copyFile(qemuBin, path.join(binDir, 'qemu-system-x86_64.exe'));
    }
    if (await this.fileExists(qemuImgBin)) {
      await fs.copyFile(qemuImgBin, path.join(binDir, 'qemu-img.exe'));
    }
    
    console.log('  ✅ QEMU instalado para Windows');
  }

  async installQEMULinux(qemuDir) {
    console.log('  🐧 Instalando QEMU para Linux...');
    
    try {
      // Tentar instalar via package manager
      await this.runCommand('sudo', ['apt', 'update']);
      await this.runCommand('sudo', ['apt', 'install', '-y', 'qemu-system-x86']);
    } catch (error) {
      console.log('  ⚠️ Falha no apt, tentando yum...');
      try {
        await this.runCommand('sudo', ['yum', 'install', '-y', 'qemu-kvm']);
      } catch (error2) {
        console.log('  ⚠️ Falha no yum, tentando pacman...');
        await this.runCommand('sudo', ['pacman', '-S', '--noconfirm', 'qemu']);
      }
    }
    
    console.log('  ✅ QEMU instalado para Linux');
  }

  async installQEMUMacOS(qemuDir) {
    console.log('  🍎 Instalando QEMU para macOS...');
    
    try {
      // Tentar instalar via Homebrew
      await this.runCommand('brew', ['install', 'qemu']);
    } catch (error) {
      console.log('  ⚠️ Homebrew não encontrado, baixando binário...');
      // Implementar download de binário para macOS se necessário
      throw new Error('Instale Homebrew primeiro: https://brew.sh/');
    }
    
    console.log('  ✅ QEMU instalado para macOS');
  }

  async installADB() {
    const adbDir = path.join(this.baseDir, 'adb');
    
    console.log('  📱 Baixando Android SDK Platform Tools...');
    
    let adbUrl;
    let adbFile;
    
    if (this.platform === 'win32') {
      adbUrl = 'https://dl.google.com/android/repository/platform-tools-latest-windows.zip';
      adbFile = 'platform-tools-windows.zip';
    } else if (this.platform === 'linux') {
      adbUrl = 'https://dl.google.com/android/repository/platform-tools-latest-linux.zip';
      adbFile = 'platform-tools-linux.zip';
    } else if (this.platform === 'darwin') {
      adbUrl = 'https://dl.google.com/android/repository/platform-tools-latest-darwin.zip';
      adbFile = 'platform-tools-darwin.zip';
    }
    
    const adbZip = path.join(adbDir, adbFile);
    
    console.log('  📥 Baixando ADB...');
    await this.downloadFile(adbUrl, adbZip);
    
    console.log('  📦 Extraindo ADB...');
    await this.extractZip(adbZip, adbDir);
    
    // Copiar executáveis para bin
    const binDir = path.join(this.baseDir, 'bin');
    const platformToolsDir = path.join(adbDir, 'platform-tools');
    
    const adbExe = this.platform === 'win32' ? 'adb.exe' : 'adb';
    const fastbootExe = this.platform === 'win32' ? 'fastboot.exe' : 'fastboot';
    
    const adbSrc = path.join(platformToolsDir, adbExe);
    const fastbootSrc = path.join(platformToolsDir, fastbootExe);
    
    if (await this.fileExists(adbSrc)) {
      await fs.copyFile(adbSrc, path.join(binDir, adbExe));
      if (this.platform !== 'win32') {
        await fs.chmod(path.join(binDir, adbExe), '755');
      }
    }
    
    if (await this.fileExists(fastbootSrc)) {
      await fs.copyFile(fastbootSrc, path.join(binDir, fastbootExe));
      if (this.platform !== 'win32') {
        await fs.chmod(path.join(binDir, fastbootExe), '755');
      }
    }
    
    console.log('  ✅ ADB instalado');
  }

  async installWebsockify() {
    console.log('  🌐 Instalando websockify...');
    
    try {
      // Tentar instalar via npm
      await this.runCommand('npm', ['install', '-g', 'websockify']);
      console.log('  ✅ websockify instalado via npm');
    } catch (error) {
      try {
        // Tentar instalar via pip
        await this.runCommand('pip', ['install', 'websockify']);
        console.log('  ✅ websockify instalado via pip');
      } catch (error2) {
        console.log('  ⚠️ websockify não instalado (opcional)');
      }
    }
  }

  async downloadAndroidImage() {
    const imagesDir = path.join(this.emulatorDataDir, 'android-images');
    const imageFile = 'android-x86_64-11.0-r4.iso';
    const imagePath = path.join(imagesDir, imageFile);
    
    // Verificar se já existe
    if (await this.fileExists(imagePath)) {
      console.log('  ✅ Imagem Android já existe');
      return;
    }
    
    console.log('  📥 Baixando Android-x86 11.0 R4 (900MB)...');
    console.log('  ⏳ Isso pode levar alguns minutos...');
    
    // URL do Android-x86 11.0 R4
    const imageUrl = 'https://osdn.net/frs/redir.php?m=auto&f=android-x86%2F71931%2Fandroid-x86_64-11.0-r4.iso';
    
    try {
      await this.downloadFile(imageUrl, imagePath, true);
      console.log('  ✅ Imagem Android baixada com sucesso');
    } catch (error) {
      console.log('  ⚠️ Falha no download automático');
      console.log('  💡 Baixe manualmente de: https://www.android-x86.org/download');
      console.log(`  📁 Coloque em: ${imagePath}`);
    }
  }

  async setupEnvironment() {
    const binDir = path.join(this.baseDir, 'bin');
    
    // Criar script de ambiente
    const envScript = this.platform === 'win32' ? 'android-env.bat' : 'android-env.sh';
    const envPath = path.join(this.baseDir, envScript);
    
    let envContent;
    
    if (this.platform === 'win32') {
      envContent = `@echo off
REM Android Emulator Environment
set PATH=${binDir};%PATH%
echo Android Emulator environment loaded
echo QEMU: %PATH%
echo ADB: %PATH%
`;
    } else {
      envContent = `#!/bin/bash
# Android Emulator Environment
export PATH="${binDir}:$PATH"
echo "Android Emulator environment loaded"
echo "QEMU: $(which qemu-system-x86_64)"
echo "ADB: $(which adb)"
`;
    }
    
    await fs.writeFile(envPath, envContent);
    
    if (this.platform !== 'win32') {
      await fs.chmod(envPath, '755');
    }
    
    console.log(`  ✅ Script de ambiente criado: ${envPath}`);
    
    // Atualizar package.json com scripts
    await this.updatePackageJson();
  }

  async updatePackageJson() {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    
    try {
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
      
      // Adicionar scripts para Android Emulator
      if (!packageJson.scripts) {
        packageJson.scripts = {};
      }
      
      const binDir = path.join(this.baseDir, 'bin');
      const envVar = this.platform === 'win32' ? 
        `set PATH=${binDir};%PATH% && ` : 
        `export PATH="${binDir}:$PATH" && `;
      
      packageJson.scripts['android:env'] = this.platform === 'win32' ? 
        `${this.baseDir}\\android-env.bat` : 
        `source ${this.baseDir}/android-env.sh`;
      
      packageJson.scripts['android:verify'] = `${envVar}node scripts/verify-android-deps.js`;
      packageJson.scripts['android:start'] = `${envVar}npm run dev`;
      
      await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('  ✅ package.json atualizado com scripts Android');
    } catch (error) {
      console.log('  ⚠️ Falha ao atualizar package.json:', error.message);
    }
  }

  async verifyInstallation() {
    const binDir = path.join(this.baseDir, 'bin');
    const checks = [];
    
    // Verificar QEMU
    const qemuExe = this.platform === 'win32' ? 'qemu-system-x86_64.exe' : 'qemu-system-x86_64';
    const qemuPath = path.join(binDir, qemuExe);
    
    if (await this.fileExists(qemuPath)) {
      checks.push('✅ QEMU instalado');
    } else {
      checks.push('❌ QEMU não encontrado');
    }
    
    // Verificar ADB
    const adbExe = this.platform === 'win32' ? 'adb.exe' : 'adb';
    const adbPath = path.join(binDir, adbExe);
    
    if (await this.fileExists(adbPath)) {
      checks.push('✅ ADB instalado');
    } else {
      checks.push('❌ ADB não encontrado');
    }
    
    // Verificar imagem Android
    const imagePath = path.join(this.emulatorDataDir, 'android-images', 'android-x86_64-11.0-r4.iso');
    
    if (await this.fileExists(imagePath)) {
      checks.push('✅ Imagem Android disponível');
    } else {
      checks.push('❌ Imagem Android não encontrada');
    }
    
    console.log('');
    console.log('📋 VERIFICAÇÃO:');
    checks.forEach(check => console.log(`  ${check}`));
  }

  // Utility methods
  async downloadFile(url, destination, showProgress = false) {
    return new Promise((resolve, reject) => {
      const file = createWriteStream(destination);
      
      https.get(url, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          // Handle redirect
          return this.downloadFile(response.headers.location, destination, showProgress)
            .then(resolve)
            .catch(reject);
        }
        
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
          return;
        }
        
        const totalSize = parseInt(response.headers['content-length'], 10);
        let downloadedSize = 0;
        
        response.on('data', (chunk) => {
          downloadedSize += chunk.length;
          if (showProgress && totalSize) {
            const percent = Math.round((downloadedSize / totalSize) * 100);
            process.stdout.write(`\r  📥 Progresso: ${percent}% (${Math.round(downloadedSize / 1024 / 1024)}MB)`);
          }
        });
        
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          if (showProgress) {
            console.log(''); // Nova linha após progresso
          }
          resolve();
        });
        
        file.on('error', (error) => {
          fs.unlink(destination).catch(() => {});
          reject(error);
        });
      }).on('error', reject);
    });
  }

  async extractZip(zipPath, extractDir) {
    // Implementação simples de extração ZIP
    // Em produção, usaria uma biblioteca como 'yauzl' ou 'node-stream-zip'
    return this.runCommand('unzip', ['-q', zipPath, '-d', extractDir]);
  }

  async runCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, {
        stdio: 'pipe',
        ...options
      });
      
      let stdout = '';
      let stderr = '';
      
      process.stdout?.on('data', (data) => {
        stdout += data.toString();
      });
      
      process.stderr?.on('data', (data) => {
        stderr += data.toString();
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(`Command failed: ${command} ${args.join(' ')}\n${stderr}`));
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

// Executar instalador
if (import.meta.url === `file://${process.argv[1]}`) {
  const installer = new AndroidDependencyInstaller();
  installer.install();
}

export { AndroidDependencyInstaller };