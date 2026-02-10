# 🚀 3 Formas de Fazer Deploy no Easypanel

Escolha a forma que você preferir. Todas funcionam!

---

## 🥇 FORMA 1: Copiar e Colar (MAIS FÁCIL - 5 min)

**Vantagens:**
- ✅ Não precisa GitHub
- ✅ Não precisa upload de arquivos
- ✅ Mais rápido
- ✅ Funciona sempre

**Como fazer:**

1. **Abra Easypanel**
   ```
   https://seu-servidor.easypanel.io
   ```

2. **Crie Projeto**
   - New Project → Nome: `android-cloud` → Create

3. **Adicione Docker Compose**
   - Add Service → Docker Compose
   - Cole o conteúdo de `docker-compose.yml`
   - Create

4. **Crie Arquivos da API**
   
   No Easypanel, vá em "Files" ou "File Manager":
   
   ```
   Criar pasta: api/
   Criar arquivo: api/package.json (cole o conteúdo)
   Criar arquivo: api/server.js (cole o conteúdo)
   ```

5. **Configure Variáveis**
   - Environment → Adicione: `DOMAIN=seu-dominio.com`

6. **Deploy**
   - Clique em "Deploy"
   - Aguarde 2-3 minutos

7. **Teste**
   ```
   http://seu-servidor:3011/health
   ```

**Arquivos para copiar:**
- `android-cloud/docker-compose.yml`
- `android-cloud/api/package.json`
- `android-cloud/api/server.js`

---

## 🥈 FORMA 2: Via GitHub (RECOMENDADO PARA ATUALIZAÇÕES)

**Vantagens:**
- ✅ Fácil de atualizar depois
- ✅ Versionamento automático
- ✅ Backup no GitHub

### 💡 IMPORTANTE: Você já tem ChatVendas no GitHub?

**Se SIM:** Você pode usar o mesmo repositório! Não precisa criar um novo!
- Veja: `DEPLOY-GITHUB-SUBPASTA.md` (guia específico)
- O Easypanel pode usar só a pasta `android-cloud/` do seu repo

**Se NÃO:** Siga os passos abaixo para criar um repo novo.

---

### Opção A: Usar Repositório Existente (ChatVendas)

Se o ChatVendas já está no GitHub:

1. **No Easypanel**
   - New Project → android-cloud
   - Add Service → Docker Compose

2. **Cole este docker-compose (modificado):**
   ```yaml
   version: '3.8'
   
   services:
     android-api:
       build:
         context: https://github.com/SEU-USUARIO/chatvendas.git#main:android-cloud/api
       # ... resto igual
   ```
   
   **Troque:** `SEU-USUARIO/chatvendas` pelo seu repositório

3. **Deploy**
   - Easypanel vai clonar o repo e usar só a pasta `android-cloud/`

**Veja guia completo:** `DEPLOY-GITHUB-SUBPASTA.md`

---

### Opção B: Criar Repositório Novo (Só android-cloud)

1. **Criar Repositório no GitHub**
   ```
   - Acesse: https://github.com/new
   - Nome: android-cloud
   - Público ou Privado
   - Create repository
   ```

2. **Fazer Upload dos Arquivos**
   
   **Via Interface GitHub:**
   ```
   - Clique em "uploading an existing file"
   - Arraste a pasta android-cloud/
   - Commit changes
   ```
   
   **Via Git (se tiver instalado):**
   ```bash
   cd android-cloud
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/seu-usuario/android-cloud.git
   git push -u origin main
   ```

3. **Conectar no Easypanel**
   ```
   - New Project → android-cloud
   - Add Service → GitHub
   - Conecte sua conta GitHub
   - Selecione o repositório android-cloud
   - Branch: main
   - Deploy
   ```

4. **Configure Variáveis**
   ```
   Environment → DOMAIN=seu-dominio.com
   ```

5. **Deploy Automático**
   - Toda vez que você fizer push no GitHub, o Easypanel atualiza automaticamente!

---

## 🥉 FORMA 3: Via SSH (PARA QUEM GOSTA DE TERMINAL)

**Vantagens:**
- ✅ Controle total
- ✅ Mais rápido para quem sabe usar terminal
- ✅ Não depende de interface

**Como fazer:**

1. **Conectar no Servidor**
   ```bash
   ssh root@seu-servidor.com
   ```

2. **Criar Diretório**
   ```bash
   mkdir -p /opt/android-cloud/api
   cd /opt/android-cloud
   ```

3. **Copiar Arquivos do Seu PC**
   
   **Opção A: Via SCP (Windows)**
   ```bash
   # No PowerShell do seu PC
   scp -r android-cloud/* root@seu-servidor:/opt/android-cloud/
   ```
   
   **Opção B: Via WinSCP ou FileZilla**
   ```
   - Abra WinSCP ou FileZilla
   - Conecte no servidor
   - Arraste a pasta android-cloud/
   ```
   
   **Opção C: Criar Manualmente**
   ```bash
   # No servidor
   nano docker-compose.yml  # Cole e salve (Ctrl+X, Y, Enter)
   nano api/package.json    # Cole e salve
   nano api/server.js       # Cole e salve
   ```

4. **Configurar Variáveis**
   ```bash
   nano .env
   # Adicione: DOMAIN=seu-dominio.com
   # Salve (Ctrl+X, Y, Enter)
   ```

5. **Iniciar**
   ```bash
   docker-compose up -d
   ```

6. **Ver Logs**
   ```bash
   docker-compose logs -f
   ```

7. **Testar**
   ```bash
   curl http://localhost:3011/health
   ```

---

## 📊 Comparação

| Característica | Copiar/Colar | GitHub | SSH |
|----------------|--------------|--------|-----|
| Facilidade | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Velocidade | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Atualizações | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Backup | ⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| Controle | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 🎯 Qual Escolher?

### Use **Copiar/Colar** se:
- ✅ Você quer fazer rápido
- ✅ É a primeira vez
- ✅ Não tem GitHub configurado
- ✅ Não sabe usar SSH

### Use **GitHub** se:
- ✅ Você vai atualizar frequentemente
- ✅ Quer backup automático
- ✅ Trabalha em equipe
- ✅ Quer versionamento

### Use **SSH** se:
- ✅ Você é experiente com terminal
- ✅ Quer controle total
- ✅ Prefere linha de comando
- ✅ Vai fazer muitas customizações

---

## 🆘 Precisa de Ajuda?

### Copiar/Colar
Veja: `COPIAR-E-COLAR.txt`

### GitHub
Veja: `DEPLOY-VIA-GITHUB.md` (vou criar)

### SSH
Veja: `DEPLOY-VIA-SSH.md` (vou criar)

### Geral
Veja: `DEPLOY-EASYPANEL-SIMPLES.md`

---

## ✅ Depois do Deploy

Independente da forma escolhida, você precisa:

1. **Testar a API**
   ```
   http://seu-servidor:3011/health
   ```

2. **Configurar no ChatVendas**
   ```env
   # backend/.env
   CLOUD_ANDROID_API=http://seu-servidor:3011
   ```

3. **Reiniciar Backend**
   ```bash
   npm run electron:dev
   ```

4. **Criar Instância**
   - Abra ChatVendas
   - Android Emulator
   - Criar Instância

---

## 🎉 Pronto!

Escolha a forma que você preferir e siga o guia correspondente!

**Recomendação:** Comece com **Copiar/Colar** para testar, depois migre para **GitHub** se quiser facilitar atualizações.
