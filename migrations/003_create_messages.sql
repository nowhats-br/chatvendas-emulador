-- Tabela de tickets/conversas
CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  contact_id TEXT NOT NULL,
  instance_id TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'pending', 'closed')),
  subject TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  assigned_to TEXT, -- usuário responsável
  department TEXT,
  tags TEXT, -- JSON array
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  closed_at DATETIME,
  
  FOREIGN KEY (contact_id) REFERENCES contacts(id),
  FOREIGN KEY (instance_id) REFERENCES instances(id)
);

-- Tabela de mensagens
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  instance_id TEXT NOT NULL,
  
  -- Conteúdo da mensagem
  type TEXT NOT NULL CHECK (type IN ('text', 'image', 'video', 'audio', 'document', 'sticker', 'location', 'contact', 'buttons', 'list', 'template')),
  content TEXT, -- texto ou JSON para mensagens complexas
  media_url TEXT,
  media_filename TEXT,
  media_mimetype TEXT,
  media_size INTEGER,
  
  -- Metadados WhatsApp
  wa_message_id TEXT UNIQUE,
  wa_remote_jid TEXT,
  from_me BOOLEAN DEFAULT FALSE,
  quoted_message_id TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  error_message TEXT,
  
  -- Timestamps
  timestamp DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (ticket_id) REFERENCES tickets(id),
  FOREIGN KEY (contact_id) REFERENCES contacts(id),
  FOREIGN KEY (instance_id) REFERENCES instances(id),
  FOREIGN KEY (quoted_message_id) REFERENCES messages(id)
);

-- Triggers
CREATE TRIGGER IF NOT EXISTS update_tickets_updated_at 
  AFTER UPDATE ON tickets
  FOR EACH ROW
BEGIN
  UPDATE tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;