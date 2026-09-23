import { Achievement, UserStats } from '../types';

export const ACHIEVEMENTS_LIST: Achievement[] = [
  {
    id: 'first_tree',
    title: 'Primer Brote',
    description: 'Completa tu primera sesión de enfoque.',
    icon: '🌱',
    rewardDrops: 15,
    unlocked: false
  },
  {
    id: 'streak_3',
    title: 'Raíces Fuertes',
    description: 'Alcanza una racha de 3 días consecutivos.',
    icon: '🔥',
    rewardDrops: 25,
    unlocked: false
  },
  {
    id: 'streak_7',
    title: 'Semana Verde',
    description: 'Mantén una racha de 7 días enfocado.',
    icon: '👑',
    rewardDrops: 50,
    unlocked: false
  },
  {
    id: 'focus_60',
    title: 'Maestro Zen',
    description: 'Completa una sesión ininterrumpida de 60 minutos.',
    icon: '🧘',
    rewardDrops: 30,
    unlocked: false
  },
  {
    id: 'botanist',
    title: 'Botánico Experto',
    description: 'Desbloquea 4 especies distintas en el invernadero.',
    icon: '🌸',
    rewardDrops: 40,
    unlocked: false
  },
  {
    id: 'forest_10',
    title: 'Pequeño Bosque',
    description: 'Cultiva un total de 10 árboles con éxito.',
    icon: '🌲',
    rewardDrops: 45,
    unlocked: false
  }
];

export const checkNewAchievements = (stats: UserStats): string[] => {
  const alreadyUnlocked = stats.unlockedAchievements || [];
  const newlyUnlocked: string[] = [];

  const completedTrees = stats.records.filter(r => r.completed);

  if (completedTrees.length >= 1 && !alreadyUnlocked.includes('first_tree')) {
    newlyUnlocked.push('first_tree');
  }
  if (stats.streakDays >= 3 && !alreadyUnlocked.includes('streak_3')) {
    newlyUnlocked.push('streak_3');
  }
  if (stats.streakDays >= 7 && !alreadyUnlocked.includes('streak_7')) {
    newlyUnlocked.push('streak_7');
  }
  if (completedTrees.some(r => r.durationMinutes >= 60) && !alreadyUnlocked.includes('focus_60')) {
    newlyUnlocked.push('focus_60');
  }
  if (stats.unlockedSpecies.length >= 4 && !alreadyUnlocked.includes('botanist')) {
    newlyUnlocked.push('botanist');
  }
  if (completedTrees.length >= 10 && !alreadyUnlocked.includes('forest_10')) {
    newlyUnlocked.push('forest_10');
  }

  return newlyUnlocked;
};
