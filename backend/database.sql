-- Create database if not exists
CREATE DATABASE IF NOT EXISTS simpsons_cards;
USE simpsons_cards;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    last_cards_drawn TIMESTAMP,
    cards_remaining_today INT DEFAULT 4,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cards table
CREATE TABLE IF NOT EXISTS cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    character_name VARCHAR(100) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    rarity VARCHAR(20) NOT NULL,
    description TEXT
);

-- User_cards table (to track which cards each user has)
CREATE TABLE IF NOT EXISTS user_cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    card_id INT,
    obtained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (card_id) REFERENCES cards(id)
);

-- Insert initial cards data
INSERT INTO cards (character_name, image_url, rarity, description) VALUES
('Homer Simpson', 'https://example.com/homer.jpg', 'COMMON', 'Nuclear safety inspector at Springfield Nuclear Power Plant'),
('Bart Simpson', 'https://example.com/bart.jpg', 'COMMON', 'Perpetual troublemaker and eldest son of the Simpson family'),
('Lisa Simpson', 'https://example.com/lisa.jpg', 'RARE', 'Gifted saxophonist and the middle child of the Simpson family'),
('Marge Simpson', 'https://example.com/marge.jpg', 'COMMON', 'The patient mother of the Simpson family'),
('Mr. Burns', 'https://example.com/burns.jpg', 'LEGENDARY', 'Owner of the Springfield Nuclear Power Plant'),
('Ned Flanders', 'https://example.com/flanders.jpg', 'RARE', 'The Simpsons'' annoyingly cheerful neighbor'),
('Krusty the Clown', 'https://example.com/krusty.jpg', 'RARE', 'Springfield''s famous TV clown'),
('Apu Nahasapeemapetilon', 'https://example.com/apu.jpg', 'COMMON', 'Owner of the Kwik-E-Mart'),
('Moe Szyslak', 'https://example.com/moe.jpg', 'COMMON', 'Owner of Moe''s Tavern'),
('Ralph Wiggum', 'https://example.com/ralph.jpg', 'RARE', 'The innocent and simple-minded son of Chief Wiggum');
