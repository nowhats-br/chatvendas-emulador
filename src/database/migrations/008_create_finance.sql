-- Tabela de transações financeiras
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  
  -- Tipo e categoria
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL, -- vendas, comissões, marketing, operacional, etc.
  subcategory TEXT,
  
  -- Valores
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'BRL',
  
  -- Descrição
  description TEXT NOT NULL,
  notes TEXT,
  
  -- Referências
  reference_type TEXT, -- order, campaign, driver_payment, etc.
  reference_id TEXT,
  
  -- Informações de pagamento
  payment_method TEXT,
  payment_details TEXT, -- JSON
  
  -- Status
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled', 'refunded')),
  
  -- Datas
  transaction_date DATE NOT NULL,
  due_date DATE,
  paid_date DATE,
  
  -- Metadados
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT,
  
  -- Índices para relatórios
  year INTEGER GENERATED ALWAYS AS (strftime('%Y', transaction_date)) STORED,
  month INTEGER GENERATED ALWAYS AS (strftime('%m', transaction_date)) STORED,
  day INTEGER GENERATED ALWAYS AS (strftime('%d', transaction_date)) STORED
);

-- Tabela de contas a receber
CREATE TABLE IF NOT EXISTS accounts_receivable (
  id TEXT PRIMARY KEY,
  contact_id TEXT,
  order_id TEXT,
  
  -- Valores
  original_amount DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  remaining_amount DECIMAL(10,2) NOT NULL,
  
  -- Datas
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue', 'cancelled')),
  
  -- Informações adicionais
  description TEXT,
  notes TEXT,
  payment_method TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (contact_id) REFERENCES contacts(id),
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Tabela de contas a pagar
CREATE TABLE IF NOT EXISTS accounts_payable (
  id TEXT PRIMARY KEY,
  supplier_name TEXT NOT NULL,
  supplier_document TEXT,
  
  -- Valores
  original_amount DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  remaining_amount DECIMAL(10,2) NOT NULL,
  
  -- Datas
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue', 'cancelled')),
  
  -- Categoria
  category TEXT NOT NULL, -- fornecedores, impostos, marketing, etc.
  
  -- Informações adicionais
  description TEXT NOT NULL,
  notes TEXT,
  payment_method TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT
);

-- Tabela de metas financeiras
CREATE TABLE IF NOT EXISTS financial_goals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Tipo de meta
  type TEXT NOT NULL CHECK (type IN ('revenue', 'profit', 'orders', 'customers')),
  
  -- Período
  period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Valores
  target_value DECIMAL(10,2) NOT NULL,
  current_value DECIMAL(10,2) DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT
);

-- Triggers
CREATE TRIGGER IF NOT EXISTS update_transactions_updated_at 
  AFTER UPDATE ON transactions
  FOR EACH ROW
BEGIN
  UPDATE transactions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_accounts_receivable_updated_at 
  AFTER UPDATE ON accounts_receivable
  FOR EACH ROW
BEGIN
  UPDATE accounts_receivable SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_accounts_payable_updated_at 
  AFTER UPDATE ON accounts_payable
  FOR EACH ROW
BEGIN
  UPDATE accounts_payable SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_financial_goals_updated_at 
  AFTER UPDATE ON financial_goals
  FOR EACH ROW
BEGIN
  UPDATE financial_goals SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;