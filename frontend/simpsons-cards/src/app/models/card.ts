export type CardRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

export interface Card {
  id?: number;
  name: string;
  character_name: string;
  image_url: string;
  description: string;
  rarity: CardRarity;
  quantity?: number;
  created_at?: Date;
  updated_at?: Date;
}
