import { PlantSpecies } from '../types';

export const PLANT_SPECIES_LIST: PlantSpecies[] = [
  {
    id: 'pine',
    name: 'Pino Siempreverde',
    tagline: 'Firme y resistente ante cualquier tormenta.',
    cost: 0,
    unlocked: true,
    colorScheme: {
      primary: '#059669', // Emerald
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
      primary: '#f472b6', // Pink
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
      primary: '#15803d', // Green
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
      primary: '#eab308', // Yellow
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
      primary: '#8b5cf6', // Violet
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
      primary: '#84cc16', // Lime
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
      primary: '#ef4444', // Red
      secondary: '#b91c1c',
      accent: '#fca5a5',
      pot: '#18181b'
    }
  }
];

export const SESSION_TAGS = [
  { name: 'Estudio', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  { name: 'Trabajo', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  { name: 'Código', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
  { name: 'Lectura', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { name: 'Meditación', color: 'bg-teal-500/20 text-teal-300 border-teal-500/40' },
  { name: 'Creativo', color: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40' },
] as const;
