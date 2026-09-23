import React, { useState } from 'react';
import { PlantSpeciesId, PlantRecord } from '../types';
import { PLANT_SPECIES_LIST } from '../data/plants';
import { PlantIllustration } from './PlantIllustration';
import { Trees, Calendar, Info, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ForestGardenProps {
  records: PlantRecord[];
  onSelectPlant?: (record: PlantRecord) => void;
}

export const ForestGarden: React.FC<ForestGardenProps> = ({ records }) => {
  const [selectedRecord, setSelectedRecord] = useState<PlantRecord | null>(null);

  // Estadísticas rápidas
  const totalTrees = records.length;
  const aliveTrees = records.filter(r => r.completed).length;
  const wiltedTrees = records.filter(r => !r.completed).length;

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Resumen Superior */}
      <div className="bg-emerald-900/40 border border-emerald-700/50 rounded-2xl p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trees className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-slate-100 text-lg">Mi Bosque</h2>
          </div>
          <span className="text-xs bg-emerald-800/80 px-2.5 py-1 rounded-full text-emerald-200">
            {aliveTrees} florecidos / {wiltedTrees} secos
          </span>
        </div>

        {/* Barra de ratio de supervivencia */}
        {totalTrees > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Tasa de supervivencia</span>
              <span>{Math.round((aliveTrees / totalTrees) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden flex">
              <div
                className="bg-emerald-400 h-full transition-all duration-500"
                style={{ width: `${(aliveTrees / totalTrees) * 100}%` }}
              />
              <div
                className="bg-amber-600 h-full transition-all duration-500"
                style={{ width: `${(wiltedTrees / totalTrees) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Terreno / Cuadrícula de Árboles */}
      <div className="flex-1 bg-gradient-to-b from-emerald-950/60 to-emerald-900/40 border border-emerald-800/40 rounded-3xl p-4 overflow-y-auto">
        {records.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-900/40 flex items-center justify-center border border-emerald-700/30">
              <Trees className="w-8 h-8 text-emerald-500 opacity-60" />
            </div>
            <div>
              <p className="font-semibold text-slate-200">Tu bosque está esperando</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Completa tu primera sesión de enfoque para plantar tu primer espécimen aquí.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {records.map((record) => {
              const species = PLANT_SPECIES_LIST.find(s => s.id === record.speciesId) || PLANT_SPECIES_LIST[0];
              const dateStr = new Date(record.date).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric'
              });

              return (
                <button
                  key={record.id}
                  onClick={() => setSelectedRecord(record)}
                  className={`relative flex flex-col items-center p-2 rounded-2xl border transition-all active:scale-95 ${
                    record.completed
                      ? 'bg-emerald-900/20 border-emerald-800/60 hover:border-emerald-500 hover:bg-emerald-800/30'
                      : 'bg-amber-950/20 border-amber-900/50 hover:border-amber-700'
                  }`}
                >
                  <PlantIllustration
                    speciesId={record.speciesId}
                    stage={record.growthStage}
                    size={75}
                  />

                  {/* Etiqueta flotante */}
                  <div className="w-full text-center mt-1">
                    <span className="text-[10px] text-slate-300 font-medium truncate block">
                      {species.name.split(' ')[0]}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {record.durationMinutes}m • {dateStr}
                    </span>
                  </div>

                  {/* Indicador de estado */}
                  <div className="absolute top-1.5 right-1.5">
                    {record.completed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Detalle de Árbol */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-emerald-950 border border-emerald-700 rounded-3xl p-6 max-w-xs w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <PlantIllustration
                speciesId={selectedRecord.speciesId}
                stage={selectedRecord.growthStage}
                size={130}
              />

              <h3 className="text-lg font-bold text-slate-100 mt-2">
                {PLANT_SPECIES_LIST.find(s => s.id === selectedRecord.speciesId)?.name}
              </h3>

              <div className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-900/60 border border-emerald-600/40 text-emerald-300">
                <span>{selectedRecord.tag}</span>
              </div>

              <div className="w-full bg-emerald-900/30 border border-emerald-800/40 rounded-xl p-3 mt-4 space-y-2 text-left text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tiempo enfocado:</span>
                  </span>
                  <span className="font-semibold text-slate-100">{selectedRecord.durationMinutes} minutos</span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Fecha:</span>
                  </span>
                  <span className="text-slate-100">
                    {new Date(selectedRecord.date).toLocaleDateString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: 'numeric',
                      month: 'short'
                    })}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center space-x-1.5">
                    <Info className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Resultado:</span>
                  </span>
                  <span className={selectedRecord.completed ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                    {selectedRecord.completed ? 'Completado con éxito' : 'Marchitado'}
                  </span>
                </div>

                {selectedRecord.notes && (
                  <p className="text-[11px] text-amber-300/80 italic pt-1 border-t border-emerald-800/40">
                    {selectedRecord.notes}
                  </p>
                )}
              </div>

              <button
                onClick={() => setSelectedRecord(null)}
                className="mt-5 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-slate-900 font-bold rounded-xl transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
