-- Create database
CREATE DATABASE IF NOT EXISTS springfield_shuffle;
USE springfield_shuffle;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    last_cards_drawn TIMESTAMP,
    cards_remaining_today INT DEFAULT 4,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Cards table
CREATE TABLE IF NOT EXISTS cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    character_name VARCHAR(100) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    rarity ENUM('Common', 'Uncommon', 'Rare', 'Legendary') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User_cards table (to track which cards each user has)
CREATE TABLE IF NOT EXISTS user_cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    card_id INT NOT NULL,
    obtained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (card_id) REFERENCES cards(id),
    UNIQUE KEY unique_user_card (user_id, card_id)
);

-- Insert initial cards data
INSERT INTO cards (name, character_name, image_url, description, rarity) VALUES
('Homer Simpson - Safety Inspector', 'Homer Simpson', 'https://example.com/homer.jpg', 'Nuclear safety inspector at Springfield Nuclear Power Plant', 'Common'),
('Bart Simpson - Skateboarder', 'Bart Simpson', 'https://example.com/bart.jpg', 'Perpetual troublemaker and eldest son of the Simpson family', 'Common'),
('Lisa Simpson - Saxophonist', 'Lisa Simpson', 'https://example.com/lisa.jpg', 'Gifted saxophonist and the middle child of the Simpson family', 'Rare'),
('Marge Simpson - Mother', 'Marge Simpson', 'https://example.com/marge.jpg', 'The patient mother of the Simpson family', 'Common'),
('Mr. Burns - Power Plant Owner', 'Mr. Burns', 'https://example.com/burns.jpg', 'Owner of the Springfield Nuclear Power Plant', 'Legendary'),
('Ned Flanders - Neighbor', 'Ned Flanders', 'https://example.com/flanders.jpg', 'The Simpsons'' annoyingly cheerful neighbor', 'Rare'),
('Krusty the Clown - TV Star', 'Krusty the Clown', 'https://example.com/krusty.jpg', 'Springfield''s famous TV clown', 'Rare'),
('Apu Nahasapeemapetilon - Store Owner', 'Apu Nahasapeemapetilon', 'https://example.com/apu.jpg', 'Owner of the Kwik-E-Mart', 'Common'),
('Moe Szyslak - Bartender', 'Moe Szyslak', 'https://example.com/moe.jpg', 'Owner of Moe''s Tavern', 'Common'),
('Ralph Wiggum - Student', 'Ralph Wiggum', 'https://example.com/ralph.jpg', 'The innocent and simple-minded son of Chief Wiggum', 'Rare');
