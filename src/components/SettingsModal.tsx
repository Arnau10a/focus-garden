import React, { useState } from 'react';
import {
  Settings,
  Cloud,
  Volume2,
  VolumeX,
  Shield,
  Trash2,
  Sparkles,
  Smartphone,
  Copy,
  Check,
  RotateCcw,
  Info,
  X,
  Bell
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncCode: string;
  onApplySyncCode: (code: string) => void;
  isSynced: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  strictMode: boolean;
  onToggleStrictMode: () => void;
  onResetStats: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  syncCode,
  onApplySyncCode,
  isSynced,
  soundEnabled,
  onToggleSound,
  strictMode,
  onToggleStrictMode,
  onResetStats
}) => {
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(syncCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim()) {
      onApplySyncCode(inputCode.trim().toUpperCase());
      setInputCode('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-[#05231b] border border-emerald-700/60 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabecera del Menú de Ajustes */}
        <div className="px-6 py-4 border-b border-emerald-900/40 flex items-center justify-between bg-emerald-950/60 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-none">Ajustes y Opciones</h2>
              <span className="text-[11px] text-emerald-400/80">Personaliza tu FocusGarden</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-emerald-900/40 hover:bg-emerald-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* SECCIÓN 1: SINCRONIZACIÓN EN LA NUBE */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
              <Cloud className="w-4 h-4 text-sky-400" />
              <span>Sincronización en la Nube (PC & Móvil)</span>
            </h3>

            <div className="bg-emerald-950/70 border border-emerald-800/60 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Tu ID de Sincronización:</span>
                {isSynced && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                    Conectado
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-800/40">
                <span className="font-mono text-lg font-black text-emerald-300 tracking-wider">
                  {syncCode}
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-800/60 hover:bg-emerald-700 border border-emerald-600/40 text-xs text-slate-200 active:scale-95 transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>

              {/* Formulario para enlazar con el código de otro dispositivo */}
              <form onSubmit={handleConnect} className="pt-2 border-t border-emerald-800/40 space-y-2">
                <label className="text-[11px] text-slate-400 block">
                  Vincular con el ID de tu otro dispositivo:
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="EJ: FG-4892"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    className="flex-1 bg-emerald-950/80 border border-emerald-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-mono tracking-wider uppercase"
                  />
                  <button
                    type="submit"
                    disabled={!inputCode.trim()}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs active:scale-95 transition-all"
                  >
                    Vincular
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* SECCIÓN 2: PREFERENCIAS DE ENFOQUE */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Preferencias de Sesión</span>
            </h3>

            <div className="bg-emerald-950/70 border border-emerald-800/60 rounded-2xl divide-y divide-emerald-800/40">
              {/* Sonido Zen de Lluvia */}
              <div
                onClick={onToggleSound}
                className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-emerald-900/20 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl ${soundEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Paisaje Sonoro (Lluvia Zen)</div>
                    <div className="text-[11px] text-slate-400">Sonido ambiente suave durante el enfoque</div>
                  </div>
                </div>
                <div className={`w-9 h-5 rounded-full p-0.5 transition-colors ${soundEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${soundEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>

              {/* Modo Estricto por Defecto */}
              <div
                onClick={onToggleStrictMode}
                className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-emerald-900/20 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl ${strictMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Modo Estricto Antidistracciones</div>
                    <div className="text-[11px] text-slate-400">Penaliza el árbol si sales de la aplicación</div>
                  </div>
                </div>
                <div className={`w-9 h-5 rounded-full p-0.5 transition-colors ${strictMode ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${strictMode ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: INFORMACIÓN Y GESTIÓN */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
              <Info className="w-4 h-4 text-emerald-400" />
              <span>Acerca de & Datos</span>
            </h3>

            <div className="bg-emerald-950/70 border border-emerald-800/60 rounded-2xl p-4 space-y-3 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Versión:</span>
                <span className="font-mono text-emerald-400 font-bold">FocusGarden 1.2.1 (PWA)</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Almacenamiento:</span>
                <span className="text-slate-400">Local + Nube Supabase</span>
              </div>

              {/* Botón de Reiniciar / Borrar Datos */}
              <div className="pt-2 border-t border-emerald-800/40">
                {!showConfirmReset ? (
                  <button
                    onClick={() => setShowConfirmReset(true)}
                    className="w-full flex items-center justify-center space-x-2 py-2 text-xs font-bold text-red-400/80 hover:text-red-300 hover:bg-red-950/30 rounded-xl transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Restablecer estadísticas de sesión</span>
                  </button>
                ) : (
                  <div className="p-3 bg-red-950/50 border border-red-800/60 rounded-xl space-y-2 text-center">
                    <p className="text-[11px] text-red-200">¿Estás seguro de borrar todos los árboles y gotas?</p>
                    <div className="flex space-x-2 justify-center">
                      <button
                        onClick={() => {
                          onResetStats();
                          setShowConfirmReset(false);
                          onClose();
                        }}
                        className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold"
                      >
                        Sí, borrar todo
                      </button>
                      <button
                        onClick={() => setShowConfirmReset(false)}
                        className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-emerald-950/80 border-t border-emerald-900/40 text-center shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs active:scale-95 transition-all shadow-md shadow-emerald-500/20"
          >
            Guardar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
