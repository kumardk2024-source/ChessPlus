import React from 'react';
import { useTheme } from '../context/ThemeContext';

export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type PieceColor = 'w' | 'b';

interface ChessPieceProps {
  type: PieceType;
  color: PieceColor;
  className?: string;
  size?: number | string;
  themeOverride?: 'normal' | 'dark' | 'futuristic';
}

/**
 * Premium Chess Pieces with Dual Style Engine:
 * 1. Classic 3D Style (जब Normal / Dark चुना हो):
 *    - White: Silver / Pearl Chrome with polished metallic bevels & specular highlights
 *    - Black: 3D Obsidian Gunmetal with volumetric shading & rim accents
 *    - Realistic sculpted Knight (घोड़ा) bust
 * 
 * 2. Futuristic Neo-Cyber Sci-Fi Style (जब Futuristic मोड चालू हो):
 *    - White: Brushed Cryo-Titanium armor with glowing electric cyan neon circuit conduits
 *    - Black: Carbon Void stealth alloy with pulsing cyber-gold/amber plasma conduits
 *    - Mecha-stylized contours, angular laser-cut bevels & glowing energy core
 */
export const ChessPiece: React.FC<ChessPieceProps> = ({
  type,
  color,
  className = '',
  size = '100%',
  themeOverride,
}) => {
  const { theme } = useTheme();
  const activeTheme = themeOverride || theme;
  const isFuturistic = activeTheme === 'futuristic';

  const isWhite = color === 'w';
  const idPrefix = `${color}-${type}-${isFuturistic ? 'futuristic' : 'classic'}`;

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`select-none filter ${
        isFuturistic
          ? isWhite
            ? 'drop-shadow-[0_8px_14px_rgba(6,182,212,0.45)]'
            : 'drop-shadow-[0_8px_14px_rgba(245,158,11,0.35)]'
          : 'drop-shadow-[0_8px_10px_rgba(0,0,0,0.55)]'
      } ${className}`}
      aria-label={`${isWhite ? 'White' : 'Black'} ${type}`}
    >
      <defs>
        {isFuturistic ? (
          <>
            {/* ================= Futuristic Cryo-Titanium (White Pieces) ================= */}
            <linearGradient id={`${idPrefix}-fut-body`} x1="15%" y1="0%" x2="85%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="18%" stopColor="#e0f2fe" />
              <stop offset="45%" stopColor="#bae6fd" />
              <stop offset="70%" stopColor="#7dd3fc" />
              <stop offset="90%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>

            <linearGradient id={`${idPrefix}-fut-pedestal`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0369a1" />
              <stop offset="25%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="75%" stopColor="#7dd3fc" />
              <stop offset="100%" stopColor="#0c4a6e" />
            </linearGradient>

            <linearGradient id={`${idPrefix}-fut-highlight`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="35%" stopColor="#e0f2fe" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" />
            </linearGradient>

            {/* ================= Futuristic Carbon Void & Amber Neon (Black Pieces) ================= */}
            <linearGradient id={`${idPrefix}-fut-dark-body`} x1="15%" y1="0%" x2="85%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="20%" stopColor="#1e293b" />
              <stop offset="45%" stopColor="#0f172a" />
              <stop offset="75%" stopColor="#090d16" />
              <stop offset="90%" stopColor="#1e1b4b" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>

            <linearGradient id={`${idPrefix}-fut-dark-pedestal`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#090d16" />
              <stop offset="25%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#475569" />
              <stop offset="75%" stopColor="#334155" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>

            <linearGradient id={`${idPrefix}-fut-dark-highlight`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
              <stop offset="40%" stopColor="#d97706" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.05" />
            </linearGradient>
          </>
        ) : (
          <>
            {/* ================= Classic White (Silver Chrome) Gradients ================= */}
            <linearGradient id={`${idPrefix}-chrome-body`} x1="15%" y1="0%" x2="85%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="20%" stopColor="#f1f5f9" />
              <stop offset="42%" stopColor="#cbd5e1" />
              <stop offset="58%" stopColor="#94a3b8" />
              <stop offset="80%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>

            <linearGradient id={`${idPrefix}-chrome-highlight`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="40%" stopColor="#f8fafc" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.1" />
            </linearGradient>

            <linearGradient id={`${idPrefix}-chrome-pedestal`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="25%" stopColor="#e2e8f0" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="75%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>

            {/* ================= Classic Black (3D Obsidian Gunmetal) Gradients ================= */}
            <linearGradient id={`${idPrefix}-obsidian-body`} x1="15%" y1="0%" x2="85%" y2="100%">
              <stop offset="0%" stopColor="#525b6c" />
              <stop offset="18%" stopColor="#3d4452" />
              <stop offset="42%" stopColor="#22262f" />
              <stop offset="68%" stopColor="#15181f" />
              <stop offset="85%" stopColor="#282e3a" />
              <stop offset="100%" stopColor="#0d0f13" />
            </linearGradient>

            <linearGradient id={`${idPrefix}-obsidian-highlight`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.85" />
              <stop offset="35%" stopColor="#64748b" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#1e293b" stopOpacity="0.05" />
            </linearGradient>

            <linearGradient id={`${idPrefix}-obsidian-pedestal`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1a1e26" />
              <stop offset="25%" stopColor="#3d4452" />
              <stop offset="50%" stopColor="#64748b" />
              <stop offset="75%" stopColor="#282e3a" />
              <stop offset="100%" stopColor="#12151b" />
            </linearGradient>
          </>
        )}
      </defs>

      {/* Render the piece geometry according to theme */}
      {renderPieceSvg(type, isWhite, idPrefix, isFuturistic)}
    </svg>
  );
};

function renderPieceSvg(
  type: PieceType,
  isWhite: boolean,
  idPrefix: string,
  isFuturistic: boolean
) {
  let bodyGrad: string;
  let pedGrad: string;
  let innerShine: string;
  let rimStroke: string;
  let rimWidth: string;
  let darkDetail: string;
  let specularColor: string;
  let neonGlowColor: string;

  if (isFuturistic) {
    if (isWhite) {
      bodyGrad = `url(#${idPrefix}-fut-body)`;
      pedGrad = `url(#${idPrefix}-fut-pedestal)`;
      innerShine = `url(#${idPrefix}-fut-highlight)`;
      rimStroke = '#38bdf8';
      rimWidth = '1.3';
      darkDetail = '#0284c7';
      specularColor = '#ffffff';
      neonGlowColor = '#00e5ff';
    } else {
      bodyGrad = `url(#${idPrefix}-fut-dark-body)`;
      pedGrad = `url(#${idPrefix}-fut-dark-pedestal)`;
      innerShine = `url(#${idPrefix}-fut-dark-highlight)`;
      rimStroke = '#f59e0b';
      rimWidth = '1.3';
      darkDetail = '#020617';
      specularColor = '#fef08a';
      neonGlowColor = '#f59e0b';
    }
  } else {
    bodyGrad = isWhite ? `url(#${idPrefix}-chrome-body)` : `url(#${idPrefix}-obsidian-body)`;
    pedGrad = isWhite ? `url(#${idPrefix}-chrome-pedestal)` : `url(#${idPrefix}-obsidian-pedestal)`;
    innerShine = isWhite ? `url(#${idPrefix}-chrome-highlight)` : `url(#${idPrefix}-obsidian-highlight)`;
    rimStroke = isWhite ? '#ffffff' : '#7e8b9f';
    rimWidth = isWhite ? '1.1' : '1.3';
    darkDetail = isWhite ? '#475569' : '#08090d';
    specularColor = isWhite ? '#ffffff' : '#cbd5e1';
    neonGlowColor = 'transparent';
  }

  switch (type) {
    case 'p': // Pawn
      return (
        <g>
          {/* Base bottom ring */}
          <ellipse cx="50" cy="86" rx="27" ry="6.5" fill={pedGrad} stroke={rimStroke} strokeWidth={rimWidth} />
          {/* Base tier */}
          <path
            d="M25 86 C25 79, 32 76, 35 74 L65 74 C68 76, 75 79, 75 86 Z"
            fill={bodyGrad}
            stroke={rimStroke}
            strokeWidth={rimWidth}
          />
          {/* Mid collar ring */}
          <ellipse cx="50" cy="74" rx="17" ry="3.5" fill={pedGrad} stroke={rimStroke} strokeWidth={rimWidth} />
          {/* Body stem */}
          <path
            d="M36 74 C36 59, 41 51, 42 45 L58 45 C59 51, 64 59, 64 74 Z"
            fill={bodyGrad}
            stroke={rimStroke}
            strokeWidth={rimWidth}
          />
          {/* Stem specular / neon conduit */}
          <path
            d="M43 47 C42 54, 38 64, 38 72"
            stroke={isFuturistic ? neonGlowColor : innerShine}
            strokeWidth={isFuturistic ? '1.8' : '3'}
            strokeLinecap="round"
            fill="none"
            opacity={0.85}
          />
          {/* Neck ring */}
          <ellipse cx="50" cy="45" rx="13" ry="2.8" fill={pedGrad} stroke={rimStroke} strokeWidth={rimWidth} />
          {/* Head Sphere */}
          <circle cx="50" cy="30" r="14.5" fill={bodyGrad} stroke={rimStroke} strokeWidth={rimWidth} />
          {/* 3D Sphere Specular highlights */}
          <ellipse cx="45" cy="25" rx="6.5" ry="9" transform="rotate(-30 45 25)" fill={innerShine} opacity={0.85} />
          <circle cx="43" cy="21" r="2.5" fill={specularColor} opacity={0.95} />
          {/* Futuristic Head Neon Ring */}
          {isFuturistic && (
            <circle cx="50" cy="30" r="12" fill="none" stroke={neonGlowColor} strokeWidth="1" strokeDasharray="3 3" opacity="0.8" />
          )}
        </g>
      );

    case 'r': // Rook (Fortress)
      return (
        <g>
          {/* Base */}
          <ellipse cx="50" cy="86" rx="28" ry="6.5" fill={pedGrad} stroke={rimStroke} strokeWidth={rimWidth} />
          <path
            d="M24 86 C24 79, 31 77, 33 74 L67 74 C69 77, 76 79, 76 86 Z"
            fill={bodyGrad}
            stroke={rimStroke}
            strokeWidth={rimWidth}
          />
          <ellipse cx="50" cy="74" rx="19" ry="3.8" fill={pedGrad} stroke={rimStroke} strokeWidth={rimWidth} />
          {/* Tower shaft with taper */}
          <path
            d="M33 74 L36 39 L64 39 L67 74 Z"
            fill={bodyGrad}
            stroke={rimStroke}
            strokeWidth={rimWidth}
          />
          {/* Specular / Futuristic Conduit ridge on tower */}
          <path
            d="M40 39 L38 73"
            stroke={isFuturistic ? neonGlowColor : innerShine}
            strokeWidth={isFuturistic ? '2' : '3.5'}
            strokeLinecap="round"
            opacity={0.85}
          />
          {isFuturistic && (
            <line x1="36" y1="56" x2="64" y2="56" stroke={neonGlowColor} strokeWidth="1.2" opacity="0.75" />
          )}
          {/* Crown ledge */}
          <ellipse cx="50" cy="39" rx="21" ry="3.8" fill={pedGrad} stroke={rimStroke} strokeWidth={rimWidth} />
          {/* Battlement Crenellations */}
          <path
            d="M29 39 L29 23 L37 23 L37 30 L44 30 L44 23 L56 23 L56 30 L63 30 L63 23 L71 23 L71 39 Z"
            fill={bodyGrad}
            stroke={rimStroke}
            strokeWidth={rimWidth}
          />
          {/* Embrasure cutouts */}
          <rect x="37" y="26" width="7" height="6" rx="1" fill={darkDetail} />
          <rect x="56" y="26" width="7" height="6" rx="1" fill={darkDetail} />
          {/* Crenellation top highlights */}
          <line x1="30" y1="23.5" x2="36" y2="23.5" stroke={specularColor} strokeWidth="1.2" opacity={0.9} />
          <line x1="45" y1="23.5" x2="55" y2="23.5" stroke={specularColor} strokeWidth="1.2" opacity={0.9} />
          <line x1="64" y1="23.5" x2="70" y2="23.5" stroke={specularColor} strokeWidth="1.2" opacity={0.9} />
        </g>
      );

    case 'n': // Knight (Steed / Mecha-Steed)
      return (
        <g>
          {/* Base Pedestal */}
          <ellipse cx="50" cy="87" rx="28" ry="6.5" fill={pedGrad} stroke={rimStroke} strokeWidth={rimWidth} />
          <path
            d="M24 87 C24 80, 31 77, 34 74 L66 74 C69 77, 76 80, 76 87 Z"
            fill={bodyGrad}
            stroke={rimStroke}
            strokeWidth={rimWidth}
          />
          <ellipse cx="50" cy="74" rx="19" ry="3.8" fill={pedGrad} stroke={rimStroke} strokeWidth={rimWidth} />

          {/* Steed Sculpted Body */}
          <path
            d="M34 74 
               C31 64, 25 56, 27 46 
               C29 38, 33 32, 38 27 
               C39 23, 41 18, 43 14 
               C45 14, 47 17, 48 21 
               C52 17, 57 15, 62 16 
               C64 21, 62 25, 60 29 
               C66 31, 72 37, 72 45 
               C72 52, 67 58, 64 63 
               C61 68, 62 71, 66 74 Z"
            fill={bodyGrad}
            stroke={rimStroke}
            strokeWidth={rimWidth}
          />

          {/* Sculpted Muzzle, Jaw, and Lips */}
          <path
            d="M38 27 
               C33 30, 26 35, 23 42 
               C21 46, 22 51, 26 53 
               C30 55, 36 53, 40 48 
               C43 44, 44 38, 42 32 Z"
            fill={bodyGrad}
            stroke={rimStroke}
            strokeWidth={rimWidth}
          />

          {/* Nostril */}
          <ellipse cx="27" cy="46" rx="2.5" ry="1.6" transform="rotate(-25 27 46)" fill={darkDetail} />
          <path d="M26 44 C27 43, 29 44, 29 46" stroke={specularColor} strokeWidth="0.8" fill="none" opacity={0.8} />

          {/* Mouth line */}
          <path d="M24 50 C27 51, 30 50, 32 48" stroke={darkDetail} strokeWidth="1.2" strokeLinecap="round" fill="none" />

          {/* Eye - Expressive / Futuristic Sensor Visor */}
          {isFuturistic ? (
            <>
              <ellipse cx="37" cy="35" rx="3.5" ry="2" transform="rotate(-15 37 35)" fill={neonGlowColor} opacity="0.95" />
              <line x1="33" y1="35" x2="42" y2="33" stroke="#ffffff" strokeWidth="0.8" />
            </>
          ) : (
            <>
              <path d="M34 31 C37 29, 41 30, 43 33" stroke={specularColor} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity={0.85} />
              <ellipse cx="37" cy="35" rx="3.2" ry="2.2" transform="rotate(-15 37 35)" fill={darkDetail} />
              <circle cx="36.5" cy="34.5" r="1.3" fill={specularColor} />
              <circle cx="37.2" cy="33.8" r="0.6" fill="#ffffff" />
            </>
          )}

          {/* Mane */}
          <path
            d="M48 21 C53 23, 58 24, 61 28 C64 34, 63 42, 60 49 C58 55, 59 62, 62 68"
            stroke={isFuturistic ? neonGlowColor : innerShine}
            strokeWidth={isFuturistic ? '2.4' : '3.2'}
            strokeLinecap="round"
            fill="none"
            opacity={0.85}
          />
          <path
            d="M54 28 C57 32, 58 37, 56 42"
            stroke={innerShine}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity={0.7}
          />
        </g>
      );

    case 'b': // Bishop
      return (
        <g>
          {/* Base */}
          <ellipse cx="50" cy="87" rx="27" ry="6.5" fill={pedGrad} stroke={rimStroke} strokeWidth={rimWidth} />
          <path
            d="M25 87 C25 80, 32 77, 35 74 L65 74 C68 77, 75 80, 75 87 Z"
            fill={bodyGrad}
            stroke={rimStroke}
            strokeWidth={rimWidth}
          />
          <ellipse cx="50" cy="74" rx="18" ry="3.6" fill={pedGrad} stroke={rimStroke} strokeWidth={rimWidth} />
          {/* Stem */}
          <path
            d="M35 74 C35 59, 41 52, 42 45 L58 45 C59 52, 65 59, 65 74 Z"
            fill={bodyGrad}
            stroke={rimStroke}
            strokeWidth={rimWidth}
          />
          <ellipse cx="50" cy="45" rx="14" ry="3" fill={pedGrad} stroke={rimStroke} strokeWidth={rimWidth} />
          {/* Pointed Mitre Head */}
          <path
            d="M38 45 C35 34, 38 22, 50 16 C62 22, 65 34, 62 45 Z"
            fill={bodyGrad}
            stroke={rimStroke}
            strokeWidth={rimWidth}
          />
          {/* Mitre Slot */}
          <path d="M47 22 L60 36 L56 38 L44 25 Z" fill={darkDetail} stroke={isFuturistic ? neonGlowColor : rimStroke} strokeWidth={isFuturistic ? '1.2' : '0.5'} />
          {/* Top Cross / Sphere */}
          <circle cx="50" cy="16" r="3.8" fill={pedGrad} stroke={rimStroke} strokeWidth={rimWidth} />
          <circle cx="49" cy="15" r="1.3" fill={specularColor} />
          {/* Specular sheen curve */}
          <ellipse cx="43" cy="36" rx="4" ry="10" transform="rotate(-18 43 36)" fill={innerShine} opacity={0.75} />
          {isFuturistic && (
            <circle cx="50" cy="16" r="5" fill="none" stroke={neonGlowColor} strokeWidth="0.8" opacity="0.8" />
          )}
        </g>
      );

    case 'q': // Queen
      return (
        <g>
          {/* Base */}
          <ellipse cx="50" cy="87" rx="29" ry="6.5" fill={pedGrad} stroke={rimStroke} strokeWidth={rimWidth} />
          <path
            d="M23 87 C23 80, 30 77, 33 74 L67 74 C70 77, 77 80, 77 87 Z"
            fill={bodyGrad}
            stroke={rimStroke}
            strokeWidth={rimWidth}
          />
          <ellipse cx="50" cy="74" rx="20" ry="3.8" fill={pedGrad} stroke={rimStroke} strokeWidth={rimWidth} />
          {/* Stem */}
          <path
            d="M33 74 C35 59, 40 52, 41 45 L59 45 C60 52, 65 59, 67 74 Z"
            fill={bodyGrad}
            stroke={rimStroke}
            strokeWidth={rimWidth}
          />
          {/* Regal Neck Ring */}
          <ellipse cx="50" cy="45" rx="15" ry="3.2" fill={pedGrad} stroke={rimStroke} strokeWidth={rimWidth} />
          {/* Crown Flared Body */}
          <path
            d="M37 45 
               C33 37, 24 30, 25 26 
               C27 26, 33 34, 37 30 
               C39 24, 40 19, 43 18 
               C45 20, 46 26, 50 22 
               C54 26, 55 20, 57 18 
               C60 19, 61 24, 63 30 
               C67 34, 73 26, 75 26 
               C76 30, 67 37, 63 45 Z"
            fill={bodyGrad}
            stroke={rimStroke}
            strokeWidth={rimWidth}
          />
          {/* Crown Jewels (Orbs on crown tips) */}
          <circle cx="25" cy="25" r="2.6" fill={pedGrad} stroke={isFuturistic ? neonGlowColor : rimStroke} strokeWidth="1" />
          <circle cx="37" cy="21" r="2.6" fill={pedGrad} stroke={isFuturistic ? neonGlowColor : rimStroke} strokeWidth="1" />
          <circle cx="50" cy="18" r="3.2" fill={pedGrad} stroke={isFuturistic ? neonGlowColor : rimStroke} strokeWidth="1" />
          <circle cx="63" cy="21" r="2.6" fill={pedGrad} stroke={isFuturistic ? neonGlowColor : rimStroke} strokeWidth="1" />
          <circle cx="75" cy="25" r="2.6" fill={pedGrad} stroke={isFuturistic ? neonGlowColor : rimStroke} strokeWidth="1" />
          {/* Crown Base Rim Sheen */}
          <path d="M37 43 Q50 48 63 43" stroke={isFuturistic ? neonGlowColor : specularColor} strokeWidth="2.5" fill="none" opacity={0.75} />
          <ellipse cx="44" cy="57" rx="4.5" ry="12" fill={innerShine} opacity={0.75} />
        </g>
      );

    case 'k': // King
      return (
        <g>
          {/* Base */}
          <ellipse cx="50" cy="87" rx="29" ry="6.5" fill={pedGrad} stroke={rimStroke} strokeWidth={rimWidth} />
          <path
            d="M23 87 C23 80, 30 77, 33 74 L67 74 C70 77, 77 80, 77 87 Z"
            fill={bodyGrad}
            stroke={rimStroke}
            strokeWidth={rimWidth}
          />
          <ellipse cx="50" cy="74" rx="20" ry="3.8" fill={pedGrad} stroke={rimStroke} strokeWidth={rimWidth} />
          {/* Stem */}
          <path
            d="M33 74 C35 59, 40 52, 41 45 L59 45 C60 52, 65 59, 67 74 Z"
            fill={bodyGrad}
            stroke={rimStroke}
            strokeWidth={rimWidth}
          />
          {/* Dual Neck Ring */}
          <ellipse cx="50" cy="45" rx="16" ry="3.2" fill={pedGrad} stroke={rimStroke} strokeWidth={rimWidth} />
          {/* Royal Arched Crown Body */}
          <path
            d="M36 45 C31 37, 29 27, 37 23 C42 26, 45 29, 50 30 C55 29, 58 26, 63 23 C71 27, 69 37, 64 45 Z"
            fill={bodyGrad}
            stroke={rimStroke}
            strokeWidth={rimWidth}
          />
          {/* Crown Cross Top */}
          <rect x="47.5" y="9" width="5" height="13" rx="1" fill={pedGrad} stroke={rimStroke} strokeWidth={rimWidth} />
          <rect x="43" y="12" width="14" height="5" rx="1" fill={pedGrad} stroke={rimStroke} strokeWidth={rimWidth} />
          {/* Cross Center Jewel */}
          <circle cx="50" cy="14.5" r="1.6" fill={isFuturistic ? neonGlowColor : specularColor} />
          {/* Arches Accent */}
          <path d="M39 32 Q50 37 61 32" stroke={isFuturistic ? neonGlowColor : specularColor} strokeWidth="2.2" fill="none" opacity={0.7} />
          <ellipse cx="44" cy="57" rx="4.5" ry="12" fill={innerShine} opacity={0.75} />
        </g>
      );
  }
}
