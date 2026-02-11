# 🎯 Solução Final - Problema do DOMAIN

## 📊 Status Atual

✅ Código atualizado (fallback = 167.86.72.198)  
✅ Variável DOMAIN adicionada no Easypanel  
❌ API ainda retorna `localhost`  

## 🐛 Problema

A variável `DOMAIN=167.86.72.198` foi adicionada no Easypanel, mas a API não está usando ela.

**Teste atual:**
```bash
curl http://167.86.72.198:3011/instances
# Retorna: "vncUrl":"wss://localhost:6081/websockify"  ❌
```

## ✅ Soluções Possíveis

### Solução 1: Verificar se o Deploy Pegou as Mudanças

O código foi atualizado para usar `167.86.72.198` como fallback:

```javascript
const DOMAIN = process.env.DOMAIN || '167.86.72.198';
```

**Mas o Easypanel pode estar usando código antigo!**

**Ação:**
1. No Easypanel, ir em "Fonte" ou "Source"
2. Verificar se está conectado ao GitHub
3. Fazer um novo deploy forçado
4. Aguardar 2-3 minutos
5. Testar: `curl http://167.86.72.198:3011/instances`

### Solução 2: Deletar e Recriar o Serviço

Se o deploy não funcionar, pode ser cache do Docker.

**Ação:**
1. No Easypanel, deletar o serviço "android cloud"
2. Criar novo serviço
3. Configurar:
   - Fonte: GitHub (repositório android-cloud)
   - Porta: 3011
   - Variável: `DOMAIN=167.86.72.198`
4. Deploy
5. Testar

### Solução 3: Usar Docker Compose Direto via SSH

Se o Easypanel não estiver funcionando, usar docker-compose direto.

**Ação via SSH:**
```bash
ssh root@167.86.72.198

# Ir para o diretório
cd /caminho/para/android-cloud

# Parar serviço atual
docker-compose down

# Criar .env
echo "DOMAIN=167.86.72.198" > .env
echo "PORT=3011" >> .env

# Subir novamente
docker-compose up -d

# Ver logs
docker-compose logs -f
```

### Solução 4: Hardcode Direto no Código (Temporário)

Se nada funcionar, podemos hardcode o IP diretamente.

**Modificar `android-cloud/api/server.js`:**
```javascript
const DOMAIN = '167.86.72.198'; // Hardcoded
```

Remover o `process.env.DOMAIN` completamente.

## 🧪 Como Testar

Após qualquer solução:

### 1. Testar API
```bash
curl http://167.86.72.198:3011/instances
```

Deve mostrar:
```json
{
  "vncUrl": "wss://167.86.72.198:6081/websockify"  ✅
}
```

### 2. Deletar Device Antigo
No ChatVendas, deletar o device "teste" (que tem localhost).

### 3. Criar Novo Device
1. Iniciar ChatVendas: `npm run electron:dev`
2. Ir em "Emulador Android"
3. Criar novo device "teste2"
4. Aguardar 2-5 min

### 4. Verificar Logs
**Frontend deve mostrar:**
```
☁️ VNC Cloud Mode (via proxy): {
  targetHost: "167.86.72.198",  ✅
  targetPort: "6081"
}
```

**Backend deve mostrar:**
```
🔌 Nova conexão VNC proxy: ws://167.86.72.198:6081
✅ Conectado no servidor VNC
```

## 📝 Checklist

- [ ] Fazer deploy forçado no Easypanel
- [ ] Aguardar 2-3 minutos
- [ ] Testar: `curl http://167.86.72.198:3011/instances`
- [ ] Verificar se vncUrl tem `167.86.72.198`
- [ ] Se não, tentar Solução 2 ou 3
- [ ] Deletar devices antigos
- [ ] Iniciar ChatVendas: `npm run electron:dev`
- [ ] Criar novo device
- [ ] Aguardar boot (2-5 min)
- [ ] Verificar se tela do Android aparece

## 🆘 Se Nada Funcionar

Podemos fazer hardcode temporário do IP diretamente no código e fazer deploy. Isso vai funcionar 100%, mas não é a solução ideal (melhor usar variável de ambiente).

Me avise qual solução você quer tentar primeiro!
