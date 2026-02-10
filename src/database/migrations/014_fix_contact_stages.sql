-- Migration 014: Fix contact stages check constraint
PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;

-- 1. Create new table with updated constraints including all stages used by Kanban
CREATE TABLE contacts_new (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  document TEXT,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('M', 'F', 'Other')),
  
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
  
  -- Kanban/CRM (Fixed: added contacted, negotiation, proposal, closed)
  stage TEXT DEFAULT 'lead' CHECK (stage IN ('lead', 'contacted', 'negotiation', 'proposal', 'closed', 'prospect', 'customer', 'inactive')),
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

-- 2. Copy data from old table
-- We use explicit column names to be safer, but SELECT * is usually fine in these migrations
INSERT INTO contacts_new SELECT * FROM contacts;

-- 3. Drop old table
DROP TABLE contacts;

-- 4. Rename new table to contacts
ALTER TABLE contacts_new RENAME TO contacts;

-- 5. Re-create indexes
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(phone);
CREATE INDEX IF NOT EXISTS idx_contacts_whatsapp_id ON contacts(whatsapp_id);
CREATE INDEX IF NOT EXISTS idx_contacts_stage ON contacts(stage);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at);

-- 6. Re-create trigger
CREATE TRIGGER IF NOT EXISTS update_contacts_updated_at 
  AFTER UPDATE ON contacts
  FOR EACH ROW
BEGIN
  UPDATE contacts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

COMMIT;
PRAGMA foreign_keys=ON;
