const electron = require('electron');
const dotenv = require('dotenv');
const path = require('path');

// Carregar .env ANTES de tudo
const envPath = path.join(__dirname, '..', '.env');
console.log('📁 Carregando .env de:', envPath);
const envResult = dotenv.config({ path: envPath });

if (envResult.error) {
  console.warn('⚠️  Erro ao carregar .env:', envResult.error.message);
} else {
  console.log('✅ .env carregado com sucesso');
  console.log('   CLOUD_ANDROID_API:', process.env.CLOUD_ANDROID_API || 'NÃO DEFINIDO');
}

// Check if we are in Electron or Node
if (typeof electron === 'string') {
  console.log('🔄 Detectado execução via Node. Reiniciando com Electron...');
  const { spawn } = require('child_process');
  spawn(electron, [__filename], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' }
  });
  process.exit(0);
}

const { app, BrowserWindow, ipcMain, Menu, shell, dialog } = electron;
const { spawn } = require('child_process');
const isDev = process.env.NODE_ENV === 'development';

console.log(`🔧 Environment: Electron`);
console.log(`🔧 Modo: ${isDev ? 'Desenvolvimento' : 'Produção'}`);
console.log(`🔧 NODE_ENV: ${process.env.NODE_ENV}`);

// Register dummy handle if not in electron to prevent crash
const safeIpcMain = ipcMain || { handle: () => { }, on: () => { } };

let mainWindow;
let backendProcess;

// Configurar menu da aplicação
function createMenu() {
  const template = [
    {
      label: 'Arquivo',
      submenu: [
        { label: 'Sair', role: 'quit' }
      ]
    },
    {
      label: 'Editar',
      submenu: [
        { label: 'Desfazer', role: 'undo' },
        { label: 'Refazer', role: 'redo' },
        { type: 'separator' },
        { label: 'Recortar', role: 'cut' },
        { label: 'Copiar', role: 'copy' },
        { label: 'Colar', role: 'paste' }
      ]
    },
    {
      label: 'Visualizar',
      submenu: [
        { label: 'Recarregar', role: 'reload' },
        { label: 'Ferramentas do Desenvolvedor', role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Iniciar servidor backend
function startBackend() {
  return new Promise((resolve, reject) => {
    // Em desenvolvimento, não iniciar backend próprio - usar o que já está rodando
    if (isDev) {
      console.log('🔗 Modo desenvolvimento: conectando ao backend existente...');
      // Verificar se o backend está rodando
      const http = require('http');
      const req = http.get('http://localhost:3010/api/health', (res) => {
        if (res.statusCode === 200) {
          console.log('✅ Backend encontrado na porta 3010');
          resolve();
        } else {
          reject(new Error('Backend não está respondendo corretamente'));
        }
      });

      req.on('error', (error) => {
        reject(new Error('Backend não encontrado na porta 3010. Certifique-se de que está rodando.'));
      });

      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Timeout ao conectar com o backend'));
      });

      return;
    }

    // Em produção, iniciar o backend
    const backendPath = path.join(__dirname, '../backend');

    console.log('🚀 Iniciando servidor backend...');

    backendProcess = spawn('node', ['src/server.js'], {
      cwd: backendPath,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        NODE_ENV: isDev ? 'development' : 'production',
        PORT: '3010',
        // Garantir que CLOUD_ANDROID_API seja passado
        CLOUD_ANDROID_API: process.env.CLOUD_ANDROID_API || 'http://localhost:3011'
      }
    });

    backendProcess.stdout.on('data', (data) => {
      const message = data.toString();
      console.log(`[Backend] ${message}`);

      // Verificar se o servidor iniciou com sucesso
      if (message.includes('Servidor rodando na porta')) {
        resolve();
      }
    });

    backendProcess.stderr.on('data', (data) => {
      console.error(`[Backend Error] ${data.toString()}`);
    });

    backendProcess.on('close', (code) => {
      console.log(`[Backend] Processo encerrado com código ${code}`);
      if (code !== 0 && code !== null) {
        reject(new Error(`Backend encerrado com código ${code}`));
      }
    });

    backendProcess.on('error', (error) => {
      console.error('[Backend] Erro ao iniciar:', error);
      reject(error);
    });

    // Timeout de 30 segundos para inicialização
    setTimeout(() => {
      reject(new Error('Timeout ao iniciar backend'));
    }, 30000);
  });
}

// Criar janela principal
function createWindow() {
  console.log('🪟 Criando janela principal...');

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    show: true, // Mostrar imediatamente para debug
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default'
  });

  // Configurar Content Security Policy (CSP)
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          isDev
            ? "default-src 'self' 'unsafe-inline' 'unsafe-eval' http: https: ws: wss: blob: data:; img-src 'self' http: https: blob: data:; media-src 'self' http: https: blob: data:; connect-src 'self' http: https: ws: wss: blob: data:;"
            : "default-src 'self' http: https: ws: wss: blob: data:; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' http: https: blob: data:; media-src 'self' http: https: blob: data:; connect-src 'self' http: https: ws: wss: blob: data:;"
        ]
      }
    });
  });

  // Carregar aplicação
  const startUrl = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  console.log(`🌐 Carregando URL: ${startUrl}`);

  mainWindow.loadURL(startUrl);

  // Eventos de debug
  mainWindow.webContents.on('did-start-loading', () => {
    console.log('🔄 Iniciando carregamento da página...');
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('✅ Página carregada com sucesso!');
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('❌ Falha ao carregar página:', errorCode, errorDescription, validatedURL);
  });

  // Mostrar janela quando estiver pronta
  mainWindow.once('ready-to-show', () => {
    console.log('🪟 Janela pronta para exibição');
    mainWindow.show();

    if (isDev) {
      console.log('🔧 Abrindo DevTools...');
      mainWindow.webContents.openDevTools();
    }
  });

  // Interceptar links externos
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    console.log('🪟 Janela fechada');
    mainWindow = null;
  });

  console.log('🪟 Janela criada com sucesso');
}

// Handlers IPC para comunicação com o frontend
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-app-path', (event, name) => {
  return app.getPath(name);
});

ipcMain.handle('show-message-box', async (event, options) => {
  const result = await dialog.showMessageBox(mainWindow, options);
  return result;
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

// Eventos da aplicação
app.whenReady().then(async () => {
  try {
    console.log(`🔧 Verificando modo: isDev = ${isDev}`);

    if (!isDev) {
      // Apenas em produção iniciar o backend
      await startBackend();
      console.log('✅ Backend iniciado com sucesso');
    } else {
      console.log('🔗 Modo desenvolvimento: pulando inicialização do backend');
    }

    // Criar menu
    createMenu();

    // Criar janela principal
    createWindow();

    console.log('✅ Aplicação iniciada com sucesso');

  } catch (error) {
    console.error('❌ Erro ao iniciar aplicação:', error);

    const { dialog } = require('electron');
    dialog.showErrorBox(
      'Erro ao Iniciar',
      `Não foi possível iniciar o ChatVendas:\n\n${error.message}`
    );

    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  console.log('🛑 Encerrando aplicação...');

  // Encerrar processo do backend
  if (backendProcess) {
    console.log('🛑 Encerrando servidor backend...');
    backendProcess.kill('SIGTERM');

    // Forçar encerramento após 5 segundos
    setTimeout(() => {
      if (backendProcess && !backendProcess.killed) {
        console.log('🛑 Forçando encerramento do backend...');
        backendProcess.kill('SIGKILL');
      }
    }, 5000);
  }
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Erro não capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada não tratada:', reason);
});