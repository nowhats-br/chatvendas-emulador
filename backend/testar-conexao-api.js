import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar .env
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('========================================');
console.log('  Teste de Conexão com API Cloud');
console.log('========================================');
console.log('');

// Mostrar variáveis
console.log('📁 Arquivo .env:', path.join(__dirname, '.env'));
console.log('');
console.log('🔧 Variáveis carregadas:');
console.log('   PORT:', process.env.PORT);
console.log('   CLOUD_ANDROID_API:', process.env.CLOUD_ANDROID_API);
console.log('');

if (!process.env.CLOUD_ANDROID_API) {
  console.log('❌ CLOUD_ANDROID_API não está definido!');
  process.exit(1);
}

const apiUrl = process.env.CLOUD_ANDROID_API;

console.log(`🧪 Testando: ${apiUrl}/health`);
console.log('');

// Testar conexão
fetch(`${apiUrl}/health`, { timeout: 10000 })
  .then(res => {
    console.log(`📡 Status HTTP: ${res.status} ${res.statusText}`);
    return res.json();
  })
  .then(data => {
    console.log('✅ Resposta da API:');
    console.log(JSON.stringify(data, null, 2));
    console.log('');
    console.log('🎉 Conexão OK! Backend deve funcionar!');
  })
  .catch(error => {
    console.log('❌ Erro ao conectar:');
    console.log('   Tipo:', error.name);
    console.log('   Mensagem:', error.message);
    console.log('');
    console.log('Possíveis causas:');
    console.log('  1. Firewall bloqueando porta 3011');
    console.log('  2. API não está rodando');
    console.log('  3. URL incorreta no .env');
    console.log('');
    console.log('Teste manual no navegador:');
    console.log(`  ${apiUrl}/health`);
  });
