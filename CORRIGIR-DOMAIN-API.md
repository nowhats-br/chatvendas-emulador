# 🔧 Correção URGENTE - Domain da API Cloud

## 🐛 Problema Identificado

A API cloud está retornando:
```
vncUrl: "wss://localhost:6081/websockify"
```

Mas deveria retornar:
```
vncUrl: "wss://167.86.72.198:6081/websockify"
```

**Causa:** A variável de ambiente `DOMAIN` não está configurada no servidor.

## ✅ Solução

### Opção 1: Via SSH (Mais Rápido)

1. **Conectar no servidor:**
```bash
ssh root@167.86.72.198
```

2. **Ir para o diretório da API:**
```bash
cd /caminho/para/android-cloud
```

3. **Criar arquivo .env:**
```bash
cat > .env << EOF
DOMAIN=167.86.72.198
PORT=3011
NODE_ENV=production
EOF
```

4. **Reiniciar o container da API:**
```bash
docker-compose restart android-api
```

5. **Verificar se funcionou:**
```bash
curl http://167.86.72.198:3011/health
```

### Opção 2: Via Easypanel (Interface Web)

1. **Acessar Easypanel**
2. **Ir no serviço `android-api`**
3. **Adicionar variável de ambiente:**
   - Nome: `DOMAIN`
   - Valor: `167.86.72.198`
4. **Salvar e reiniciar o serviço**

### Opção 3: Modificar docker-compose.yml

Se estiver usando docker-compose diretamente:

```yaml
services:
  android-api:
    environment:
      NODE_ENV: production
      PORT: 3011
      DOMAIN: 167.86.72.198  # ← Adicionar esta linha
```

Depois:
```bash
docker-compose up -d android-api
```

## 🧪 Testar

### 1. Verificar Health Check
```bash
curl http://167.86.72.198:3011/health
```

Deve retornar:
```json
{
  "status": "ok",
  "timestamp": "...",
  "mode": "cloud"
}
```

### 2. Criar um Device de Teste

No ChatVendas:
1. Ir em "Emulador Android"
2. Criar novo device chamado "teste-domain"
3. Verificar os logs do backend

**Backend deve mostrar:**
```
✅ Instância teste-domain criada na nuvem
   Resposta: {
     "success": true,
     "instance": {
       "vncUrl": "wss://167.86.72.198:6082/websockify"  ← IP correto!
     }
   }
```

### 3. Verificar Frontend Console

Deve mostrar:
```
☁️ VNC Cloud Mode (via proxy): {
  cloudVncUrl: "wss://167.86.72.198:6082/websockify",
  targetHost: "167.86.72.198",  ← IP correto!
  targetPort: "6082"
}
```

## 📝 Como a API Usa o DOMAIN

No arquivo `android-cloud/api/server.js`:

```javascript
const DOMAIN = process.env.DOMAIN || 'localhost';

// Ao criar instância:
res.json({
  success: true,
  instance: {
    vncUrl: `wss://${DOMAIN}:${6080 + instanceNumber}/websockify`,
    //           ↑ Aqui usa o DOMAIN
  }
});

// Ao listar instâncias:
vncUrl: `wss://${DOMAIN}:${vncPort?.PublicPort || 6080}/websockify`
//           ↑ Aqui também
```

## ⚠️ Importante

### Usar IP ou Domínio?

**Opção 1: IP (Mais Simples)**
```
DOMAIN=167.86.72.198
```
- ✅ Funciona imediatamente
- ✅ Não precisa configurar DNS
- ❌ Se o IP mudar, precisa reconfigurar

**Opção 2: Domínio (Recomendado)**
```
DOMAIN=painel.nowhats.com.br
```
- ✅ Mais profissional
- ✅ Se IP mudar, só atualizar DNS
- ❌ Precisa configurar DNS apontando para o IP
- ❌ Precisa certificado SSL para WSS

### Protocolo (WS vs WSS)

Atualmente a API usa `wss://` (WebSocket Secure), mas se não tiver certificado SSL, deve usar `ws://`:

**Modificar em `android-cloud/api/server.js`:**

```javascript
// Se NÃO tiver SSL:
vncUrl: `ws://${DOMAIN}:${port}/websockify`

// Se TIVER SSL:
vncUrl: `wss://${DOMAIN}:${port}/websockify`
```

## 🚀 Após Configurar

1. **Deletar devices antigos** (criados com localhost)
2. **Criar novos devices**
3. **Testar conexão VNC**
4. **Verificar se a tela do Android aparece**

## 🔍 Troubleshooting

### Ainda mostra localhost?

**Verificar:**
1. Variável de ambiente foi configurada?
   ```bash
   docker exec android-api env | grep DOMAIN
   ```
2. Container foi reiniciado?
   ```bash
   docker-compose restart android-api
   ```
3. Logs do container:
   ```bash
   docker logs android-api
   ```

### Erro de SSL/TLS?

Se usar `wss://` sem certificado SSL:
- Mudar para `ws://` na API
- Ou configurar certificado SSL no servidor

### Firewall bloqueando?

Verificar se as portas estão abertas:
```bash
ufw status
ufw allow 6080:6090/tcp
```

## 📚 Arquivos Relacionados

- `android-cloud/api/server.js` - Código da API
- `android-cloud/docker-compose-easypanel.yml` - Configuração Docker
- `android-cloud/.env.example` - Exemplo de configuração
- `backend/src/routes/vncProxy.js` - Proxy WebSocket (já criado)

🎯 Após configurar o DOMAIN, o sistema deve funcionar perfeitamente!
