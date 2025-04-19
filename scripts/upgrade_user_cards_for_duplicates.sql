-- Script para permitir cartas repetidas y añadir cantidad en user_cards
-- 1. Elimina el índice único (ajusta el nombre si es diferente)
ALTER TABLE user_cards DROP INDEX unique_user_card;

-- 2. Añade columna quantity
ALTER TABLE user_cards ADD COLUMN quantity INT NOT NULL DEFAULT 1;

-- 3. Migra los datos existentes: agrupa duplicados y suma cantidad
-- (Esto solo si ya tienes datos con duplicados prohibidos)
-- Creamos una tabla temporal para agrupar
CREATE TABLE user_cards_temp AS
SELECT user_id, card_id, COUNT(*) AS quantity
FROM user_cards
GROUP BY user_id, card_id;

-- Borra los datos originales
DELETE FROM user_cards;

-- Inserta los datos agrupados con cantidad
INSERT INTO user_cards (user_id, card_id, quantity)
SELECT user_id, card_id, quantity FROM user_cards_temp;

DROP TABLE user_cards_temp;

-- 4. (Opcional) Añade índice para eficiencia de búsqueda
CREATE INDEX idx_user_cards_userid ON user_cards(user_id);
CREATE INDEX idx_user_cards_cardid ON user_cards(card_id);

-- ¡Listo! Ahora puedes tener cartas repetidas y saber cuántas tiene cada usuario.
