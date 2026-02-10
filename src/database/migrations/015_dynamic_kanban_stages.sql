-- Migration 015: Dynamic Kanban Stages
PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;

-- 1. Create kanban_stages table
CREATE TABLE IF NOT EXISTS kanban_stages (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  color TEXT DEFAULT 'border-blue-500',
  sort_order INTEGER DEFAULT 0,
  is_system BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Seed initial stages if not already present
-- Using INSERT OR IGNORE just in case
INSERT OR IGNORE INTO kanban_stages (id, label, color, sort_order, is_system) VALUES 
('lead', 'Novos Leads', 'border-blue-500', 0, 1),
('contacted', 'Em Contato', 'border-yellow-500', 1, 1),
('negotiation', 'Negociação', 'border-orange-500', 2, 1),
('proposal', 'Proposta Enviada', 'border-purple-500', 3, 1),
('closed', 'Fechado', 'border-emerald-500', 4, 1);

-- 3. Create new contacts table without CHECK constraint on stage
CREATE TABLE IF NOT EXISTS contacts_v3 (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  document TEXT,
  birth_date DATE,
  gender TEXT,
  
  -- Endereço
  address_street TEXT,
  address_number TEXT,
  address_complement TEXT,
  address_neighborhood TEXT,
  address_city TEXT,
  address_state TEXT,
  address_zipcode TEXT,
  
  -- Informações comerciais
  customer_since DATE,
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  average_ticket DECIMAL(10,2) DEFAULT 0,
  last_order_date DATE,
  
  -- Kanban/CRM (CHECK constraint removed)
  stage TEXT DEFAULT 'lead',
  source TEXT,
  tags TEXT,
  notes TEXT,
  
  -- WhatsApp
  whatsapp_id TEXT,
  profile_picture TEXT,
  is_blocked BOOLEAN DEFAULT FALSE,
  
  -- Metadados
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT,
  updated_by TEXT
);

-- 4. Copy data from contacts to contacts_v3
INSERT INTO contacts_v3 SELECT * FROM contacts;

-- 5. Swap tables
DROP TABLE contacts;
ALTER TABLE contacts_v3 RENAME TO contacts;

-- 6. Re-create indexes
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(phone);
CREATE INDEX IF NOT EXISTS idx_contacts_whatsapp_id ON contacts(whatsapp_id);
CREATE INDEX IF NOT EXISTS idx_contacts_stage ON contacts(stage);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at);

-- 7. Re-create trigger
CREATE TRIGGER IF NOT EXISTS update_contacts_updated_at 
  AFTER UPDATE ON contacts
  FOR EACH ROW
BEGIN
  UPDATE contacts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

COMMIT;
PRAGMA foreign_keys=ON;
