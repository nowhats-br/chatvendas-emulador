import express from 'express';
import Docker from 'dockerode';
import cors from 'cors';

const app = express();
const docker = new Docker();
const PORT = process.env.PORT || 3011;
// HARDCODED: Easypanel não está passando a variável corretamente
const DOMAIN = '167.86.72.198';

app.use(cors());
app.use(express.json());

// Middleware de log
app.use((req, res, next) => {
  console.log(`📥 [${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    mode: 'cloud'
  });
});

// Listar instâncias
app.get('/instances', async (req, res) => {
  try {
    const containers = await docker.listContainers({
      all: true,
      filters: { 
        name: ['android-emulator'] 
      }
    });
    
    const instances = containers.map(c => {
      const name = c.Names[0].replace('/', '');
      const vncPort = c.Ports.find(p => p.PrivatePort === 6080);
      const adbPort = c.Ports.find(p => p.PrivatePort === 5555);
      
      return {
        id: c.Id.substring(0, 12),
        name: name,
        status: c.State === 'running' ? 'running' : 'stopped',
        vncPort: vncPort?.PublicPort || 6080,
        wsPort: vncPort?.PublicPort || 6080,
        adbPort: adbPort?.PublicPort || 5555,
        vncUrl: `wss://${DOMAIN}:${vncPort?.PublicPort || 6080}/websockify`,
        created: new Date(c.Created * 1000).toISOString()
      };
    });
    
    res.json({ 
      success: true, 
      instances,
      total: instances.length
    });
  } catch (error) {
    console.error('❌ Erro ao listar instâncias:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Criar nova instância
app.post('/create', async (req, res) => {
  try {
    const { name, profile = 'med' } = req.body;
    
    if (!name) {
      return res.status(400).json({ 
        success: false,
        error: 'Nome da instância é obrigatório' 
      });
    }
    
    // Verificar se já existe
    const existing = await docker.listContainers({
      all: true,
      filters: { name: [`android-emulator-${name}`] }
    });
    
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Instância com este nome já existe'
      });
    }
    
    // Obter próximo número de porta
    const allContainers = await docker.listContainers({
      all: true,
      filters: { name: ['android-emulator'] }
    });
    const instanceNumber = allContainers.length + 1;
    
    // Configurar recursos baseado no perfil
    let memory, cpus;
    switch (profile) {
      case 'low':
        memory = 2048 * 1024 * 1024; // 2GB
        cpus = 2;
        break;
      case 'high':
        memory = 6144 * 1024 * 1024; // 6GB
        cpus = 6;
        break;
      default: // med
        memory = 4096 * 1024 * 1024; // 4GB
        cpus = 4;
    }
    
    console.log(`🚀 Criando instância: android-emulator-${name}`);
    
    // Criar container
    const container = await docker.createContainer({
      Image: 'budtmo/docker-android:emulator_13.0',
      name: `android-emulator-${name}`,
      Env: [
        'EMULATOR_DEVICE=Samsung Galaxy S10',
        'EMULATOR_WIDTH=720',
        'EMULATOR_HEIGHT=1520',
        'WEB_VNC=true',
        'VNC_PASSWORD=chatvendas123',
        `EMULATOR_ARGS=-gpu swiftshader_indirect -no-snapshot -noaudio -memory ${memory / (1024 * 1024)}`,
        'TZ=America/Sao_Paulo'
      ],
      ExposedPorts: {
        '5900/tcp': {},
        '6080/tcp': {},
        '5555/tcp': {}
      },
      HostConfig: {
        PortBindings: {
          '5900/tcp': [{ HostPort: `${5900 + instanceNumber}` }],
          '6080/tcp': [{ HostPort: `${6080 + instanceNumber}` }],
          '5555/tcp': [{ HostPort: `${5555 + instanceNumber}` }]
        },
        Memory: memory,
        NanoCpus: cpus * 1000000000,
        Privileged: true,
        RestartPolicy: { 
          Name: 'unless-stopped' 
        }
      }
      // Removido NetworkingConfig - usar rede padrão
    });
    
    // Iniciar container
    await container.start();
    
    console.log(`✅ Instância criada: ${container.id.substring(0, 12)}`);
    
    res.json({
      success: true,
      instance: {
        id: container.id.substring(0, 12),
        name: `android-emulator-${name}`,
        vncUrl: `wss://${DOMAIN}:${6080 + instanceNumber}/websockify`,
        vncPort: 6080 + instanceNumber,
        adbPort: 5555 + instanceNumber,
        status: 'starting'
      }
    });
  } catch (error) {
    console.error('❌ Erro ao criar instância:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Parar instância
app.post('/instance/:name/stop', async (req, res) => {
  try {
    const { name } = req.params;
    const container = docker.getContainer(name);
    
    await container.stop();
    
    console.log(`⏸️  Instância parada: ${name}`);
    
    res.json({ 
      success: true,
      message: `Instância ${name} parada`
    });
  } catch (error) {
    console.error('❌ Erro ao parar instância:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Iniciar instância
app.post('/instance/:name/start', async (req, res) => {
  try {
    const { name } = req.params;
    const container = docker.getContainer(name);
    
    await container.start();
    
    console.log(`▶️  Instância iniciada: ${name}`);
    
    res.json({ 
      success: true,
      message: `Instância ${name} iniciada`
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar instância:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Deletar instância
app.delete('/instance/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const container = docker.getContainer(name);
    
    // Parar se estiver rodando
    try {
      await container.stop();
    } catch (e) {
      // Já está parado
    }
    
    // Remover
    await container.remove();
    
    console.log(`🗑️  Instância deletada: ${name}`);
    
    res.json({ 
      success: true,
      message: `Instância ${name} deletada`
    });
  } catch (error) {
    console.error('❌ Erro ao deletar instância:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Enviar input (teclas) para instância
app.post('/instance/:name/input', async (req, res) => {
  try {
    const { name } = req.params;
    const { command } = req.body;
    
    // Aqui você implementaria o envio de comandos via ADB
    // Por enquanto, apenas retorna sucesso
    
    res.json({ 
      success: true,
      message: `Comando ${command} enviado para ${name}`
    });
  } catch (error) {
    console.error('❌ Erro ao enviar input:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  🚀 Android Cloud API');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`✅ Servidor rodando em: http://0.0.0.0:${PORT}`);
  console.log(`🌐 Domínio configurado: ${DOMAIN}`);
  console.log(`🔍 DOMAIN env var: ${process.env.DOMAIN || 'NÃO DEFINIDO'}`);
  console.log(`📊 Health check: http://0.0.0.0:${PORT}/health`);
  console.log('═══════════════════════════════════════════════════════');
});
