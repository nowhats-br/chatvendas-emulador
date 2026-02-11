# 🚨 INSTRUÇÕES URGENTES - Configurar DOMAIN

## 🐛 Problema Atual

A API cloud está retornando `localhost` ao invés do IP real:
```
vncUrl: "wss://localhost:6081/websockify"  ❌
```

Deveria ser:
```
vncUrl: "wss://167.86.72.198:6081/websockify"  ✅
```

## ✅ Solução (3 Passos Rápidos)

### Passo 1: Conectar no Servidor via SSH

```bash
ssh root@167.86.72.198
```

### Passo 2: Configurar DOMAIN

**Opção A: Se estiver usando Easypanel**

1. Acessar Easypanel no navegador
2. Ir no serviço `android-api`
3. Adicionar variável de ambiente:
   - Nome: `DOMAIN`
   - Valor: `167.86.72.198`
4. Salvar e reiniciar

**Opção B: Se estiver usando Docker Compose direto**

```bash
# Ir para o diretório da API
cd /caminho/para/android-cloud

# Criar arquivo .env
echo "DOMAIN=167.86.72.198" > .env
echo "PORT=3011" >> .env
echo "NODE_ENV=production" >> .env

# Reiniciar container
docker-compose restart android-api

# OU se não tiver docker-compose instalado:
docker restart android-api
```

### Passo 3: Verificar se Funcionou

```bash
# Testar health check
curl http://167.86.72.198:3011/health

# Listar instâncias e verificar vncUrl
curl http://167.86.72.198:3011/instances
```

**Deve mostrar:**
```json
{
  "instances": [{
    "vncUrl": "wss://167.86.72.198:6081/websockify"  ← IP correto!
  }]
}
```

## 🧪 Testar no ChatVendas

Após configurar o DOMAIN:

1. **Deletar devices antigos** (foram criados com localhost)
   - Ir em "Emulador Android"
   - Deletar todos os devices existentes

2. **Criar novo device**
   - Clicar em "Novo Android"
   - Nome: "teste"
   - Perfil: Médio
   - Criar

3. **Verificar logs do backend**
   - Deve mostrar: `vncUrl: "wss://167.86.72.198:6082/websockify"`

4. **Aguardar 2-5 minutos**
   - Android está fazendo boot
   - Tela vai aparecer quando estiver pronto

5. **Verificar console do navegador**
   - Deve mostrar: `targetHost: "167.86.72.198"`
   - Não deve mostrar `localhost`

## 📝 Scripts de Teste

Criei 2 scripts para testar:

### Windows:
```bash
cd android-cloud
test-domain.bat
```

### Linux/Mac:
```bash
cd android-cloud
chmod +x test-domain.sh
./test-domain.sh
```

## ⚠️ Importante

### Protocolo WS vs WSS

A API está usando `wss://` (WebSocket Secure), mas se o servidor não tiver certificado SSL, vai dar erro.

**Se der erro de SSL:**

1. Editar `android-cloud/api/server.js`
2. Trocar `wss://` por `ws://` em 2 lugares:

```javascript
// Linha ~40 (criar instância):
vncUrl: `ws://${DOMAIN}:${6080 + instanceNumber}/websockify`,

// Linha ~70 (listar instâncias):
vncUrl: `ws://${DOMAIN}:${vncPort?.PublicPort || 6080}/websockify`,
```

3. Reiniciar API:
```bash
docker-compose restart android-api
```

### Firewall

Verificar se as portas VNC estão abertas:

```bash
# Ver status
ufw status

# Abrir portas VNC (6080-6090)
ufw allow 6080:6090/tcp

# Recarregar
ufw reload
```

## 🎯 Checklist Final

- [ ] SSH no servidor
- [ ] Configurar `DOMAIN=167.86.72.198`
- [ ] Reiniciar container `android-api`
- [ ] Testar: `curl http://167.86.72.198:3011/instances`
- [ ] Verificar se vncUrl tem IP correto (não localhost)
- [ ] Deletar devices antigos no ChatVendas
- [ ] Criar novo device
- [ ] Aguardar boot (2-5 min)
- [ ] Verificar se tela do Android aparece

## 🆘 Se Ainda Não Funcionar

### 1. Verificar logs da API:
```bash
docker logs android-api
```

### 2. Verificar variável de ambiente:
```bash
docker exec android-api env | grep DOMAIN
```

Deve mostrar:
```
DOMAIN=167.86.72.198
```

### 3. Verificar se container está rodando:
```bash
docker ps | grep android
```

### 4. Ver logs do emulador:
```bash
docker logs android-emulator-teste
```

## 📚 Documentação Criada

- `CORRIGIR-DOMAIN-API.md` - Detalhes completos
- `RESUMO-CORRECAO-VNC.md` - Resumo da correção VNC
- `CORRECAO-VNC-CLOUD.md` - Detalhes técnicos do proxy
- `android-cloud/.env.example` - Exemplo de configuração
- `android-cloud/test-domain.sh` - Script de teste (Linux)
- `android-cloud/test-domain.bat` - Script de teste (Windows)

🚀 Após configurar o DOMAIN, tudo deve funcionar!
