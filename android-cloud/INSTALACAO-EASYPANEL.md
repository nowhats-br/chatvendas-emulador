# 📦 Instalação no Easypanel - Passo a Passo

## 🎯 O que você vai instalar

Você vai instalar **2 coisas** no Easypanel:

1. **API de Gerenciamento** (Node.js) - Controla os emuladores
2. **Emuladores Android** (Docker) - Android 13 rodando

## 📁 Estrutura dos Arquivos

```
android-cloud/
├── README.md                    ← Documentação geral
├── INSTALACAO-EASYPANEL.md     ← Este arquivo (guia)
├── docker-compose.yml          ← PRINCIPAL - Cole no Easypanel
├── .env.example                ← Exemplo de configuração
└── api/
    ├── server.js               ← Código da API
    ├── package.json            ← Dependências Node.js
    └── Dockerfile              ← Build da API
```

## 🚀 MÉTODO 1: Via Interface Easypanel (RECOMENDADO)

### Passo 1: Acessar Easypanel

1. Abra seu navegador
2. Acesse: `https://seu-servidor.easypanel.io`
3. Faça login

### Passo 2: Criar Projeto

1. Clique em **"New Project"** (botão azul no canto superior direito)
2. Nome do projeto: `android-cloud`
3. Clique em **"Create"**

### Passo 3: Adicionar Serviço Docker Compose

1. Dentro do projeto, clique em **"Add Service"**
2. Selecione **"Docker Compose"**
3. **COPIE E COLE** o conteúdo do arquivo `docker-compose.yml` (está na pasta android-cloud)
4. Clique em **"Create"**

### Passo 4: Configurar Variáveis de Ambiente

1. Vá na aba **"Environment"** (ou "Settings")
2. Adicione a variável:
   ```
   Nome: DOMAIN
   Valor: seu-dominio.com  (ou IP do servidor)
   ```
3. Clique em **"Save"**

### Passo 5: Deploy

1. Clique no botão **"Deploy"** (geralmente verde)
2. Aguarde 2-3 minutos (vai baixar imagens Docker)
3. Veja os logs para confirmar que iniciou

### Passo 6: Verificar

1. Acesse: `http://seu-servidor:3011/health`
2. Deve retornar: `{"status":"ok","mode":"cloud"}`
3. ✅ **PRONTO!** API funcionando!

## 🖥️ MÉTODO 2: Via SSH (Alternativo)

### Passo 1: Conectar no Servidor

```bash
ssh root@seu-servidor.com
```

### Passo 2: Criar Diretório

```bash
mkdir -p /opt/android-cloud
cd /opt/android-cloud
```

### Passo 3: Criar Arquivos

**Opção A: Copiar via SCP (do seu PC)**
```bash
# No seu PC (Windows)
scp -r android-cloud/* root@seu-servidor:/opt/android-cloud/
```

**Opção B: Criar manualmente**
```bash
# No servidor
nano docker-compose.yml
# Cole o conteúdo e salve (Ctrl+X, Y, Enter)

mkdir api
nano api/server.js
# Cole o conteúdo e salve

nano api/package.json
# Cole o conteúdo e salve

nano api/Dockerfile
# Cole o conteúdo e salve
```

### Passo 4: Configurar Variáveis

```bash
cp .env.example .env
nano .env
# Edite DOMAIN=seu-dominio.com
# Salve (Ctrl+X, Y, Enter)
```

### Passo 5: Iniciar

```bash
docker-compose up -d
```

### Passo 6: Verificar

```bash
# Ver logs
docker-compose logs -f

# Ver containers rodando
docker ps

# Testar API
curl http://localhost:3011/health
```

## 🔧 Configurar no ChatVendas

### Passo 1: Editar .env do Backend

No seu PC, edite `backend/.env`:

```env
# Adicione esta linha:
CLOUD_ANDROID_API=https://android-api.seudominio.com

# Ou se for testar localmente:
CLOUD_ANDROID_API=http://localhost:3011
```

### Passo 2: Reiniciar Backend

```bash
cd backend
npm start
```

### Passo 3: Testar no ChatVendas

1. Abra o ChatVendas
2. Vá em **"Android Emulator"**
3. Clique em **"Criar Instância"**
4. Digite um nome (ex: "device1")
5. Aguarde 1-2 minutos
6. Android aparece no frame! 🎉

## 📊 Verificar se Está Funcionando

### 1. Health Check da API

```bash
curl http://seu-servidor:3011/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-10T00:00:00.000Z",
  "mode": "cloud"
}
```

### 2. Listar Instâncias

```bash
curl http://seu-servidor:3011/instances
```

**Resposta esperada:**
```json
{
  "success": true,
  "instances": [
    {
      "id": "abc123",
      "name": "android-emulator-1",
      "status": "running",
      "vncUrl": "wss://seu-dominio.com:6080/websockify"
    }
  ],
  "total": 1
}
```

### 3. Acessar VNC Direto

Abra no navegador:
```
http://seu-servidor:6080
```

Deve aparecer a tela do Android!

## 🐛 Problemas Comuns

### Erro: "Cannot connect to Docker daemon"

**Solução:**
```bash
# Verificar se Docker está rodando
systemctl status docker

# Iniciar Docker
systemctl start docker
```

### Erro: "Port already in use"

**Solução:**
```bash
# Ver o que está usando a porta
netstat -tulpn | grep 3011

# Matar processo
kill -9 <PID>
```

### Erro: "Image not found"

**Solução:**
```bash
# Baixar imagem manualmente
docker pull budtmo/docker-android:emulator_13.0
```

### Emulador não inicia

**Solução:**
```bash
# Ver logs do container
docker logs android-emulator-1

# Reiniciar container
docker restart android-emulator-1
```

## 💰 Custos

### Servidor Recomendado (Hetzner CPX21)

- **Preço:** €7.49/mês (~R$45/mês)
- **Specs:** 3 vCPU, 4GB RAM, 80GB SSD
- **Capacidade:** 2-3 emuladores simultâneos

### Servidor Médio (Hetzner CPX31)

- **Preço:** €13.90/mês (~R$85/mês)
- **Specs:** 4 vCPU, 8GB RAM, 160GB SSD
- **Capacidade:** 5-7 emuladores simultâneos

## 📞 Próximos Passos

1. ✅ Deploy no Easypanel (você está aqui!)
2. ✅ Configurar domínio (opcional mas recomendado)
3. ✅ Atualizar .env do ChatVendas
4. ✅ Reiniciar backend
5. ✅ Criar primeira instância
6. ✅ Testar Android no frame!

## 🎉 Resultado Final

Depois de tudo configurado:

1. Usuário abre ChatVendas
2. Vai em "Android Emulator"
3. Clica em "Criar Instância"
4. Android 13 aparece no frame do celular
5. Tudo funciona via nuvem
6. Backend NUNCA crasha
7. Escalável e rápido!

---

**Dúvidas?** Verifique os logs:
```bash
docker-compose logs -f
```

**Tudo funcionando?** 🎉 Parabéns!
