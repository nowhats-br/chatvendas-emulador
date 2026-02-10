-- Adicionar suporte para tipos de mensagem interativa (botões e listas)
-- Atualizar constraint da tabela campaigns para incluir 'buttons' e 'list'

-- Primeiro, criar uma nova tabela temporária com a constraint atualizada
CREATE TABLE campaigns_new (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Configurações da campanha (constraint atualizada)
  message_type TEXT NOT NULL CHECK (message_type IN ('text', 'image', 'video', 'audio', 'document', 'template', 'buttons', 'list')),
  message_content TEXT NOT NULL, -- texto ou JSON
  media_url TEXT,
  media_files TEXT, -- JSON array de arquivos de mídia
  
  -- Segmentação
  target_type TEXT DEFAULT 'all' CHECK (target_type IN ('all', 'segment', 'list')),
  target_criteria TEXT, -- JSON com critérios de segmentação
  contact_list TEXT, -- JSON array de IDs de contatos
  
  -- Configurações de envio
  instances TEXT, -- JSON array de instance_ids para rotação
  delay_between_messages INTEGER DEFAULT 5000, -- ms
  min_delay INTEGER DEFAULT 5000, -- delay mínimo (ms)
  max_delay INTEGER DEFAULT 10000, -- delay máximo (ms)
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

-- Copiar dados da tabela antiga para a nova
INSERT INTO campaigns_new SELECT 
  id, name, description, message_type, message_content, media_url,
  COALESCE(media_files, '[]') as media_files,
  target_type, target_criteria, contact_list, instances,
  delay_between_messages, 
  COALESCE(min_delay, delay_between_messages) as min_delay,
  COALESCE(max_delay, delay_between_messages) as max_delay,
  delay_between_instances, max_messages_per_instance,
  status, scheduled_at, started_at, completed_at,
  total_contacts, messages_sent, messages_delivered, messages_read, messages_failed,
  created_at, updated_at, created_by
FROM campaigns;

-- Remover tabela antiga
DROP TABLE campaigns;

-- Renomear nova tabela
ALTER TABLE campaigns_new RENAME TO campaigns;

-- Recriar trigger
CREATE TRIGGER IF NOT EXISTS update_campaigns_updated_at 
  AFTER UPDATE ON campaigns
  FOR EACH ROW
BEGIN
  UPDATE campaigns SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;