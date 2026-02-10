-- Tabela de categorias
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  parent_id TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (parent_id) REFERENCES categories(id)
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  sku TEXT UNIQUE,
  barcode TEXT,
  
  -- Preços
  price DECIMAL(10,2) NOT NULL,
  cost_price DECIMAL(10,2),
  sale_price DECIMAL(10,2),
  
  -- Estoque
  stock_quantity INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  max_stock INTEGER,
  track_stock BOOLEAN DEFAULT TRUE,
  
  -- Categorização
  category_id TEXT,
  tags TEXT, -- JSON array
  
  -- Mídia
  images TEXT, -- JSON array de URLs
  video_url TEXT,
  
  -- Configurações
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  weight DECIMAL(8,3),
  dimensions TEXT, -- JSON {length, width, height}
  
  -- SEO/Marketing
  meta_title TEXT,
  meta_description TEXT,
  
  -- Metadados
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT,
  
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Tabela de variações de produto
CREATE TABLE IF NOT EXISTS product_variations (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  name TEXT NOT NULL, -- ex: "Tamanho P - Cor Azul"
  sku TEXT UNIQUE,
  
  -- Atributos da variação
  attributes TEXT NOT NULL, -- JSON {size: "P", color: "Azul"}
  
  -- Preços específicos
  price DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  sale_price DECIMAL(10,2),
  
  -- Estoque específico
  stock_quantity INTEGER DEFAULT 0,
  
  -- Mídia específica
  image_url TEXT,
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Triggers
CREATE TRIGGER IF NOT EXISTS update_categories_updated_at 
  AFTER UPDATE ON categories
  FOR EACH ROW
BEGIN
  UPDATE categories SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_products_updated_at 
  AFTER UPDATE ON products
  FOR EACH ROW
BEGIN
  UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_product_variations_updated_at 
  AFTER UPDATE ON product_variations
  FOR EACH ROW
BEGIN
  UPDATE product_variations SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;