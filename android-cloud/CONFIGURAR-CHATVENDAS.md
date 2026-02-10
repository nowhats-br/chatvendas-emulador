# 🔧 Como Configurar o ChatVendas para Usar a API na Nuvem

## Arquitetura

```
┌─────────────────────────┐         Internet        ┌──────────────────────┐
│  Computador do Usuário  │  ◄──────────────────►  │  Servidor Easypanel  │
│                         │                         │                      │
│  ┌─────────────────┐   │                         │  ┌────────────────┐ │
│  │  ChatVendas     │   │    HTTP Request         │  │  android-api   │ │
│  │  (Electron)     │───┼────────────────────────►│  │  (porta 3011)  │ │
│  │  localhost:3010 │   │                         │  └────────────────┘ │
│  └─────────────────┘   │                         │          │          │
│                         │                         │          ▼          │
│  ┌─────────────────┐   │                         │  ┌────────────────┐ │
│  │  Navegador      │   │    WebSocket (VNC)      │  │  android-1     │ │
│  │  localhost:5173 │◄──┼─────────────────────────┤  │  (porta 6080)  │ │
│  └─────────────────┘   │                         │  └────────────────┘ │
└─────────────────────────┘                         └──────────────────────┘
```

## Passo a Passo

### 1. Descobrir o IP/Domínio do Servidor Easypanel

Você precisa saber o endereço público do servidor onde está rodando a API.

**Opções:**

**A) Se tem domínio configurado:**
```
https://seudominio.com:3011
```

**B) Se tem apenas IP público:**
```
http://192.168.1.100:3011  (exemplo)
```

**C) Para descobrir o IP no Easypanel:**
- Vá nas configurações do servidor
- Procure por "IP Address" ou "Public IP"

### 2. Testar se a API está Acessível

No seu computador, abra o navegador e acesse:
```
http://SEU_IP_OU_DOMINIO:3011/health
```

**Deve retornar:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-10T...",
  "mode": "cloud"
}
```

**Se não funcionar:**
- ❌ Firewall do servidor está bloqueando a porta 3011
- ❌ Easypanel não expôs a porta publicamente
- ❌ API não está rodando

### 3. Configurar o Backend do ChatVendas

No seu computador, edite o arquivo:
```
backend/.env
```

Altere a linha:
```env
CLOUD_ANDROID_API=http://SEU_IP_OU_DOMINIO:3011
```

**Exemplos:**
```env
# Com domínio
CLOUD_ANDROID_API=https://android.meuservidor.com:3011

# Com IP
CLOUD_ANDROID_API=http://45.123.456.789:3011

# Localhost (apenas para testes locais)
CLOUD_ANDROID_API=http://localhost:3011
```

### 4. Reiniciar o ChatVendas

1. Feche o ChatVendas completamente
2. Abra novamente
3. Aguarde o backend inicializar

### 5. Verificar Conexão

No ChatVendas:
1. Vá em **"Emulador Android"**
2. Deve aparecer: **"Sistema: Cloud (Nuvem)"**
3. Clique em **"Criar Nova Instância"**

**Se funcionar:**
✅ Vai aparecer um formulário para criar o emulador

**Se não funcionar:**
❌ Vai aparecer erro de conexão

## Configurar Firewall no Servidor

Se a API não está acessível pela internet, você precisa abrir as portas:

### No servidor (via SSH):

```bash
# Conectar
ssh root@seu-servidor

# Abrir porta da API
ufw allow 3011/tcp

# Abrir portas dos emuladores (VNC)
ufw allow 6080:6090/tcp

# Verificar
ufw status
```

### No Easypanel:

Verifique se as portas estão expostas no docker-compose:

```yaml
services:
  android-api:
    ports:
      - "3011:3011"  # ✅ Deve estar assim
```

## Testar Criação de Emulador

### Via ChatVendas (Interface):

1. Abra o ChatVendas
2. Vá em "Emulador Android"
3. Clique em "Criar Nova Instância"
4. Preencha:
   - Nome: `teste1`
   - Perfil: `Médio (4GB RAM)`
5. Clique em "Criar"
6. Aguarde 2-5 minutos
7. O emulador deve aparecer no frame!

### Via Linha de Comando (Teste):

No seu computador:

```bash
# Windows (PowerShell)
curl http://SEU_IP:3011/instances

# Criar instância
curl -X POST http://SEU_IP:3011/create `
  -H "Content-Type: application/json" `
  -d '{"name":"teste1","profile":"med"}'
```

## Fluxo Completo

```
1. Usuário abre ChatVendas no computador
   └─> Backend inicia em localhost:3010

2. Usuário vai em "Emulador Android"
   └─> Frontend carrega em localhost:5173

3. Usuário clica em "Criar Nova Instância"
   └─> Frontend envia request para backend (localhost:3010)
       └─> Backend envia request para API na nuvem (SEU_IP:3011)
           └─> API cria container Docker no servidor
               └─> Container inicia emulador Android
                   └─> Emulador fica disponível via VNC (porta 6081+)

4. Frontend conecta no VNC via WebSocket
   └─> wss://SEU_IP:6081/websockify
       └─> Usuário vê a tela do Android no navegador!
```

## Quantos Emuladores Posso Criar?

Depende dos recursos do servidor:

### Servidor Pequeno (2 vCPU, 4GB RAM):
- **2-3 emuladores** simultâneos

### Servidor Médio (4 vCPU, 8GB RAM):
- **5-7 emuladores** simultâneos

### Servidor Grande (8 vCPU, 16GB RAM):
- **15+ emuladores** simultâneos

## Troubleshooting

### Erro: "Cannot connect to API"

**Causa:** Backend não consegue acessar a API na nuvem

**Solução:**
1. Verifique se `CLOUD_ANDROID_API` está correto no `.env`
2. Teste no navegador: `http://SEU_IP:3011/health`
3. Verifique firewall do servidor

### Erro: "Port already in use"

**Causa:** Muitos emuladores criados, portas esgotadas

**Solução:**
1. Delete emuladores antigos
2. Ou configure mais portas no servidor

### Emulador não aparece no frame

**Causa:** VNC não está acessível

**Solução:**
1. Verifique se a porta 6080+ está aberta no firewall
2. Aguarde 2-5 minutos (emulador demora para inicializar)
3. Veja os logs no Easypanel

## Resumo

✅ API na nuvem (Easypanel) - cria e gerencia emuladores  
✅ ChatVendas no computador - interface para o usuário  
✅ Conexão via internet - backend → API  
✅ VNC via WebSocket - navegador → emulador  

**Configuração necessária:**
```env
CLOUD_ANDROID_API=http://SEU_IP_OU_DOMINIO:3011
```

Pronto! Agora você pode criar quantos emuladores quiser direto do ChatVendas! 🚀
