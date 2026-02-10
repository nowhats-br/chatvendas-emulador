# 🚀 Deploy no Easypanel - Usando Subpasta do GitHub

## 💡 Cenário

Você já tem o ChatVendas no GitHub:
```
https://github.com/seu-usuario/chatvendas
```

E a pasta `android-cloud/` está dentro desse repositório:
```
chatvendas/
├── backend/
├── src/
├── android-cloud/          ← Esta pasta
│   ├── docker-compose.yml
│   └── api/
└── ...
```

**Você NÃO precisa criar um repositório separado!**

---

## 🎯 Método 1: Via Docker Compose no Easypanel (RECOMENDADO)

O Easypanel permite usar Docker Compose diretamente, sem precisar apontar para subpasta.

### Passo a Passo:

1. **Acesse Easypanel**
   ```
   https://seu-servidor.easypanel.io
   ```

2. **Crie Projeto**
   - New Project → Nome: `android-cloud` → Create

3. **Adicione Docker Compose**
   - Add Service → **Docker Compose**
   - Cole o conteúdo de `android-cloud/docker-compose.yml`
   - Create

4. **Configure Build Context**
   
   No Easypanel, edite o docker-compose para apontar para o GitHub:
   
   ```yaml
   version: '3.8'
   
   services:
     android-api:
       build:
         context: https://github.com/seu-usuario/chatvendas.git#main:android-cloud/api
       container_name: android-api
       ports:
         - "3011:3011"
       environment:
         NODE_ENV: production
         PORT: 3011
         DOMAIN: ${DOMAIN:-localhost}
       volumes:
         - /var/run/docker.sock:/var/run/docker.sock:ro
       restart: unless-stopped
       networks:
         - android-network
   
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
   
   **Explicação:**
   ```
   context: https://github.com/seu-usuario/chatvendas.git#main:android-cloud/api
            └─────────────────┬──────────────────┘ └─┬─┘ └────────┬────────┘
                              │                      │            │
                         URL do repo              branch      subpasta
   ```

5. **Configure Variáveis**
   - Environment → `DOMAIN=seu-dominio.com`

6. **Deploy**
   - Clique em "Deploy"
   - Easypanel vai clonar o repo e usar só a pasta `android-cloud/`

---

## 🎯 Método 2: Via GitHub Service (Alternativo)

Se o Easypanel suportar subpastas diretamente:

1. **Conectar GitHub**
   - Add Service → GitHub
   - Conecte sua conta
   - Selecione repositório: `chatvendas`

2. **Configurar Subpasta**
   - Root Directory: `android-cloud`
   - Dockerfile Path: `api/Dockerfile`
   - Docker Compose Path: `docker-compose.yml`

3. **Deploy**
   - Easypanel vai usar só a pasta `android-cloud/`

---

## 🎯 Método 3: Git Sparse Checkout (Avançado)

Se você quiser clonar APENAS a pasta `android-cloud/` no servidor:

```bash
# Conectar no servidor
ssh root@seu-servidor.com

# Criar diretório
mkdir -p /opt/android-cloud
cd /opt/android-cloud

# Inicializar Git
git init

# Configurar remote
git remote add origin https://github.com/seu-usuario/chatvendas.git

# Habilitar sparse checkout
git config core.sparseCheckout true

# Especificar apenas a pasta android-cloud
echo "android-cloud/*" >> .git/info/sparse-checkout

# Fazer pull
git pull origin main

# Mover arquivos para raiz
mv android-cloud/* .
rmdir android-cloud

# Iniciar
docker-compose up -d
```

---

## 🎯 Método 4: GitHub Actions (Automático)

Crie um workflow que faz deploy automático quando você atualizar a pasta `android-cloud/`:

Crie: `.github/workflows/deploy-android-cloud.yml`

```yaml
name: Deploy Android Cloud

on:
  push:
    branches: [main]
    paths:
      - 'android-cloud/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: root
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/android-cloud
            git pull origin main
            docker-compose up -d --build
```

**Configurar Secrets no GitHub:**
- Settings → Secrets → New secret
- `SERVER_HOST`: IP do servidor
- `SSH_KEY`: Chave SSH privada

**Resultado:** Toda vez que você fizer push na pasta `android-cloud/`, o GitHub Actions faz deploy automático!

---

## 📊 Comparação dos Métodos

| Método | Facilidade | Automático | Requer Separar Repo |
|--------|------------|------------|---------------------|
| Docker Compose | ⭐⭐⭐⭐⭐ | ❌ | ❌ |
| GitHub Service | ⭐⭐⭐⭐ | ✅ | ❌ |
| Sparse Checkout | ⭐⭐⭐ | ❌ | ❌ |
| GitHub Actions | ⭐⭐⭐⭐ | ✅ | ❌ |

---

## 🎯 Minha Recomendação

### Para Começar Rápido:
**Use Método 1 (Docker Compose)**
- Copie e cole o docker-compose.yml no Easypanel
- Mude o `build: ./api` para `build: https://github.com/...`
- Deploy!

### Para Produção:
**Use Método 4 (GitHub Actions)**
- Configure uma vez
- Toda atualização faz deploy automático
- Mais profissional

---

## ✅ Vantagens de Usar o Mesmo Repositório

1. ✅ **Tudo em um lugar** - Código do ChatVendas + Android Cloud juntos
2. ✅ **Versionamento unificado** - Mesma versão para tudo
3. ✅ **Mais fácil de gerenciar** - Um repo só
4. ✅ **Deploy automático** - GitHub Actions monitora a pasta
5. ✅ **Backup único** - Tudo no mesmo lugar

---

## 🚀 Exemplo Prático

Vamos supor que seu repo é:
```
https://github.com/joao/chatvendas
```

**No Easypanel, use este docker-compose:**

```yaml
version: '3.8'

services:
  android-api:
    build:
      context: https://github.com/joao/chatvendas.git#main:android-cloud/api
    # ... resto da configuração
```

**Ou via SSH:**

```bash
ssh root@servidor.com
cd /opt
git clone --depth 1 --filter=blob:none --sparse https://github.com/joao/chatvendas.git android-cloud
cd android-cloud
git sparse-checkout set android-cloud
cd android-cloud
docker-compose up -d
```

---

## 🎉 Conclusão

**Você NÃO precisa criar um repositório separado!**

Use o mesmo repositório do ChatVendas e aproveite a pasta `android-cloud/` que já está lá.

**Forma mais fácil:**
1. Copie o docker-compose.yml no Easypanel
2. Mude o build context para apontar para o GitHub
3. Deploy!

**Forma mais profissional:**
1. Configure GitHub Actions
2. Toda atualização faz deploy automático
3. Sem trabalho manual!

---

Quer que eu configure o GitHub Actions para você? É só 1 arquivo e fica automático! 🚀
