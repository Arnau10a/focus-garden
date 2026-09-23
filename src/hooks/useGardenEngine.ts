import { useState, useEffect, useRef, useCallback } from 'react';
import { PlantSpeciesId, SessionTag, GrowthStage, UserStats, PlantRecord, ActiveSessionSync } from '../types';
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
  records: [],
  activeSession: null
};

const generateSyncCode = () => {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `FG-${num}`;
};

export const useGardenEngine = () => {
  const [syncCode, setSyncCode] = useState<string>(() => {
    return localStorage.getItem(SYNC_CODE_KEY) || generateSyncCode();
  });

  const [isSynced, setIsSynced] = useState<boolean>(false);

  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignorado
    }
    return INITIAL_STATS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
      localStorage.setItem(SYNC_CODE_KEY, syncCode);
    } catch {
      // Ignorado
    }
  }, [stats, syncCode]);

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

  // Manejar sincronización de sesión activa cuando llega desde el otro dispositivo
  const handleRemoteStatsUpdate = useCallback((remoteStats: UserStats) => {
    setStats(remoteStats);

    const active = remoteStats.activeSession;
    if (active && active.isRunning) {
      // Hay un temporizador corriendo en el otro dispositivo
      const now = Date.now();
      const remaining = Math.max(0, Math.round((active.targetEndTime - now) / 1000));

      setSelectedSpecies(active.speciesId);
      setSelectedTag(active.tag);
      setTargetDurationMinutes(active.durationMinutes);
      setSecondsRemaining(remaining);
      setIsRunning(true);
      setIsPaused(false);
    } else if (!active && isRunning) {
      // Si el otro dispositivo se rindió o terminó la sesión
      setIsRunning(false);
      setIsPaused(false);
    }
  }, [isRunning]);

  // Suscripción Realtime con Supabase
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    const client = supabase;

    const fetchRemote = async () => {
      try {
        const { data, error } = await client
          .from('gardens')
          .select('stats')
          .eq('sync_code', syncCode)
          .single();

        if (data && data.stats) {
          handleRemoteStatsUpdate(data.stats);
          setIsSynced(true);
        } else if (!error || error.code === 'PGRST116') {
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

    const channel = client
      .channel(`garden_${syncCode}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'gardens', filter: `sync_code=eq.${syncCode}` },
        (payload) => {
          if (payload.new && payload.new.stats) {
            handleRemoteStatsUpdate(payload.new.stats);
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [syncCode, handleRemoteStatsUpdate]);

  const applySyncCode = (newCode: string) => {
    setSyncCode(newCode);
    localStorage.setItem(SYNC_CODE_KEY, newCode);
  };

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
        records: [newRecord, ...prev.records],
        activeSession: null // Libera la sesión en el cronómetro del otro equipo
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
        records: [newRecord, ...prev.records],
        activeSession: null // Se rinde también en el otro dispositivo
      };
      syncToCloud(updated);
      return updated;
    });

    setSecondsRemaining(targetDurationMinutes * 60);
  }, [totalSeconds, secondsRemaining, selectedSpecies, selectedTag, targetDurationMinutes, syncToCloud]);

  // Iniciar sesión y propagar a la nube
  const startSession = () => {
    soundscape.playZenChime('start');
    if (soundEnabled) {
      soundscape.startRain();
    }
    const durationSecs = targetDurationMinutes * 60;
    setSecondsRemaining(durationSecs);
    setIsRunning(true);
    setIsPaused(false);
    setStrictWarningSeconds(null);

    const now = Date.now();
    const activeSession: ActiveSessionSync = {
      isRunning: true,
      speciesId: selectedSpecies,
      tag: selectedTag,
      durationMinutes: targetDurationMinutes,
      startTime: now,
      targetEndTime: now + durationSecs * 1000
    };

    setStats((prev) => {
      const updated = {
        ...prev,
        activeSession
      };
      syncToCloud(updated);
      return updated;
    });
  };

  const togglePause = () => {
    soundscape.playPop();
    setIsPaused((prev) => !prev);
  };

  // Cronómetro local
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

  // Detección de salida en Modo Estricto
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
