export type PlantSpeciesId = 
  | 'pine'
  | 'sakura'
  | 'bonsai'
  | 'sunflower'
  | 'cactus'
  | 'mushroom'
  | 'bamboo'
  | 'carnivorous';

export interface PlantSpecies {
  id: PlantSpeciesId;
  name: string;
  tagline: string;
  cost: number;
  unlocked: boolean;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    pot: string;
  };
}

export type GrowthStage = 'seed' | 'sprout' | 'growing' | 'mature' | 'wilted';

export type SessionTag = 'Estudio' | 'Trabajo' | 'Código' | 'Lectura' | 'Meditación' | 'Creativo';

export interface PlantRecord {
  id: string;
  speciesId: PlantSpeciesId;
  durationMinutes: number;
  tag: SessionTag;
  date: string; // ISO string
  timestamp: number;
  completed: boolean; // false si se marchitó
  notes?: string;
  growthStage: GrowthStage;
}

export interface UserStats {
  drops: number; // Moneda de gotas de agua
  totalFocusMinutes: number;
  streakDays: number;
  lastActiveDate: string;
  unlockedSpecies: PlantSpeciesId[];
  records: PlantRecord[];
}
