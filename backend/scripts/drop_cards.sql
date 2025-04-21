-- First, remove the user_cards table which has a foreign key to cards
DROP TABLE IF EXISTS user_cards;

-- Then remove the cards table
DROP TABLE IF EXISTS cards;

-- Verify that the tables have been removed
SELECT 'user_cards' as table_name, COUNT(*) as count FROM user_cards UNION ALL
SELECT 'cards', COUNT(*) FROM cards;
