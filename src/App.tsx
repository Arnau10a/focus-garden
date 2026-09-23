import React, { useState, useEffect } from 'react';
import { useGardenEngine } from './hooks/useGardenEngine';
import { PLANT_SPECIES_LIST, SESSION_TAGS } from './data/plants';
import { PlantIllustration } from './components/PlantIllustration';
import { ForestGarden } from './components/ForestGarden';
import { PlantShop } from './components/PlantShop';
import {
  Timer,
  Trees,
  ShoppingBag,
  Volume2,
  VolumeX,
  Shield,
  ShieldAlert,
  Flame,
  Droplet,
  Play,
  Square,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  Settings,
  BarChart3,
  Coffee
} from 'lucide-react';
import { SettingsModal } from './components/SettingsModal';
import { AnalyticsModal } from './components/AnalyticsModal';
import { SessionSuccessModal } from './components/SessionSuccessModal';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'timer' | 'forest' | 'shop'>('timer');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

  const {
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
    closeSuccessModal,
    saveSessionNote,
    forceReloadApp,
    resetStats
  } = useGardenEngine();

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  };

  const currentSpeciesObj = PLANT_SPECIES_LIST.find((s) => s.id === selectedSpecies) || PLANT_SPECIES_LIST[0];

  // Actualizar título de la pestaña con la cuenta regresiva en vivo
  useEffect(() => {
    if (isRunning) {
      const formatted = formatTime(secondsRemaining);
      if (isBreak) {
        document.title = `☕ (${formatted}) Descanso | FocusGarden`;
      } else {
        document.title = `🌿 (${formatted}) ${selectedTag} | FocusGarden`;
      }
    } else {
      document.title = 'FocusGarden - Focus Plant & Forest';
    }
  }, [isRunning, isBreak, secondsRemaining, selectedTag]);

  return (
    <div className="flex h-screen w-full bg-[#02130f] text-slate-100 overflow-hidden font-sans">
      {/* ============================================================== */}
      {/* SIDEBAR PARA ESCRITORIO (md: y superiores)                      */}
      {/* ============================================================== */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-emerald-950/40 border-r border-emerald-900/40 p-5 justify-between shrink-0 backdrop-blur-xl">
        <div className="space-y-6">
          {/* Logo y Nombre */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 text-emerald-950 fill-emerald-950" />
            </div>
            <div>
              <h1 className="font-black text-lg tracking-wide text-white">FocusGarden</h1>
              <p className="text-xs text-emerald-400/80">Cultiva tu concentración</p>
            </div>
          </div>

          {/* Tarjeta de Racha y Saldo */}
          <div className="bg-gradient-to-br from-emerald-900/40 to-emerald-950/60 border border-emerald-800/50 rounded-2xl p-3.5 space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 flex items-center space-x-1.5">
                <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Racha actual</span>
              </span>
              <span className="font-bold text-sm text-white">{stats.streakDays} días</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-emerald-800/40">
              <span className="text-xs text-slate-400 flex items-center space-x-1.5">
                <Droplet className="w-4 h-4 text-sky-400 fill-sky-400" />
                <span>Gotas ganadas</span>
              </span>
              <span className="font-bold text-sm text-sky-300">{stats.drops}</span>
            </div>
          </div>

          {/* Menú de Navegación de Escritorio */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('timer')}
              disabled={isRunning}
              className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-2xl font-bold text-sm transition-all text-left ${
                activeTab === 'timer'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:bg-emerald-900/30 hover:text-white'
              }`}
            >
              <Timer className="w-5 h-5" />
              <span>Temporizador</span>
            </button>

            <button
              onClick={() => setActiveTab('forest')}
              disabled={isRunning}
              className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-2xl font-bold text-sm transition-all text-left ${
                activeTab === 'forest'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:bg-emerald-900/30 hover:text-white'
              }`}
            >
              <Trees className="w-5 h-5" />
              <span>Mi Bosque</span>
            </button>

            <button
              onClick={() => setActiveTab('shop')}
              disabled={isRunning}
              className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-2xl font-bold text-sm transition-all text-left ${
                activeTab === 'shop'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:bg-emerald-900/30 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span>El Invernadero</span>
            </button>

            <button
              onClick={() => setShowAnalyticsModal(true)}
              className="w-full flex items-center space-x-3.5 px-4 py-3 rounded-2xl font-bold text-sm transition-all text-left text-slate-300 hover:bg-emerald-900/30 hover:text-white"
            >
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <span>Estadísticas & Logros</span>
            </button>

            <button
              onClick={() => setShowSettingsModal(true)}
              className="w-full flex items-center space-x-3.5 px-4 py-3 rounded-2xl font-bold text-sm transition-all text-left text-slate-300 hover:bg-emerald-900/30 hover:text-white"
            >
              <Settings className="w-5 h-5 text-emerald-400" />
              <span>Opciones & Ajustes</span>
            </button>
          </nav>
        </div>

        {/* Footer del Sidebar: Control de Paisaje Sonoro */}
        <div className="pt-4 border-t border-emerald-900/40">
          <button
            onClick={toggleSound}
            className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${
              soundEnabled
                ? 'bg-emerald-900/40 border-emerald-500/80 text-emerald-300'
                : 'bg-emerald-950/60 border-emerald-900/50 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
              <span className="text-xs font-semibold">
                {currentSoundscape === 'rain' && '🌧️ Lluvia Zen'}
                {currentSoundscape === 'waves' && '🌊 Olas de Mar'}
                {currentSoundscape === 'birds' && '🌲 Bosque Pájaros'}
                {currentSoundscape === 'fire' && '🔥 Hoguera Leña'}
                {currentSoundscape === 'cafe' && '☕ Cafetería Lo-Fi'}
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-950">
              {soundEnabled ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* CONTENEDOR PRINCIPAL RESPONSIVE (Móvil y Escritorio)           */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative max-w-full">
        {/* Alerta de Modo Estricto cuando se cambia de app o pestaña */}
        {strictWarningSeconds !== null && (
          <div className="absolute inset-0 z-50 bg-red-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
            <div className="w-20 h-20 rounded-full bg-red-600/30 border-2 border-red-500/80 flex items-center justify-center mb-4 shadow-lg shadow-red-500/30 animate-bounce">
              <AlertTriangle className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-wide">¡VUELVE A LA APP!</h2>
            <p className="text-sm text-red-200 mt-2 max-w-sm leading-relaxed">
              Has salido de FocusGarden con el Modo Estricto activo. Regresa antes de que tu planta se seque:
            </p>
            <div className="text-7xl font-black text-white mt-4 font-mono tracking-tight drop-shadow-lg">
              {strictWarningSeconds}s
            </div>
          </div>
        )}

        {/* HEADER SUPERIOR EN MÓVIL (Oculto en Escritorio md:hidden) */}
        <header className="flex md:hidden px-5 pt-4 pb-3 items-center justify-between bg-emerald-950/50 backdrop-blur-md border-b border-emerald-900/30 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Sparkles className="w-4 h-4 text-emerald-950 fill-emerald-950" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-wide text-white leading-none">FocusGarden</h1>
              <div className="flex items-center space-x-1.5 text-[11px] text-emerald-300/80 mt-1">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>{stats.streakDays}d racha</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAnalyticsModal(true)}
              className="p-2 rounded-xl border border-emerald-800/60 bg-emerald-900/40 text-emerald-300 active:scale-95 transition-all"
              title="Estadísticas & Logros"
            >
              <BarChart3 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 rounded-xl border border-emerald-800/60 bg-emerald-900/40 text-emerald-300 active:scale-95 transition-all"
              title="Opciones y Ajustes"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('shop')}
              className="flex items-center space-x-1.5 bg-emerald-900/50 border border-emerald-700/50 px-3 py-1.5 rounded-xl transition-all"
            >
              <Droplet className="w-3.5 h-3.5 text-sky-400 fill-sky-400" />
              <span className="font-bold text-xs text-sky-200">{stats.drops}</span>
            </button>
          </div>
        </header>

        {/* ÁREA DE CONTENIDO */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto flex flex-col items-center justify-center">
          <div className="w-full max-w-md lg:max-w-2xl h-full flex flex-col justify-between">
            {activeTab === 'timer' && (
              <div className="flex flex-col h-full justify-between items-center py-2 space-y-4">
                {/* Selector de Etiquetas estilizado por colores con espacio adecuado */}
                {!isRunning ? (
                  <div className="w-full flex items-center justify-start sm:justify-center space-x-2.5 overflow-x-auto no-scrollbar py-1.5 px-3">
                    {SESSION_TAGS.map((tag) => {
                      const isSelected = selectedTag === tag.name;
                      return (
                        <button
                          key={tag.name}
                          onClick={() => setSelectedTag(tag.name)}
                          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all shrink-0 active:scale-95 ${
                            isSelected
                              ? `${tag.activeColor} scale-105`
                              : `${tag.idleColor}`
                          }`}
                        >
                          <span className="text-sm">{tag.icon}</span>
                          <span>{tag.name}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : isBreak ? (
                  <div className="inline-flex items-center space-x-2 bg-amber-950/60 border border-amber-500/50 px-5 py-2 rounded-full text-xs text-amber-200 shadow-md backdrop-blur-md animate-pulse">
                    <Coffee className="w-4 h-4 text-amber-400" />
                    <span>Tiempo de Descanso: <b className="text-white">Relájate y bebe agua ☕</b></span>
                  </div>
                ) : (
                  <div className="inline-flex items-center space-x-2 bg-emerald-900/40 border border-emerald-600/40 px-5 py-2 rounded-full text-xs text-emerald-200 shadow-sm backdrop-blur-md">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Sesión enfocada en: <b className="text-white">{selectedTag}</b></span>
                  </div>
                )}

                {/* Ilustración de la Planta y Anillo */}
                <div className="relative flex flex-col items-center justify-center my-auto">
                  <div className="w-64 h-64 md:w-80 md:h-80 rounded-full border border-emerald-800/30 flex items-center justify-center relative timer-halo">
                    <svg className="w-full h-full -rotate-90 pointer-events-none absolute inset-0" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#04271d"
                        strokeWidth="3.5"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke={isBreak ? '#f59e0b' : '#10b981'}
                        strokeWidth="4"
                        strokeDasharray="283"
                        strokeDashoffset={283 * (1 - (isRunning ? progressRatio : 0))}
                        strokeLinecap="round"
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>

                    <div
                      className="z-10 cursor-pointer active:scale-95 transition-transform"
                      onClick={() => !isRunning && setActiveTab('shop')}
                      title="Cambiar espécimen en el invernadero"
                    >
                      <PlantIllustration
                        speciesId={selectedSpecies}
                        stage={currentGrowthStage}
                        size={210}
                      />
                    </div>
                  </div>

                  {!isRunning && (
                    <button
                      onClick={() => setActiveTab('shop')}
                      className="mt-3 inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-xs text-emerald-300 hover:text-emerald-200 transition-all active:scale-95"
                    >
                      <span>{currentSpeciesObj.name}</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                    </button>
                  )}
                </div>

                {/* Temporizador y Controles */}
                <div className="w-full flex flex-col items-center space-y-4">
                  <div className="text-6xl md:text-7xl font-black tracking-tight font-mono text-white drop-shadow-[0_2px_14px_rgba(16,185,129,0.35)]">
                    {formatTime(isRunning ? secondsRemaining : targetDurationMinutes * 60)}
                  </div>

                  {!isRunning ? (
                    <div className="w-full space-y-3">
                      {/* Píldoras de tiempo */}
                      <div className="grid grid-cols-4 gap-2.5 bg-emerald-950/60 p-1.5 rounded-2xl border border-emerald-900/60">
                        {[15, 25, 45, 60].map((mins) => (
                          <button
                            key={mins}
                            onClick={() => setTargetDurationMinutes(mins)}
                            className={`py-2 rounded-xl text-xs md:text-sm font-bold transition-all active:scale-95 ${
                              targetDurationMinutes === mins
                                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {mins}m
                          </button>
                        ))}
                      </div>

                      {/* Modo Estricto */}
                      <div
                        onClick={() => setStrictMode(!strictMode)}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all active:scale-[0.99] ${
                          strictMode
                            ? 'bg-emerald-900/30 border-emerald-600/60 shadow-sm shadow-emerald-500/10'
                            : 'bg-emerald-950/40 border-emerald-900/40 opacity-70'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-xl ${strictMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                            {strictMode ? <Shield className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                          </div>
                          <div className="text-left">
                            <div className="text-xs md:text-sm font-bold text-white">Modo Estricto</div>
                            <div className="text-[11px] text-slate-400">
                              {strictMode ? 'Tu planta morirá si cambias de app o pestaña' : 'Modo flexible'}
                            </div>
                          </div>
                        </div>

                        <div
                          className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                            strictMode ? 'bg-emerald-500' : 'bg-slate-700'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                              strictMode ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Botón Acción Principal */}
                      <button
                        onClick={startSession}
                        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 active:scale-[0.98] text-emerald-950 font-black rounded-2xl shadow-xl shadow-emerald-500/25 flex items-center justify-center space-x-2 text-base md:text-lg tracking-wide transition-all"
                      >
                        <Play className="w-5 h-5 fill-current" />
                        <span>PLANTAR Y ENFOCARSE</span>
                      </button>
                    </div>
                  ) : (
                    <div className="w-full flex items-center space-x-3">
                      <button
                        onClick={() => setShowExitConfirm(true)}
                        className={`flex-1 py-3.5 border active:scale-95 font-bold rounded-2xl flex items-center justify-center space-x-2 text-xs md:text-sm transition-all shadow-md ${
                          isBreak
                            ? 'bg-amber-950/40 hover:bg-amber-900/50 border-amber-800/60 text-amber-200'
                            : 'bg-red-950/40 hover:bg-red-900/50 border-red-800/60 text-red-300'
                        }`}
                      >
                        <Square className="w-4 h-4" />
                        <span>{isBreak ? 'Terminar Descanso' : 'Rendirse'}</span>
                      </button>

                      {!strictMode && (
                        <button
                          onClick={togglePause}
                          className="flex-1 py-3.5 bg-emerald-900/40 hover:bg-emerald-800/50 border border-emerald-700/60 active:scale-95 text-emerald-200 font-bold rounded-2xl flex items-center justify-center space-x-2 text-xs md:text-sm transition-all shadow-md"
                        >
                          <span>{isPaused ? 'Reanudar' : 'Pausar'}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'forest' && (
              <ForestGarden records={stats.records} />
            )}

            {activeTab === 'shop' && (
              <PlantShop
                drops={stats.drops}
                unlockedSpecies={stats.unlockedSpecies}
                onBuy={buySpecies}
                onSelectCurrent={(id) => {
                  setSelectedSpecies(id);
                  setActiveTab('timer');
                }}
                currentSelectedId={selectedSpecies}
              />
            )}
          </div>
        </main>

        {/* ============================================================== */}
        {/* NAVEGACIÓN INFERIOR PARA MÓVIL (md:hidden)                      */}
        {/* ============================================================== */}
        <nav className="flex md:hidden border-t border-emerald-900/40 bg-emerald-950/90 backdrop-blur-xl px-8 py-3 justify-around items-center shrink-0">
          <button
            onClick={() => setActiveTab('timer')}
            disabled={isRunning}
            className={`flex flex-col items-center space-y-1 py-1 px-4 rounded-xl transition-all active:scale-95 ${
              activeTab === 'timer'
                ? 'text-emerald-400 font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Timer className="w-5 h-5" />
            <span className="text-[11px] tracking-tight">Temporizador</span>
          </button>

          <button
            onClick={() => setActiveTab('forest')}
            disabled={isRunning}
            className={`flex flex-col items-center space-y-1 py-1 px-4 rounded-xl transition-all active:scale-95 ${
              activeTab === 'forest'
                ? 'text-emerald-400 font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trees className="w-5 h-5" />
            <span className="text-[11px] tracking-tight">Mi Bosque</span>
          </button>

          <button
            onClick={() => setActiveTab('shop')}
            disabled={isRunning}
            className={`flex flex-col items-center space-y-1 py-1 px-4 rounded-xl transition-all active:scale-95 ${
              activeTab === 'shop'
                ? 'text-emerald-400 font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-[11px] tracking-tight">Invernadero</span>
          </button>
        </nav>
      </div>

      {/* Modal Confirmar Rendirse / Salir del Descanso */}
      {showExitConfirm && (
        <div className="absolute inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-5 animate-in fade-in duration-150">
          <div className="bg-[#05231b] border border-red-900/60 rounded-3xl p-6 text-center max-w-xs w-full shadow-2xl">
            <div className={`w-14 h-14 rounded-full border flex items-center justify-center mx-auto mb-3 shadow-lg ${
              isBreak ? 'bg-amber-950/70 border-amber-600/40 text-amber-400' : 'bg-red-950/70 border-red-600/40 text-red-400 shadow-red-500/20'
            }`}>
              {isBreak ? <Coffee className="w-7 h-7" /> : <AlertTriangle className="w-7 h-7" />}
            </div>
            <h3 className="text-lg font-bold text-white">
              {isBreak ? '¿Terminar descanso ahora?' : '¿Seguro que te rindes?'}
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {isBreak
                ? 'Volverás al temporizador listo para comenzar tu siguiente bloque de concentración.'
                : 'Si abandonas ahora, tu planta morirá marchita y aparecerá seca en tu bosque.'}
            </p>
            <div className="grid grid-cols-2 gap-3 mt-5">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="py-3 bg-emerald-500 hover:bg-emerald-400 font-bold text-slate-950 rounded-xl text-xs active:scale-95 transition-all shadow-md shadow-emerald-500/20"
              >
                {isBreak ? 'Continuar descanso' : 'Continuar'}
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  failSession('give_up');
                }}
                className={`py-3 border font-bold rounded-xl text-xs active:scale-95 transition-all ${
                  isBreak
                    ? 'bg-amber-950/70 hover:bg-amber-900/80 border-amber-700/60 text-amber-200'
                    : 'bg-red-950/70 hover:bg-red-900/80 border-red-700/60 text-red-200'
                }`}
              >
                {isBreak ? 'Terminar' : 'Rendirme'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Menú Completo de Opciones y Ajustes */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        syncCode={syncCode}
        onApplySyncCode={applySyncCode}
        isSynced={isSynced}
        soundEnabled={soundEnabled}
        currentSoundscape={currentSoundscape}
        onChangeSoundscape={changeSoundscape}
        onToggleSound={toggleSound}
        strictMode={strictMode}
        onToggleStrictMode={() => setStrictMode(!strictMode)}
        onResetStats={resetStats}
        onForceReload={forceReloadApp}
      />

      {/* Modal de Estadísticas & Logros */}
      <AnalyticsModal
        isOpen={showAnalyticsModal}
        onClose={() => setShowAnalyticsModal(false)}
        records={stats.records}
        streakDays={stats.streakDays}
        totalMinutes={stats.totalFocusMinutes}
        unlockedAchievements={stats.unlockedAchievements || []}
      />

      {/* Modal de Sesión Completada & Modo Descanso */}
      {completedSessionData && (
        <SessionSuccessModal
          isOpen={true}
          onClose={closeSuccessModal}
          speciesId={completedSessionData.speciesId}
          tag={completedSessionData.tag}
          durationMinutes={completedSessionData.durationMinutes}
          dropsEarned={completedSessionData.dropsEarned}
          onSaveNote={(note) => saveSessionNote(note)}
          onStartBreak={startBreak}
        />
      )}
    </div>
  );
};

export default App;
