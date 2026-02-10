# ✅ Correção do Warning do Easypanel

## ⚠️ Warning que você viu:

```
time="2026-02-10T01:51:11Z" level=warning msg="/etc/easypanel/projects/android/android-cloud/code/docker-compose.yml: the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion"
```

## 🔧 Solução:

Remover a linha `version: '3.8'` do docker-compose.yml

---

## 📦 Arquivos Corrigidos

Atualizei 3 arquivos para você:

1. ✅ `docker-compose.yml` - Versão local (corrigido)
2. ✅ `docker-compose-github.yml` - Versão com GitHub (corrigido)
3. ✅ `docker-compose-easypanel.yml` - Versão otimizada para Easypanel (NOVO)

---

## 🚀 Use Este Agora (Sem Warnings)

Copie o conteúdo de: **`docker-compose-easypanel.yml`**

Ou copie daqui:

```yaml
services:
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
    healthcheck:
      test: ["CMD", "adb", "devices"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  android-1-data:

networks:
  android-network:
    driver: bridge
```

---

## 📋 Passo a Passo no Easypanel

1. **Edite o Docker Compose**
   - No Easypanel, vá no projeto `android-cloud`
   - Clique em "Edit" ou "Settings"
   - Encontre o Docker Compose

2. **Substitua o Conteúdo**
   - Delete tudo
   - Cole o conteúdo acima (sem `version: '3.8'`)

3. **Salve e Redeploy**
   - Clique em "Save"
   - Clique em "Deploy"

4. **Verifique**
   - Veja os logs
   - O warning não deve aparecer mais

---

## ✅ O que Mudou?

**ANTES:**
```yaml
version: '3.8'  ← Esta linha causava o warning

services:
  ...
```

**DEPOIS:**
```yaml
services:  ← Começa direto aqui
  ...
```

---

## 🎯 Por que isso aconteceu?

- Docker Compose v2+ não precisa mais da linha `version`
- Easypanel usa Docker Compose v2
- É só um warning, não quebra nada
- Mas é melhor remover para ficar limpo

---

## 🐛 Outros Erros?

Se aparecer outros erros, me avise! Vou te ajudar a resolver.

**Erros comuns:**

### "Cannot connect to Docker daemon"
```bash
ssh root@servidor
systemctl start docker
```

### "Port already in use"
Mude as portas no docker-compose:
```yaml
ports:
  - "3012:3011"  # Mude 3011 para 3012
```

### "Image not found"
```bash
docker pull budtmo/docker-android:emulator_13.0
```

---

## 📞 Próximos Passos

1. ✅ Corrigir docker-compose (você está aqui!)
2. ✅ Redeploy no Easypanel
3. ✅ Testar: `http://servidor:3011/health`
4. ✅ Configurar no ChatVendas
5. ✅ Criar instância Android!

---

**Dúvidas?** Me avise! 🚀
