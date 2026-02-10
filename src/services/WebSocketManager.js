export class WebSocketManager {
  constructor(wss) {
    this.wss = wss;
    this.clients = new Map(); // clientId -> ws
    
    this.setupWebSocket();
  }

  setupWebSocket() {
    this.wss.on('connection', (ws, req) => {
      const clientId = this.generateClientId();
      this.clients.set(clientId, ws);

      console.log(`🔌 Cliente WebSocket conectado: ${clientId}`);

      // Enviar ID do cliente
      ws.send(JSON.stringify({
        type: 'client_id',
        data: { clientId }
      }));

      // Handlers de mensagens
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(clientId, message);
        } catch (error) {
          console.error('❌ Erro ao processar mensagem WebSocket:', error);
        }
      });

      // Cleanup na desconexão
      ws.on('close', () => {
        this.clients.delete(clientId);
        console.log(`🔌 Cliente WebSocket desconectado: ${clientId}`);
      });

      ws.on('error', (error) => {
        console.error(`❌ Erro WebSocket ${clientId}:`, error);
        this.clients.delete(clientId);
      });

      // Ping/Pong para manter conexão viva
      const pingInterval = setInterval(() => {
        if (ws.readyState === ws.OPEN) {
          ws.ping();
        } else {
          clearInterval(pingInterval);
        }
      }, 30000);

      ws.on('pong', () => {
        // Cliente respondeu ao ping
      });
    });
  }

  handleMessage(clientId, message) {
    const { type, data } = message;

    switch (type) {
      case 'subscribe':
        // Cliente quer se inscrever em eventos específicos
        this.handleSubscription(clientId, data);
        break;
        
      case 'unsubscribe':
        // Cliente quer cancelar inscrição
        this.handleUnsubscription(clientId, data);
        break;
        
      default:
        console.log(`📨 Mensagem WebSocket não tratada: ${type}`);
    }
  }

  handleSubscription(clientId, data) {
    const ws = this.clients.get(clientId);
    if (!ws) return;

    // Adicionar informações de inscrição ao cliente
    if (!ws.subscriptions) {
      ws.subscriptions = new Set();
    }

    if (data.events) {
      data.events.forEach(event => ws.subscriptions.add(event));
    }

    console.log(`📡 Cliente ${clientId} inscrito em:`, Array.from(ws.subscriptions));
  }

  handleUnsubscription(clientId, data) {
    const ws = this.clients.get(clientId);
    if (!ws || !ws.subscriptions) return;

    if (data.events) {
      data.events.forEach(event => ws.subscriptions.delete(event));
    }

    console.log(`📡 Cliente ${clientId} desinscrito de:`, data.events);
  }

  broadcast(type, data, filter = null) {
    const message = JSON.stringify({ type, data, timestamp: new Date().toISOString() });

    this.clients.forEach((ws, clientId) => {
      try {
        if (ws.readyState === ws.OPEN) {
          // Verificar se o cliente está inscrito neste tipo de evento
          if (ws.subscriptions && !ws.subscriptions.has(type)) {
            return; // Cliente não está inscrito neste evento
          }

          // Aplicar filtro se fornecido
          if (filter && !filter(clientId, ws)) {
            return;
          }

          ws.send(message);
        }
      } catch (error) {
        console.error(`❌ Erro ao enviar mensagem para ${clientId}:`, error);
        this.clients.delete(clientId);
      }
    });
  }

  sendToClient(clientId, type, data) {
    const ws = this.clients.get(clientId);
    
    if (ws && ws.readyState === ws.OPEN) {
      try {
        ws.send(JSON.stringify({ 
          type, 
          data, 
          timestamp: new Date().toISOString() 
        }));
        return true;
      } catch (error) {
        console.error(`❌ Erro ao enviar mensagem para ${clientId}:`, error);
        this.clients.delete(clientId);
        return false;
      }
    }
    
    return false;
  }

  getConnectedClients() {
    return Array.from(this.clients.keys());
  }

  getClientCount() {
    return this.clients.size;
  }

  generateClientId() {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Métodos específicos para eventos do sistema
  notifyNewMessage(ticketId, message) {
    this.broadcast('new_message', { ticketId, message });
  }

  notifyMessageUpdate(messageId, update) {
    this.broadcast('message_update', { messageId, update });
  }

  notifyInstanceStatusChange(instanceId, status) {
    this.broadcast('instance_status', { instanceId, status });
  }

  notifyQRCode(instanceId, qrCode, expiresAt) {
    this.broadcast('qr_code', { instanceId, qrCode, expiresAt });
  }

  notifyOrderUpdate(orderId, status) {
    this.broadcast('order_update', { orderId, status });
  }

  notifyCampaignProgress(campaignId, progress) {
    this.broadcast('campaign_progress', { campaignId, progress });
  }

  notifyContactUpdate(contactId, data) {
    this.broadcast('contact_update', { contactId, data });
  }

  // Método para enviar notificações do sistema
  sendSystemNotification(title, message, type = 'info') {
    this.broadcast('system_notification', {
      title,
      message,
      type, // info, success, warning, error
      timestamp: new Date().toISOString()
    });
  }
}