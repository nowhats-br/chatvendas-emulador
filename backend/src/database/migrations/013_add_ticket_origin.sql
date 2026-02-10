-- Adicionar campo de origem aos tickets
ALTER TABLE tickets ADD COLUMN origin TEXT DEFAULT 'organic' CHECK (origin IN ('organic', 'chatbot', 'campaign', 'followup'));

-- Atualizar tickets existentes baseado em heurísticas
-- Se o ticket tem mensagens de campanha, marcar como campaign
UPDATE tickets 
SET origin = 'campaign' 
WHERE id IN (
  SELECT DISTINCT t.id 
  FROM tickets t 
  JOIN messages m ON t.id = m.ticket_id 
  WHERE m.type = 'template' OR m.content LIKE '%campanha%' OR m.content LIKE '%promoção%'
);

-- Se o ticket tem mensagens de bot, marcar como chatbot
UPDATE tickets 
SET origin = 'chatbot' 
WHERE id IN (
  SELECT DISTINCT t.id 
  FROM tickets t 
  JOIN messages m ON t.id = m.ticket_id 
  WHERE m.type = 'buttons' OR m.type = 'list' OR m.content LIKE '%bot%' OR m.content LIKE '%menu%'
);