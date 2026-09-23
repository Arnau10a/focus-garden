import React from 'react';
import { PlantRecord, SessionTag } from '../types';
import { BarChart3, Clock, Flame, Calendar, Trophy, PieChart, Sparkles } from 'lucide-react';
import { ACHIEVEMENTS_LIST } from '../data/achievements';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: PlantRecord[];
  streakDays: number;
  totalMinutes: number;
  unlockedAchievements: string[];
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  isOpen,
  onClose,
  records,
  streakDays,
  totalMinutes,
  unlockedAchievements = []
}) => {
  if (!isOpen) return null;

  const completedRecords = records.filter(r => r.completed);

  // Calcular distribución por categorías
  const tagMinutesMap: Record<string, number> = {};
  completedRecords.forEach(r => {
    tagMinutesMap[r.tag] = (tagMinutesMap[r.tag] || 0) + r.durationMinutes;
  });

  const totalCalculatedMinutes = Object.values(tagMinutesMap).reduce((a, b) => a + b, 0) || 1;

  // Récord personal en 1 día
  const dayMinutesMap: Record<string, number> = {};
  completedRecords.forEach(r => {
    const day = r.date.split('T')[0];
    dayMinutesMap[day] = (dayMinutesMap[day] || 0) + r.durationMinutes;
  });

  let recordDayMinutes = 0;
  Object.values(dayMinutesMap).forEach(mins => {
    if (mins > recordDayMinutes) recordDayMinutes = mins;
  });

  // Últimos 7 días para gráfico de barras
  const last7Days: { label: string; date: string; minutes: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('es-ES', { weekday: 'short' });
    last7Days.push({
      label: dayName.charAt(0).toUpperCase() + dayName.slice(1),
      date: dateStr,
      minutes: dayMinutesMap[dateStr] || 0
    });
  }

  const maxDailyInWeek = Math.max(...last7Days.map(d => d.minutes), 30);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-[#05231b] border border-emerald-700/60 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabecera */}
        <div className="px-6 py-4 border-b border-emerald-900/40 flex items-center justify-between bg-emerald-950/60 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-none">Estadísticas & Logros</h2>
              <span className="text-[11px] text-emerald-400/80">Tu progreso de enfoque</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full bg-emerald-900/40"
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Métricas clave */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-emerald-950/70 border border-emerald-800/60 p-3 rounded-2xl text-center">
              <Clock className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <div className="text-lg font-black text-white">{totalMinutes}m</div>
              <div className="text-[10px] text-slate-400">Total Enfoque</div>
            </div>

            <div className="bg-emerald-950/70 border border-emerald-800/60 p-3 rounded-2xl text-center">
              <Flame className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <div className="text-lg font-black text-amber-300">{streakDays} d</div>
              <div className="text-[10px] text-slate-400">Racha Actual</div>
            </div>

            <div className="bg-emerald-950/70 border border-emerald-800/60 p-3 rounded-2xl text-center">
              <Trophy className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
              <div className="text-lg font-black text-yellow-300">{recordDayMinutes}m</div>
              <div className="text-[10px] text-slate-400">Récord Diario</div>
            </div>
          </div>

          {/* Gráfico de Barras Últimos 7 Días */}
          <div className="bg-emerald-950/70 border border-emerald-800/60 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
              <span>Tiempo de Enfoque (Últimos 7 días)</span>
            </div>

            <div className="flex items-end justify-between h-32 pt-4 px-1 gap-2">
              {last7Days.map((day) => {
                const heightPercent = Math.max(8, Math.round((day.minutes / maxDailyInWeek) * 100));
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <span className="text-[9px] text-emerald-300 font-bold opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                      {day.minutes}m
                    </span>
                    <div
                      className={`w-full max-w-[28px] rounded-t-lg transition-all duration-500 ${
                        day.minutes > 0
                          ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-sm shadow-emerald-500/30'
                          : 'bg-emerald-900/30'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[10px] text-slate-400 font-semibold mt-2">{day.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Distribución por Categorías */}
          <div className="bg-emerald-950/70 border border-emerald-800/60 rounded-2xl p-4 space-y-3">
            <div className="flex items-center space-x-1.5 text-xs text-slate-300 font-bold">
              <PieChart className="w-4 h-4 text-emerald-400" />
              <span>Distribución por Actividad</span>
            </div>

            {Object.keys(tagMinutesMap).length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-2">
                Completa sesiones para ver tu balance de actividades.
              </p>
            ) : (
              <div className="space-y-2.5">
                {Object.entries(tagMinutesMap).map(([tag, mins]) => {
                  const pct = Math.round((mins / totalCalculatedMinutes) * 100);
                  return (
                    <div key={tag} className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-300">
                        <span>{tag}</span>
                        <span className="font-semibold text-emerald-300">{mins}m ({pct}%)</span>
                      </div>
                      <div className="w-full bg-emerald-900/40 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sección de Logros y Desafíos */}
          <div className="bg-emerald-950/70 border border-emerald-800/60 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-xs text-slate-300 font-bold">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span>Logros y Desafíos</span>
              </div>
              <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full font-bold">
                {unlockedAchievements.length} / {ACHIEVEMENTS_LIST.length}
              </span>
            </div>

            <div className="space-y-2">
              {ACHIEVEMENTS_LIST.map((ach) => {
                const isUnlocked = unlockedAchievements.includes(ach.id);
                return (
                  <div
                    key={ach.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                      isUnlocked
                        ? 'bg-yellow-950/30 border-yellow-600/50 shadow-sm shadow-yellow-500/10'
                        : 'bg-slate-900/30 border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="text-xl">{ach.icon}</span>
                      <div>
                        <div className={`text-xs font-bold ${isUnlocked ? 'text-yellow-200' : 'text-slate-300'}`}>
                          {ach.title}
                        </div>
                        <div className="text-[10px] text-slate-400 leading-tight">
                          {ach.description}
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-[10px] font-bold text-sky-300 bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-800/50">
                        +{ach.rewardDrops} gotas
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-emerald-950/80 border-t border-emerald-900/40 text-center shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs active:scale-95 transition-all shadow-md shadow-emerald-500/20"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
