-- Remove all related tables first
DROP TABLE IF EXISTS user_cards;
DROP TABLE IF EXISTS cards;

-- Create the cards table
CREATE TABLE IF NOT EXISTS cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    character_name VARCHAR(100) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    rarity ENUM('Common', 'Uncommon', 'Rare', 'Epic', 'Legendary') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create the user_cards table
CREATE TABLE IF NOT EXISTS user_cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    card_id INT NOT NULL,
    obtained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (card_id) REFERENCES cards(id),
    UNIQUE KEY unique_user_card (user_id, card_id)
);

-- Exchange requests table
CREATE TABLE IF NOT EXISTS exchange_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exchange_offer_id INT NOT NULL,
    user_id INT NOT NULL,
    offered_card_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') NOT NULL DEFAULT 'pending',
    archived TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (exchange_offer_id) REFERENCES exchange_offers(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (offered_card_id) REFERENCES user_cards(id)
);

-- Insert initial cards
INSERT INTO cards (name, character_name, image_url, description, rarity) VALUES
('Homer Simpson - Space', 'Homer Simpson', '/assets/homer/space_homer.jpg', 'Homer Simpson in his space suit, ready to travel to the stars. This iconic image shows Homer at his most heroic moment, although he probably doesn\'t know how to use the spaceship controls.', 'Common'),
('Homer Simpson - No Beer No TV', 'Homer Simpson', '/assets/homer/no_beer_no_tv.jpg', 'Homer Simpson at his most desperate: without beer or television. This card shows Homer on his couch, looking sad and empty-eyed, reflecting his dependence on the two things he loves most in life.', 'Uncommon'),
('Homer Simpson - NY Bills', 'Homer Simpson', '/assets/homer/ny_bills.jpg', 'Homer Simpson showing his fandom for the Buffalo Bills. Even though it\'s not the most successful NFL team, Homer keeps his unwavering loyalty, even when the team is at its worst.', 'Rare'),
('Bart Simpson - Naked', 'Bart Simpson', '/assets/bart/naked_bart.jpg', 'Bart Simpson in his most natural state. This card shows Bart naked, running through Springfield with his characteristic laugh and a totally carefree expression.', 'Common'),
('Lisa Simpson - Loser', 'Lisa Simpson', '/assets/lisa/loser_lisa.jpg', 'Lisa Simpson at her most vulnerable moment. Even though she is the smartest in the family, even she has her moments of doubt and frustration. This card shows Lisa in a moment of reflection.', 'Uncommon'),
('Lisa Simpson - Cool', 'Lisa Simpson', '/assets/lisa/cool_lisa.png', 'Lisa Simpson showing her most rebellious side. With sunglasses and a carefree attitude, this card shows Lisa enjoying life and breaking her own rules for once.', 'Rare'),
('Marge Simpson - Mayor', 'Marge Simpson', '/assets/marge/mayor_marge.jpg', 'Marge Simpson as Springfield\'s mayor. With her characteristic blue hair and a power suit, this card shows Marge facing the challenges of governing a city full of eccentric characters.', 'Common'),
('Marge Simpson - Witch', 'Marge Simpson', '/assets/marge/witch_marge.jpg', 'Marge Simpson transformed into a witch for Halloween. With a pointy hat and a magic wand, this card shows Marge in one of the series\' most memorable episodes.', 'Uncommon'),
('Maggie Simpson - Violent', 'Maggie Simpson', '/assets/maggie/violent_maggie.jpg', 'Maggie Simpson showing her most dangerous side. Although she looks like a helpless baby, Maggie has surprising strength and doesn\'t hesitate to use her pacifier as a weapon when necessary.', 'Rare'),
('Bart Simpson - Snake', 'Bart Simpson', '/assets/iconic_moments/barts_snake.jpg', 'The iconic moment where Bart Simpson is attacked by a snake. This card shows the scene that became one of the most memorable moments of the series, with Bart screaming as the snake chases him.', 'Legendary'),
('The Stonecutters', 'Iconic Moment', '/assets/iconic_moments/the_stonecutters.jpg', 'The Stonecutters at their secret meeting. This card shows Homer discovering Springfield\'s most powerful secret society, with all the members wearing masks and ceremonial robes.', 'Legendary');
