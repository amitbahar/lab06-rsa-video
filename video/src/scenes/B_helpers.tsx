// Helpers for scenes S06–S10 (owned by the S06–S10 scene agent).
import {warp} from '../shared/timewarp';
import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, fonts} from '../shared/theme';

/** Narration-WAV seconds → scene frame (narration starts 6 frames into the scene). */
export const makeT = (id: string) => (s: number) => Math.round(6 + warp(id, s) * 30);

/** Eased 0→1 between frames a and b (clamped). */
export const ease = (frame: number, a: number, b: number) =>
  interpolate(frame, [a, b], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

/** Spring 0→1 starting at `delay`. */
export const useSpring = (delay: number, damping = 14) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping}});
};

/** Absolutely placed, centred at (x, y), with opacity + scale. */
export const Place: React.FC<{
  x: number;
  y: number;
  o?: number;
  s?: number;
  dy?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({x, y, o = 1, s = 1, dy = 0, children, style}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      transform: `translate(-50%, -50%) translateY(${dy}px) scale(${s})`,
      opacity: o,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Pops in (spring) at `delay`, optionally fades out between [outA, outB]. */
export const PopAt: React.FC<{
  x: number;
  y: number;
  delay: number;
  out?: [number, number];
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({x, y, delay, out, children, style}) => {
  const frame = useCurrentFrame();
  const s = useSpring(delay);
  const o = out ? 1 - ease(frame, out[0], out[1]) : 1;
  return (
    <Place x={x} y={y} o={Math.min(1, s) * o} s={0.6 + 0.4 * s} style={style}>
      {children}
    </Place>
  );
};

/** Superscript that renders well in both sans and mono text. */
export const Sup: React.FC<{children: React.ReactNode; color?: string}> = ({children, color}) => (
  <span style={{fontSize: '0.62em', position: 'relative', top: '-0.75em', lineHeight: 0, color}}>{children}</span>
);

/** Text label (≥ 40px by default). */
export const Txt: React.FC<{
  children: React.ReactNode;
  color?: string;
  size?: number;
  weight?: number;
  mono?: boolean;
  style?: React.CSSProperties;
}> = ({children, color = colors.text, size = 44, weight = 700, mono, style}) => (
  <div
    style={{
      fontSize: size,
      fontWeight: weight,
      color,
      whiteSpace: 'nowrap',
      textAlign: 'center',
      fontFamily: mono ? fonts.mono : fonts.sans,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Small padlock drawn inline (for chips, address bars, chains). */
export const MiniLock: React.FC<{size?: number; color?: string}> = ({size = 48, color = colors.muted}) => (
  <svg width={size} height={size * 1.2} viewBox="0 0 40 48" style={{display: 'block'}}>
    <path d="M10 22 V14 a10 10 0 0 1 20 0 V22" fill="none" stroke={color} strokeWidth="5" />
    <rect x="4" y="21" width="32" height="25" rx="5" fill={color} />
    <circle cx="20" cy="32" r="4" fill="#0b1120" />
  </svg>
);

/** Simple document icon with text lines. */
export const Doc: React.FC<{width?: number; height?: number; border?: string; title?: string}> = ({
  width = 340,
  height = 420,
  border = colors.muted,
  title = 'Document',
}) => (
  <div
    style={{
      width,
      height,
      borderRadius: 18,
      background: '#f8fafc',
      border: `6px solid ${border}`,
      padding: '28px 30px',
      boxSizing: 'border-box',
    }}
  >
    <div style={{fontSize: 40, fontWeight: 800, color: '#0f172a', marginBottom: 22}}>{title}</div>
    {[0.95, 0.8, 0.9, 0.6, 0.85].map((w, i) => (
      <div key={i} style={{height: 14, width: `${w * 100}%`, background: '#cbd5e1', borderRadius: 7, marginBottom: 20}} />
    ))}
  </div>
);

/** Globe icon. */
export const Globe: React.FC<{size?: number; color?: string}> = ({size = 120, color = colors.publicKey}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="44" fill="none" stroke={color} strokeWidth="6" />
    <ellipse cx="50" cy="50" rx="20" ry="44" fill="none" stroke={color} strokeWidth="5" />
    <line x1="6" y1="50" x2="94" y2="50" stroke={color} strokeWidth="5" />
    <path d="M14 28 H86 M14 72 H86" stroke={color} strokeWidth="4" />
  </svg>
);

/** Avatar circle with initial only (for crowds). */
export const Face: React.FC<{initial: string; color?: string; size?: number}> = ({initial, color = colors.muted, size = 90}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: `${color}33`,
      border: `5px solid ${color}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.45,
      fontWeight: 800,
      color,
    }}
  >
    {initial}
  </div>
);
