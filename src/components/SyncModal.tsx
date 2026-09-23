import React, { useState } from 'react';
import { Cloud, Check, Copy, Key, Sparkles, X } from 'lucide-react';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncCode: string;
  onApplySyncCode: (code: string) => void;
  isSynced: boolean;
}

export const SyncModal: React.FC<SyncModalProps> = ({
  isOpen,
  onClose,
  syncCode,
  onApplySyncCode,
  isSynced
}) => {
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);

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
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-5 animate-in fade-in duration-150">
      <div className="bg-[#05231b] border border-emerald-700/60 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-emerald-950/60"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2.5 text-emerald-400 mb-2">
          <Cloud className="w-6 h-6" />
          <h3 className="text-base font-bold text-white">Sincronizar Dispositivos</h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed mb-5">
          Conecta tu PC y tu móvil con un código único para compartir el mismo bosque, árboles y gotas en tiempo real.
        </p>

        {/* Tu código actual */}
        <div className="bg-emerald-950/70 border border-emerald-800/60 rounded-2xl p-4 mb-5">
          <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
            <span>Tu ID de Sincronización:</span>
            {isSynced && (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                Conectado
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xl font-black text-emerald-300 tracking-wider">
              {syncCode}
            </span>
            <button
              onClick={handleCopy}
              className="p-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-700/60 text-slate-200 active:scale-95 transition-all"
              title="Copiar código"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Vincular otro dispositivo */}
        <form onSubmit={handleConnect} className="space-y-3">
          <label className="text-xs font-semibold text-slate-300 block">
            ¿Quieres vincularte al código de tu otro equipo?
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="EJ: FG-8392"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              className="flex-1 bg-emerald-950/80 border border-emerald-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-mono tracking-wider uppercase"
            />
            <button
              type="submit"
              disabled={!inputCode.trim()}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs active:scale-95 transition-all shadow-md shadow-emerald-500/20"
            >
              Vincular
            </button>
          </div>
        </form>

        <p className="text-[10px] text-slate-400 mt-4 leading-normal italic">
          Cualquier sesión que completes en el móvil o en el PC se reflejará en ambos equipos automáticamente.
        </p>
      </div>
    </div>
  );
};
