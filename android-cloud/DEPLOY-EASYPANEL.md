# 🚀 Deploy Completo no Easypanel

## Situação Atual

✅ API Android está funcionando  
❌ Backend não consegue conectar (usa localhost ao invés do nome do serviço)

## Solução: Deploy Completo

### Opção 1: Tudo em Um Projeto (RECOMENDADO)

Use o arquivo `docker-compose-completo.yml` que inclui:
- Backend ChatVendas (porta 3010)
- API Android (porta 3011)
- Emulador Android-1 (portas 5900, 6080, 5555)

#### Passos:

1. **No Easypanel, edite o serviço atual**
2. **Substitua o docker-compose pelo conteúdo de `docker-compose-completo.yml`**
3. **Configure as variáveis de ambiente:**
   ```
   DOMAIN=seu-dominio.com
   JWT_SECRET=seu_secret_super_seguro_aqui
   ```
4. **Clique em "Deploy"**
5. **Aguarde 3-5 minutos**

#### Resultado:

```
✅ backend          - http://seu-servidor:3010
✅ android-api      - http://seu-servidor:3011
✅ android-1        - http://seu-servidor:6080 (VNC)
```

### Opção 2: Projetos Separados

Se o backend já está em outro projeto no Easypanel:

#### No projeto do Backend:

Adicione a variável de ambiente:
```
CLOUD_ANDROID_API=http://android-api:3011
```

**MAS ATENÇÃO:** Isso só funciona se ambos os projetos estiverem na **mesma rede Docker**.

#### Criar rede compartilhada:

```bash
# SSH no servidor
ssh root@seu-servidor

# Criar rede
docker network create shared-network

# Conectar os containers
docker network connect shared-network nome-container-backend
docker network connect shared-network android_android-cloud-android-api-1
```

### Opção 3: URL Pública

Se os projetos estão em servidores diferentes:

#### No backend (.env):
```
CLOUD_ANDROID_API=https://android-api.seudominio.com
```

#### No Easypanel (projeto da API):
- Configure um domínio público para o serviço `android-api`
- Habilite HTTPS
- Use essa URL no backend

## Verificar se Funcionou

### 1. Testar API diretamente
```bash
curl http://seu-servidor:3011/health
```

Deve retornar:
```json
{"status":"ok","timestamp":"...","mode":"cloud"}
```

### 2. Testar Backend
```bash
curl http://seu-servidor:3010/api/android-emulator/system/status
```

Deve retornar informações do sistema Android.

### 3. Testar Criação de Instância

No ChatVendas (interface web):
1. Vá em "Emulador Android"
2. Clique em "Criar Nova Instância"
3. Escolha um nome e perfil
4. Clique em "Criar"

Deve aparecer o emulador no frame!

## Troubleshooting

### Backend ainda não conecta

**Verifique os logs do backend:**
```bash
docker logs nome-container-backend
```

Procure por:
```
❌ Erro ao conectar na API: ECONNREFUSED
```

**Solução:** Verifique se `CLOUD_ANDROID_API` está correto.

### API não cria containers

**Erro comum:**
```
Cannot connect to Docker daemon
```

**Solução:** 
- Verifique se o volume do Docker socket está montado:
  ```yaml
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock:ro
  ```
- Pode precisar de modo privileged no Easypanel

### Emulador não inicia

**Verifique recursos do servidor:**
```bash
# Memória disponível
free -h

# CPU
top
```

Cada emulador precisa:
- 2-4 GB RAM
- 2-4 vCPUs

## Estrutura Final

```
Easypanel (Projeto: android-cloud)
├── backend (porta 3010)
│   └── Conecta em: http://android-api:3011
├── android-api (porta 3011)
│   └── Gerencia containers Docker
└── android-1 (portas 5900, 6080, 5555)
    └── Emulador fixo

Containers Dinâmicos (criados pela API):
├── android-emulator-instance1 (portas 5901, 6081, 5556)
├── android-emulator-instance2 (portas 5902, 6082, 5557)
└── android-emulator-instance3 (portas 5903, 6083, 5558)
```

## Próximos Passos

1. ✅ Deploy completo no Easypanel
2. ✅ Testar criação de instância
3. ✅ Configurar domínios (opcional)
4. ✅ Configurar SSL/HTTPS (opcional)
5. ✅ Monitorar recursos do servidor

## Custos Estimados

Para 5-7 emuladores simultâneos:
- **Servidor:** 4 vCPU, 8GB RAM, 40GB Disco
- **Custo:** €13-20/mês (Hetzner CPX31)

## Suporte

Se tiver problemas:
1. Compartilhe os logs completos
2. Informe a configuração do servidor
3. Descreva o erro exato
