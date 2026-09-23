import { PlantSpecies, SessionTag } from '../types';

export const PLANT_SPECIES_LIST: PlantSpecies[] = [
  {
    id: 'pine',
    name: 'Pino Siempreverde',
    tagline: 'Firme y resistente ante cualquier tormenta.',
    cost: 0,
    unlocked: true,
    colorScheme: {
      primary: '#059669',
      secondary: '#047857',
      accent: '#10b981',
      pot: '#b45309'
    }
  },
  {
    id: 'sakura',
    name: 'Cerezo Japonés (Sakura)',
    tagline: 'Flores suaves que inspiran calma y creatividad.',
    cost: 50,
    unlocked: false,
    colorScheme: {
      primary: '#f472b6',
      secondary: '#db2777',
      accent: '#fbcfe8',
      pot: '#78350f'
    }
  },
  {
    id: 'bonsai',
    name: 'Bonsái Zen',
    tagline: 'El arte de la paciencia y el cuidado minucioso.',
    cost: 100,
    unlocked: false,
    colorScheme: {
      primary: '#15803d',
      secondary: '#166534',
      accent: '#86efac',
      pot: '#1e293b'
    }
  },
  {
    id: 'sunflower',
    name: 'Girasol Radiante',
    tagline: 'Siempre buscando la luz y la máxima energía.',
    cost: 40,
    unlocked: false,
    colorScheme: {
      primary: '#eab308',
      secondary: '#ca8a04',
      accent: '#fef08a',
      pot: '#ea580c'
    }
  },
  {
    id: 'cactus',
    name: 'Cactus del Desierto',
    tagline: 'Prospera incluso en las condiciones más duras.',
    cost: 30,
    unlocked: false,
    colorScheme: {
      primary: '#10b981',
      secondary: '#0f766e',
      accent: '#fb7185',
      pot: '#c2410c'
    }
  },
  {
    id: 'mushroom',
    name: 'Hongo Mágico Fantasía',
    tagline: 'Emite un brillo relajante en la noche profunda.',
    cost: 120,
    unlocked: false,
    colorScheme: {
      primary: '#8b5cf6',
      secondary: '#6d28d9',
      accent: '#c4b5fd',
      pot: '#0f172a'
    }
  },
  {
    id: 'bamboo',
    name: 'Bambú de la Suerte',
    tagline: 'Crecimiento rápido, flexible pero inquebrantable.',
    cost: 60,
    unlocked: false,
    colorScheme: {
      primary: '#84cc16',
      secondary: '#65a30d',
      accent: '#d9f99d',
      pot: '#374151'
    }
  },
  {
    id: 'carnivorous',
    name: 'Planta Atrapamoscas',
    tagline: 'Devora cualquier distracción al instante.',
    cost: 150,
    unlocked: false,
    colorScheme: {
      primary: '#ef4444',
      secondary: '#b91c1c',
      accent: '#fca5a5',
      pot: '#18181b'
    }
  }
];

export interface TagConfig {
  name: SessionTag;
  icon: string;
  activeColor: string;
  idleColor: string;
  badgeDot: string;
}

export const SESSION_TAGS: TagConfig[] = [
  {
    name: 'Estudio',
    icon: '📚',
    activeColor: 'bg-blue-600/30 text-blue-200 border-blue-400 shadow-md shadow-blue-500/20 ring-1 ring-blue-400/50',
    idleColor: 'bg-blue-950/40 text-blue-300/70 border-blue-900/60 hover:border-blue-700',
    badgeDot: 'bg-blue-400'
  },
  {
    name: 'Trabajo',
    icon: '💼',
    activeColor: 'bg-emerald-600/30 text-emerald-200 border-emerald-400 shadow-md shadow-emerald-500/20 ring-1 ring-emerald-400/50',
    idleColor: 'bg-emerald-950/40 text-emerald-300/70 border-emerald-900/60 hover:border-emerald-700',
    badgeDot: 'bg-emerald-400'
  },
  {
    name: 'Código',
    icon: '💻',
    activeColor: 'bg-cyan-600/30 text-cyan-200 border-cyan-400 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400/50',
    idleColor: 'bg-cyan-950/40 text-cyan-300/70 border-cyan-900/60 hover:border-cyan-700',
    badgeDot: 'bg-cyan-400'
  },
  {
    name: 'Lectura',
    icon: '📖',
    activeColor: 'bg-amber-600/30 text-amber-200 border-amber-400 shadow-md shadow-amber-500/20 ring-1 ring-amber-400/50',
    idleColor: 'bg-amber-950/40 text-amber-300/70 border-amber-900/60 hover:border-amber-700',
    badgeDot: 'bg-amber-400'
  },
  {
    name: 'Meditación',
    icon: '🧘',
    activeColor: 'bg-purple-600/30 text-purple-200 border-purple-400 shadow-md shadow-purple-500/20 ring-1 ring-purple-400/50',
    idleColor: 'bg-purple-950/40 text-purple-300/70 border-purple-900/60 hover:border-purple-700',
    badgeDot: 'bg-purple-400'
  },
  {
    name: 'Creativo',
    icon: '🎨',
    activeColor: 'bg-rose-600/30 text-rose-200 border-rose-400 shadow-md shadow-rose-500/20 ring-1 ring-rose-400/50',
    idleColor: 'bg-rose-950/40 text-rose-300/70 border-rose-900/60 hover:border-rose-700',
    badgeDot: 'bg-rose-400'
  }
];
