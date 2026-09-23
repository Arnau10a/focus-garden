import React from 'react';
import { PlantSpeciesId } from '../types';
import { PLANT_SPECIES_LIST } from '../data/plants';
import { PlantIllustration } from './PlantIllustration';
import { Droplet, ShoppingBag, Check, Lock } from 'lucide-react';

interface PlantShopProps {
  drops: number;
  unlockedSpecies: PlantSpeciesId[];
  onBuy: (speciesId: PlantSpeciesId, cost: number) => boolean;
  onSelectCurrent: (speciesId: PlantSpeciesId) => void;
  currentSelectedId: PlantSpeciesId;
}

export const PlantShop: React.FC<PlantShopProps> = ({
  drops,
  unlockedSpecies,
  onBuy,
  onSelectCurrent,
  currentSelectedId
}) => {
  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Cabecera Tienda */}
      <div className="bg-emerald-900/40 border border-emerald-700/50 rounded-2xl p-4 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <ShoppingBag className="w-5 h-5 text-emerald-400" />
          <h2 className="font-bold text-slate-100 text-lg">Invernadero y Semillas</h2>
        </div>
        <div className="flex items-center space-x-1.5 bg-sky-950/80 border border-sky-600/50 px-3 py-1 rounded-full">
          <Droplet className="w-4 h-4 text-sky-400 fill-sky-400" />
          <span className="font-bold text-sky-200 text-sm">{drops}</span>
        </div>
      </div>

      {/* Grid de Especies Desbloqueables */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {PLANT_SPECIES_LIST.map((species) => {
          const isUnlocked = unlockedSpecies.includes(species.id);
          const isSelected = currentSelectedId === species.id;
          const canAfford = drops >= species.cost;

          return (
            <div
              key={species.id}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                isSelected
                  ? 'bg-emerald-800/40 border-emerald-400 ring-1 ring-emerald-400/50'
                  : isUnlocked
                  ? 'bg-emerald-950/60 border-emerald-800/60 hover:border-emerald-600'
                  : 'bg-slate-900/40 border-slate-800 opacity-90'
              }`}
            >
              {/* Ilustración & Info */}
              <div className="flex items-center space-x-3.5">
                <div className="w-16 h-16 rounded-xl bg-emerald-950/80 border border-emerald-800/40 flex items-center justify-center p-1 shrink-0">
                  <PlantIllustration
                    speciesId={species.id}
                    stage={isUnlocked ? 'mature' : 'growing'}
                    size={60}
                  />
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-sm text-slate-100">{species.name}</h3>
                    {isSelected && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-md font-semibold">
                        En uso
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-tight max-w-[180px] sm:max-w-xs">
                    {species.tagline}
                  </p>
                </div>
              </div>

              {/* Botón de Acción */}
              <div className="shrink-0 pl-2">
                {isUnlocked ? (
                  <button
                    onClick={() => onSelectCurrent(species.id)}
                    disabled={isSelected}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950'
                    }`}
                  >
                    {isSelected ? (
                      <span className="flex items-center space-x-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Equipado</span>
                      </span>
                    ) : (
                      'Plantar'
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => onBuy(species.id, species.cost)}
                    disabled={!canAfford}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                      canAfford
                        ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md shadow-sky-500/20'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? (
                      <>
                        <Droplet className="w-3.5 h-3.5 fill-current" />
                        <span>{species.cost}</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3" />
                        <span>{species.cost} gotas</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
