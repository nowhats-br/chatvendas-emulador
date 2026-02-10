-- Tabela de instâncias WhatsApp
CREATE TABLE IF NOT EXISTS instances (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  provider TEXT DEFAULT 'baileys' CHECK (provider IN ('baileys', 'whaileys')),
  phone_number TEXT,
  status TEXT DEFAULT 'disconnected' CHECK (status IN ('connected', 'connecting', 'disconnected', 'qr_ready')),
  qr_code TEXT,
  qr_expires_at DATETIME,
  pairing_code TEXT,
  battery_level INTEGER,
  is_business BOOLEAN DEFAULT FALSE,
  profile_name TEXT,
  profile_picture TEXT,
  webhook_url TEXT,
  settings TEXT, -- JSON com configurações específicas
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_seen DATETIME
);

-- Trigger para atualizar updated_at
CREATE TRIGGER IF NOT EXISTS update_instances_updated_at 
  AFTER UPDATE ON instances
  FOR EACH ROW
BEGIN
  UPDATE instances SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;