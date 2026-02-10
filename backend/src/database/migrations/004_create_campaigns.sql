-- Tabela de campanhas
CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Configurações da campanha
  message_type TEXT NOT NULL CHECK (message_type IN ('text', 'image', 'video', 'audio', 'document', 'template')),
  message_content TEXT NOT NULL, -- texto ou JSON
  media_url TEXT,
  
  -- Segmentação
  target_type TEXT DEFAULT 'all' CHECK (target_type IN ('all', 'segment', 'list')),
  target_criteria TEXT, -- JSON com critérios de segmentação
  contact_list TEXT, -- JSON array de IDs de contatos
  
  -- Configurações de envio
  instances TEXT, -- JSON array de instance_ids para rotação
  delay_between_messages INTEGER DEFAULT 5000, -- ms
  delay_between_instances INTEGER DEFAULT 30000, -- ms
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

-- Tabela de envios da campanha (log detalhado)
CREATE TABLE IF NOT EXISTS campaign_sends (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  instance_id TEXT NOT NULL,
  message_id TEXT, -- referência para messages table
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  error_message TEXT,
  sent_at DATETIME,
  delivered_at DATETIME,
  read_at DATETIME,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
  FOREIGN KEY (contact_id) REFERENCES contacts(id),
  FOREIGN KEY (instance_id) REFERENCES instances(id),
  FOREIGN KEY (message_id) REFERENCES messages(id)
);

-- Triggers
CREATE TRIGGER IF NOT EXISTS update_campaigns_updated_at 
  AFTER UPDATE ON campaigns
  FOR EACH ROW
BEGIN
  UPDATE campaigns SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;