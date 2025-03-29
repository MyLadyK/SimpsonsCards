-- Primero eliminamos la tabla user_cards que tiene una foreign key a cards
DROP TABLE IF EXISTS user_cards;

-- Luego eliminamos la tabla cards
DROP TABLE IF EXISTS cards;

-- Verificamos que las tablas se hayan eliminado
SELECT 'user_cards' as table_name, COUNT(*) as count FROM user_cards UNION ALL
SELECT 'cards', COUNT(*) FROM cards;
