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
('Homer Simpson - Space', 'Homer Simpson', '/assets/homer/space_homer.jpg', 'Homer in space', 'Common'),
('Homer Simpson - No Beer No TV', 'Homer Simpson', '/assets/homer/no_beer_no_tv.jpg', 'Homer with no beer and no TV', 'Uncommon'),
('Homer Simpson - NY Bills', 'Homer Simpson', '/assets/homer/ny_bills.jpg', 'Homer wearing NY Bills jersey', 'Rare'),
('Bart Simpson - Naked', 'Bart Simpson', '/assets/bart/naked_bart.jpg', 'Bart without pants', 'Common'),
('Lisa Simpson - Loser', 'Lisa Simpson', '/assets/lisa/loser_lisa.jpg', 'Lisa playing saxophone', 'Uncommon'),
('Lisa Simpson - Cool', 'Lisa Simpson', '/assets/lisa/cool_lisa.png', 'Lisa looking cool', 'Rare'),
('Marge Simpson - Mayor', 'Marge Simpson', '/assets/marge/mayor_marge.jpg', 'Marge as mayor', 'Common'),
('Marge Simpson - Witch', 'Marge Simpson', '/assets/marge/witch_marge.jpg', 'Marge as a witch', 'Uncommon'),
('Maggie Simpson - Violent', 'Maggie Simpson', '/assets/maggie/violent_maggie.jpg', 'Maggie being violent', 'Rare'),
('Bart Simpson - Snake', 'Bart Simpson', '/assets/iconic_moments/barts_snake.jpg', 'Bart and the snake', 'Legendary'),
('The Stonecutters', 'Iconic Moment', '/assets/iconic_moments/the_stonecutters.jpg', 'The Stonecutters reveal themselves', 'Legendary');
