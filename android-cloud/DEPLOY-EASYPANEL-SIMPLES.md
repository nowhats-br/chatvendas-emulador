# 🚀 Deploy no Easypanel - Guia Simplificado

## ⚡ MÉTODO MAIS RÁPIDO (5 minutos)

Você **NÃO precisa** fazer upload de arquivos nem usar GitHub. Basta copiar e colar!

---

## 📋 Passo 1: Preparar o Docker Compose

Copie este conteúdo (já está otimizado):

```yaml
version: '3.8'

services:
  # API de Gerenciamento
  android-api:
    image: node:20-alpine
    container_name: android-api
    working_dir: /app
    command: sh -c "npm install && node server.js"
    ports:
      - "3011:3011"
    environment:
      NODE_ENV: production
      PORT: 3011
      DOMAIN: ${DOMAIN:-localhost}
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./api:/app
    restart: unless-stopped
    networks:
      - android-network

  # Android Emulator 1 (Exemplo inicial)
  android-1:
    image: budtmo/docker-android:emulator_13.0
    container_name: android-emulator-1
    privileged: true
    ports:
      - "5900:5900"
      - "6080:6080"
      - "5555:5555"
    environment:
      EMULATOR_DEVICE: "Samsung Galaxy S10"
      EMULATOR_WIDTH: "720"
      EMULATOR_HEIGHT: "1520"
      WEB_VNC: "true"
      VNC_PASSWORD: "chatvendas123"
      EMULATOR_ARGS: "-gpu swiftshader_indirect -no-snapshot -noaudio -memory 4096"
      TZ: "America/Sao_Paulo"
    volumes:
      - android-1-data:/data
    restart: unless-stopped
    networks:
      - android-network

volumes:
  android-1-data:

networks:
  android-network:
    driver: bridge
```

---

## 🖥️ Passo 2: Acessar Easypanel

1. Abra seu navegador
2. Acesse: `https://seu-servidor.easypanel.io`
3. Faça login

---

## 📦 Passo 3: Criar Projeto

1. Clique em **"New Project"** (botão azul no canto superior direito)
2. Nome: `android-cloud`
3. Clique em **"Create"**

---

## 🐳 Passo 4: Adicionar Docker Compose

### Opção A: Via Interface (RECOMENDADO)

1. Dentro do projeto, clique em **"Add Service"**
2. Selecione **"Docker Compose"**
3. **COLE** o conteúdo do Passo 1 acima
4. Clique em **"Create"**

### Opção B: Via GitHub (se preferir)

1. Crie repositório no GitHub
2. Faça upload da pasta `android-cloud/`
3. No Easypanel: **"Add Service"** → **"GitHub"**
4. Conecte o repositório

---

## 📁 Passo 5: Criar Arquivos da API

O Easypanel precisa dos arquivos da API. Você tem 2 opções:

### Opção A: Criar Manualmente no Easypanel

1. No projeto, vá em **"Files"** ou **"File Manager"**
2. Crie pasta: `api/`
3. Crie arquivo: `api/package.json`

```json
{
  "name": "android-cloud-api",
  "version": "1.0.0",
  "type": "module",
  "main": "server.js",
  "dependencies": {
    "express": "^4.18.2",
    "dockerode": "^4.0.2",
    "cors": "^2.8.5"
  }
}
```

4. Crie arquivo: `api/server.js`

```javascript
import express from 'express';
import Docker from 'dockerode';
import cors from 'cors';

const app = express();
const docker = new Docker();
const PORT = process.env.PORT || 3011;
const DOMAIN = process.env.DOMAIN || 'localhost';

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', mode: 'cloud' });
});

app.get('/instances', async (req, res) => {
  try {
    const containers = await docker.listContainers({
      all: true,
      filters: { name: ['android-emulator'] }
    });
    
    const instances = containers.map(c => ({
      id: c.Id.substring(0, 12),
      name: c.Names[0].replace('/', ''),
      status: c.State,
      vncPort: c.Ports.find(p => p.PrivatePort === 6080)?.PublicPort || 6080,
      vncUrl: `wss://${DOMAIN}:${c.Ports.find(p => p.PrivatePort === 6080)?.PublicPort || 6080}/websockify`
    }));
    
    res.json({ success: true, instances });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/create', async (req, res) => {
  try {
    const { name, profile = 'med' } = req.body;
    
    const allContainers = await docker.listContainers({ all: true });
    const instanceNumber = allContainers.length + 1;
    
    const container = await docker.createContainer({
      Image: 'budtmo/docker-android:emulator_13.0',
      name: `android-emulator-${name}`,
      Env: [
        'EMULATOR_DEVICE=Samsung Galaxy S10',
        'EMULATOR_WIDTH=720',
        'EMULATOR_HEIGHT=1520',
        'WEB_VNC=true',
        'VNC_PASSWORD=chatvendas123',
        'EMULATOR_ARGS=-gpu swiftshader_indirect -no-snapshot -noaudio -memory 4096'
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
        Privileged: true
      }
    });
    
    await container.start();
    
    res.json({
      success: true,
      instance: {
        id: container.id.substring(0, 12),
        name: `android-emulator-${name}`,
        vncUrl: `wss://${DOMAIN}:${6080 + instanceNumber}/websockify`
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/instance/:name', async (req, res) => {
  try {
    const container = docker.getContainer(req.params.name);
    await container.stop();
    await container.remove();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API rodando na porta ${PORT}`);
});
```

### Opção B: Via SSH (Avançado)

```bash
# Conectar no servidor
ssh root@seu-servidor.com

# Criar diretório
mkdir -p /opt/android-cloud/api
cd /opt/android-cloud

# Copiar arquivos do seu PC
# (Use WinSCP, FileZilla ou SCP)
```

---

## ⚙️ Passo 6: Configurar Variáveis

1. No Easypanel, vá em **"Environment"** ou **"Settings"**
2. Adicione:
   ```
   DOMAIN=seu-dominio.com
   ```
   (ou use o IP do servidor se não tiver domínio)

---

## 🚀 Passo 7: Deploy

1. Clique em **"Deploy"** (botão verde)
2. Aguarde 2-3 minutos (vai baixar imagens Docker)
3. Veja os logs para confirmar

---

## ✅ Passo 8: Testar

### Teste 1: Health Check

Abra no navegador:
```
http://seu-servidor:3011/health
```

Deve retornar:
```json
{
  "status": "ok",
  "mode": "cloud"
}
```

### Teste 2: Ver Android Direto

Abra no navegador:
```
http://seu-servidor:6080
```

Deve aparecer a tela do Android!

---

## 🔧 Passo 9: Configurar no ChatVendas

No seu PC, edite `backend/.env`:

```env
# Adicione esta linha:
CLOUD_ANDROID_API=http://seu-servidor:3011

# Ou se tiver domínio:
CLOUD_ANDROID_API=https://android-api.seudominio.com
```

Reinicie o backend:
```bash
npm run electron:dev
```

---

## 🎉 Pronto!

Agora você pode:

1. Abrir ChatVendas
2. Ir em "Android Emulator"
3. Clicar em "Criar Instância"
4. Android aparece no frame!

---

## 🐛 Problemas Comuns

### "Cannot connect to Docker daemon"

**Solução:**
```bash
ssh root@seu-servidor
systemctl start docker
```

### "Port already in use"

**Solução:** Mude as portas no docker-compose.yml:
```yaml
ports:
  - "3012:3011"  # Mude 3011 para 3012
```

### API não responde

**Solução:** Veja os logs:
```bash
docker logs android-api
```

---

## 💰 Custos

- **Hetzner CPX21:** €7.49/mês (2-3 emuladores)
- **Hetzner CPX31:** €13.90/mês (5-7 emuladores)

---

## 📞 Próximos Passos

1. ✅ Deploy no Easypanel (você está aqui!)
2. ✅ Testar health check
3. ✅ Configurar .env do ChatVendas
4. ✅ Criar primeira instância
5. ✅ Usar Android no frame!

---

**Dúvidas?** Veja os logs:
```bash
docker-compose logs -f
```
