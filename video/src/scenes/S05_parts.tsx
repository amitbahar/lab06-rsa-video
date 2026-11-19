// Building blocks for S05 (key generation). Used only by S05_KeyGen.tsx.
import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, fonts} from '../shared/theme';
import {Key} from '../shared/components';
import {ease} from './A_helpers';

/* ---------- step list segment ---------- */

export type Seg = {
  text: string;
  cue: number; // frame the segment appears / is spoken
  val?: boolean; // a value: amber + highlight pulse when spoken
  small?: boolean; // side note (muted, smaller)
  ph?: string; // placeholder shown from the line's start until `cue`
  swap?: {cue: number; text: string}; // replace text at a later cue
};

export const FS = 56; // step font size
export const SMALL = 42;

export const Segment: React.FC<{seg: Seg; lineStart: number}> = ({seg, lineStart}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const shown = frame >= seg.cue - 2;
  const pulse = spring({frame: frame - seg.cue, fps, config: {damping: 10}});
  const active = seg.val && shown ? Math.max(0, 1 - ease(frame, seg.cue + 18, seg.cue + 40)) : 0;
  const text = seg.swap && frame >= seg.swap.cue ? seg.swap.text : seg.text;

  if (!shown) {
    if (seg.ph && frame >= lineStart) {
      return <span style={{color: colors.dim, fontSize: FS}}>{seg.ph}</span>;
    }
    return null;
  }
  const color = seg.small ? colors.muted : seg.val ? colors.math : '#e2e8f0';
  return (
    <span
      style={{
        display: 'inline-block',
        whiteSpace: 'pre',
        fontSize: seg.small ? SMALL : FS,
        color,
        fontWeight: seg.val ? 800 : 500,
        opacity: Math.min(1, pulse * 1.5),
        padding: seg.val ? '0 6px' : 0,
        borderRadius: 12,
        background: `rgba(251, 191, 36, ${0.28 * active})`,
        boxShadow: active > 0 ? `0 0 ${30 * active}px rgba(251, 191, 36, ${0.6 * active})` : 'none',
        transform: seg.val ? `scale(${1 + 0.22 * active * pulse})` : undefined,
      }}
    >
      {text}
    </span>
  );
};

/* ---------- key card ---------- */

export const CARD_W = 500;

export const Card: React.FC<{
  color: string;
  title: string;
  rows: {label: string; value: string; filled: number}[];
  s: number;
}> = ({color, title, rows, s}) => (
  <div
    style={{
      width: CARD_W,
      borderRadius: 28,
      border: `4px solid ${color}`,
      background: `${color}12`,
      padding: '22px 30px',
      opacity: s,
      transform: `scale(${0.85 + 0.15 * s})`,
      boxSizing: 'border-box',
    }}
  >
    <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
      <Key color={color} size={110} />
      <div style={{fontSize: 48, fontWeight: 800, color}}>{title}</div>
    </div>
    {rows.map((r) => (
      <div key={r.label} style={{fontFamily: fonts.mono, fontSize: 52, height: 72, lineHeight: '72px', marginTop: 6, color: '#e2e8f0'}}>
        {r.label} ={' '}
        <span
          style={{
            color: r.filled > 0 ? colors.math : colors.dim,
            fontWeight: 800,
            display: 'inline-block',
            transform: `scale(${1 + 0.35 * Math.sin(Math.min(1, r.filled) * Math.PI)})`,
          }}
        >
          {r.filled > 0 ? r.value : '?'}
        </span>
      </div>
    ))}
  </div>
);

/* ---------- pill (tree nodes, attacker path boxes) ---------- */

export const Pill: React.FC<{
  color: string;
  children: React.ReactNode;
  size?: number;
  dashed?: boolean;
  glow?: number;
  style?: React.CSSProperties;
}> = ({color, children, size = 52, dashed, glow = 0, style}) => (
  <div
    style={{
      fontFamily: fonts.mono,
      fontSize: size,
      fontWeight: 800,
      whiteSpace: 'pre',
      padding: '10px 26px',
      borderRadius: 20,
      border: `4px ${dashed ? 'dashed' : 'solid'} ${color}`,
      background: `${color}1a`,
      color: '#e2e8f0',
      boxShadow: glow > 0 ? `0 0 ${36 * glow}px ${color}` : 'none',
      ...style,
    }}
  >
    {children}
  </div>
);

/* ---------- full-frame SVG arrow (draw-on with progress p) ---------- */

export const Arrow: React.FC<{
  d: string;
  p: number;
  color: string;
  head: [number, number, number]; // tip x, tip y, direction (deg)
  width?: number;
  glow?: boolean;
  dash?: boolean;
}> = ({d, p, color, head, width = 8, glow, dash}) => {
  if (p <= 0) return null;
  const [hx, hy, deg] = head;
  const hs = width * 2.6;
  return (
    <svg
      width={1920}
      height={1080}
      style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: glow ? `drop-shadow(0 0 12px ${color})` : undefined}}
    >
      <path
        d={d}
        pathLength={1}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray={dash ? undefined : 1}
        strokeDashoffset={dash ? undefined : 1 - p}
        style={dash ? {strokeDasharray: '0.03 0.025', opacity: p} : undefined}
      />
      <polygon
        points={`0,0 ${-hs},${-hs * 0.6} ${-hs},${hs * 0.6}`}
        fill={color}
        transform={`translate(${hx} ${hy}) rotate(${deg})`}
        opacity={ease(p, 0.85, 1)}
      />
    </svg>
  );
};
