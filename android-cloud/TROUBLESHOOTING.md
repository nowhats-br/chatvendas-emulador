# 🔧 Troubleshooting - Android Cloud no Easypanel

## Status Preto = Container com Erro

Se o status está preto no Easypanel, o container não está rodando.

## Diagnóstico Rápido

### 1. Ver Logs no Easypanel

No painel do Easypanel:
- Clique no serviço `android-api` ou `android-1`
- Vá em "Logs"
- Procure por erros em vermelho

### 2. Erros Comuns

#### Erro: "Cannot find module"
```
Solução: Falta o package.json ou node_modules
- Use o docker-compose-easypanel-fixed.yml
- Ele usa Dockerfile para build correto
```

#### Erro: "ENOENT: no such file or directory './api'"
```
Solução: Volume ./api não existe
- Use docker-compose-easypanel-fixed.yml
- Remove a linha: - ./api:/app
```

#### Erro: "Cannot connect to Docker daemon"
```
Solução: Docker socket não acessível
- Verifique se /var/run/docker.sock existe
- Pode precisar de permissões especiais no Easypanel
```

#### Erro: "Port 3011 already in use"
```
Solução: Porta já está sendo usada
- Mude para outra porta no docker-compose
- Ou pare o serviço que está usando a porta
```

## Como Corrigir

### Opção 1: Usar Arquivo Corrigido (RECOMENDADO)

1. No Easypanel, vá no serviço
2. Clique em "Edit"
3. Substitua o conteúdo pelo arquivo: `docker-compose-easypanel-fixed.yml`
4. Clique em "Save" e "Deploy"

### Opção 2: Deploy Manual via SSH

```bash
# 1. Conectar no servidor
ssh root@seu-servidor.com

# 2. Ir para o diretório
cd /opt/android-cloud

# 3. Parar tudo
docker-compose down

# 4. Usar arquivo corrigido
cp docker-compose-easypanel-fixed.yml docker-compose.yml

# 5. Build e iniciar
docker-compose build
docker-compose up -d

# 6. Ver logs
docker-compose logs -f android-api
```

## Verificar se Está Funcionando

### 1. Status dos Containers
```bash
docker-compose ps
```

Deve mostrar:
```
NAME          STATUS
android-api   Up (healthy)
android-1     Up (healthy)
```

### 2. Testar API
```bash
curl http://localhost:3011/health
```

Deve retornar:
```json
{
  "status": "ok",
  "timestamp": "2026-02-10T...",
  "mode": "cloud"
}
```

### 3. Testar Criação de Instância
```bash
curl -X POST http://localhost:3011/create \
  -H "Content-Type: application/json" \
  -d '{"name":"test1","profile":"med"}'
```

## Problemas Específicos do Easypanel

### Docker Socket Bloqueado

Easypanel pode bloquear acesso ao Docker socket por segurança.

**Solução:**
- Use o modo "Privileged" no serviço
- Ou configure permissões especiais
- Ou use API externa (outro servidor)

### Build Falha

Se o build da imagem falhar:

1. Verifique se todos os arquivos estão no servidor:
   - `api/Dockerfile`
   - `api/package.json`
   - `api/server.js`

2. Tente build manual:
```bash
cd android-cloud/api
docker build -t android-api .
```

### Healthcheck Sempre Unhealthy

Se o healthcheck nunca fica verde:

1. Aumente o `start_period`:
```yaml
healthcheck:
  start_period: 120s  # Aumentar para 2 minutos
```

2. Ou remova o healthcheck temporariamente:
```yaml
# healthcheck:
#   test: ["CMD", "wget", ...]
```

## Alternativa: Sem Docker-in-Docker

Se o Easypanel não permite acesso ao Docker socket, você tem 2 opções:

### Opção A: API em Servidor Separado

1. Deploy a API em outro servidor (VPS normal)
2. Configure `CLOUD_ANDROID_API` no backend para apontar para esse servidor

### Opção B: Usar Apenas Emuladores Fixos

Remova a API e use apenas emuladores fixos:

```yaml
services:
  android-1:
    # ... configuração do emulador
  
  android-2:
    # ... outro emulador
  
  android-3:
    # ... mais um emulador
```

Desvantagem: Não pode criar/deletar dinamicamente.

## Contato

Se nada funcionar, compartilhe:
1. Logs completos do container
2. Versão do Easypanel
3. Tipo de servidor (VPS, cloud, etc)
