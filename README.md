# ChatVendas - Sistema de Vendas com WhatsApp e Android Emulator

## 🚀 Iniciar Sistema

### 1. Iniciar Backend e Frontend
```cmd
iniciar-sistema.bat
```

Ou manualmente:
```cmd
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
npm run dev
```

### 2. Acessar Sistema
- Frontend: http://localhost:5173
- Backend API: http://localhost:3010

## 📱 Android Emulator (WSL2)

### Pré-requisitos
- WSL2 instalado (Ubuntu-22.04)
- QEMU e ADB instalados no WSL2

### Instalar Android (Primeira vez)
```cmd
node backend/instalar-android-devagar.js
```

Tempo: ~5 minutos
- Cria disco de 16GB
- Instala Android automaticamente
- Configura formato celular (720x1520)

### Iniciar Android
```cmd
wsl -d Ubuntu-22.04 -- bash backend/start-android.sh
```

O Android estará disponível em:
- VNC WebSocket: ws://192.168.72.149:6081
- ADB: 127.0.0.1:5556

### Parar Android
```cmd
wsl -d Ubuntu-22.04 -- bash -c "killall -9 qemu-system-x86_64"
```

## 🔧 Comandos Úteis

### Verificar Status
```cmd
# Backend
curl http://localhost:3010/api/health

# Android QEMU
wsl -d Ubuntu-22.04 -- bash -c "ps aux | grep qemu | grep -v grep"

# ADB
wsl -d Ubuntu-22.04 -- bash -c "adb devices"
```

### Resetar Banco de Dados
```cmd
cd backend
node reset_instance_db.js
```

## 📂 Estrutura

```
├── backend/
│   ├── src/
│   │   ├── server.js              # Servidor principal
│   │   ├── services/              # Serviços (WhatsApp, Android, etc)
│   │   ├── routes/                # Rotas da API
│   │   └── database/              # Banco de dados SQLite
│   ├── sessions/                  # Sessões WhatsApp
│   ├── data/                      # Banco de dados
│   ├── instalar-android-devagar.js # Instalador Android
│   ├── start-android.sh           # Script iniciar Android
│   └── reset_instance_db.js       # Reset do banco
├── src/                           # Frontend React + TypeScript
├── electron/                      # Configuração Electron
├── migrations/                    # Migrações do banco
├── assets/                        # Assets do emulador Android
├── iniciar-sistema.bat            # Iniciar tudo
├── README.md                      # Este arquivo
├── INICIO-RAPIDO.txt             # Guia rápido
└── CORRECOES-APLICADAS.txt       # Log de correções
```

## ⚙️ Configuração

### Backend (.env)
```env
PORT=3010
DATABASE_PATH=./data/chatvendas.db
```

### Android Emulator
- Resolução: 720x1520 (formato celular)
- RAM: 4GB
- CPU: 4 cores
- Disco: 16GB

## 🐛 Troubleshooting

### Backend não inicia
```cmd
# Verificar porta
netstat -ano | findstr :3010

# Matar processo
taskkill /F /PID <PID>
```

### Android não aparece
```cmd
# Verificar QEMU
wsl -d Ubuntu-22.04 -- bash -c "ps aux | grep qemu"

# Reiniciar
wsl -d Ubuntu-22.04 -- bash -c "killall -9 qemu-system-x86_64"
wsl -d Ubuntu-22.04 -- bash backend/start-android.sh
```

### Tela preta no Android
O sistema agora acorda a tela automaticamente. Se ainda ficar preta:
```cmd
# Acordar tela manualmente
wsl -d Ubuntu-22.04 -- bash -c "adb -s 127.0.0.1:5556 shell input keyevent KEYCODE_WAKEUP"
wsl -d Ubuntu-22.04 -- bash -c "adb -s 127.0.0.1:5556 shell input keyevent KEYCODE_MENU"
wsl -d Ubuntu-22.04 -- bash -c "adb -s 127.0.0.1:5556 shell input keyevent KEYCODE_HOME"
```

### Android em formato tablet
O sistema agora inicia em formato celular desde o boot. Se ainda aparecer em tablet, aguarde 40s para o ADB aplicar a resolução automaticamente.

## 📝 Notas

- O Android demora ~2 minutos para iniciar completamente
- A primeira instalação demora ~5 minutos
- O formato celular (720x1520) é aplicado desde o boot via QEMU
- O wizard de boas-vindas é pulado automaticamente via ADB
- A tela é acordada automaticamente se ficar preta
- Backend usa ES6 modules (import/export)

## ✅ Melhorias Recentes

- ✅ Formato celular (720x1520) desde o boot
- ✅ Pula tela de boas-vindas automaticamente
- ✅ Acorda tela se ficar preta (KEYCODE_WAKEUP + MENU + HOME)
- ✅ Backend estável sem loops de restart
- ✅ Instalação automática mais confiável

---

**Sistema pronto para uso! 🎉**
