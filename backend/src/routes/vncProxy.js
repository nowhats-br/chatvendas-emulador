/**
 * Proxy WebSocket para VNC
 * Encaminha conexões do frontend para o servidor cloud
 */

import { WebSocket } from 'ws';

export function setupVNCProxy(wss, httpServer) {
  console.log('🔌 Configurando proxy WebSocket para VNC...');

  wss.on('connection', (clientWs, req) => {
    // Verificar se é uma conexão VNC (path começa com /vnc-proxy/)
    if (!req.url?.startsWith('/vnc-proxy/')) {
      return; // Não é para nós, deixar outros handlers processarem
    }

    // Extrair host e porta da URL
    // Formato: /vnc-proxy/167.86.72.198:6081
    const match = req.url.match(/\/vnc-proxy\/([^:]+):(\d+)/);
    
    if (!match) {
      console.error('❌ URL inválida para proxy VNC:', req.url);
      clientWs.close(1008, 'URL inválida');
      return;
    }

    const [, targetHost, targetPort] = match;
    const targetUrl = `ws://${targetHost}:${targetPort}`;

    console.log(`🔌 Nova conexão VNC proxy: ${targetUrl}`);

    // Conectar no servidor VNC remoto
    const serverWs = new WebSocket(targetUrl);

    // Quando conectar no servidor, começar a encaminhar dados
    serverWs.on('open', () => {
      console.log(`✅ Conectado no servidor VNC: ${targetUrl}`);
    });

    // Encaminhar dados do cliente para o servidor
    clientWs.on('message', (data) => {
      if (serverWs.readyState === WebSocket.OPEN) {
        serverWs.send(data);
      }
    });

    // Encaminhar dados do servidor para o cliente
    serverWs.on('message', (data) => {
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(data);
      }
    });

    // Tratar erros
    serverWs.on('error', (error) => {
      console.error(`❌ Erro no servidor VNC (${targetUrl}):`, error.message);
      clientWs.close(1011, 'Erro ao conectar no servidor VNC');
    });

    clientWs.on('error', (error) => {
      console.error('❌ Erro no cliente VNC:', error.message);
      serverWs.close();
    });

    // Tratar fechamento de conexão
    serverWs.on('close', (code, reason) => {
      console.log(`🔌 Servidor VNC desconectado (${targetUrl}): ${code} ${reason}`);
      clientWs.close(code, reason);
    });

    clientWs.on('close', (code, reason) => {
      console.log(`🔌 Cliente VNC desconectado: ${code} ${reason}`);
      serverWs.close();
    });
  });

  console.log('✅ Proxy WebSocket VNC configurado');
}
