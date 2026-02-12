# 🚀 Android Cloud API

API para gerenciar emuladores Android na nuvem via Docker.

## 📁 Estrutura

```
android-cloud/
├── api/
│   ├── server.js              # API Express
│   ├── package.json           # Dependências Node.js
│   └── Dockerfile             # Build da API
├── docker-compose.yml         # Configuração Docker Compose
├── portainer-stack.yml        # Stack para Portainer
├── install-portainer.sh       # Script de instalação completa
├── PORTAINER-GUIDE.md         # Guia completo do Portainer
└── README.md                  # Este arquivo
```

## ⚡ Instalação Rápida

### Opção 1: Script Automático (Recomendado)

```bash
cd /root/chatvendas-emulador/android-cloud
chmod +x install-portainer.sh
./install-portainer.sh
```

Este script irá:
- ✅ Instalar/verificar Portainer
- ✅ Baixar código do repositório
- ✅ Baixar imagem do Android (~2GB)
- ✅ Preparar stack para deploy
- ✅ Fornecer instruções detalhadas

### Opção 2: Deploy Manual via Portainer

1. Acesse: http://167.86.72.198:9000
2. Vá em Stacks → Add stack
3. Copie conteúdo de `portainer-stack.yml`
4. Deploy!

Veja guia completo em: [PORTAINER-GUIDE.md](./PORTAINER-GUIDE.md)

### Opção 3: Docker Direto

```bash
docker run -d \
  --name android-cloud-api \
  --restart unless-stopped \
  -p 3011:3011 \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  -v /root/chatvendas-emulador/android-cloud/api:/app \
  -w /app \
  -e NODE_ENV=production \
  -e PORT=3011 \
  -e DOMAIN=167.86.72.198 \
  node:20-alpine \
  sh -c 'npm install && node server.js'
```

## 🔌 Endpoints da API

### Health Check
```bash
GET /health
```
Resposta:
```json
{
  "status": "ok",
  "timestamp": "2026-02-12T...",
  "mode": "cloud"
}
```

### Listar Instâncias
```bash
GET /instances
```
Resposta:
```json
{
  "success": true,
  "instances": [
    {
      "id": "abc123",
      "name": "android-emulator-device1",
      "status": "running",
      "vncPort": 6081,
      "adbPort": 5556,
      "vncUrl": "wss://167.86.72.198:6081/websockify"
    }
  ],
  "total": 1
}
```

### Criar Nova Instância
```bash
POST /create
Content-Type: application/json

{
  "name": "device1",
  "profile": "med"  // low, med, high
}
```

Perfis disponíveis:
- `low`: 2GB RAM, 2 CPUs
- `med`: 4GB RAM, 4 CPUs (padrão)
- `high`: 6GB RAM, 6 CPUs

### Parar Instância
```bash
POST /instance/android-emulator-device1/stop
```

### Iniciar Instância
```bash
POST /instance/android-emulator-device1/start
```

### Deletar Instância
```bash
DELETE /instance/android-emulator-device1
```

## ⚙️ Configuração

### Variáveis de Ambiente

- `PORT` - Porta da API (padrão: 3011)
- `DOMAIN` - IP público do servidor (167.86.72.198)
- `NODE_ENV` - Ambiente (production)

### Portas Utilizadas

- `3011` - API HTTP
- `6081+` - VNC WebSocket (uma porta por emulador)
- `5556+` - ADB (uma porta por emulador)
- `9000` - Portainer Web UI

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    ChatVendas (Electron)                    │
│                      Windows Desktop                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                Backend (localhost:3010)                     │
│              - Routes: /api/wsl2-android/*                  │
│              - VNC Proxy: /vnc-proxy/*                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓ HTTP
┌─────────────────────────────────────────────────────────────┐
│           Cloud API (167.86.72.198:3011)                    │
│              - Gerencia containers Docker                   │
│              - Cria/para/deleta emuladores                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓ Docker API
┌─────────────────────────────────────────────────────────────┐
│                  Docker Containers                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Emulator 1  │  │  Emulator 2  │  │  Emulator 3  │     │
│  │  VNC: 6081   │  │  VNC: 6082   │  │  VNC: 6083   │     │
│  │  ADB: 5556   │  │  ADB: 5557   │  │  ADB: 5558   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## 🐛 Troubleshooting

### Erro 500 ao criar device

**Causa:** Imagem do Android não foi baixada

**Solução:**
```bash
docker pull budtmo/docker-android:emulator_13.0
```

### API não responde

**Verificar container:**
```bash
docker ps | grep android-cloud-api
docker logs android-cloud-api
```

**Reiniciar:**
```bash
docker restart android-cloud-api
```

### Portainer não abre

**Verificar:**
```bash
docker ps | grep portainer
```

**Iniciar:**
```bash
docker start portainer
```

## 📊 Monitoramento

### Via Portainer
1. Acesse: http://167.86.72.198:9000
2. Containers → Ver status, logs, stats
3. Stacks → Gerenciar stack completa

### Via CLI
```bash
# Ver todos os containers
docker ps -a

# Ver recursos em tempo real
docker stats

# Ver logs da API
docker logs -f android-cloud-api

# Ver logs de um emulador
docker logs -f android-emulator-device1
```

## 🔄 Workflow de Desenvolvimento

1. **Servidor (Ubuntu):**
   - API rodando em Docker
   - Gerenciado via Portainer
   - Emuladores criados sob demanda

2. **Desktop (Windows):**
   - ChatVendas em modo dev: `npm run electron:dev`
   - Backend local conecta na API remota
   - VNC via proxy WebSocket

3. **Criar Device:**
   - ChatVendas → Emulador Android → Criar Novo
   - Backend chama API remota
   - API cria container Docker
   - VNC conecta automaticamente

## 📚 Documentação Adicional

- [PORTAINER-GUIDE.md](./PORTAINER-GUIDE.md) - Guia completo do Portainer
- [api/server.js](./api/server.js) - Código fonte da API
- [portainer-stack.yml](./portainer-stack.yml) - Stack do Portainer

## 🎯 Próximos Passos

1. ✅ Execute `install-portainer.sh` no servidor
2. ✅ Acesse Portainer e faça deploy da stack
3. ✅ Teste: `curl http://167.86.72.198:3011/health`
4. ✅ Inicie ChatVendas: `npm run electron:dev`
5. ✅ Crie seu primeiro device Android!

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique logs no Portainer
2. Consulte [PORTAINER-GUIDE.md](./PORTAINER-GUIDE.md)
3. Execute `docker logs android-cloud-api`
