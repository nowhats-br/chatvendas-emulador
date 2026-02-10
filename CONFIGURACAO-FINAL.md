# ✅ Configuração Final - ChatVendas + Android Cloud

## Status Atual

✅ Frontend: Já vai direto para tela de criar devices  
✅ Backend: Usando CloudAndroidManager  
✅ API: Rodando no Easypanel  
✅ Docker Compose: Configurado  

## O que falta fazer:

### 1. Expor a porta 3011 no Easypanel

A API está rodando, mas precisa ser acessível pela internet.

**No Easypanel:**
1. Vá no serviço `android-api`
2. Verifique se a porta 3011 está exposta
3. Ou configure um domínio para a API

### 2. Testar conexão

No navegador (no seu computador):
```
http://painel.nowhats.com.br:3011/health
```

**Deve retornar:**
```json
{
  "status": "ok",
  "timestamp": "...",
  "mode": "cloud"
}
```

### 3. Configurar o backend/.env

Já está configurado:
```env
CLOUD_ANDROID_API=http://painel.nowhats.com.br:3011
```

### 4. Reiniciar o ChatVendas

1. Feche completamente
2. Abra novamente
3. Vá em "Emulador Android"
4. Clique em "Novo Android"

## Fluxo Completo

```
┌─────────────────────────────────────────────────────────────┐
│  1. Usuário abre ChatVendas (Electron)                      │
│     └─> Backend inicia: localhost:3010                      │
│     └─> Frontend inicia: localhost:5173                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Usuário vai em "Emulador Android"                       │
│     └─> Tela mostra: "☁️ MODO NUVEM"                        │
│     └─> Botão: "Novo Android"                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Usuário clica em "Novo Android"                         │
│     └─> Modal abre                                           │
│     └─> Preenche: Nome + Perfil (Econômico/Médio/Alto)     │
│     └─> Clica em "Criar Dispositivo"                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Frontend envia request                                   │
│     POST http://localhost:3010/api/wsl2-android/instance/create │
│     Body: { name: "teste", profile: "med" }                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Backend (CloudAndroidManager) envia para API            │
│     POST http://painel.nowhats.com.br:3011/create           │
│     Body: { name: "teste", profile: "med" }                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  6. API no Easypanel cria container Docker                   │
│     docker run budtmo/docker-android:emulator_13.0           │
│     └─> Nome: android-emulator-teste                         │
│     └─> Portas: 6081 (VNC), 5556 (ADB)                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  7. Emulador inicia (2-5 minutos)                           │
│     └─> Boot do Android 13                                   │
│     └─> VNC fica disponível                                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  8. Frontend conecta no VNC                                  │
│     wss://painel.nowhats.com.br:6081/websockify             │
│     └─> Usuário vê a tela do Android no navegador!          │
└─────────────────────────────────────────────────────────────┘
```

## Arquivos Modificados

### Backend:
- ✅ `backend/src/server.js` - Carrega .env corretamente + log de config
- ✅ `backend/.env` - CLOUD_ANDROID_API configurado
- ✅ `backend/src/routes/wsl2Android.js` - Já usa CloudAndroidManager
- ✅ `backend/src/services/CloudAndroidManager.js` - Já implementado

### Frontend:
- ✅ `src/modules/AndroidEmulator/components/AndroidEmulatorManager.tsx` - Já vai direto para devices
- ✅ `src/modules/AndroidEmulator/hooks/useEmulator.ts` - Já usa rota correta

### Cloud:
- ✅ `android-cloud/api/server.js` - API funcionando
- ✅ `android-cloud/api/Dockerfile` - Build correto
- ✅ `android-cloud/docker-compose-easypanel.yml` - Configurado

## Próximos Passos

### Passo 1: Expor porta 3011 no Easypanel

**Opção A: Via Firewall do Servidor**
```bash
ssh root@seu-servidor
ufw allow 3011/tcp
ufw allow 6080:6090/tcp  # Portas VNC dos emuladores
```

**Opção B: Via Configuração do Easypanel**
- Verifique se as portas estão expostas no serviço

### Passo 2: Testar

```bash
# No seu computador Windows
curl http://painel.nowhats.com.br:3011/health
```

### Passo 3: Usar!

1. Abra o ChatVendas
2. Vá em "Emulador Android"
3. Crie quantos devices quiser!

## Troubleshooting

### Erro: "Cannot connect to API"

**Causa:** Porta 3011 não está acessível

**Solução:**
1. Teste no navegador: `http://painel.nowhats.com.br:3011/health`
2. Se não funcionar, abra a porta no firewall
3. Ou configure um domínio com proxy reverso

### Erro: "Cannot connect to Docker daemon"

**Causa:** API não tem acesso ao Docker socket

**Solução:**
- Verifique se o volume está montado no docker-compose:
  ```yaml
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock:ro
  ```

### Emulador não aparece no frame

**Causa:** VNC não está acessível

**Solução:**
1. Aguarde 2-5 minutos (emulador demora para inicializar)
2. Verifique se a porta 6080+ está aberta no firewall
3. Veja os logs no Easypanel

## Recursos do Servidor

### Para 5-7 emuladores:
- 4 vCPU
- 8GB RAM
- 40GB Disco
- Custo: €13-20/mês

### Cada emulador usa:
- 2-4GB RAM
- 2-4 vCPUs
- 16GB Disco

## Conclusão

Tudo está pronto! Só falta:
1. ✅ Expor porta 3011 no servidor
2. ✅ Testar conexão
3. ✅ Reiniciar ChatVendas
4. ✅ Criar devices!

🚀 Pronto para usar!
