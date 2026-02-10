# 🧪 Teste Rápido - Verificar se .env está sendo lido

## Passo 1: Parar tudo

Feche o ChatVendas se estiver rodando.

## Passo 2: Testar backend isoladamente

No terminal, na pasta `backend`:

```cmd
node src/server.js
```

**Deve aparecer:**
```
🔧 Configuração Android Cloud:
   CLOUD_ANDROID_API: http://167.86.72.198:3011
   Modo: NUVEM

🔧 CloudAndroidManager inicializado
   URL da API: http://167.86.72.198:3011
```

Se aparecer "NÃO CONFIGURADO", o `.env` não está sendo lido.

## Passo 3: Se não funcionar

O problema pode ser o caminho do `.env`. Vamos forçar o carregamento.

Edite `backend/src/server.js` e adicione ANTES do `dotenv.config()`:

```javascript
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Forçar carregamento do .env
const envPath = path.join(__dirname, '..', '.env');
console.log('📁 Tentando carregar .env de:', envPath);

import dotenv from 'dotenv';
dotenv.config({ path: envPath });

console.log('✅ Variáveis carregadas:');
console.log('   CLOUD_ANDROID_API:', process.env.CLOUD_ANDROID_API);
```

## Passo 4: Testar novamente

```cmd
node src/server.js
```

Agora deve mostrar o caminho do `.env` e se foi carregado.

## Passo 5: Se ainda não funcionar

Crie um arquivo `backend/.env.local` (alguns sistemas preferem esse nome):

```env
CLOUD_ANDROID_API=http://167.86.72.198:3011
```

E modifique o `dotenv.config()` para tentar ambos:

```javascript
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });
```

## Resultado Esperado

Quando funcionar, ao rodar `npm run electron:dev`, você deve ver:

```
[Backend] 🔧 Configuração Android Cloud:
[Backend]    CLOUD_ANDROID_API: http://167.86.72.198:3011
[Backend]    Modo: NUVEM
[Backend] 🔧 CloudAndroidManager inicializado
[Backend]    URL da API: http://167.86.72.198:3011
[Backend] ✅ Servidor rodando na porta 3010
```

E ao abrir "Emulador Android" no ChatVendas, deve conectar na API!
