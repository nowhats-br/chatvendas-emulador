import { initDatabase, closeDatabase } from './init.js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

async function migrate() {
  try {
    console.log('🚀 Iniciando migrações do banco de dados...');
    
    await initDatabase();
    
    console.log('✅ Migrações executadas com sucesso!');
    console.log('📊 Banco de dados pronto para uso.');
    
  } catch (error) {
    console.error('❌ Erro durante as migrações:', error);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
}

// Executar migrações
migrate();