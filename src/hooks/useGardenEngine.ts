import { useState, useEffect, useRef, useCallback } from 'react';
import {
  PlantSpeciesId,
  SessionTag,
  GrowthStage,
  UserStats,
  PlantRecord,
  ActiveSessionSync,
  SoundscapeType
} from '../types';
import { soundscape } from '../audio/soundscape';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { checkNewAchievements } from '../data/achievements';
import { sendSystemNotification, requestNotificationPermission } from '../utils/notifications';
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
  activeSession: null,
  unlockedAchievements: [],
  pomodoroSessionsCount: 0
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
  const [currentSoundscape, setCurrentSoundscape] = useState<SoundscapeType>('rain');

  // Estados del temporizador y descansos
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isBreak, setIsBreak] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [strictWarningSeconds, setStrictWarningSeconds] = useState<number | null>(null);

  // Modal de felicitación y notas
  const [completedSessionData, setCompletedSessionData] = useState<{
    speciesId: PlantSpeciesId;
    tag: SessionTag;
    durationMinutes: number;
    dropsEarned: number;
    recordId: string;
  } | null>(null);

  const updateTargetDuration = (mins: number) => {
    setTargetDurationMinutes(mins);
    if (!isRunning && !isBreak) {
      setSecondsRemaining(mins * 60);
    }
  };

  const timerRef = useRef<number | null>(null);
  const strictTimerRef = useRef<number | null>(null);

  // Sincronización en la nube con Supabase
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

  // Manejar sincronización remota
  const handleRemoteStatsUpdate = useCallback((remoteStats: UserStats) => {
    setStats(remoteStats);

    const active = remoteStats.activeSession;
    if (active && active.isRunning) {
      const now = Date.now();
      const remaining = Math.max(0, Math.round((active.targetEndTime - now) / 1000));

      setSelectedSpecies(active.speciesId);
      setSelectedTag(active.tag);
      setTargetDurationMinutes(active.durationMinutes);
      setSecondsRemaining(remaining);
      setIsRunning(true);
      setIsPaused(false);
      setIsBreak(Boolean(active.isBreak));
    } else if (!active && isRunning) {
      setIsRunning(false);
      setIsPaused(false);
      setIsBreak(false);
      setSecondsRemaining(targetDurationMinutes * 60);
    }
  }, [isRunning, targetDurationMinutes]);

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
  if (isBreak) {
    currentGrowthStage = 'mature';
  } else if (progressRatio >= 0.99) {
    currentGrowthStage = 'mature';
  } else if (progressRatio >= 0.5) {
    currentGrowthStage = 'growing';
  } else if (progressRatio >= 0.15) {
    currentGrowthStage = 'sprout';
  } else {
    currentGrowthStage = 'seed';
  }

  // Finalizar sesión de enfoque con éxito
  const finishSessionSuccess = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    if (timerRef.current) clearInterval(timerRef.current);
    soundscape.stopSoundscape();
    soundscape.playZenChime('complete');

    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#34d399', '#10b981', '#fbcfe8', '#facc15', '#38bdf8']
    });

    const dropsEarned = Math.max(5, Math.floor(targetDurationMinutes / 2));
    const recordId = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newRecord: PlantRecord = {
      id: recordId,
      speciesId: selectedSpecies,
      durationMinutes: targetDurationMinutes,
      tag: selectedTag,
      date: new Date().toISOString(),
      timestamp: Date.now(),
      completed: true,
      growthStage: 'mature'
    };

    setCompletedSessionData({
      speciesId: selectedSpecies,
      tag: selectedTag,
      durationMinutes: targetDurationMinutes,
      dropsEarned,
      recordId
    });

    // Enviar notificación del sistema si el usuario está fuera de la app o minimizado
    sendSystemNotification('🎉 ¡Sesión de concentración completada!', {
      body: `Has cultivado tu árbol con éxito durante ${targetDurationMinutes} min en "${selectedTag}". ¡Toca para ver tu recompensa!`,
      tag: 'focusgarden-session-complete',
      renotify: true
    });

    setStats((prev) => {
      const today = new Date().toISOString().split('T')[0];
      const isNewDay = prev.lastActiveDate !== today;
      let newDrops = prev.drops + dropsEarned;

      const updatedCandidate: UserStats = {
        ...prev,
        drops: newDrops,
        totalFocusMinutes: prev.totalFocusMinutes + targetDurationMinutes,
        streakDays: isNewDay ? prev.streakDays + 1 : prev.streakDays,
        lastActiveDate: today,
        records: [newRecord, ...prev.records],
        activeSession: null,
        pomodoroSessionsCount: (prev.pomodoroSessionsCount || 0) + 1
      };

      // 3. Evaluar Logros nuevos
      const newAchieved = checkNewAchievements(updatedCandidate);
      if (newAchieved.length > 0) {
        // Bono extra de gotas por logros
        newAchieved.forEach(a => {
          newDrops += 25;
        });
        updatedCandidate.drops = newDrops;
        updatedCandidate.unlockedAchievements = [
          ...(prev.unlockedAchievements || []),
          ...newAchieved
        ];
      }

      syncToCloud(updatedCandidate);
      return updatedCandidate;
    });

    setSecondsRemaining(targetDurationMinutes * 60);
  }, [selectedSpecies, selectedTag, targetDurationMinutes, syncToCloud]);

  // 1. Iniciar descanso Pomodoro (5m o 15m)
  const startBreak = (breakMinutes: number) => {
    requestNotificationPermission().catch(() => {});
    soundscape.playZenChime('break');
    setIsBreak(true);
    setTargetDurationMinutes(breakMinutes);
    const durationSecs = breakMinutes * 60;
    setSecondsRemaining(durationSecs);
    setIsRunning(true);
    setIsPaused(false);

    const now = Date.now();
    const activeSession: ActiveSessionSync = {
      isRunning: true,
      isBreak: true,
      speciesId: selectedSpecies,
      tag: selectedTag,
      durationMinutes: breakMinutes,
      startTime: now,
      targetEndTime: now + durationSecs * 1000
    };

    setStats((prev) => {
      const updated = { ...prev, activeSession };
      syncToCloud(updated);
      return updated;
    });
  };

  // Finalizar descanso Pomodoro
  const finishBreakSuccess = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setIsBreak(false);
    soundscape.playZenChime('start');
    setTargetDurationMinutes(25);
    setSecondsRemaining(25 * 60);

    // Enviar notificación del sistema para volver a enfocarse
    sendSystemNotification('☕ ¡El descanso ha terminado!', {
      body: 'Tu mente está despejada. ¡Es hora de iniciar una nueva sesión de enfoque!',
      tag: 'focusgarden-break-complete',
      renotify: true
    });

    setStats((prev) => {
      const updated = { ...prev, activeSession: null };
      syncToCloud(updated);
      return updated;
    });
  }, [syncToCloud]);

  // 6. Guardar nota de sesión en el registro
  const saveSessionNote = (noteText: string) => {
    if (!completedSessionData) return;
    setStats((prev) => {
      const updatedRecords = prev.records.map((r) =>
        r.id === completedSessionData.recordId ? { ...r, notes: noteText } : r
      );
      const updated = { ...prev, records: updatedRecords };
      syncToCloud(updated);
      return updated;
    });
  };

  // Fallo de sesión
  const failSession = useCallback((reason: 'give_up' | 'strict_left') => {
    setIsRunning(false);
    setIsPaused(false);
    setIsBreak(false);
    setStrictWarningSeconds(null);
    if (timerRef.current) clearInterval(timerRef.current);
    if (strictTimerRef.current) clearInterval(strictTimerRef.current);

    soundscape.stopSoundscape();
    soundscape.playZenChime('wilt');

    if (!isBreak) {
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
        notes: reason === 'strict_left' ? 'Marchitada por salir a otra app' : 'Sesión interrumpida'
      };

      setStats((prev) => {
        const updated: UserStats = {
          ...prev,
          records: [newRecord, ...prev.records],
          activeSession: null
        };
        syncToCloud(updated);
        return updated;
      });
    }

    setSecondsRemaining(targetDurationMinutes * 60);
  }, [totalSeconds, secondsRemaining, selectedSpecies, selectedTag, targetDurationMinutes, isBreak, syncToCloud]);

  // Iniciar sesión
  const startSession = () => {
    requestNotificationPermission().catch(() => {});
    soundscape.playZenChime('start');
    if (soundEnabled) {
      soundscape.playSoundscape(currentSoundscape);
    }
    setIsBreak(false);
    const durationSecs = targetDurationMinutes * 60;
    setSecondsRemaining(durationSecs);
    setIsRunning(true);
    setIsPaused(false);
    setStrictWarningSeconds(null);

    const now = Date.now();
    const activeSession: ActiveSessionSync = {
      isRunning: true,
      isBreak: false,
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

  // Cronómetro local sincronizado con tiempo real exacto (sin desfase si la app se minimiza)
  useEffect(() => {
    if (!isRunning || isPaused) return;

    timerRef.current = window.setInterval(() => {
      setSecondsRemaining((prev) => {
        // Si hay una sesión activa con hora final calculada, comprobamos el tiempo real restante
        if (stats.activeSession && stats.activeSession.targetEndTime) {
          const now = Date.now();
          const realRemaining = Math.max(0, Math.round((stats.activeSession.targetEndTime - now) / 1000));
          if (realRemaining <= 0) {
            clearInterval(timerRef.current!);
            if (isBreak) {
              finishBreakSuccess();
            } else {
              finishSessionSuccess();
            }
            return targetDurationMinutes * 60;
          }
          return realRemaining;
        }

        if (prev <= 1) {
          clearInterval(timerRef.current!);
          if (isBreak) {
            finishBreakSuccess();
          } else {
            finishSessionSuccess();
          }
          return targetDurationMinutes * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isPaused, isBreak, finishSessionSuccess, finishBreakSuccess, targetDurationMinutes, stats.activeSession]);

  // Detección de salida en Modo Estricto (solo penaliza si NO es descanso)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!isRunning || !strictMode || isBreak) return;

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

        // Si la sesión ha terminado mientras el usuario estaba fuera
        if (stats.activeSession && stats.activeSession.targetEndTime) {
          const now = Date.now();
          const remaining = Math.max(0, Math.round((stats.activeSession.targetEndTime - now) / 1000));
          if (remaining <= 0) {
            if (isBreak) {
              finishBreakSuccess();
            } else {
              finishSessionSuccess();
            }
          } else {
            setSecondsRemaining(remaining);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (strictTimerRef.current) clearInterval(strictTimerRef.current);
    };
  }, [isRunning, strictMode, isBreak, failSession]);

  // Control de sonido y cambio de paisaje
  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    if (isRunning) {
      if (nextState) {
        soundscape.playSoundscape(currentSoundscape);
      } else {
        soundscape.stopSoundscape();
      }
    }
  };

  const changeSoundscape = (type: SoundscapeType) => {
    setCurrentSoundscape(type);
    if (isRunning && soundEnabled) {
      soundscape.playSoundscape(type);
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

      const newAchieved = checkNewAchievements(updated);
      if (newAchieved.length > 0) {
        updated.unlockedAchievements = [
          ...(prev.unlockedAchievements || []),
          ...newAchieved
        ];
      }

      syncToCloud(updated);
      return updated;
    });
    return true;
  };

  // 5. Forzar recarga limpiando Service Worker en móviles y PC
  const forceReloadApp = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const name of cacheNames) {
          await caches.delete(name);
        }
      }
    } catch {
      // Fallback
    }
    window.location.reload();
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
    setTargetDurationMinutes: updateTargetDuration,
    strictMode,
    setStrictMode,
    soundEnabled,
    toggleSound,
    currentSoundscape,
    changeSoundscape,
    isRunning,
    isPaused,
    isBreak,
    secondsRemaining,
    progressRatio,
    currentGrowthStage,
    strictWarningSeconds,
    startSession,
    startBreak,
    togglePause,
    failSession,
    buySpecies,
    completedSessionData,
    closeSuccessModal: () => setCompletedSessionData(null),
    saveSessionNote,
    forceReloadApp,
    resetStats: () => {
      setStats(INITIAL_STATS);
      syncToCloud(INITIAL_STATS);
    }
  };
};
