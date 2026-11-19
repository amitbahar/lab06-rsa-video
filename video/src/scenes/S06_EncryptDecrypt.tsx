// S06 — Encrypting and decrypting. See SCRIPT.md § S06.
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {colors, fonts, RSA_EXAMPLE as X} from '../shared/theme';
import {Avatar, Eye, Heading, Key, Mark, Packet, SceneFrame, Wire} from '../shared/components';
import {ease, Place, PopAt, Sup, makeT, Txt, useSpring} from './B_helpers';

const T = makeT('S06');

// Cues (narration-WAV seconds from silence detection → frames)
const F = {
  aPanel: 10,
  m: T(1.3), // "...the number seven."
  pub: T(2.9), // "Bob's public key"
  formula: T(3.7),
  pow: T(4.5), // "seven to the power of three"
  v343: T(6.3), // "three hundred forty-three"
  mod: T(7.9), // "Modulo fifty-five"
  v13: T(9.8), // "leaves thirteen"
  send: T(10.8), // "She sends thirteen"
  arrive: T(12.3),
  bFormula: T(12.5), // "Bob raises"
  bPow: T(13.4), // "thirteen to the power of twenty-seven"
  bMod: T(15.5), // "modulo fifty-five"
  v7: T(18.0), // "exactly seven"
  eve: T(19.1), // "The eavesdropper only ever saw thirteen"
};

const WIRE = {x1: 300, x2: 1620, y: 270};

/** Inline piece of a line that fades/slides in at `at`. */
const Bit: React.FC<{at: number; children: React.ReactNode; color?: string}> = ({at, children, color}) => {
  const s = useSpring(at, 16);
  return (
    <span style={{opacity: Math.min(1, s), display: 'inline-block', transform: `translateY(${(1 - s) * 16}px)`, color}}>
      {children}
    </span>
  );
};

/** Result value with a pulse + underline glow when it appears. */
const Result: React.FC<{at: number; children: React.ReactNode; color?: string}> = ({at, children, color = colors.math}) => {
  const frame = useCurrentFrame();
  const s = useSpring(at, 9);
  const glow = interpolate(frame - at, [0, 8, 40], [0, 1, 0.35], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <span
      style={{
        display: 'inline-block',
        opacity: Math.min(1, s),
        transform: `scale(${0.5 + 0.5 * s})`,
        color,
        fontWeight: 800,
        padding: '0 10px',
        borderRadius: 12,
        background: `${color}${Math.round(glow * 0x40)
          .toString(16)
          .padStart(2, '0')}`,
      }}
    >
      {children}
    </span>
  );
};

const Line: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{fontFamily: fonts.mono, fontSize: 54, color: colors.math, height: 84, lineHeight: '84px', whiteSpace: 'pre'}}>
    {children}
  </div>
);

const PanelBox: React.FC<{left: number; color: string; delay: number; children: React.ReactNode}> = ({
  left,
  color,
  delay,
  children,
}) => {
  const s = useSpring(delay, 18);
  return (
    <div
      style={{
        position: 'absolute',
        left,
        top: 450,
        width: 860,
        height: 580,
        boxSizing: 'border-box',
        padding: '26px 44px',
        borderRadius: 28,
        background: colors.panel,
        border: `3px solid ${color}88`,
        opacity: s,
        transform: `translateY(${(1 - s) * 40}px)`,
      }}
    >
      {children}
    </div>
  );
};

const KeyChip: React.FC<{color: string; label: React.ReactNode; at: number}> = ({color, label, at}) => {
  const s = useSpring(at, 14);
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 18, height: 70, opacity: Math.min(1, s), marginBottom: 6}}>
      <div style={{transform: `scale(${s})`}}>
        <Key color={color} size={96} />
      </div>
      <div style={{fontSize: 42, fontWeight: 700, color}}>{label}</div>
    </div>
  );
};

/** Modular "clock": 55 ticks; a hand sweeps 343 steps (6 laps + 13). */
const ModClock: React.FC<{start: number; end: number; total: number; mod: number}> = ({start, end, total, mod}) => {
  const frame = useCurrentFrame();
  const appear = useSpring(start - 8, 16);
  const v = total * ease(frame, start, end);
  const pos = v % mod;
  const laps = Math.floor(v / mod);
  const done = frame >= end;
  const R = 110;
  const ang = (p: number) => (p / mod) * 2 * Math.PI - Math.PI / 2;
  const hx = Math.cos(ang(done ? total % mod : pos)) * (R - 18);
  const hy = Math.sin(ang(done ? total % mod : pos)) * (R - 18);
  return (
    <div style={{position: 'absolute', right: 40, top: 190, width: 260, textAlign: 'center', opacity: appear}}>
      <svg width={260} height={260} viewBox="-130 -130 260 260">
        <circle r={R} fill="#0f172a" stroke={colors.dim} strokeWidth={3} />
        {Array.from({length: mod}).map((_, i) => {
          const a = ang(i);
          const big = i % 5 === 0;
          const r1 = big ? R - 16 : R - 9;
          const hit = done && i === total % mod;
          return (
            <line
              key={i}
              x1={Math.cos(a) * r1}
              y1={Math.sin(a) * r1}
              x2={Math.cos(a) * R}
              y2={Math.sin(a) * R}
              stroke={hit ? colors.math : big ? colors.muted : colors.dim}
              strokeWidth={hit ? 7 : big ? 4 : 2}
            />
          );
        })}
        <line x1={0} y1={0} x2={hx} y2={hy} stroke={colors.math} strokeWidth={6} strokeLinecap="round" />
        <circle r={8} fill={colors.math} />
        <text y={58} textAnchor="middle" fill={colors.math} fontSize={44} fontWeight={800} fontFamily={fonts.mono}>
          {done ? total % mod : Math.floor(pos)}
        </text>
      </svg>
      <div style={{fontSize: 40, fontWeight: 700, color: colors.muted, marginTop: 4}}>
        {laps} {laps === 1 ? 'lap' : 'laps'}
        {done ? ` + ${total % mod}` : ''}
      </div>
    </div>
  );
};

export const S06EncryptDecrypt: React.FC = () => {
  const frame = useCurrentFrame();

  // Packet travel Alice → Bob
  const pIn = useSpring(F.send - 6, 14);
  const prog = ease(frame, F.send, F.arrive);
  const pOut = 1 - ease(frame, F.arrive, F.arrive + 10);
  const passedEye = useSpring(F.send + (F.arrive - F.send) / 2, 12);
  const evePulse = interpolate(frame - F.eve, [0, 8, 20, 30], [0, 1, 0.4, 0.7], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const eyeIn = useSpring(14, 16);
  const check = useSpring(F.v7 + 10, 10);

  return (
    <SceneFrame>
      <Heading>Encrypting and decrypting</Heading>

      {/* Top row: Alice — wire — Bob, eavesdropper below the wire */}
      <Place x={170} y={290}>
        <Avatar name="Alice" color={colors.publicKey} size={110} />
      </Place>
      <Place x={1750} y={290}>
        <Avatar name="Bob" color={colors.privateKey} size={110} />
      </Place>
      <Wire
        x1={WIRE.x1}
        x2={WIRE.x2}
        y={WIRE.y}
        progress={0.04 + 0.92 * prog}
        packet={
          frame >= F.send - 8 ? (
            <div style={{opacity: Math.min(1, pIn) * pOut, transform: `scale(${pIn})`}}>
              <Packet label={String(X.c)} />
            </div>
          ) : null
        }
      />
      <Place x={960} y={378} o={eyeIn} s={1 + 0.12 * evePulse}>
        <Eye size={150} />
      </Place>
      <Place x={1110} y={378} o={Math.min(1, passedEye)} s={(0.6 + 0.4 * passedEye) * (1 + 0.2 * evePulse)}>
        <div style={{fontFamily: fonts.mono, fontSize: 52, fontWeight: 800, whiteSpace: 'nowrap'}}>
          <span style={{color: colors.math}}>13</span>
          <span style={{color: colors.bad, marginLeft: 12}}>?</span>
        </div>
      </Place>
      <PopAt x={760} y={378} delay={F.eve + 4}>
        <Txt size={42} color={colors.bad}>
          only sees
        </Txt>
      </PopAt>

      {/* Alice encrypts */}
      <PanelBox left={60} color={colors.publicKey} delay={F.aPanel}>
        <Txt size={48} weight={800} style={{textAlign: 'left', height: 62}}>
          Alice encrypts
        </Txt>
        <KeyChip
          at={F.pub}
          color={colors.publicKey}
          label={
            <>
              Bob's public key: e = {X.e}, n = {X.n}
            </>
          }
        />
        <Line>
          <Bit at={F.m}>
            m = <Result at={F.m}>{X.m}</Result>
          </Bit>
        </Line>
        <Line>
          <Bit at={F.formula}>
            c = m<Sup color={colors.publicKey}>e</Sup> mod <span style={{color: colors.publicKey}}>n</span>
          </Bit>
        </Line>
        <Line>
          <Bit at={F.pow}>
            {X.m}
            <Sup>{X.e}</Sup> ={' '}
          </Bit>
          <Result at={F.v343}>343</Result>
        </Line>
        <Line>
          <Bit at={F.mod}>343 mod {X.n} = </Bit>
          <Result at={F.v13}>{X.c}</Result>
        </Line>
        <ModClock start={F.mod + 4} end={F.v13} total={343} mod={X.n} />
      </PanelBox>

      {/* Bob decrypts */}
      <PanelBox left={1000} color={colors.privateKey} delay={F.send}>
        <Txt size={48} weight={800} style={{textAlign: 'left', height: 62}}>
          Bob decrypts
        </Txt>
        <KeyChip at={F.bFormula} color={colors.privateKey} label={<>his private key: d = {X.d}</>} />
        <Line>
          <Bit at={F.arrive}>
            c = <Result at={F.arrive}>{X.c}</Result>
          </Bit>
        </Line>
        <Line>
          <Bit at={F.bFormula + 8}>
            m = c<Sup color={colors.privateKey}>d</Sup> mod n
          </Bit>
        </Line>
        <Line>
          <Bit at={F.bPow}>
            {X.c}
            <Sup>{X.d}</Sup>
          </Bit>
          <Bit at={F.bMod}> mod {X.n}</Bit>
        </Line>
        <Line>
          <Bit at={F.v7}>m = </Bit>
          <Result at={F.v7} color={colors.ok}>
            {X.m}
          </Result>
        </Line>
        <div
          style={{
            position: 'absolute',
            right: 70,
            bottom: 60,
            opacity: Math.min(1, check),
            transform: `scale(${check})`,
            textAlign: 'center',
          }}
        >
          <Mark ok size={150} />
          <div style={{fontSize: 40, fontWeight: 700, color: colors.ok}}>same 7!</div>
        </div>
      </PanelBox>
    </SceneFrame>
  );
};
