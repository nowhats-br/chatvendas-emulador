-- Adicionar suporte para tipo de mensagem poll em campanhas e mensagens
-- Atualizar constraints para incluir 'poll'

PRAGMA foreign_keys = OFF;

-- 1. Atualizar tabela campaigns
DROP TABLE IF EXISTS campaigns_new;

CREATE TABLE campaigns_new (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Configurações da campanha (adicionado 'poll')
  message_type TEXT NOT NULL CHECK (message_type IN ('text', 'image', 'video', 'audio', 'document', 'template', 'buttons', 'list', 'carousel', 'poll')),
  message_content TEXT NOT NULL,
  media_url TEXT,
  media_files TEXT,
  
  -- Segmentação
  target_type TEXT DEFAULT 'all' CHECK (target_type IN ('all', 'segment', 'list')),
  target_criteria TEXT,
  contact_list TEXT,
  
  -- Configurações de envio
  instances TEXT,
  delay_between_messages INTEGER DEFAULT 5000,
  min_delay INTEGER DEFAULT 5000,
  max_delay INTEGER DEFAULT 10000,
  delay_between_instances INTEGER DEFAULT 30000,
  max_messages_per_instance INTEGER DEFAULT 100,
  
  -- Status e estatísticas
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'running', 'paused', 'completed', 'failed')),
  scheduled_at DATETIME,
  started_at DATETIME,
  completed_at DATETIME,
  
  total_contacts INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  messages_delivered INTEGER DEFAULT 0,
  messages_read INTEGER DEFAULT 0,
  messages_failed INTEGER DEFAULT 0,
  
  -- Metadados
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT
);

INSERT INTO campaigns_new SELECT * FROM campaigns;

DROP TABLE campaigns;
ALTER TABLE campaigns_new RENAME TO campaigns;

-- 2. Atualizar tabela messages
DROP TABLE IF EXISTS messages_new;

CREATE TABLE messages_new (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  instance_id TEXT NOT NULL,
  
  -- Conteúdo da mensagem (adicionado 'poll' e garantindo carousel se necessário futuramente)
  type TEXT NOT NULL CHECK (type IN ('text', 'image', 'video', 'audio', 'document', 'sticker', 'location', 'contact', 'buttons', 'list', 'template', 'carousel', 'poll')),
  content TEXT,
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

-- Note: we need to map the columns correctly if the schema changed
INSERT INTO messages_new SELECT * FROM messages;

DROP TABLE messages;
ALTER TABLE messages_new RENAME TO messages;

-- Recriar triggers
CREATE TRIGGER IF NOT EXISTS update_campaigns_updated_at 
  AFTER UPDATE ON campaigns
  FOR EACH ROW
BEGIN
  UPDATE campaigns SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

PRAGMA foreign_keys = ON;
