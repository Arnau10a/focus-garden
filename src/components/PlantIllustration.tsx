import React from 'react';
import { PlantSpeciesId, GrowthStage } from '../types';

interface PlantIllustrationProps {
  speciesId: PlantSpeciesId;
  stage: GrowthStage;
  className?: string;
  size?: number;
}

export const PlantIllustration: React.FC<PlantIllustrationProps> = ({
  speciesId,
  stage,
  className = '',
  size = 220
}) => {
  // Maceta estética de arcilla terracota con textura y plato
  const renderPot = (accentColor = '#c2410c') => (
    <g>
      {/* Sombra suave en el suelo */}
      <ellipse cx="110" cy="194" rx="55" ry="12" fill="#021c14" opacity="0.6" />
      {/* Plato base */}
      <ellipse cx="110" cy="186" rx="42" ry="7" fill="#7c2d12" />
      {/* Cuerpo cónico de la maceta */}
      <path
        d="M74 140 L146 140 L136 186 L84 186 Z"
        fill="url(#potGrad)"
        stroke="#451a03"
        strokeWidth="2.5"
      />
      {/* Borde superior de la maceta con volumen */}
      <rect x="68" y="128" width="84" height="15" rx="5" fill="#ea580c" stroke="#451a03" strokeWidth="2.5" />
      {/* Brillo highlight de la maceta */}
      <path d="M78 132 L142 132" stroke="#fdba74" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      {/* Tierra húmeda rica en nutrientes */}
      <ellipse cx="110" cy="131" rx="38" ry="6" fill="#27150a" />
      <ellipse cx="110" cy="132" rx="32" ry="4" fill="#3f1d0b" />
    </g>
  );

  // Estado marchito
  if (stage === 'wilted') {
    return (
      <svg width={size} height={size} viewBox="0 0 220 220" className={`transition-all duration-700 ${className}`}>
        <defs>
          <linearGradient id="potGradWilt" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#78350f" />
            <stop offset="100%" stop-color="#451a03" />
          </linearGradient>
        </defs>
        <ellipse cx="110" cy="194" rx="55" ry="12" fill="#000000" opacity="0.5" />
        <path d="M74 140 L146 140 L136 186 L84 186 Z" fill="url(#potGradWilt)" stroke="#291205" strokeWidth="2" />
        <rect x="68" y="128" width="84" height="15" rx="5" fill="#5c2b09" stroke="#291205" strokeWidth="2" />
        <ellipse cx="110" cy="131" rx="38" ry="6" fill="#1c0d06" />

        {/* Tallo marchito retorcido y grisáceo */}
        <path d="M110 128 Q100 95 65 88 Q95 90 85 55" stroke="#713f12" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M85 95 Q125 90 145 110" stroke="#713f12" strokeWidth="4.5" fill="none" strokeLinecap="round" />
        {/* Hojas secas caídas */}
        <ellipse cx="62" cy="92" rx="10" ry="4.5" fill="#a16207" transform="rotate(35 62 92)" />
        <ellipse cx="148" cy="115" rx="9" ry="4" fill="#854d0e" transform="rotate(-35 148 115)" />
        <ellipse cx="125" cy="190" rx="7" ry="3.5" fill="#713f12" transform="rotate(18 125 190)" />
      </svg>
    );
  }

  // Gradients comunes para las especies
  const defs = (
    <defs>
      <linearGradient id="potGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ea580c" />
        <stop offset="60%" stop-color="#c2410c" />
        <stop offset="100%" stop-color="#9a3412" />
      </linearGradient>
      <linearGradient id="stemGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#22c55e" />
        <stop offset="100%" stop-color="#15803d" />
      </linearGradient>
      <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#4ade80" />
        <stop offset="100%" stop-color="#16a34a" />
      </linearGradient>
      <linearGradient id="sakuraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fbcfe8" />
        <stop offset="50%" stop-color="#f472b6" />
        <stop offset="100%" stop-color="#db2777" />
      </linearGradient>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fef08a" />
        <stop offset="50%" stop-color="#facc15" />
        <stop offset="100%" stop-color="#ca8a04" />
      </linearGradient>
      <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
  );

  // Etapa 1: Semilla brillante con brotecito despertando
  if (stage === 'seed') {
    return (
      <svg width={size} height={size} viewBox="0 0 220 220" className={className}>
        {defs}
        {renderPot()}
        {/* Montículo suave de tierra fértil */}
        <ellipse cx="110" cy="130" rx="22" ry="7" fill="#451a03" />
        {/* Aura suave de vida */}
        <circle cx="110" cy="122" r="16" fill="#34d399" opacity="0.25" className="animate-pulse" />
        {/* Semilla mágica dorada */}
        <ellipse cx="110" cy="125" rx="8" ry="6" fill="url(#goldGrad)" stroke="#a16207" strokeWidth="1.5" />
        {/* Pequeño ápice verde naciendo */}
        <path d="M110 120 Q112 110 115 106" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" />
        <circle cx="115" cy="105" r="2.5" fill="#86efac" />
      </svg>
    );
  }

  // Etapa 2: Brote tierno con dos hojas saludables y rocío
  if (stage === 'sprout') {
    return (
      <svg width={size} height={size} viewBox="0 0 220 220" className={`plant-sway ${className}`}>
        {defs}
        {renderPot()}
        {/* Tallo curvo natural */}
        <path d="M110 130 Q110 105 108 90" stroke="url(#stemGrad)" strokeWidth="5.5" strokeLinecap="round" />
        {/* Hoja izquierda llena de vida */}
        <path d="M109 100 C90 85 75 98 80 110 C92 114 105 105 109 100 Z" fill="url(#leafGrad)" stroke="#15803d" strokeWidth="1" />
        {/* Hoja derecha */}
        <path d="M108 95 C126 80 140 92 135 105 C122 110 110 100 108 95 Z" fill="url(#leafGrad)" stroke="#15803d" strokeWidth="1" />
        {/* Brillo rocío de la mañana */}
        <circle cx="85" cy="100" r="2.5" fill="#ffffff" opacity="0.9" />
        <circle cx="128" cy="96" r="2" fill="#ffffff" opacity="0.9" />
      </svg>
    );
  }

  const isMature = stage === 'mature';

  // Render según la especie para etapas 'growing' y 'mature'
  switch (speciesId) {
    case 'sakura':
      return (
        <svg width={size} height={size} viewBox="0 0 220 220" className={`plant-sway ${className}`}>
          {defs}
          {renderPot()}
          {/* Tronco estilizado de cerezo */}
          <path
            d={isMature ? "M110 130 C105 95 90 75 98 50" : "M110 130 C108 105 98 88 102 75"}
            stroke="#5c2b09"
            strokeWidth={isMature ? "10" : "7"}
            fill="none"
            strokeLinecap="round"
          />
          {isMature && (
            <>
              <path d="M102 85 Q75 75 58 78" stroke="#5c2b09" strokeWidth="6" fill="none" strokeLinecap="round" />
              <path d="M100 70 Q130 55 152 65" stroke="#5c2b09" strokeWidth="6" fill="none" strokeLinecap="round" />
            </>
          )}
          {/* Copa exuberante de Sakura */}
          <g filter={isMature ? "url(#softGlow)" : undefined}>
            <circle cx="95" cy={isMature ? "42" : "68"} r={isMature ? "36" : "22"} fill="url(#sakuraGrad)" opacity="0.95" />
            <circle cx={isMature ? "60" : "80"} cy={isMature ? "72" : "78"} r={isMature ? "28" : "18"} fill="#f472b6" opacity="0.92" />
            <circle cx={isMature ? "148" : "120"} cy={isMature ? "60" : "70"} r={isMature ? "30" : "19"} fill="#f9a8d4" opacity="0.95" />
            <circle cx="112" cy={isMature ? "28" : "55"} r={isMature ? "30" : "18"} fill="#fbcfe8" />
            {/* Pequeños pétalos de flor flotantes */}
            <circle cx="42" cy="92" r="3.5" fill="#fbcfe8" />
            <circle cx="168" cy="96" r="4" fill="#f472b6" />
            <circle cx="132" cy="115" r="3" fill="#fbcfe8" />
          </g>
        </svg>
      );

    case 'bonsai':
      return (
        <svg width={size} height={size} viewBox="0 0 220 220" className={`plant-sway ${className}`}>
          {defs}
          {/* Maceta japonesa ancha estilo Zen */}
          <ellipse cx="110" cy="192" rx="65" ry="13" fill="#000000" opacity="0.5" />
          <path d="M48 152 L172 152 L160 185 L60 185 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="3" />
          <rect x="42" y="146" width="136" height="9" rx="2" fill="#334155" />
          <ellipse cx="110" cy="148" rx="58" ry="5" fill="#3f2e1a" />
          {/* Tronco retorcido de arte bonsái */}
          <path
            d={isMature ? "M110 150 C95 125 140 105 105 75 C88 60 110 42 120 38" : "M110 150 C100 130 125 110 105 90"}
            stroke="#451a03"
            strokeWidth={isMature ? "12" : "7"}
            fill="none"
            strokeLinecap="round"
          />
          {/* Nubes verdes zen en capas */}
          <ellipse cx={isMature ? "75" : "90"} cy={isMature ? "78" : "95"} rx={isMature ? "34" : "22"} ry={isMature ? "17" : "11"} fill="#15803d" />
          <ellipse cx={isMature ? "145" : "125"} cy={isMature ? "55" : "80"} rx={isMature ? "38" : "24"} ry={isMature ? "19" : "12"} fill="#166534" />
          {isMature && (
            <ellipse cx="118" cy="32" rx="42" ry="20" fill="#22c55e" filter="url(#softGlow)" />
          )}
        </svg>
      );

    case 'sunflower':
      return (
        <svg width={size} height={size} viewBox="0 0 220 220" className={`plant-sway ${className}`}>
          {defs}
          {renderPot()}
          {/* Tallo robusto */}
          <path d={isMature ? "M110 130 L110 58" : "M110 130 L110 88"} stroke="#15803d" strokeWidth="7" strokeLinecap="round" />
          {/* Hojas aterciopeladas */}
          <ellipse cx="85" cy="110" rx="22" ry="10" fill="#16a34a" transform="rotate(-25 85 110)" />
          <ellipse cx="135" cy="98" rx="24" ry="11" fill="#16a34a" transform="rotate(25 135 98)" />
          {/* Flor de Girasol majestuosa */}
          <g transform={`translate(110, ${isMature ? 52 : 82})`} filter={isMature ? "url(#softGlow)" : undefined}>
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <ellipse
                key={deg}
                cx="0"
                cy={isMature ? "-34" : "-20"}
                rx={isMature ? "8.5" : "5"}
                ry={isMature ? "20" : "12"}
                fill="url(#goldGrad)"
                stroke="#ca8a04"
                strokeWidth="1.2"
                transform={`rotate(${deg})`}
              />
            ))}
            <circle cx="0" cy="0" r={isMature ? "22" : "13"} fill="#713f12" stroke="#451a03" strokeWidth="2.5" />
            <circle cx="0" cy="0" r={isMature ? "15" : "9"} fill="#854d0e" />
          </g>
        </svg>
      );

    case 'cactus':
      return (
        <svg width={size} height={size} viewBox="0 0 220 220" className={`plant-sway ${className}`}>
          {defs}
          {renderPot()}
          {/* Cuerpo suculento */}
          <rect
            x={isMature ? "90" : "97"}
            y={isMature ? "48" : "78"}
            width={isMature ? "40" : "26"}
            height={isMature ? "85" : "55"}
            rx={isMature ? "20" : "13"}
            fill="#059669"
            stroke="#064e3b"
            strokeWidth="3.5"
          />
          {isMature && (
            <>
              {/* Brazos laterales */}
              <path d="M92 100 L68 100 L68 70" stroke="#059669" strokeWidth="15" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M128 88 L152 88 L152 58" stroke="#059669" strokeWidth="15" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              {/* Flor de cactus rosa desierto */}
              <circle cx="110" cy="42" r="11" fill="#f43f5e" filter="url(#softGlow)" />
              <circle cx="110" cy="42" r="5" fill="#fef08a" />
            </>
          )}
          {/* Espinas doradas */}
          <line x1="96" y1="72" x2="90" y2="70" stroke="#fef08a" strokeWidth="2.5" />
          <line x1="124" y1="84" x2="130" y2="82" stroke="#fef08a" strokeWidth="2.5" />
          <line x1="104" y1="108" x2="100" y2="105" stroke="#fef08a" strokeWidth="2.5" />
        </svg>
      );

    case 'mushroom':
      return (
        <svg width={size} height={size} viewBox="0 0 220 220" className={`plant-sway ${className}`}>
          {defs}
          <ellipse cx="110" cy="194" rx="55" ry="12" fill="#021c14" opacity="0.6" />
          <ellipse cx="110" cy="186" rx="42" ry="7" fill="#1e1b4b" />
          <path d="M74 140 L146 140 L136 186 L84 186 Z" fill="#1e1b4b" stroke="#0f172a" strokeWidth="2.5" />
          <rect x="68" y="128" width="84" height="15" rx="5" fill="#312e81" stroke="#0f172a" strokeWidth="2.5" />
          <ellipse cx="110" cy="131" rx="38" ry="6" fill="#0f172a" />
          {/* Tallo del hongo místico */}
          <path d="M102 135 L106 82 C106 75 114 75 114 82 L118 135 Z" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2.5" />
          {/* Sombrero mágico violeta */}
          <path
            d={isMature ? "M52 86 C52 35 168 35 168 86 Z" : "M75 96 C75 58 145 58 145 96 Z"}
            fill="#7c3aed"
            stroke="#5b21b6"
            strokeWidth="3.5"
            filter={isMature ? "url(#softGlow)" : undefined}
          />
          {/* Lunares brillantes */}
          <circle cx="110" cy={isMature ? "50" : "68"} r={isMature ? "9" : "5"} fill="#ede9fe" />
          <circle cx={isMature ? "80" : "92"} cy={isMature ? "72" : "80"} r={isMature ? "7" : "4.5"} fill="#ede9fe" />
          <circle cx={isMature ? "140" : "128"} cy={isMature ? "70" : "78"} r={isMature ? "8" : "4.5"} fill="#ede9fe" />
        </svg>
      );

    case 'pine':
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 220 220" className={`plant-sway ${className}`}>
          {defs}
          {renderPot()}
          {/* Tronco de madera noble */}
          <rect x="103" y="112" width="14" height="26" fill="#78350f" stroke="#451a03" strokeWidth="2.5" rx="2" />
          {/* Follaje del pino en capas piramidales */}
          {isMature ? (
            <g filter="url(#softGlow)">
              <polygon points="110,18 156,70 64,70" fill="#047857" stroke="#064e3b" strokeWidth="2.5" />
              <polygon points="110,48 168,98 52,98" fill="#059669" stroke="#064e3b" strokeWidth="2.5" />
              <polygon points="110,76 180,126 40,126" fill="#10b981" stroke="#064e3b" strokeWidth="2.5" />
              {/* Estrella dorada en la cima del pino florecido */}
              <polygon points="110,8 113,16 122,16 115,22 118,30 110,25 102,30 105,22 98,16 107,16" fill="url(#goldGrad)" />
            </g>
          ) : (
            <g>
              <polygon points="110,50 144,90 76,90" fill="#047857" stroke="#064e3b" strokeWidth="2" />
              <polygon points="110,80 156,122 64,122" fill="#059669" stroke="#064e3b" strokeWidth="2" />
            </g>
          )}
        </svg>
      );
  }
};
