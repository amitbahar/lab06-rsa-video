// Shared visual building blocks. OWNED BY STEP 0 — scene agents must not edit this file.
// Need something new and reusable? Build it inside your own scene file instead.
import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {background, colors, fonts} from './theme';

/* ---------- timing helpers ---------- */

/** Spring 0→1 starting at `delay` frames. */
export const usePop = (delay = 0, damping = 14) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping}});
};

/** Linear 0→1 between frames [from, to], clamped. */
export const useRamp = (from: number, to: number) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [from, to], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
};

/** Seconds → frames (30 fps). Use with the narration WAV to sync visuals to spoken words. */
export const sec = (s: number) => Math.round(s * 30);

/* ---------- layout ---------- */

/** Standard scene wrapper: background, font, and a fade in/out at the scene edges. */
export const SceneFrame: React.FC<{children: React.ReactNode; fade?: number}> = ({children, fade = 10}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const opacity = interpolate(frame, [0, fade, durationInFrames - fade, durationInFrames], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{background, fontFamily: fonts.sans, color: colors.text}}>
      <AbsoluteFill style={{opacity}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Absolutely positioned box centred on (x, y) in 1920×1080 space. */
export const At: React.FC<{x: number; y: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  x,
  y,
  children,
  style,
}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', ...style}}>{children}</div>
);

/** Scene heading at the top of the frame. */
export const Heading: React.FC<{children: React.ReactNode; delay?: number}> = ({children, delay = 0}) => {
  const s = usePop(delay);
  return (
    <div
      style={{
        position: 'absolute',
        top: 70,
        width: '100%',
        textAlign: 'center',
        fontSize: 64,
        fontWeight: 800,
        opacity: s,
        transform: `translateY(${(1 - s) * 30}px)`,
      }}
    >
      {children}
    </div>
  );
};

/** Rounded panel / card. */
export const Panel: React.FC<{children: React.ReactNode; color?: string; style?: React.CSSProperties}> = ({
  children,
  color = colors.panelBorder,
  style,
}) => (
  <div
    style={{
      background: colors.panel,
      border: `3px solid ${color}`,
      borderRadius: 28,
      padding: '28px 40px',
      ...style,
    }}
  >
    {children}
  </div>
);

/* ---------- characters & icons ---------- */

/** Key with label (from TestClip). */
export const Key: React.FC<{label?: string; color: string; size?: number}> = ({label, color, size = 140}) => (
  <div style={{textAlign: 'center'}}>
    <svg width={size} height={size * 0.5} viewBox="0 0 200 100">
      <circle cx="45" cy="50" r="32" fill="none" stroke={color} strokeWidth="14" />
      <rect x="75" y="43" width="115" height="14" rx="4" fill={color} />
      <rect x="150" y="57" width="12" height="24" rx="3" fill={color} />
      <rect x="172" y="57" width="12" height="18" rx="3" fill={color} />
    </svg>
    {label && <div style={{fontSize: size * 0.3, fontWeight: 700, color, marginTop: 8}}>{label}</div>}
  </div>
);

/** Person avatar: coloured circle with initial + name below. */
export const Avatar: React.FC<{name: string; color?: string; size?: number}> = ({
  name,
  color = colors.muted,
  size = 160,
}) => (
  <div style={{textAlign: 'center', width: size * 1.6}}>
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        margin: '0 auto',
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
      {name[0]}
    </div>
    <div style={{fontSize: size * 0.24, fontWeight: 700, marginTop: 10}}>{name}</div>
  </div>
);

/** Eavesdropper eye. `open` 0..1 controls the lid. */
export const Eye: React.FC<{size?: number; open?: number; color?: string}> = ({size = 160, open = 1, color = colors.bad}) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 200 120">
    <path d={`M10 60 Q100 ${60 - 55 * open} 190 60 Q100 ${60 + 55 * open} 10 60 Z`} fill="#0f172a" stroke={color} strokeWidth="6" />
    <circle cx="100" cy="60" r={26 * open} fill={color} />
    <circle cx="100" cy="60" r={11 * open} fill="#0b1120" />
  </svg>
);

/** Padlock; `closed` 0 (open shackle, lifted) → 1 (locked). */
export const Padlock: React.FC<{color: string; size?: number; closed?: number}> = ({color, size = 160, closed = 1}) => {
  const lift = (1 - closed) * 34;
  return (
    <svg width={size} height={size * 1.4} viewBox="0 -40 160 224">
      <path
        d={`M40 ${100 - lift} V55 a40 40 0 0 1 80 0 V${closed > 0.5 ? 100 : 66}`}
        transform={`translate(0 ${-lift})`}
        fill="none"
        stroke={color}
        strokeWidth="16"
        strokeLinecap="round"
      />
      <rect x="15" y="84" width="130" height="96" rx="18" fill={color} />
      <circle cx="80" cy="124" r="13" fill="#0b1120" />
      <rect x="74" y="128" width="12" height="28" rx="4" fill="#0b1120" />
    </svg>
  );
};

/** Keyhole icon — the "trapdoor" symbol (S04 and S07). */
export const Keyhole: React.FC<{size?: number; color?: string; label?: string}> = ({
  size = 160,
  color = colors.math,
  label,
}) => (
  <div style={{textAlign: 'center'}}>
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="46" fill="none" stroke={color} strokeWidth="6" />
      <circle cx="50" cy="40" r="13" fill={color} />
      <path d="M43 46 L38 76 H62 L57 46 Z" fill={color} />
    </svg>
    {label && <div style={{fontSize: size * 0.18, color, fontWeight: 700, marginTop: 8}}>{label}</div>}
  </div>
);

/** Small labelled packet (message box) — travels along a Wire. */
export const Packet: React.FC<{label: string; color?: string}> = ({label, color = colors.math}) => (
  <div
    style={{
      padding: '14px 28px',
      borderRadius: 16,
      background: '#0f172a',
      border: `4px solid ${color}`,
      color,
      fontSize: 44,
      fontWeight: 800,
      fontFamily: fonts.mono,
      whiteSpace: 'nowrap',
    }}
  >
    {label}
  </div>
);

/**
 * Horizontal wire from x1 to x2 at height y. Optional packet moves along it:
 * `progress` 0..1 = position of the packet.
 */
export const Wire: React.FC<{x1: number; x2: number; y: number; progress?: number; packet?: React.ReactNode}> = ({
  x1,
  x2,
  y,
  progress,
  packet,
}) => (
  <>
    <div
      style={{
        position: 'absolute',
        left: x1,
        top: y - 3,
        width: x2 - x1,
        height: 6,
        borderRadius: 3,
        background: `repeating-linear-gradient(90deg, ${colors.dim} 0 24px, transparent 24px 36px)`,
      }}
    />
    {packet !== undefined && progress !== undefined && (
      <At x={x1 + (x2 - x1) * progress} y={y}>
        {packet}
      </At>
    )}
  </>
);

/** Monospace math line; fades/slides in at `delay`. `highlight` tints it amber. */
export const MathLine: React.FC<{children: React.ReactNode; delay?: number; size?: number; color?: string}> = ({
  children,
  delay = 0,
  size = 56,
  color = colors.text,
}) => {
  const s = usePop(delay, 18);
  return (
    <div
      style={{
        fontFamily: fonts.mono,
        fontSize: size,
        color,
        opacity: s,
        transform: `translateX(${(1 - s) * -40}px)`,
        whiteSpace: 'pre',
        margin: '10px 0',
      }}
    >
      {children}
    </div>
  );
};

/** Big ✓ / ✗ mark. */
export const Mark: React.FC<{ok: boolean; size?: number}> = ({ok, size = 120}) => (
  <div style={{fontSize: size, fontWeight: 900, color: ok ? colors.ok : colors.bad, lineHeight: 1}}>
    {ok ? '✓' : '✗'}
  </div>
);

/** The RSA title card (S01 ends on it, S10 echoes it). `progress` 0..1 drives the entrance. */
export const TitleCard: React.FC<{progress: number}> = ({progress}) => (
  <AbsoluteFill>
    <div
      style={{
        position: 'absolute',
        top: 220,
        width: '100%',
        textAlign: 'center',
        opacity: progress,
        transform: `translateY(${(1 - progress) * 40}px)`,
      }}
    >
      <div style={{fontSize: 160, fontWeight: 800, letterSpacing: 12}}>RSA</div>
      <div style={{fontSize: 44, color: colors.muted}}>Public-key cryptography</div>
    </div>
    <At x={660} y={700} style={{opacity: progress, transform: `translate(-50%, -50%) scale(${progress})`}}>
      <Key label="Public key" color={colors.publicKey} />
    </At>
    <At x={1260} y={700} style={{opacity: progress, transform: `translate(-50%, -50%) scale(${progress})`}}>
      <Key label="Private key" color={colors.privateKey} />
    </At>
  </AbsoluteFill>
);
