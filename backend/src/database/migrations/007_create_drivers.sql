-- Tabela de entregadores/motoristas
CREATE TABLE IF NOT EXISTS drivers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  document TEXT, -- CPF
  
  -- Informações pessoais
  birth_date DATE,
  address TEXT, -- JSON com endereço completo
  
  -- Informações profissionais
  license_number TEXT, -- CNH
  license_category TEXT,
  license_expires_at DATE,
  
  -- Veículo
  vehicle_type TEXT CHECK (vehicle_type IN ('motorcycle', 'car', 'bicycle', 'walking')),
  vehicle_brand TEXT,
  vehicle_model TEXT,
  vehicle_year INTEGER,
  vehicle_plate TEXT,
  vehicle_color TEXT,
  
  -- Status e configurações
  status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'busy', 'offline')),
  is_available BOOLEAN DEFAULT TRUE,
  max_deliveries_per_day INTEGER DEFAULT 50,
  delivery_radius_km DECIMAL(5,2) DEFAULT 10,
  
  -- Localização atual
  current_latitude DECIMAL(10,8),
  current_longitude DECIMAL(11,8),
  last_location_update DATETIME,
  
  -- Estatísticas
  total_deliveries INTEGER DEFAULT 0,
  successful_deliveries INTEGER DEFAULT 0,
  cancelled_deliveries INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  
  -- Financeiro
  commission_percentage DECIMAL(5,2) DEFAULT 10,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  pending_earnings DECIMAL(10,2) DEFAULT 0,
  
  -- Metadados
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT,
  last_seen DATETIME
);

-- Tabela de entregas
CREATE TABLE IF NOT EXISTS deliveries (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  driver_id TEXT NOT NULL,
  
  -- Status da entrega
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'picked_up', 'in_transit', 'delivered', 'failed', 'cancelled')),
  
  -- Endereços
  pickup_address TEXT, -- JSON
  delivery_address TEXT, -- JSON
  
  -- Coordenadas
  pickup_latitude DECIMAL(10,8),
  pickup_longitude DECIMAL(11,8),
  delivery_latitude DECIMAL(10,8),
  delivery_longitude DECIMAL(11,8),
  
  -- Tempos
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  picked_up_at DATETIME,
  delivered_at DATETIME,
  estimated_delivery DATETIME,
  
  -- Distância e valores
  distance_km DECIMAL(8,2),
  delivery_fee DECIMAL(10,2),
  driver_commission DECIMAL(10,2),
  
  -- Observações
  notes TEXT,
  failure_reason TEXT,
  
  -- Avaliação
  customer_rating INTEGER CHECK (customer_rating BETWEEN 1 AND 5),
  customer_feedback TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (driver_id) REFERENCES drivers(id)
);

-- Tabela de pagamentos para entregadores
CREATE TABLE IF NOT EXISTS driver_payments (
  id TEXT PRIMARY KEY,
  driver_id TEXT NOT NULL,
  
  -- Período do pagamento
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Valores
  total_deliveries INTEGER DEFAULT 0,
  total_commission DECIMAL(10,2) DEFAULT 0,
  bonus_amount DECIMAL(10,2) DEFAULT 0,
  deduction_amount DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(10,2) DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  payment_method TEXT,
  payment_date DATETIME,
  
  -- Observações
  notes TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT,
  
  FOREIGN KEY (driver_id) REFERENCES drivers(id)
);

-- Triggers
CREATE TRIGGER IF NOT EXISTS update_drivers_updated_at 
  AFTER UPDATE ON drivers
  FOR EACH ROW
BEGIN
  UPDATE drivers SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_deliveries_updated_at 
  AFTER UPDATE ON deliveries
  FOR EACH ROW
BEGIN
  UPDATE deliveries SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;