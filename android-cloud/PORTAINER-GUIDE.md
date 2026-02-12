# 📊 Guia Completo - Portainer + Android Cloud API

## 🎯 Visão Geral

Este guia mostra como gerenciar a Android Cloud API através do Portainer, uma interface web para Docker.

**Arquitetura:**
```
ChatVendas (Electron) 
    ↓
Backend (localhost:3010)
    ↓
Cloud API (167.86.72.198:3011) ← Gerenciado pelo Portainer
    ↓
Docker Containers (Android Emulators)
```

---

## 🚀 Instalação Rápida

### Via SSH no servidor:

```bash
cd /root/chatvendas-emulador/android-cloud
chmod +x install-portainer.sh
./install-portainer.sh
```

Este script irá:
1. ✅ Instalar/verificar Portainer
2. ✅ Baixar código do repositório
3. ✅ Baixar imagem do Android (~2GB, 5-10 min)
4. ✅ Preparar stack para deploy
5. ✅ Fornecer instruções detalhadas

---

## 📋 Deploy via Portainer (Recomendado)

### Passo 1: Acessar Portainer
- URL: http://167.86.72.198:9000
- Login com suas credenciais

### Passo 2: Selecionar Ambiente
- Clique em **"local"** (seu Docker local)

### Passo 3: Criar Stack
1. Menu lateral → **"Stacks"**
2. Botão **"+ Add stack"**
3. Configurar:
   - **Name:** `android-cloud-api`
   - **Build method:** Web editor
   - **Web editor:** Copie o conteúdo de `portainer-stack.yml`

### Passo 4: Deploy
1. Clique em **"Deploy the stack"**
2. Aguarde ~30 segundos
3. Verifique status: Container deve estar "running"

### Passo 5: Testar
```bash
curl http://167.86.72.198:3011/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "timestamp": "2026-02-12T...",
  "mode": "cloud"
}
```

---

## 🔧 Gerenciamento via Portainer

### Ver Logs da API
1. Stacks → `android-cloud-api`
2. Clique no container `android-cloud-api`
3. Aba **"Logs"**
4. Ative "Auto-refresh" para logs em tempo real

### Reiniciar API
1. Stacks → `android-cloud-api`
2. Clique no container
3. Botão **"Restart"**

### Parar/Iniciar API
1. Stacks → `android-cloud-api`
2. Botões **"Stop"** / **"Start"**

### Ver Containers Android
1. Menu lateral → **"Containers"**
2. Filtrar por: `android-emulator`
3. Ver status, logs, estatísticas de cada emulador

### Atualizar Código
1. Faça `git pull` no servidor
2. Portainer → Stacks → `android-cloud-api`
3. Botão **"Stop"** → **"Start"**
4. Ou use **"Restart"**

---

## ⚡ Deploy Alternativo (Docker Direto)

Se preferir não usar Portainer UI, pode fazer deploy direto:

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

**Vantagem:** Deploy imediato
**Desvantagem:** Sem interface visual para gerenciar

---

## 🐛 Troubleshooting

### Problema: API retorna 500 ao criar device

**Causa:** Imagem do Android não foi baixada

**Solução:**
```bash
docker pull budtmo/docker-android:emulator_13.0
```

Aguarde 5-10 minutos (~2GB). Depois teste criar device novamente.

---

### Problema: Porta 3011 não responde

**Verificar se container está rodando:**
```bash
docker ps | grep android-cloud-api
```

**Ver logs:**
```bash
docker logs android-cloud-api
```

**Verificar porta:**
```bash
netstat -tlnp | grep 3011
```

---

### Problema: Portainer não abre

**Verificar se está rodando:**
```bash
docker ps | grep portainer
```

**Iniciar Portainer:**
```bash
docker start portainer
```

**Reinstalar Portainer:**
```bash
docker rm -f portainer
docker volume create portainer_data
docker run -d \
  -p 9000:9000 \
  -p 9443:9443 \
  --name portainer \
  --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest
```

---

## 📊 Monitoramento

### Ver Recursos (CPU/RAM) dos Emuladores
1. Portainer → Containers
2. Clique em um container `android-emulator-*`
3. Aba **"Stats"**
4. Gráficos em tempo real de CPU, RAM, Network, Disk

### Ver Todos os Containers
```bash
docker ps -a
```

### Ver Uso de Recursos
```bash
docker stats
```

---

## 🔄 Workflow Completo

### 1. Desenvolvimento Local (Windows)
```bash
npm run electron:dev
```

### 2. Criar Device Android
- Abrir ChatVendas
- Ir em "Emulador Android"
- Clicar "Criar Novo Device"
- Escolher nome e perfil
- Aguardar ~30 segundos

### 3. Gerenciar via Portainer
- Acessar http://167.86.72.198:9000
- Ver logs, status, recursos
- Reiniciar se necessário

### 4. Conectar VNC
- ChatVendas conecta automaticamente
- Proxy WebSocket: `ws://127.0.0.1:3010/vnc-proxy/...`
- Servidor real: `wss://167.86.72.198:6081/websockify`

---

## 📝 Comandos Úteis

### Listar todos os emuladores
```bash
docker ps -a | grep android-emulator
```

### Parar todos os emuladores
```bash
docker stop $(docker ps -q --filter "name=android-emulator")
```

### Remover todos os emuladores parados
```bash
docker rm $(docker ps -aq --filter "name=android-emulator" --filter "status=exited")
```

### Ver logs da API
```bash
docker logs -f android-cloud-api
```

### Reiniciar API
```bash
docker restart android-cloud-api
```

---

## 🎯 Próximos Passos

1. ✅ Execute `install-portainer.sh`
2. ✅ Acesse Portainer e crie a stack
3. ✅ Teste a API: `curl http://167.86.72.198:3011/health`
4. ✅ Abra ChatVendas: `npm run electron:dev`
5. ✅ Crie seu primeiro device Android!

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique logs no Portainer
2. Execute `docker logs android-cloud-api`
3. Teste conectividade: `curl http://167.86.72.198:3011/health`
4. Verifique se imagem foi baixada: `docker images | grep budtmo`
