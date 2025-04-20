export type CardRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

export interface Card {
  id?: number;
  name: string;
  character_name: string;
  image_url: string;
  description: string;
  rarity: CardRarity;
  quantity?: number;
  user_card_id?: number; // ID en user_cards
  owner_id?: number; // ID del propietario (usuario)
  created_at?: Date;
  updated_at?: Date;
}
