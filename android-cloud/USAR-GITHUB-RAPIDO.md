# 🚀 Guia Rápido: Deploy via GitHub

## ✅ Pré-requisitos

- ChatVendas já está no GitHub
- Pasta `android-cloud/` está no repositório
- Você tem acesso ao Easypanel

---

## 📋 Passo a Passo (5 minutos)

### 1️⃣ Abra o Arquivo

Abra: `android-cloud/docker-compose-github.yml`

### 2️⃣ Troque Esta Linha (linha 23)

**ANTES:**
```yaml
context: https://github.com/SEU-USUARIO/chatvendas.git#main:android-cloud/api
```

**DEPOIS (exemplo):**
```yaml
context: https://github.com/joao/meu-chatvendas.git#main:android-cloud/api
```

**Troque:**
- `SEU-USUARIO` → Seu usuário do GitHub
- `chatvendas` → Nome do seu repositório
- `main` → Branch (se for `master`, troque)

### 3️⃣ Copie o Arquivo Todo

- Ctrl+A (selecionar tudo)
- Ctrl+C (copiar)

### 4️⃣ No Easypanel

1. Acesse: `https://seu-servidor.easypanel.io`
2. Login
3. **New Project** → Nome: `android-cloud` → Create
4. **Add Service** → **Docker Compose**
5. **Cole** o conteúdo (Ctrl+V)
6. **Create**

### 5️⃣ Configure Variáveis

1. Vá em **Environment** (ou Settings)
2. Adicione:
   ```
   Nome: DOMAIN
   Valor: seu-dominio.com
   ```
   (ou use o IP do servidor se não tiver domínio)
3. **Save**

### 6️⃣ Deploy

1. Clique em **Deploy** (botão verde)
2. Aguarde 2-3 minutos
3. Veja os logs

### 7️⃣ Teste

Abra no navegador:
```
http://seu-servidor:3011/health
```

**Deve retornar:**
```json
{
  "status": "ok",
  "mode": "cloud"
}
```

✅ **Se aparecer isso, FUNCIONOU!**

### 8️⃣ Configure no ChatVendas

No seu PC, edite `backend/.env`:

```env
# Adicione esta linha:
CLOUD_ANDROID_API=http://seu-servidor:3011

# Ou se tiver domínio:
CLOUD_ANDROID_API=https://android-api.seudominio.com
```

### 9️⃣ Reinicie o Backend

```bash
npm run electron:dev
```

### 🔟 Teste no ChatVendas

1. Abra ChatVendas
2. Vá em **Android Emulator**
3. Clique em **Criar Instância**
4. Digite um nome (ex: "device1")
5. Aguarde 1-2 minutos
6. **Android aparece no frame!** 🎉

---

## 🎯 Exemplo Completo

**Seu repositório:**
```
https://github.com/joao/chatvendas
```

**Linha 23 do docker-compose-github.yml:**
```yaml
context: https://github.com/joao/chatvendas.git#main:android-cloud/api
```

**No Easypanel:**
- Environment: `DOMAIN=meuservidor.com`

**No ChatVendas (.env):**
```env
CLOUD_ANDROID_API=http://meuservidor.com:3011
```

---

## 🐛 Problemas Comuns

### ❌ "repository not found"

**Causa:** Repositório é privado

**Solução 1:** Tornar repositório público
```
GitHub → Settings → Danger Zone → Change visibility → Public
```

**Solução 2:** Configurar SSH key no Easypanel
```
Easypanel → Settings → SSH Keys → Add Key
```

### ❌ "context not found"

**Causa:** Pasta `android-cloud/` não existe no repo

**Solução:** Verifique se a pasta está no GitHub
```
https://github.com/seu-usuario/chatvendas/tree/main/android-cloud
```

### ❌ Branch errado

**Causa:** Seu branch é `master` não `main`

**Solução:** Troque na linha 23:
```yaml
context: https://github.com/seu-usuario/chatvendas.git#master:android-cloud/api
```

### ❌ "Cannot connect to Docker daemon"

**Solução:**
```bash
ssh root@seu-servidor
systemctl start docker
```

### ❌ "Port already in use"

**Solução:** Mude as portas no docker-compose:
```yaml
ports:
  - "3012:3011"  # Mude 3011 para 3012
```

---

## 📊 Checklist

- [ ] ChatVendas está no GitHub
- [ ] Pasta `android-cloud/` está no repo
- [ ] Troquei `SEU-USUARIO/chatvendas` pelo meu repo
- [ ] Verifiquei o nome do branch (main ou master)
- [ ] Copiei o arquivo todo
- [ ] Colei no Easypanel
- [ ] Configurei `DOMAIN` no Environment
- [ ] Fiz Deploy
- [ ] Testei `/health` e funcionou
- [ ] Configurei `CLOUD_ANDROID_API` no ChatVendas
- [ ] Reiniciei o backend
- [ ] Testei criar instância

---

## 🎉 Pronto!

Agora você tem:
- ✅ Android 13 rodando na nuvem
- ✅ API gerenciando emuladores
- ✅ ChatVendas conectado
- ✅ Backend nunca crasha
- ✅ Escalável e rápido

---

## 📞 Próximos Passos

1. Criar mais instâncias Android
2. Testar WhatsApp Business
3. Configurar domínio personalizado
4. Adicionar mais servidores se precisar

---

**Dúvidas?** Veja os logs:
```bash
# No Easypanel
Logs → android-api

# Ou via SSH
ssh root@servidor
docker logs android-api
```

🚀 **Boa sorte!**
