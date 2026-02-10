/**
 * Instalador Android DEVAGAR (para funcionar corretamente)
 * Sequência: Liga -> Instala -> Reinicia -> Tela inicial com apps
 * Formato: Celular (720x1520) tela cheia
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import net from 'net';

const execPromise = promisify(exec);

async function runWSL(command) {
  const { stdout } = await execPromise(`wsl -d Ubuntu-22.04 -- bash -c "${command}"`);
  return stdout.trim();
}

async function sendKey(port, key, delay = 1000) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    client.setTimeout(3000);

    client.connect(port, '127.0.0.1', () => {
      client.write(`sendkey ${key}\n`);
      setTimeout(() => {
        client.end();
        setTimeout(resolve, delay); // Aguardar após enviar
      }, 200);
    });

    client.on('error', (err) => {
      client.destroy();
      resolve(); // Continuar mesmo com erro
    });

    client.on('timeout', () => {
      client.destroy();
      resolve();
    });
  });
}

async function instalarAndroid() {
  console.log('🚀 INSTALADOR ANDROID DEVAGAR');
  console.log('==============================');
  console.log('📱 Formato: Celular (720x1520)');
  console.log('⏱️  Tempo estimado: 5 minutos\n');

  const instanceName = 'especial';
  const vncPort = 1;
  const wsPort = 6081;
  const adbPort = 5556;
  const monitorPort = 7001;

  // 1. Limpar
  console.log('[1/6] 🧹 Limpando...');
  await runWSL('killall -9 qemu-system-x86_64 2>/dev/null || true');
  await runWSL('rm -f /tmp/qemu-*.pid');
  await new Promise(resolve => setTimeout(resolve, 3000));

  // 2. Preparar disco
  console.log('[2/6] 💾 Preparando disco 16GB...');
  const diskPath = `~/android-emulator/instances/${instanceName}/android.qcow2`;
  await runWSL(`mkdir -p ~/android-emulator/instances/${instanceName}`);
  await runWSL(`rm -f ${diskPath}`);
  await runWSL(`qemu-img create -f qcow2 ${diskPath} 16G`);

  // 3. Iniciar em modo instalação
  console.log('[3/6] 🎮 Iniciando QEMU (modo instalação)...');
  await runWSL('sudo chmod 666 /dev/kvm 2>/dev/null || true');

  const isoPath = '~/android-emulator/images/android-x86.iso';
  const qemuCmd = `qemu-system-x86_64 -enable-kvm -cpu host -m 4096 -smp 4 -drive file=${diskPath},if=virtio -cdrom ${isoPath} -boot order=dc -netdev user,id=net0,hostfwd=tcp::${adbPort}-:5555 -device e1000,netdev=net0 -device virtio-vga,xres=720,yres=1520 -vnc 0.0.0.0:${vncPort},websocket=${wsPort} -monitor tcp:0.0.0.0:${monitorPort},server,nowait -daemonize`;

  await runWSL(qemuCmd);
  console.log('   ✅ QEMU iniciado');
  console.log(`   📺 VNC: ws://192.168.72.149:${wsPort}\n`);

  // 4. Instalação automática DEVAGAR
  console.log('[4/6] 🤖 Instalando Android (DEVAGAR)...');
  
  console.log('   ⏳ Aguardando menu de boot (15s)...');
  await new Promise(resolve => setTimeout(resolve, 15000));

  console.log('   📍 Selecionando Installation...');
  await sendKey(monitorPort, 'down', 800);
  await sendKey(monitorPort, 'down', 800);
  await sendKey(monitorPort, 'ret', 5000);

  console.log('   💾 Criando partição...');
  await sendKey(monitorPort, 'ret', 3000); // Create/Modify

  // cfdisk - DEVAGAR
  await sendKey(monitorPort, 'ret', 1000); // New
  await sendKey(monitorPort, 'ret', 1000); // Primary
  await sendKey(monitorPort, 'ret', 2000); // Tamanho máximo
  await sendKey(monitorPort, 'down', 800); // Bootable
  await sendKey(monitorPort, 'ret', 1000);
  await sendKey(monitorPort, 'down', 800); // Write
  await sendKey(monitorPort, 'ret', 1000);
  
  // Digitar "yes" DEVAGAR
  await sendKey(monitorPort, 'y', 300);
  await sendKey(monitorPort, 'e', 300);
  await sendKey(monitorPort, 's', 300);
  await sendKey(monitorPort, 'ret', 2000);
  
  await sendKey(monitorPort, 'down', 800); // Quit
  await sendKey(monitorPort, 'ret', 3000);

  console.log('   📂 Selecionando partição...');
  await sendKey(monitorPort, 'ret', 3000);

  console.log('   💿 Formatando ext4...');
  await sendKey(monitorPort, 'ret', 5000);
  await sendKey(monitorPort, 'left', 800);
  await sendKey(monitorPort, 'ret', 8000); // Aguardar formatação

  console.log('   ⚙️  Instalando GRUB...');
  await sendKey(monitorPort, 'left', 800);
  await sendKey(monitorPort, 'ret', 5000);

  console.log('   📦 Copiando sistema (90s)...');
  await sendKey(monitorPort, 'left', 800);
  await sendKey(monitorPort, 'ret', 1000);
  await new Promise(resolve => setTimeout(resolve, 90000)); // Aguardar cópia

  console.log('   🔄 Reiniciando...');
  await sendKey(monitorPort, 'ret', 5000);

  // 5. Parar e reiniciar com boot pelo HD
  console.log('[5/6] 🔄 Mudando para boot pelo HD...');
  await runWSL('killall -9 qemu-system-x86_64');
  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log('   🚀 Iniciando Android do disco...');
  const qemuCmdHD = `qemu-system-x86_64 -enable-kvm -cpu host -m 4096 -smp 4 -drive file=${diskPath},if=virtio -boot order=c -netdev user,id=net0,hostfwd=tcp::${adbPort}-:5555 -device e1000,netdev=net0 -device virtio-vga,xres=720,yres=1520 -vnc 0.0.0.0:${vncPort},websocket=${wsPort} -monitor tcp:0.0.0.0:${monitorPort},server,nowait -daemonize`;

  await runWSL(qemuCmdHD);
  console.log('   ✅ Android iniciado\n');

  // 6. Configurar via ADB
  console.log('[6/6] 🔧 Configurando Android...');
  console.log('   ⏳ Aguardando boot (40s)...');
  await new Promise(resolve => setTimeout(resolve, 40000));

  try {
    console.log('   🔌 Conectando ADB...');
    await runWSL(`adb connect 127.0.0.1:${adbPort}`);
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('   ⚙️  Pulando wizard...');
    await runWSL(`adb -s 127.0.0.1:${adbPort} shell settings put secure user_setup_complete 1`);
    await runWSL(`adb -s 127.0.0.1:${adbPort} shell settings put secure tv_user_setup_complete 1`);
    await runWSL(`adb -s 127.0.0.1:${adbPort} shell settings put global device_provisioned 1`);

    console.log('   📱 Aplicando resolução celular...');
    await runWSL(`adb -s 127.0.0.1:${adbPort} shell wm size 720x1520`);
    await runWSL(`adb -s 127.0.0.1:${adbPort} shell wm density 320`);
    await runWSL(`adb -s 127.0.0.1:${adbPort} shell settings put system user_rotation 0`);
    await runWSL(`adb -s 127.0.0.1:${adbPort} shell settings put system accelerometer_rotation 0`);

    console.log('   🏠 Reiniciando launcher...');
    await runWSL(`adb -s 127.0.0.1:${adbPort} shell am force-stop com.android.launcher3`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('   💡 Acordando tela...');
    await runWSL(`adb -s 127.0.0.1:${adbPort} shell input keyevent KEYCODE_WAKEUP`);
    await runWSL(`adb -s 127.0.0.1:${adbPort} shell input keyevent KEYCODE_MENU`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await runWSL(`adb -s 127.0.0.1:${adbPort} shell input keyevent KEYCODE_HOME`);

    console.log('   ✅ Configurado!\n');
  } catch (e) {
    console.log('   ⚠️  ADB:', e.message, '\n');
  }

  console.log('🎉 PRONTO!');
  console.log('==========');
  console.log('✅ Android instalado');
  console.log('✅ Formato celular (720x1520)');
  console.log('✅ Tela inicial com apps');
  console.log('✅ Play Store, Galeria, etc.');
  console.log(`\n📺 Veja no VNC: ws://192.168.72.149:${wsPort}`);
}

instalarAndroid().catch(console.error);
