-- Tabela de templates de mensagem
CREATE TABLE IF NOT EXISTS message_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Tipo e categoria
  type TEXT NOT NULL CHECK (type IN ('text', 'image', 'video', 'audio', 'document', 'buttons', 'list', 'template')),
  category TEXT, -- saudacao, despedida, promocao, suporte, etc.
  
  -- Conteúdo
  content TEXT NOT NULL, -- texto ou JSON para mensagens complexas
  media_url TEXT,
  media_filename TEXT,
  
  -- Variáveis disponíveis
  variables TEXT, -- JSON array com variáveis como {name}, {phone}, etc.
  
  -- Configurações
  is_active BOOLEAN DEFAULT TRUE,
  is_global BOOLEAN DEFAULT TRUE, -- disponível para todas as instâncias
  instance_id TEXT, -- se específico para uma instância
  
  -- Estatísticas de uso
  usage_count INTEGER DEFAULT 0,
  last_used DATETIME,
  
  -- Metadados
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT,
  
  FOREIGN KEY (instance_id) REFERENCES instances(id)
);

-- Tabela de respostas rápidas
CREATE TABLE IF NOT EXISTS quick_replies (
  id TEXT PRIMARY KEY,
  shortcut TEXT NOT NULL, -- atalho para ativar (ex: /oi, /preco)
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  
  -- Configurações
  is_active BOOLEAN DEFAULT TRUE,
  is_global BOOLEAN DEFAULT TRUE,
  instance_id TEXT,
  
  -- Estatísticas
  usage_count INTEGER DEFAULT 0,
  last_used DATETIME,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT,
  
  FOREIGN KEY (instance_id) REFERENCES instances(id)
);

-- Tabela de fluxos de chatbot
CREATE TABLE IF NOT EXISTS chatbot_flows (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Configuração do fluxo
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('keyword', 'welcome', 'menu', 'fallback')),
  trigger_value TEXT, -- palavra-chave ou condição
  
  -- Estrutura do fluxo (JSON)
  flow_data TEXT NOT NULL, -- JSON com nodes e connections
  
  -- Configurações
  is_active BOOLEAN DEFAULT TRUE,
  instance_id TEXT,
  
  -- Estatísticas
  total_executions INTEGER DEFAULT 0,
  successful_completions INTEGER DEFAULT 0,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT,
  
  FOREIGN KEY (instance_id) REFERENCES instances(id)
);

-- Tabela de execuções de chatbot (log)
CREATE TABLE IF NOT EXISTS chatbot_executions (
  id TEXT PRIMARY KEY,
  flow_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  instance_id TEXT NOT NULL,
  
  -- Estado da execução
  current_node TEXT,
  variables TEXT, -- JSON com variáveis coletadas
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  
  -- Timestamps
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  last_interaction DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (flow_id) REFERENCES chatbot_flows(id),
  FOREIGN KEY (contact_id) REFERENCES contacts(id),
  FOREIGN KEY (instance_id) REFERENCES instances(id)
);

-- Triggers
CREATE TRIGGER IF NOT EXISTS update_message_templates_updated_at 
  AFTER UPDATE ON message_templates
  FOR EACH ROW
BEGIN
  UPDATE message_templates SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_quick_replies_updated_at 
  AFTER UPDATE ON quick_replies
  FOR EACH ROW
BEGIN
  UPDATE quick_replies SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_chatbot_flows_updated_at 
  AFTER UPDATE ON chatbot_flows
  FOR EACH ROW
BEGIN
  UPDATE chatbot_flows SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;