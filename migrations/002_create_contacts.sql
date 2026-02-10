-- Tabela de contatos
CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  document TEXT, -- CPF/CNPJ
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
  
  -- Kanban/CRM
  stage TEXT DEFAULT 'lead' CHECK (stage IN ('lead', 'prospect', 'customer', 'inactive')),
  source TEXT, -- origem do contato
  tags TEXT, -- JSON array de tags
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

-- Trigger para atualizar updated_at
CREATE TRIGGER IF NOT EXISTS update_contacts_updated_at 
  AFTER UPDATE ON contacts
  FOR EACH ROW
BEGIN
  UPDATE contacts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;