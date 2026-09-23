import { useState, useEffect, useRef, useCallback } from 'react';
import { PlantSpeciesId, SessionTag, GrowthStage, UserStats, PlantRecord } from '../types';
import { soundscape } from '../audio/soundscape';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'focus_garden_stats_v1';
const SYNC_CODE_KEY = 'focus_garden_sync_code';

const INITIAL_STATS: UserStats = {
  drops: 25,
  totalFocusMinutes: 0,
  streakDays: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  unlockedSpecies: ['pine'],
  records: []
};

// Generador de código aleatorio corto ej: FG-7491
const generateSyncCode = () => {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `FG-${num}`;
};

export const useGardenEngine = () => {
  // Código de sincronización para conectar móvil y PC
  const [syncCode, setSyncCode] = useState<string>(() => {
    return localStorage.getItem(SYNC_CODE_KEY) || generateSyncCode();
  });

  const [isSynced, setIsSynced] = useState<boolean>(false);

  // Estado de usuario y persistencia local
  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignorar fallback
    }
    return INITIAL_STATS;
  });

  // Guardar en localStorage siempre
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
      localStorage.setItem(SYNC_CODE_KEY, syncCode);
    } catch {
      // Ignorado
    }
  }, [stats, syncCode]);

  // Si Supabase está configurado, sincronizar bidireccionalmente en la nube
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    const client = supabase;

    // 1. Cargar datos remotos
    const fetchRemote = async () => {
      try {
        const { data, error } = await client
          .from('gardens')
          .select('stats')
          .eq('sync_code', syncCode)
          .single();

        if (data && data.stats) {
          setStats(data.stats);
          setIsSynced(true);
        } else if (!error || error.code === 'PGRST116') {
          // Crear fila inicial en Supabase para este syncCode
          await client
            .from('gardens')
            .upsert({ sync_code: syncCode, stats });
          setIsSynced(true);
        }
      } catch (err) {
        console.warn('Error syncing with Supabase:', err);
      }
    };

    fetchRemote();

    // 2. Suscribirse a cambios en tiempo real
    const channel = client
      .channel(`garden_${syncCode}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'gardens', filter: `sync_code=eq.${syncCode}` },
        (payload) => {
          if (payload.new && payload.new.stats) {
            setStats(payload.new.stats);
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [syncCode]);

  // Helper para empujar cambios a la nube si Supabase está activo
  const syncToCloud = useCallback(async (newStats: UserStats) => {
    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      try {
        await client
          .from('gardens')
          .upsert({ sync_code: syncCode, stats: newStats });
      } catch (err) {
        console.warn('Could not sync to cloud:', err);
      }
    }
  }, [syncCode]);

  // Aplicar un nuevo código de sincronización (ej: poner en el móvil el código del PC)
  const applySyncCode = (newCode: string) => {
    setSyncCode(newCode);
    localStorage.setItem(SYNC_CODE_KEY, newCode);
    // Si Supabase está conectado, traerá inmediatamente la partida del otro dispositivo
  };

  // Configuración de la sesión
  const [selectedSpecies, setSelectedSpecies] = useState<PlantSpeciesId>('pine');
  const [selectedTag, setSelectedTag] = useState<SessionTag>('Estudio');
  const [targetDurationMinutes, setTargetDurationMinutes] = useState<number>(25);
  const [strictMode, setStrictMode] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);

  // Estados del temporizador
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [strictWarningSeconds, setStrictWarningSeconds] = useState<number | null>(null);

  const timerRef = useRef<number | null>(null);
  const strictTimerRef = useRef<number | null>(null);

  const totalSeconds = targetDurationMinutes * 60;
  const progressRatio = (totalSeconds - secondsRemaining) / totalSeconds;

  let currentGrowthStage: GrowthStage = 'seed';
  if (progressRatio >= 0.99) {
    currentGrowthStage = 'mature';
  } else if (progressRatio >= 0.5) {
    currentGrowthStage = 'growing';
  } else if (progressRatio >= 0.15) {
    currentGrowthStage = 'sprout';
  } else {
    currentGrowthStage = 'seed';
  }

  // Finalizar sesión con éxito
  const finishSessionSuccess = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    if (timerRef.current) clearInterval(timerRef.current);
    soundscape.stopRain();
    soundscape.playZenChime('complete');

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#34d399', '#10b981', '#fbcfe8', '#facc15', '#38bdf8']
    });

    const dropsEarned = Math.max(5, Math.floor(targetDurationMinutes / 2));
    const newRecord: PlantRecord = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      speciesId: selectedSpecies,
      durationMinutes: targetDurationMinutes,
      tag: selectedTag,
      date: new Date().toISOString(),
      timestamp: Date.now(),
      completed: true,
      growthStage: 'mature'
    };

    setStats((prev) => {
      const today = new Date().toISOString().split('T')[0];
      const isNewDay = prev.lastActiveDate !== today;
      const updated: UserStats = {
        ...prev,
        drops: prev.drops + dropsEarned,
        totalFocusMinutes: prev.totalFocusMinutes + targetDurationMinutes,
        streakDays: isNewDay ? prev.streakDays + 1 : prev.streakDays,
        lastActiveDate: today,
        records: [newRecord, ...prev.records]
      };
      syncToCloud(updated);
      return updated;
    });

    setSecondsRemaining(targetDurationMinutes * 60);
  }, [selectedSpecies, selectedTag, targetDurationMinutes, syncToCloud]);

  // Fallo de sesión
  const failSession = useCallback((reason: 'give_up' | 'strict_left') => {
    setIsRunning(false);
    setIsPaused(false);
    setStrictWarningSeconds(null);
    if (timerRef.current) clearInterval(timerRef.current);
    if (strictTimerRef.current) clearInterval(strictTimerRef.current);

    soundscape.stopRain();
    soundscape.playZenChime('wilt');

    const minutesFocused = Math.max(1, Math.floor((totalSeconds - secondsRemaining) / 60));
    const newRecord: PlantRecord = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      speciesId: selectedSpecies,
      durationMinutes: minutesFocused,
      tag: selectedTag,
      date: new Date().toISOString(),
      timestamp: Date.now(),
      completed: false,
      growthStage: 'wilted',
      notes: reason === 'strict_left' ? 'Planta marchitada por salir a otra app' : 'Sesión interrumpida'
    };

    setStats((prev) => {
      const updated: UserStats = {
        ...prev,
        records: [newRecord, ...prev.records]
      };
      syncToCloud(updated);
      return updated;
    });

    setSecondsRemaining(targetDurationMinutes * 60);
  }, [totalSeconds, secondsRemaining, selectedSpecies, selectedTag, targetDurationMinutes, syncToCloud]);

  // Iniciar sesión
  const startSession = () => {
    soundscape.playZenChime('start');
    if (soundEnabled) {
      soundscape.startRain();
    }
    setSecondsRemaining(targetDurationMinutes * 60);
    setIsRunning(true);
    setIsPaused(false);
    setStrictWarningSeconds(null);
  };

  const togglePause = () => {
    soundscape.playPop();
    setIsPaused((prev) => !prev);
  };

  // Cronómetro
  useEffect(() => {
    if (!isRunning || isPaused) return;

    timerRef.current = window.setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          finishSessionSuccess();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isPaused, finishSessionSuccess]);

  // Detección de salida a otra app / cambio de pestaña
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!isRunning || !strictMode) return;

      if (document.hidden) {
        let countdown = 10;
        setStrictWarningSeconds(countdown);

        strictTimerRef.current = window.setInterval(() => {
          countdown -= 1;
          if (countdown <= 0) {
            clearInterval(strictTimerRef.current!);
            failSession('strict_left');
          } else {
            setStrictWarningSeconds(countdown);
          }
        }, 1000);
      } else {
        if (strictTimerRef.current) {
          clearInterval(strictTimerRef.current);
          strictTimerRef.current = null;
        }
        setStrictWarningSeconds(null);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (strictTimerRef.current) clearInterval(strictTimerRef.current);
    };
  }, [isRunning, strictMode, failSession]);

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    if (isRunning) {
      if (nextState) {
        soundscape.startRain();
      } else {
        soundscape.stopRain();
      }
    }
  };

  const buySpecies = (speciesId: PlantSpeciesId, cost: number): boolean => {
    if (stats.drops < cost || stats.unlockedSpecies.includes(speciesId)) {
      return false;
    }
    soundscape.playPop();
    setStats((prev) => {
      const updated: UserStats = {
        ...prev,
        drops: prev.drops - cost,
        unlockedSpecies: [...prev.unlockedSpecies, speciesId]
      };
      syncToCloud(updated);
      return updated;
    });
    return true;
  };

  return {
    stats,
    syncCode,
    isSynced,
    applySyncCode,
    selectedSpecies,
    setSelectedSpecies,
    selectedTag,
    setSelectedTag,
    targetDurationMinutes,
    setTargetDurationMinutes,
    strictMode,
    setStrictMode,
    soundEnabled,
    toggleSound,
    isRunning,
    isPaused,
    secondsRemaining,
    progressRatio,
    currentGrowthStage,
    strictWarningSeconds,
    startSession,
    togglePause,
    failSession,
    buySpecies,
    resetStats: () => {
      setStats(INITIAL_STATS);
      syncToCloud(INITIAL_STATS);
    }
  };
};
