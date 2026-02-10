#!/bin/bash
# Script para iniciar Android em formato celular
# Executar no WSL2

INSTANCE="especial"
DISK_PATH=~/android-emulator/instances/$INSTANCE/android.qcow2
VNC_PORT=1
WS_PORT=6081
ADB_PORT=5556
MONITOR_PORT=7001

echo "🚀 Iniciando Android..."

# Limpar processos anteriores
killall -9 qemu-system-x86_64 2>/dev/null || true
sleep 2

# Dar permissão KVM
sudo chmod 666 /dev/kvm 2>/dev/null || true

# Verificar se disco existe
if [ ! -f "$DISK_PATH" ]; then
    echo "❌ Disco não encontrado!"
    echo "Execute primeiro a instalação"
    exit 1
fi

# Iniciar QEMU com resolução celular
echo "📱 Formato: 720x1520 (celular)"

qemu-system-x86_64 \
  -enable-kvm -cpu host \
  -m 4096 -smp 4 \
  -drive file=$DISK_PATH,if=virtio \
  -boot order=c \
  -netdev user,id=net0,hostfwd=tcp::$ADB_PORT-:5555 \
  -device e1000,netdev=net0 \
  -device virtio-vga,xres=720,yres=1520 \
  -vnc 0.0.0.0:$VNC_PORT,websocket=$WS_PORT \
  -monitor tcp:0.0.0.0:$MONITOR_PORT,server,nowait \
  -daemonize

echo "✅ Android iniciado!"
echo "📺 VNC: ws://$(hostname -I | awk '{print $1}'):$WS_PORT"
echo "🔌 ADB: 127.0.0.1:$ADB_PORT"

# Aguardar Android iniciar
echo "⏳ Aguardando Android (40s)..."
sleep 40

# Configurar via ADB
echo "🔧 Configurando..."
adb connect 127.0.0.1:$ADB_PORT
sleep 2

# Pular wizard
adb -s 127.0.0.1:$ADB_PORT shell settings put secure user_setup_complete 1
adb -s 127.0.0.1:$ADB_PORT shell settings put global device_provisioned 1

# Resolução celular
adb -s 127.0.0.1:$ADB_PORT shell wm size 720x1520
adb -s 127.0.0.1:$ADB_PORT shell wm density 320
adb -s 127.0.0.1:$ADB_PORT shell settings put system user_rotation 0

# Desabilitar animações
adb -s 127.0.0.1:$ADB_PORT shell settings put global window_animation_scale 0
adb -s 127.0.0.1:$ADB_PORT shell settings put global transition_animation_scale 0

# Acordar tela se estiver dormindo
adb -s 127.0.0.1:$ADB_PORT shell input keyevent KEYCODE_WAKEUP
adb -s 127.0.0.1:$ADB_PORT shell input keyevent KEYCODE_MENU
sleep 1

# Ir para home
adb -s 127.0.0.1:$ADB_PORT shell input keyevent KEYCODE_HOME
adb -s 127.0.0.1:$ADB_PORT shell input keyevent KEYCODE_WAKEUP

echo "✅ Pronto!"
echo "🎉 Android rodando em formato celular!"
