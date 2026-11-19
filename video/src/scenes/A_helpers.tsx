// Helpers for scenes S01–S05 (owned by the S01–S05 scene agent).
import React from 'react';
import {Easing, interpolate} from 'remotion';
import {colors, fonts} from '../shared/theme';

/* ---------- narration sync ---------- */

/**
 * Speech chunks per scene: [startSec, endSec, text]. Boundaries come from silence
 * detection on the narration WAV (pauses ≥ 0.15 s); words inside a chunk are
 * interpolated linearly.
 */
export type Chunk = [number, number, string];

const AUDIO_OFFSET = 6; // narration starts 6 frames into each scene (Main.tsx)

const words = (s: string) => s.toLowerCase().replace(/[^a-z0-9'\- ]/g, ' ').split(/\s+/).filter(Boolean);

/** Frame at which `phrase` starts (or ends, with `at = 'end'`) being spoken. */
export const cueOf = (chunks: Chunk[], phrase: string, at: 'start' | 'end' = 'start'): number => {
  const p = words(phrase);
  for (const [a, b, text] of chunks) {
    const w = words(text);
    for (let i = 0; i + p.length <= w.length; i++) {
      if (p.every((x, j) => w[i + j] === x)) {
        const idx = at === 'start' ? i : i + p.length;
        return Math.round(AUDIO_OFFSET + (a + ((b - a) * idx) / w.length) * 30);
      }
    }
  }
  throw new Error(`cue not found: ${phrase}`);
};

/* ---------- animation helpers ---------- */

/** Eased 0→1 between frames a and b (clamped). */
export const ease = (frame: number, a: number, b: number) =>
  interpolate(frame, [a, b], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

export const lerp = (t: number, a: number, b: number) => a + (b - a) * t;

/** Absolutely placed, centred at (x, y), with opacity + scale. */
export const Place: React.FC<{
  x: number;
  y: number;
  o?: number;
  s?: number;
  rot?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({x, y, o = 1, s = 1, rot = 0, children, style}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      transform: `translate(-50%, -50%) scale(${s}) rotate(${rot}deg)`,
      opacity: o,
      ...style,
    }}
  >
    {children}
  </div>
);

/* ---------- icons ---------- */

export const Laptop: React.FC<{size?: number; color?: string}> = ({size = 220, color = colors.publicKey}) => (
  <svg width={size} height={size * 0.7} viewBox="0 0 200 140">
    <rect x="30" y="10" width="140" height="95" rx="10" fill="#0f172a" stroke={color} strokeWidth="7" />
    <rect x="44" y="24" width="112" height="16" rx="4" fill={`${color}55`} />
    <rect x="44" y="48" width="70" height="10" rx="4" fill={`${color}33`} />
    <rect x="44" y="64" width="90" height="10" rx="4" fill={`${color}33`} />
    <path d="M8 115 H192 L180 132 H20 Z" fill={color} />
  </svg>
);

export const Server: React.FC<{size?: number; color?: string}> = ({size = 200, color = colors.muted}) => (
  <svg width={size} height={size} viewBox="0 0 200 200">
    {[20, 80, 140].map((y) => (
      <g key={y}>
        <rect x="30" y={y} width="140" height="48" rx="10" fill="#0f172a" stroke={color} strokeWidth="7" />
        <circle cx="58" cy={y + 24} r="7" fill={colors.ok} />
        <rect x="80" y={y + 18} width="70" height="12" rx="4" fill={`${color}66`} />
      </g>
    ))}
  </svg>
);

/** Envelope-like message box, optionally with a small padlock icon on it. */
export const MsgBox: React.FC<{label?: string; color?: string; size?: number}> = ({
  label = 'msg',
  color = colors.text,
  size = 1,
}) => (
  <div
    style={{
      width: 150 * size,
      height: 100 * size,
      borderRadius: 14 * size,
      background: '#0f172a',
      border: `${5 * size}px solid ${color}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: fonts.mono,
      fontWeight: 800,
      fontSize: 40 * size,
      color,
    }}
  >
    {label}
  </div>
);

/** Text label (≥ 40px by default). */
export const Label: React.FC<{children: React.ReactNode; color?: string; size?: number; weight?: number; mono?: boolean}> = ({
  children,
  color = colors.text,
  size = 44,
  weight = 700,
  mono,
}) => (
  <div
    style={{
      fontSize: size,
      fontWeight: weight,
      color,
      whiteSpace: 'nowrap',
      textAlign: 'center',
      fontFamily: mono ? fonts.mono : fonts.sans,
    }}
  >
    {children}
  </div>
);
