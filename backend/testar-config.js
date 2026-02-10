import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar .env
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('========================================');
console.log('  Teste de Configuração');
console.log('========================================');
console.log('');
console.log('📁 Arquivo .env:', path.join(__dirname, '.env'));
console.log('');
console.log('🔧 Variáveis carregadas:');
console.log('   PORT:', process.env.PORT);
console.log('   NODE_ENV:', process.env.NODE_ENV);
console.log('   CLOUD_ANDROID_API:', process.env.CLOUD_ANDROID_API);
console.log('');

if (!process.env.CLOUD_ANDROID_API) {
  console.log('❌ CLOUD_ANDROID_API não está configurado!');
  console.log('   Edite o arquivo backend/.env');
} else if (process.env.CLOUD_ANDROID_API.includes('SEU_SERVIDOR')) {
  console.log('⚠️  CLOUD_ANDROID_API ainda tem placeholder!');
  console.log('   Substitua SEU_SERVIDOR pelo IP/domínio real');
} else {
  console.log('✅ CLOUD_ANDROID_API configurado corretamente!');
  console.log('');
  console.log('🧪 Testando conexão...');
  
  // Testar conexão
  import('node-fetch').then(({ default: fetch }) => {
    fetch(`${process.env.CLOUD_ANDROID_API}/health`, { timeout: 5000 })
      .then(res => res.json())
      .then(data => {
        console.log('✅ API respondeu:', JSON.stringify(data, null, 2));
        console.log('');
        console.log('🎉 Tudo funcionando! Pode iniciar o ChatVendas!');
      })
      .catch(error => {
        console.log('❌ Erro ao conectar na API:', error.message);
        console.log('');
        console.log('Possíveis causas:');
        console.log('  1. Porta 3011 não está exposta no Easypanel');
        console.log('  2. Firewall bloqueando');
        console.log('  3. URL incorreta');
        console.log('');
        console.log('Teste no navegador:');
        console.log(`  ${process.env.CLOUD_ANDROID_API}/health`);
      });
  });
}

console.log('========================================');
