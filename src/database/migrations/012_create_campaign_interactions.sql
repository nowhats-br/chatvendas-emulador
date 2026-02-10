-- Tabela para rastrear interações com mensagens de campanha
CREATE TABLE IF NOT EXISTS campaign_interactions (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  instance_id TEXT NOT NULL,
  campaign_send_id TEXT NOT NULL,
  
  -- Tipo de interação
  interaction_type TEXT NOT NULL CHECK (interaction_type IN (
    'button_click', 'list_selection', 'carousel_click', 'keyword_response', 'poll_vote'
  )),
  
  -- Dados da interação
  interaction_data TEXT, -- JSON com dados específicos da interação
  button_id TEXT, -- ID do botão clicado
  button_text TEXT, -- Texto do botão
  list_option_id TEXT, -- ID da opção da lista
  list_option_text TEXT, -- Texto da opção da lista
  keyword TEXT, -- Palavra-chave detectada
  response_text TEXT, -- Texto da resposta do usuário
  
  -- Metadados
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
  FOREIGN KEY (contact_id) REFERENCES contacts(id),
  FOREIGN KEY (instance_id) REFERENCES instances(id),
  FOREIGN KEY (campaign_send_id) REFERENCES campaign_sends(id)
);

-- Tabela para rastrear palavras-chave configuradas
CREATE TABLE IF NOT EXISTS campaign_keywords (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  keyword TEXT NOT NULL,
  case_sensitive BOOLEAN DEFAULT FALSE,
  exact_match BOOLEAN DEFAULT FALSE,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
);

-- Tabela para rastrear enquetes/polls
CREATE TABLE IF NOT EXISTS campaign_polls (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  question TEXT NOT NULL,
  options TEXT NOT NULL, -- JSON array com opções
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_campaign_interactions_campaign_id ON campaign_interactions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_interactions_contact_id ON campaign_interactions(contact_id);
CREATE INDEX IF NOT EXISTS idx_campaign_interactions_type ON campaign_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_campaign_interactions_created_at ON campaign_interactions(created_at);
CREATE INDEX IF NOT EXISTS idx_campaign_keywords_campaign_id ON campaign_keywords(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_keywords_keyword ON campaign_keywords(keyword);
CREATE INDEX IF NOT EXISTS idx_campaign_polls_campaign_id ON campaign_polls(campaign_id);