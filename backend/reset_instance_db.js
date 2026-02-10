import { initDatabase, getDatabase } from './src/database/init.js';

await initDatabase();
const db = getDatabase();

const instanceId = 'c0c39a4d-0829-433c-aacc-f4ec95d0bc73';

console.log(`Resetando status da instância ${instanceId}...`);

await db.run(`
  UPDATE instances 
  SET status = 'disconnected', qr_code = NULL, qr_expires_at = NULL 
  WHERE id = ?
`, [instanceId]);

console.log('✅ Status resetado para desconectado.');
await db.close();
