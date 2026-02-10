-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  contact_id TEXT NOT NULL,
  instance_id TEXT,
  ticket_id TEXT,
  
  -- Status do pedido
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partial', 'refunded', 'cancelled')),
  
  -- Valores
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  shipping_amount DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  -- Informações de entrega
  delivery_type TEXT DEFAULT 'pickup' CHECK (delivery_type IN ('pickup', 'delivery')),
  delivery_address TEXT, -- JSON com endereço completo
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  estimated_delivery DATETIME,
  delivered_at DATETIME,
  
  -- Informações de pagamento
  payment_method TEXT,
  payment_details TEXT, -- JSON com detalhes específicos
  paid_amount DECIMAL(10,2) DEFAULT 0,
  change_amount DECIMAL(10,2) DEFAULT 0,
  
  -- Observações
  notes TEXT,
  internal_notes TEXT,
  
  -- Rastreamento
  driver_id TEXT,
  tracking_code TEXT,
  
  -- Metadados
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT,
  
  FOREIGN KEY (contact_id) REFERENCES contacts(id),
  FOREIGN KEY (instance_id) REFERENCES instances(id),
  FOREIGN KEY (ticket_id) REFERENCES tickets(id),
  FOREIGN KEY (driver_id) REFERENCES drivers(id)
);

-- Tabela de itens do pedido
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  variation_id TEXT,
  
  -- Detalhes do item
  product_name TEXT NOT NULL, -- snapshot do nome no momento da compra
  variation_name TEXT,
  sku TEXT,
  
  -- Preços
  unit_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_price DECIMAL(10,2) NOT NULL,
  
  -- Observações específicas do item
  notes TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (variation_id) REFERENCES product_variations(id)
);

-- Tabela de histórico de status do pedido
CREATE TABLE IF NOT EXISTS order_status_history (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  status TEXT NOT NULL,
  notes TEXT,
  changed_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Triggers
CREATE TRIGGER IF NOT EXISTS update_orders_updated_at 
  AFTER UPDATE ON orders
  FOR EACH ROW
BEGIN
  UPDATE orders SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger para criar histórico de status
CREATE TRIGGER IF NOT EXISTS create_order_status_history
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  WHEN NEW.status != OLD.status
BEGIN
  INSERT INTO order_status_history (id, order_id, status, changed_by)
  VALUES (
    lower(hex(randomblob(16))),
    NEW.id,
    NEW.status,
    'system'
  );
END;