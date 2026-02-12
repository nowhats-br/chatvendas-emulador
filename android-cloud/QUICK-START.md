# ⚡ Quick Start - Android Cloud API

## 🎯 Objetivo

Fazer a API funcionar no servidor e criar devices Android pelo ChatVendas.

---

## 📋 Checklist Rápido

### No Servidor (via SSH)

```bash
# 1. Conectar no servidor
ssh root@167.86.72.198

# 2. Ir para o diretório
cd /root/chatvendas-emulador/android-cloud

# 3. Executar instalação
chmod +x install-portainer.sh
./install-portainer.sh
```

**O script vai:**
- ✅ Instalar Portainer (se não tiver)
- ✅ Baixar imagem do Android (~2GB, 5-10 min)
- ✅ Preparar tudo para deploy

### No Portainer (via Browser)

```
1. Abrir: http://167.86.72.198:9000
2. Login (criar senha se primeira vez)
3. Clicar em "local"
4. Menu lateral → "Stacks"
5. Botão "+ Add stack"
6. Name: android-cloud-api
7. Build method: Web editor
8. Copiar conteúdo de: portainer-stack.yml
9. Clicar "Deploy the stack"
10. Aguardar ~30 segundos
```

### Testar API

```bash
curl http://167.86.72.198:3011/health
```

Deve retornar:
```json
{"status":"ok","timestamp":"...","mode":"cloud"}
```

### No ChatVendas (Windows)

```bash
# 1. Iniciar em modo dev
npm run electron:dev

# 2. Ir em "Emulador Android"
# 3. Clicar "Criar Novo Device"
# 4. Preencher nome e perfil
# 5. Aguardar ~30 segundos
# 6. VNC conecta automaticamente!
```

---

## 🚨 Se Algo Der Errado

### Erro 500 ao criar device

```bash
# Baixar imagem do Android
docker pull budtmo/docker-android:emulator_13.0
```

### API não responde

```bash
# Ver se está rodando
docker ps | grep android-cloud-api

# Ver logs
docker logs android-cloud-api

# Reiniciar
docker restart android-cloud-api
```

### Portainer não abre

```bash
# Ver se está rodando
docker ps | grep portainer

# Iniciar
docker start portainer
```

---

## 📊 Comandos Úteis

```bash
# Ver todos os containers
docker ps -a

# Ver recursos (CPU/RAM)
docker stats

# Ver logs da API
docker logs -f android-cloud-api

# Ver emuladores
docker ps | grep android-emulator

# Parar tudo
docker stop $(docker ps -q)
```

---

## 🎯 Resultado Final

Quando tudo estiver funcionando:

1. ✅ Portainer rodando em: http://167.86.72.198:9000
2. ✅ API respondendo em: http://167.86.72.198:3011/health
3. ✅ ChatVendas criando devices na nuvem
4. ✅ VNC conectando automaticamente
5. ✅ Android rodando no frame!

---

## 📞 Precisa de Ajuda?

1. Veja logs no Portainer (Containers → android-cloud-api → Logs)
2. Leia [PORTAINER-GUIDE.md](./PORTAINER-GUIDE.md) para detalhes
3. Execute `docker logs android-cloud-api` para debug

---

**Tempo estimado:** 10-15 minutos (incluindo download da imagem)
