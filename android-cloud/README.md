# 🚀 Android Cloud - API de Gerenciamento

API para gerenciar emuladores Android 13 na nuvem via Docker.

## 📋 Arquivos

```
android-cloud/
├── docker-compose.yml      # Configuração Docker
├── .env.example           # Exemplo de variáveis
├── api/
│   ├── server.js          # API Node.js
│   ├── package.json       # Dependências
│   └── Dockerfile         # Build da API
└── README.md             # Este arquivo
```

## 🚀 Instalação no Easypanel

### Método 1: Via Interface (MAIS FÁCIL)

1. **Login no Easypanel**
   ```
   https://seu-servidor.easypanel.io
   ```

2. **Criar Projeto**
   - Clique em "New Project"
   - Nome: `android-cloud`
   - Clique em "Create"

3. **Adicionar Serviço**
   - Clique em "Add Service"
   - Selecione "Docker Compose"
   - Cole o conteúdo de `docker-compose.yml`
   - Clique em "Create"

4. **Configurar Variáveis**
   - Vá em "Environment"
   - Adicione: `DOMAIN=seu-dominio.com`
   - Salve

5. **Deploy**
   - Clique em "Deploy"
   - Aguarde 2-3 minutos
   - Pronto!

### Método 2: Via SSH

```bash
# 1. Conectar no servidor
ssh root@seu-servidor.com

# 2. Criar diretório
mkdir -p /opt/android-cloud
cd /opt/android-cloud

# 3. Copiar arquivos (use SCP ou cole manualmente)
# Copie: docker-compose.yml, api/

# 4. Configurar variáveis
cp .env.example .env
nano .env  # Edite DOMAIN

# 5. Iniciar
docker-compose up -d

# 6. Ver logs
docker-compose logs -f
```

## 🔧 Configuração no ChatVendas

Edite `backend/.env`:

```env
# Desenvolvimento (local)
CLOUD_ANDROID_API=http://localhost:3011

# Produção (nuvem)
CLOUD_ANDROID_API=https://android-api.seudominio.com
```

## 📡 Endpoints da API

### Health Check
```
GET /health
```

### Listar Instâncias
```
GET /instances
```

### Criar Instância
```
POST /create
Body: { "name": "device1", "profile": "med" }
```

### Deletar Instância
```
DELETE /instance/:name
```

### Parar Instância
```
POST /instance/:name/stop
```

### Iniciar Instância
```
POST /instance/:name/start
```

## 💰 Requisitos de Servidor

### Mínimo (2-3 emuladores):
- 2 vCPU
- 4GB RAM
- 20GB Disco
- Custo: ~€7-10/mês

### Recomendado (5-7 emuladores):
- 4 vCPU
- 8GB RAM
- 40GB Disco
- Custo: ~€13-20/mês

### Alto (15+ emuladores):
- 8 vCPU
- 16GB RAM
- 80GB Disco
- Custo: ~€26-40/mês

## 🌐 Providers Recomendados

1. **Hetzner** (Melhor custo-benefício)
   - https://www.hetzner.com/cloud
   - CPX21: €7.49/mês

2. **DigitalOcean**
   - https://www.digitalocean.com
   - Basic: $24/mês

3. **Vultr**
   - https://www.vultr.com
   - High Frequency: $24/mês

## 🧪 Testar

```bash
# Health check
curl http://localhost:3011/health

# Listar instâncias
curl http://localhost:3011/instances

# Criar instância
curl -X POST http://localhost:3011/create \
  -H "Content-Type: application/json" \
  -d '{"name":"test1","profile":"med"}'
```

## 🎯 Próximos Passos

1. ✅ Deploy no Easypanel
2. ✅ Configurar domínio
3. ✅ Atualizar .env do ChatVendas
4. ✅ Reiniciar backend
5. ✅ Testar criação de instância
6. ✅ Usar Android no frame!

## 📞 Suporte

Se tiver dúvidas, verifique:
- Logs: `docker-compose logs -f`
- Status: `docker-compose ps`
- Containers: `docker ps`

---

**Pronto para usar!** 🎉
