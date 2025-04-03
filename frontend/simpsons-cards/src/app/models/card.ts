export interface Card {
  id?: number;
  name: string;
  character_name: string;
  image_url: string;
  description: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary';
  created_at?: Date;
  updated_at?: Date;
}
