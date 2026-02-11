# 🔧 Correção VNC Cloud - WebSocket Proxy

## Problema Identificado

O erro `WebSocket connection to 'ws://127.0.0.1:6081/' failed` acontecia porque:

1. O frontend estava tentando conectar no VNC usando `localhost:6081`
2. Mas o emulador está rodando no servidor cloud (167.86.72.198:6081)
3. A porta 6081 não existe no localhost, apenas no servidor cloud

## Solução Implementada

### 1. Proxy WebSocket no Backend

Criado `backend/src/routes/vncProxy.js` que:
- Recebe conexões WebSocket do frontend
- Encaminha para o servidor VNC no cloud
- Faz bridge bidirecional dos dados

**Fluxo:**
```
Frontend (noVNC)
    ↓ ws://127.0.0.1:3010/vnc-proxy/167.86.72.198:6081
Backend (Proxy)
    ↓ ws://167.86.72.198:6081
Servidor Cloud (VNC)
```

### 2. VNCViewer Atualizado

Modificado `src/modules/AndroidEmulator/components/VNCViewer.tsx`:

**Antes:**
```typescript
const host = '127.0.0.1';
const vncUrl = `http://127.0.0.1:3010/vnc/index.html?host=${host}&port=${wsPort}...`;
```

**Depois:**
```typescript
if (cloudVncUrl) {
  // Modo Cloud: Usar proxy
  vncUrl = `http://127.0.0.1:3010/vnc/index.html?host=127.0.0.1&port=3010&path=vnc-proxy/${host}:${port}...`;
} else {
  // Modo Local: Usar localhost direto
  vncUrl = `http://127.0.0.1:3010/vnc/index.html?host=${host}&port=${wsPort}...`;
}
```

### 3. Integração no Server

Modificado `backend/src/server.js`:
- Importado `setupVNCProxy`
- Chamado após criar WebSocketServer
- Proxy fica escutando em `/vnc-proxy/*`

## Como Funciona

### Modo Cloud (Novo):
```
1. API retorna: vncUrl = "wss://167.86.72.198:6081/websockify"
2. VNCViewer extrai: host=167.86.72.198, port=6081
3. VNCViewer monta URL: 
   http://127.0.0.1:3010/vnc/index.html?
     host=127.0.0.1&
     port=3010&
     path=vnc-proxy/167.86.72.198:6081
4. noVNC conecta em: ws://127.0.0.1:3010/vnc-proxy/167.86.72.198:6081
5. Proxy encaminha para: ws://167.86.72.198:6081
6. ✅ Conexão estabelecida!
```

### Modo Local (Mantido):
```
1. VNCViewer usa: host=127.0.0.1, port=6081
2. noVNC conecta direto: ws://127.0.0.1:6081
3. ✅ Conexão estabelecida!
```

## Arquivos Modificados

### Novos:
- ✅ `backend/src/routes/vncProxy.js` - Proxy WebSocket

### Modificados:
- ✅ `backend/src/server.js` - Integração do proxy
- ✅ `src/modules/AndroidEmulator/components/VNCViewer.tsx` - Detecção de modo cloud

## Testando

### 1. Reiniciar Backend
```bash
npm run electron:dev
```

### 2. Criar Device
1. Abrir "Emulador Android"
2. Clicar em "Novo Android"
3. Preencher nome e perfil
4. Clicar em "Criar Dispositivo"

### 3. Verificar Logs

**Backend deve mostrar:**
```
🔌 Configurando proxy WebSocket para VNC...
✅ Proxy WebSocket VNC configurado
🔌 Nova conexão VNC proxy: ws://167.86.72.198:6081
✅ Conectado no servidor VNC: ws://167.86.72.198:6081
```

**Frontend deve mostrar:**
```
☁️ VNC Cloud Mode (via proxy): {
  instanceId: "175772e4a23d",
  cloudVncUrl: "wss://167.86.72.198:6081/websockify",
  targetHost: "167.86.72.198",
  targetPort: "6081",
  proxyPath: "vnc-proxy/167.86.72.198:6081",
  vncUrl: "http://127.0.0.1:3010/vnc/index.html?..."
}
```

### 4. Resultado Esperado

- ✅ Tela do Android aparece no frame
- ✅ Mouse e teclado funcionam
- ✅ Sem erro de WebSocket

## Troubleshooting

### Erro: "WebSocket connection failed"

**Causa 1:** Proxy não está rodando
- Verifique se o backend iniciou corretamente
- Procure por "✅ Proxy WebSocket VNC configurado" nos logs

**Causa 2:** Servidor cloud não está acessível
- Teste: `curl http://167.86.72.198:6081`
- Verifique se a porta está aberta no firewall

**Causa 3:** noVNC não suporta parâmetro `path`
- Verificar versão do noVNC
- Pode precisar usar `?path=` ao invés de `&path=`

### Erro: "Connection closed (code: 1006)"

**Causa:** Emulador ainda está iniciando
- Aguarde 2-5 minutos
- Android demora para fazer boot completo
- VNC só fica disponível após boot

### Tela preta no frame

**Causa:** VNC conectou mas Android ainda não iniciou
- Normal nos primeiros 2-5 minutos
- Aguarde o boot do Android
- Verifique logs do container no Easypanel

## Próximos Passos

1. ✅ Testar criação de device
2. ✅ Verificar conexão VNC via proxy
3. ✅ Testar interação (mouse/teclado)
4. ✅ Criar múltiplos devices

## Benefícios

### ✅ Segurança:
- Frontend nunca conecta diretamente no cloud
- Todas as conexões passam pelo backend local
- Possibilidade de adicionar autenticação no proxy

### ✅ Flexibilidade:
- Funciona com qualquer servidor cloud
- Suporta HTTP e HTTPS
- Fácil adicionar logging/monitoramento

### ✅ Compatibilidade:
- Mantém modo local funcionando
- Detecção automática de modo (cloud vs local)
- Sem breaking changes

🚀 Pronto para testar!
