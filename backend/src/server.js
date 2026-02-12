import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { initDatabase } from './database/init.js';
import { seedDatabase } from './database/seed.js';
import { WebSocketManager } from './services/WebSocketManager.js';
import { BaseWhatsAppManager } from './services/BaseWhatsAppManager.js';

// Routers
import instanceRoutes from './routes/instances.js';
import contactRoutes from './routes/contacts.js';
import ticketRoutes from './routes/tickets.js';
import messageRoutes from './routes/messages.js';
import reportRoutes from './routes/reports.js';
import templateRoutes from './routes/templates.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import kanbanRoutes from './routes/kanban.js';
import dashboardRoutes from './routes/dashboard.js';
import financeRoutes from './routes/finance.js';
import driversRoutes from './routes/drivers.js';
import campaignRoutes from './routes/campaigns.js';
import wslRoutes from './routes/wsl-routes.mjs';
import androidCloudRoutes from './routes/androidCloud.js';
import { setupVNCProxy } from './routes/vncProxy.js';

// Configuração
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar .env do diretório backend
const envPath = path.join(__dirname, '..', '.env');
console.log('📁 Carregando .env de:', envPath);

const envResult = dotenv.config({ path: envPath });

if (envResult.error) {
  console.error('❌ Erro ao carregar .env:', envResult.error.message);
} else {
  console.log('✅ .env carregado com sucesso');
}

// Log de configuração importante
console.log('');
console.log('🔧 Configuração Android Cloud:');
console.log('   CLOUD_ANDROID_API:', process.env.CLOUD_ANDROID_API || '❌ NÃO CONFIGURADO');
console.log('   Modo:', process.env.CLOUD_ANDROID_API ? '☁️  NUVEM' : '💻 LOCAL');
console.log('');

const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

const PORT = process.env.PORT || 3010;

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`📥 [${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/vnc', express.static(path.join(__dirname, 'public', 'vnc')));

// Inicializar WebSocket e WhatsApp Managers
const wsManager = new WebSocketManager(wss);
const waManager = new BaseWhatsAppManager(wsManager);

// Configurar proxy VNC para conexões cloud
setupVNCProxy(wss, httpServer);

// Injetar managers nas requisições
app.use((req, res, next) => {
  req.wsManager = wsManager;
  req.waManager = waManager;
  next();
});

// Rotas
app.use('/api/instances', instanceRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/kanban', kanbanRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/drivers', driversRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/android-cloud', androidCloudRoutes);
app.use('/api/wsl2-android', androidCloudRoutes); // Manter compatibilidade com frontend
app.use('/api/wsl', wslRoutes);

// Servir página do instalador
app.get('/installer', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'wsl-installer.html'));
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Inicialização
async function start() {
  try {
    console.log('🚀 Iniciando servidor ChatVendas...');

    // 1. Inicializar Banco de Dados
    await initDatabase();

    // 2. Popular banco com dados de exemplo (apenas se vazio e não for produção)
    if (process.env.NODE_ENV !== 'production') {
      await seedDatabase();
    }

    // 3. Iniciar Servidor HTTP
    httpServer.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Erro: A porta ${PORT} já está em uso.`);
      } else {
        console.error('❌ Erro no servidor HTTP:', err);
      }
      process.exit(1);
    });

    httpServer.listen(PORT, '127.0.0.1', () => {
      console.log(`✅ Servidor rodando em 127.0.0.1:${PORT}`);
      console.log(`📡 WebSocket ativo em ws://127.0.0.1:${PORT}`);
      console.log(`🌐 API disponível em: http://127.0.0.1:${PORT}/api`);
      console.log(`📊 Dashboard: http://127.0.0.1:${PORT}/api/dashboard/stats`);
      console.log(`⏳ Inicializando WhatsApp Manager em background...`);
    });

    // 4. Inicializar WhatsApp Manager em BACKGROUND (não bloquear)
    waManager.initialize().then(() => {
      console.log(`✅ WhatsApp Manager inicializado`);
    }).catch((error) => {
      console.error('⚠️  Erro ao inicializar WhatsApp Manager:', error);
      // Não falhar o servidor se WhatsApp Manager falhar
    });

  } catch (error) {
    console.error('❌ Erro durante a inicialização:', error);
    process.exit(1);
  }
}

// Handler global para erros não capturados - NÃO CRASHAR
process.on('uncaughtException', (error) => {
  console.error('🚨 ERRO NÃO CAPTURADO:', error);
  console.error('Stack:', error.stack);
  // NÃO fazer process.exit() - continuar rodando
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 PROMISE REJEITADA NÃO TRATADA:', reason);
  console.error('Promise:', promise);
  // NÃO fazer process.exit() - continuar rodando
});

start();