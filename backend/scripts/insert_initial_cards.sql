USE springfield_shuffle;

-- Insert initial cards
INSERT INTO cards (name, character_name, image_url, description, rarity) VALUES
('Homer Simpson - Space', 'Homer Simpson', '/assets/homer/space_homer.jpg', 'Homer Simpson in his space suit, ready to travel to the stars.', 'Common'),
('Homer Simpson - No Beer No TV', 'Homer Simpson', '/assets/homer/no_beer_no_tv.jpg', 'Homer Simpson at his most desperate: without beer or television.', 'Uncommon'),
('Homer Simpson - NY Bills', 'Homer Simpson', '/assets/homer/ny_bills.jpg', 'Homer Simpson showing his fandom for the Buffalo Bills.', 'Rare'),
('Bart Simpson - Naked', 'Bart Simpson', '/assets/bart/naked_bart.jpg', 'Bart Simpson in his most natural state.', 'Common'),
('Lisa Simpson - Loser', 'Lisa Simpson', '/assets/lisa/loser_lisa.jpg', 'Lisa Simpson at her most vulnerable moment.', 'Uncommon'),
('Lisa Simpson - Cool', 'Lisa Simpson', '/assets/lisa/cool_lisa.png', 'Lisa Simpson showing her most rebellious side.', 'Rare'),
('Marge Simpson - Mayor', 'Marge Simpson', '/assets/marge/mayor_marge.jpg', 'Marge Simpson as Springfield\'s mayor.', 'Common'),
('Marge Simpson - Witch', 'Marge Simpson', '/assets/marge/witch_marge.jpg', 'Marge Simpson transformed into a witch for Halloween.', 'Uncommon'),
('Maggie Simpson - Violent', 'Maggie Simpson', '/assets/maggie/violent_maggie.jpg', 'Maggie Simpson showing her most dangerous side.', 'Rare'),
('Bart Simpson - Snake', 'Bart Simpson', '/assets/iconic_moments/barts_snake.jpg', 'The iconic moment where Bart Simpson is attacked by a snake.', 'Legendary'),
('The Stonecutters', 'Iconic Moment', '/assets/iconic_moments/the_stonecutters.jpg', 'The Stonecutters at their secret meeting.', 'Legendary');
