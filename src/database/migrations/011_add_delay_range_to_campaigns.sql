-- Adicionar colunas de intervalo min/max para campanhas
ALTER TABLE campaigns ADD COLUMN min_delay INTEGER DEFAULT 10000;
ALTER TABLE campaigns ADD COLUMN max_delay INTEGER DEFAULT 20000;
