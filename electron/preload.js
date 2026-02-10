const { contextBridge, ipcRenderer } = require('electron');

// Expor APIs seguras para o renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Informações da aplicação
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getAppPath: (name) => ipcRenderer.invoke('get-app-path', name),

  // Diálogos
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),

  // Notificações do sistema
  showNotification: (title, body, options = {}) => {
    if (Notification.permission === 'granted') {
      return new Notification(title, { body, ...options });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          return new Notification(title, { body, ...options });
        }
      });
    }
  },

  // Verificar se está rodando no Electron
  isElectron: true,

  // Plataforma
  platform: process.platform,

  // Versão do Node.js
  nodeVersion: process.versions.node,

  // Versão do Electron
  electronVersion: process.versions.electron,

  // Versão do Chrome
  chromeVersion: process.versions.chrome
});

// Expor APIs específicas do ChatVendas
contextBridge.exposeInMainWorld('chatVendasAPI', {
  // Configurações locais
  getLocalConfig: () => {
    return {
      apiUrl: 'http://127.0.0.1:3010/api',
      wsUrl: 'ws://127.0.0.1:3010',
      isElectron: true
    };
  },

  // Gerenciamento de arquivos
  selectFile: async (options = {}) => {
    const defaultOptions = {
      properties: ['openFile'],
      filters: [
        { name: 'Imagens', extensions: ['jpg', 'jpeg', 'png', 'gif'] },
        { name: 'Vídeos', extensions: ['mp4', 'avi', 'mov'] },
        { name: 'Áudios', extensions: ['mp3', 'wav', 'ogg'] },
        { name: 'Documentos', extensions: ['pdf', 'doc', 'docx', 'txt'] },
        { name: 'Todos os arquivos', extensions: ['*'] }
      ]
    };

    const result = await ipcRenderer.invoke('show-open-dialog', {
      ...defaultOptions,
      ...options
    });

    return result;
  },

  // Salvar arquivo
  saveFile: async (options = {}) => {
    const result = await ipcRenderer.invoke('show-save-dialog', options);
    return result;
  },

  // Mostrar mensagem de confirmação
  confirm: async (message, title = 'Confirmação') => {
    const result = await ipcRenderer.invoke('show-message-box', {
      type: 'question',
      buttons: ['Cancelar', 'Confirmar'],
      defaultId: 1,
      title,
      message
    });

    return result.response === 1;
  },

  // Mostrar mensagem de erro
  showError: async (message, title = 'Erro') => {
    await ipcRenderer.invoke('show-message-box', {
      type: 'error',
      title,
      message
    });
  },

  // Mostrar mensagem de sucesso
  showSuccess: async (message, title = 'Sucesso') => {
    await ipcRenderer.invoke('show-message-box', {
      type: 'info',
      title,
      message
    });
  },

  // Mostrar aviso
  showWarning: async (message, title = 'Aviso') => {
    await ipcRenderer.invoke('show-message-box', {
      type: 'warning',
      title,
      message
    });
  }
});

// Log para debug
console.log('🔌 Preload script carregado');
console.log('📱 Plataforma:', process.platform);
console.log('⚡ Electron:', process.versions.electron);
console.log('🌐 Chrome:', process.versions.chrome);
console.log('📦 Node.js:', process.versions.node);