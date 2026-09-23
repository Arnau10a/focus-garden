import React, { useState } from 'react';
import { PlantIllustration } from './PlantIllustration';
import { PlantSpeciesId, SessionTag } from '../types';
import { PLANT_SPECIES_LIST } from '../data/plants';
import { Sparkles, FileText, Check, Coffee } from 'lucide-react';

interface SessionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  speciesId: PlantSpeciesId;
  tag: SessionTag;
  durationMinutes: number;
  dropsEarned: number;
  onSaveNote: (note: string) => void;
  onStartBreak: (breakMinutes: number) => void;
}

export const SessionSuccessModal: React.FC<SessionSuccessModalProps> = ({
  isOpen,
  onClose,
  speciesId,
  tag,
  durationMinutes,
  dropsEarned,
  onSaveNote,
  onStartBreak
}) => {
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const species = PLANT_SPECIES_LIST.find(s => s.id === speciesId) || PLANT_SPECIES_LIST[0];

  const handleFinish = () => {
    if (note.trim()) {
      onSaveNote(note.trim());
    }
    onClose();
  };

  const handleBreak = (mins: number) => {
    if (note.trim()) {
      onSaveNote(note.trim());
    }
    onStartBreak(mins);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-[#05231b] border border-emerald-600/60 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4">
        {/* Cabecera festiva */}
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>¡Sesión completada con éxito!</span>
        </div>

        {/* Ilustración de la planta florecida */}
        <div className="flex justify-center py-1">
          <PlantIllustration speciesId={speciesId} stage="mature" size={150} />
        </div>

        <div>
          <h3 className="text-xl font-black text-white">{species.name}</h3>
          <p className="text-xs text-slate-300 mt-1">
            Has ganado <b className="text-sky-300">+{dropsEarned} gotas</b> por {durationMinutes} min de {tag}.
          </p>
        </div>

        {/* 6. Nota de Sesión (Journaling) */}
        <div className="text-left space-y-1.5 pt-2 border-t border-emerald-800/40">
          <label className="text-[11px] font-bold text-slate-300 flex items-center space-x-1.5">
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Nota de sesión (opcional):</span>
          </label>
          <input
            type="text"
            placeholder="¿En qué has avanzado hoy?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-emerald-950/80 border border-emerald-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
          />
        </div>

        {/* 1. Opciones de Descanso Pomodoro */}
        <div className="space-y-2 pt-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleBreak(5)}
              className="py-2.5 px-3 bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-700/60 rounded-xl text-xs font-bold text-emerald-200 flex items-center justify-center space-x-1.5 active:scale-95 transition-all"
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Descanso 5m</span>
            </button>
            <button
              onClick={() => handleBreak(15)}
              className="py-2.5 px-3 bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-700/60 rounded-xl text-xs font-bold text-emerald-200 flex items-center justify-center space-x-1.5 active:scale-95 transition-all"
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Descanso 15m</span>
            </button>
          </div>

          <button
            onClick={handleFinish}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs active:scale-95 transition-all shadow-md shadow-emerald-500/20"
          >
            Guardar y Volver
          </button>
        </div>
      </div>
    </div>
  );
};
