-- Primero eliminamos todas las tablas relacionadas
DROP TABLE IF EXISTS user_cards;
DROP TABLE IF EXISTS cards;

-- Creamos la tabla cards
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

-- Creamos la tabla user_cards
CREATE TABLE IF NOT EXISTS user_cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    card_id INT NOT NULL,
    obtained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (card_id) REFERENCES cards(id),
    UNIQUE KEY unique_user_card (user_id, card_id)
);

-- Insertamos los datos iniciales
INSERT INTO cards (name, character_name, image_url, description, rarity) VALUES
('Homer Simpson - Space', 'Homer Simpson', '/assets/homer/space_homer.jpg', 'Homer Simpson en su traje espacial, listo para viajar a las estrellas. Esta icónica imagen muestra a Homer en su momento más heroico, aunque probablemente no sepa cómo usar el control de la nave.', 'Common'),
('Homer Simpson - No Beer No TV', 'Homer Simpson', '/assets/homer/no_beer_no_tv.jpg', 'Homer Simpson en su estado más desesperado: sin cerveza ni televisión. Esta carta muestra a Homer en su sofá, con cara de tristeza y una mirada vacía, reflejando su dependencia de las dos cosas que más ama en la vida.', 'Uncommon'),
('Homer Simpson - NY Bills', 'Homer Simpson', '/assets/homer/ny_bills.jpg', 'Homer Simpson mostrando su fanatismo por los Buffalo Bills. Aunque no es el equipo más exitoso de la NFL, Homer mantiene su lealtad inquebrantable, incluso cuando el equipo está en su peor momento.', 'Rare'),
('Bart Simpson - Naked', 'Bart Simpson', '/assets/bart/naked_bart.jpg', 'Bart Simpson en su estado más natural. Esta carta muestra a Bart desnudo, corriendo por Springfield con su característica risa y una expresión de total despreocupación.', 'Common'),
('Lisa Simpson - Loser', 'Lisa Simpson', '/assets/lisa/loser_lisa.jpg', 'Lisa Simpson en su momento más vulnerable. Aunque es la más inteligente de la familia, incluso ella tiene sus momentos de duda y frustración. Esta carta muestra a Lisa en un momento de reflexión.', 'Uncommon'),
('Lisa Simpson - Cool', 'Lisa Simpson', '/assets/lisa/cool_lisa.png', 'Lisa Simpson mostrando su lado más rebelde. Con gafas de sol y una actitud despreocupada, esta carta muestra a Lisa disfrutando de la vida y rompiendo sus propias reglas por una vez.', 'Rare'),
('Marge Simpson - Mayor', 'Marge Simpson', '/assets/marge/mayor_marge.jpg', 'Marge Simpson en su papel como alcaldesa de Springfield. Con su característico peinado azul y un traje de poder, esta carta muestra a Marge enfrentando los desafíos de gobernar una ciudad llena de personajes excéntricos.', 'Common'),
('Marge Simpson - Witch', 'Marge Simpson', '/assets/marge/witch_marge.jpg', 'Marge Simpson transformada en bruja durante Halloween. Con un sombrero puntiagudo y una varita mágica, esta carta muestra a Marge en uno de los episodios más memorables de la serie.', 'Uncommon'),
('Maggie Simpson - Violent', 'Maggie Simpson', '/assets/maggie/violent_maggie.jpg', 'Maggie Simpson mostrando su lado más peligroso. Aunque parece una bebé indefensa, Maggie tiene una fuerza sorprendente y no duda en usar su chupete como arma cuando es necesario.', 'Rare'),
('Bart Simpson - Snake', 'Bart Simpson', '/assets/iconic_moments/barts_snake.jpg', 'El momento icónico donde Bart Simpson es atacado por una serpiente. Esta carta muestra la escena que se convirtió en uno de los momentos más memorables de la serie, con Bart gritando mientras la serpiente lo persigue.', 'Legendary'),
('The Stonecutters', 'Iconic Moment', '/assets/iconic_moments/the_stonecutters.jpg', 'Los Stonecutters en su reunión secreta. Esta carta muestra a Homer descubriendo la sociedad secreta más poderosa de Springfield, con todos los miembros usando máscaras y mantos ceremoniales.', 'Legendary');
