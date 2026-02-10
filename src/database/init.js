import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db = null;

export async function initDatabase() {
    const dbPath = path.join(process.cwd(), 'data', 'chatvendas.db');
    
    // Garantir que a pasta data existe
    if (!fs.existsSync(path.dirname(dbPath))) {
        fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    }

    db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    console.log('📦 Banco de Dados conectado em: ' + dbPath);

    // Executar migrações se as tabelas não existirem
    const tables = await db.all(\
SELECT
name
FROM
sqlite_master
WHERE
type=table\);
    if (tables.length === 0) {
        console.log('🚀 Iniciando banco de dados do zero...');
        const migrationsDir = path.join(__dirname, 'migrations');
        if (fs.existsSync(migrationsDir)) {
            const files = fs.readdirSync(migrationsDir).sort();
            for (const file of files) {
                if (file.endsWith('.sql')) {
                    console.log('📝 Aplicando migração: ' + file);
                    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
                    await db.exec(sql);
                }
            }
        }
    }

    return db;
}

export function getDatabase() {
    if (!db) throw new Error('Banco de dados não inicializado!');
    return db;
}

export async function closeDatabase() {
    if (db) {
        await db.close();
        db = null;
    }
}
