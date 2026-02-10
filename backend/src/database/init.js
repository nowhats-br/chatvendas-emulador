import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs/promises';

let db = null;

export async function initDatabase() {
  const dbDir = path.join(process.cwd(), 'data');
  await fs.mkdir(dbDir, { recursive: true });

  const dbPath = path.join(dbDir, 'chatvendas.db');

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Ativar foreign keys
  await db.run('PRAGMA foreign_keys = ON');

  // Criar tabelas
  await db.exec(`
    CREATE TABLE IF NOT EXISTS instances (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone_number TEXT,
      profile_name TEXT,
      profile_picture TEXT,
      status TEXT DEFAULT 'disconnected',
      provider TEXT DEFAULT 'baileys',
      qr_code TEXT,
      qr_expires_at TEXT,
      webhook_url TEXT,
      settings TEXT,
      last_seen TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT UNIQUE,
      whatsapp_id TEXT UNIQUE,
      email TEXT,
      profile_picture TEXT,
      stage TEXT DEFAULT 'lead',
      total_spent REAL DEFAULT 0,
      tags TEXT,
      notes TEXT,
      last_seen TEXT,
      customer_since TEXT DEFAULT CURRENT_TIMESTAMP,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      contact_id TEXT NOT NULL,
      instance_id TEXT NOT NULL,
      status TEXT DEFAULT 'open',
      subject TEXT,
      priority TEXT DEFAULT 'normal',
      department TEXT,
      assigned_to TEXT,
      tags TEXT,
      last_message TEXT,
      last_message_time TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      closed_at TEXT,
      FOREIGN KEY (contact_id) REFERENCES contacts(id),
      FOREIGN KEY (instance_id) REFERENCES instances(id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      ticket_id TEXT NOT NULL,
      contact_id TEXT NOT NULL,
      instance_id TEXT NOT NULL,
      type TEXT DEFAULT 'text',
      content TEXT,
      media_url TEXT,
      media_filename TEXT,
      media_mimetype TEXT,
      media_size INTEGER,
      wa_message_id TEXT,
      wa_remote_jid TEXT,
      from_me INTEGER DEFAULT 0,
      quoted_message_id TEXT,
      status TEXT DEFAULT 'pending',
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      error_message TEXT,
      FOREIGN KEY (ticket_id) REFERENCES tickets(id),
      FOREIGN KEY (contact_id) REFERENCES contacts(id),
      FOREIGN KEY (instance_id) REFERENCES instances(id)
    );

    CREATE TABLE IF NOT EXISTS campaigns (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      message_type TEXT NOT NULL,
      message_content TEXT NOT NULL,
      status TEXT DEFAULT 'draft',
      instances TEXT,
      target_criteria TEXT,
      contact_list TEXT,
      media_url TEXT,
      media_files TEXT,
      target_type TEXT,
      delay_between_messages INTEGER,
      min_delay INTEGER,
      max_delay INTEGER,
      delay_between_instances INTEGER,
      max_messages_per_instance INTEGER,
      total_contacts INTEGER DEFAULT 0,
      messages_sent INTEGER DEFAULT 0,
      messages_delivered INTEGER DEFAULT 0,
      messages_read INTEGER DEFAULT 0,
      messages_failed INTEGER DEFAULT 0,
      scheduled_at TEXT,
      started_at TEXT,
      completed_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS campaign_interactions (
      id TEXT PRIMARY KEY,
      campaign_id TEXT NOT NULL,
      contact_id TEXT NOT NULL,
      interaction_type TEXT NOT NULL,
      button_text TEXT,
      list_option_text TEXT,
      keyword TEXT,
      response_text TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
      FOREIGN KEY (contact_id) REFERENCES contacts(id)
    );

    CREATE TABLE IF NOT EXISTS campaign_sends (
      id TEXT PRIMARY KEY,
      campaign_id TEXT NOT NULL,
      contact_id TEXT NOT NULL,
      instance_id TEXT,
      status TEXT DEFAULT 'pending',
      error TEXT,
      sent_at TEXT,
      delivered_at TEXT,
      read_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
      FOREIGN KEY (contact_id) REFERENCES contacts(id)
    );

    CREATE TABLE IF NOT EXISTS message_templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      category TEXT,
      content TEXT NOT NULL,
      variables TEXT,
      usage_count INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS quick_replies (
      id TEXT PRIMARY KEY,
      shortcut TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      usage_count INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL DEFAULT 0,
      image_url TEXT,
      category TEXT,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      ticket_id TEXT,
      contact_id TEXT NOT NULL,
      instance_id TEXT,
      total_amount REAL DEFAULT 0,
      status TEXT DEFAULT 'pending',
      payment_method TEXT,
      items TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ticket_id) REFERENCES tickets(id),
      FOREIGN KEY (contact_id) REFERENCES contacts(id)
    );

    CREATE TABLE IF NOT EXISTS kanban_stages (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      color TEXT,
      sort_order INTEGER DEFAULT 0,
      is_system INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'completed',
      transaction_date TEXT DEFAULT CURRENT_TIMESTAMP,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS drivers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      vehicle_type TEXT,
      vehicle_plate TEXT,
      status TEXT DEFAULT 'inactive',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Inserir estágios padrão se a tabela estiver vazia
  const stagesCount = await db.get('SELECT COUNT(*) as count FROM kanban_stages');
  if (stagesCount.count === 0) {
    const defaultStages = [
      { id: 'lead', label: 'Lead', color: 'border-blue-500', sort_order: 0, is_system: 1 },
      { id: 'negotiation', label: 'Negociação', color: 'border-yellow-500', sort_order: 1, is_system: 1 },
      { id: 'closed', label: 'Fechado', color: 'border-green-500', sort_order: 2, is_system: 1 },
      { id: 'lost', label: 'Perdido', color: 'border-red-500', sort_order: 3, is_system: 1 }
    ];

    for (const stage of defaultStages) {
      await db.run(`
        INSERT INTO kanban_stages (id, label, color, sort_order, is_system)
        VALUES (?, ?, ?, ?, ?)
      `, [stage.id, stage.label, stage.color, stage.sort_order, stage.is_system]);
    }
  }

  // Migrações simples
  try {
    await db.run('ALTER TABLE contacts ADD COLUMN last_seen TEXT');
    console.log('✅ Coluna last_seen adicionada à tabela contacts');
  } catch (e) {
    // Ignorar se a coluna já existir
  }

  try {
    await db.run('ALTER TABLE instances ADD COLUMN fingerprint TEXT');
    console.log('✅ Coluna fingerprint adicionada à tabela instances');
  } catch (e) {
    // Ignorar se a coluna já existir
  }

  console.log('✅ Banco de dados inicializado');
  return db;
}

export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export async function closeDatabase() {
  if (db) {
    await db.close();
    db = null;
  }
}