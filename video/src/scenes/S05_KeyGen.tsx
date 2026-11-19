// S05 — Generating the keys. See SCRIPT.md § S05.
import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, fonts, RSA_EXAMPLE as X} from '../shared/theme';
import {Key, SceneFrame} from '../shared/components';
import {Chunk, cueOf, ease, Label, lerp, Place} from './A_helpers';

const CHUNKS: Chunk[] = [
  [0.0, 1.6, "Let's build a tiny key pair."],
  [2.12, 3.06, 'Pick two primes:'],
  [3.34, 5.68, 'p equals five, and q equals eleven.'],
  [6.16, 8.06, 'Multiply them to get n, fifty-five.'],
  [8.66, 10.18, 'Next, compute phi of n:'],
  [10.5, 11.46, 'p minus one,'],
  [11.66, 13.9, 'times q minus one, which is forty.'],
  [14.42, 17.78, 'Choose a public exponent e that shares no factors with forty.'],
  [18.14, 18.78, "We'll use three."],
  [19.28, 20.58, 'Finally, find d,'],
  [20.74, 24.62, 'so that e times d leaves a remainder of one when divided by forty.'],
  [25.26, 28.52, "That's twenty-seven, because eighty-one is two forties plus one."],
  [28.98, 30.66, 'The public key is e and n.'],
  [31.1, 32.28, 'The private key is d.'],
  [32.7, 34.36, 'Everything else gets thrown away.'],
];

const c = (phrase: string, at: 'start' | 'end' = 'start') => cueOf(CHUNKS, phrase, at);

/* ---------- step list model ---------- */

type Seg = {
  text: string;
  cue: number; // frame the segment appears / is spoken
  val?: boolean; // a value: amber + highlight pulse when spoken
  small?: boolean; // side note (muted, smaller)
  ph?: string; // placeholder shown from the line's start until `cue`
  swap?: {cue: number; text: string}; // replace text at a later cue
};

const FS = 56; // step font size
const SMALL = 42;
const LEFT = 120;
const ROWS = [250, 380, 510, 640, 770];

const buildSteps = (): Seg[][] => [
  [
    {text: 'p = ', cue: c('p equals five')},
    {text: String(X.p), cue: c('five'), val: true},
    {text: ',  q = ', cue: c('q equals')},
    {text: String(X.q), cue: c('eleven'), val: true},
  ],
  [
    {text: 'n = p · q = ', cue: c('Multiply them')},
    {text: String(X.n), cue: c('fifty-five'), val: true},
  ],
  [
    {text: 'φ(n) = ', cue: c('phi of n')},
    {text: '(p−1)', cue: c('p minus one'), val: true},
    {text: '(q−1)', cue: c('q minus one'), val: true},
    {text: ' = 4 · 10 = ', cue: c('which is forty')},
    {text: String(X.phi), cue: c('is forty', 'end') - 6, val: true},
  ],
  [
    {text: 'e = ', cue: c('Choose a public')},
    {text: String(X.e), cue: c('three'), val: true, ph: '?'},
    {
      text: '   gcd(e, 40) = 1',
      cue: c('shares no factors'),
      small: true,
      swap: {cue: c('three'), text: '   gcd(3, 40) = 1'},
    },
  ],
  [
    {text: 'd = ', cue: c('find d')},
    {text: String(X.d), cue: c('twenty-seven'), val: true, ph: '?'},
    {
      text: '   3 · d mod 40 = 1',
      cue: c('leaves a remainder'),
      small: true,
      swap: {cue: c('eighty-one'), text: '   3 · 27 = 81 = 2·40 + 1'},
    },
  ],
];

const Segment: React.FC<{seg: Seg; lineStart: number}> = ({seg, lineStart}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const shown = frame >= seg.cue - 2;
  const pulse = spring({frame: frame - seg.cue, fps, config: {damping: 10}});
  const active = seg.val && shown ? Math.max(0, 1 - ease(frame, seg.cue + 18, seg.cue + 40)) : 0;
  const text = seg.swap && frame >= seg.swap.cue ? seg.swap.text : seg.text;

  if (!shown) {
    if (seg.ph && frame >= lineStart) {
      return <span style={{color: colors.dim}}>{seg.ph}</span>;
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

/* ---------- key cards ---------- */

const Card: React.FC<{
  color: string;
  title: string;
  rows: {label: string; value: string; filled: number}[];
  s: number;
}> = ({color, title, rows, s}) => (
  <div
    style={{
      width: 500,
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
      <div key={r.label} style={{fontFamily: fonts.mono, fontSize: 52, marginTop: 10, color: '#e2e8f0'}}>
        {r.label} ={' '}
        <span style={{color: r.filled > 0 ? colors.math : colors.dim, fontWeight: 800, opacity: r.filled > 0 ? r.filled : 1}}>
          {r.filled > 0 ? r.value : '?'}
        </span>
      </div>
    ))}
  </div>
);

/* ---------- scene ---------- */

export const S05KeyGen: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = (d: number, damping = 14) => spring({frame: frame - d, fps, config: {damping}});
  const steps = buildSteps();

  const tPair = c('tiny key pair');
  const tPick = c('Pick two primes');
  const tPubKey = c('The public key is');
  const tE = c('is e and n');
  const tN = c('and n');
  const tPrivD = c('The private key is d');
  const tD = c('is d');
  const tAway = c('Everything else');
  const tThrown = c('thrown away');

  const sHead = pop(0);
  const sCards = pop(tPair);
  // line start = its first segment cue (line 1 starts at "Pick two primes")
  const lineStarts = steps.map((l, i) => (i === 0 ? tPick : l[0].cue));
  const current = lineStarts.reduce((acc, t, i) => (frame >= t - 2 ? i : acc), -1);

  // flights from the step list into the cards
  const charW = FS * 0.6;
  const PUB: [number, number] = [1560, 400];
  const PRIV: [number, number] = [1560, 730];
  const flight = (t: number) => ease(frame, t, t + 22);
  const flyE = flight(tE);
  const flyN = flight(tN);
  const flyD = flight(tD);
  const srcE: [number, number] = [LEFT + 40 + charW * 4.5, ROWS[3]];
  const srcN: [number, number] = [LEFT + 40 + charW * 13, ROWS[1]];
  const srcD: [number, number] = [LEFT + 40 + charW * 5, ROWS[4]];
  // destinations inside the cards (value column)
  const dstE: [number, number] = [PUB[0] - 250 + 30 + charW * 0.93 * 4.5, PUB[1] + 30];
  const dstN: [number, number] = [PUB[0] - 250 + 30 + charW * 0.93 * 5, PUB[1] + 100];
  const dstD: [number, number] = [PRIV[0] - 250 + 30 + charW * 0.93 * 5, PRIV[1] + 30];

  const sPubGlow = ease(frame, tPubKey - 4, tPubKey + 10) * (1 - ease(frame, tPrivD - 4, tPrivD + 8));
  const sPrivGlow = ease(frame, tPrivD - 4, tPrivD + 10) * (1 - ease(frame, tAway, tAway + 10));
  const thrown = ease(frame, tAway + 2, tAway + 30);
  const sThrownLabel = pop(tThrown);

  const flyer = (p: number, from: [number, number], to: [number, number], text: string) =>
    p > 0 && p < 1 ? (
      <Place x={lerp(p, from[0], to[0])} y={lerp(p, from[1], to[1]) - Math.sin(p * Math.PI) * 80} s={1 + 0.3 * Math.sin(p * Math.PI)}>
        <div style={{fontFamily: fonts.mono, fontWeight: 800, fontSize: FS, color: colors.math}}>{text}</div>
      </Place>
    ) : null;

  return (
    <SceneFrame>
      <div
        style={{
          position: 'absolute',
          top: 70,
          width: '100%',
          textAlign: 'center',
          fontSize: 64,
          fontWeight: 800,
          opacity: sHead,
          transform: `translateY(${(1 - sHead) * 30}px)`,
        }}
      >
        Generating a tiny key pair
      </div>

      {/* step list */}
      {steps.map((line, i) => {
        const start = lineStarts[i];
        const sLine = pop(start, 18);
        const discard = i === 0 || i === 2 ? thrown : 0;
        if (frame < start - 2) return null;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: LEFT,
              top: ROWS[i],
              transform: `translate(${(1 - sLine) * -40}px, -50%) translateY(${discard * 16}px) rotate(${discard * -1.5}deg)`,
              opacity: Math.min(1, sLine) * (1 - discard * 0.85),
              fontFamily: fonts.mono,
              display: 'flex',
              alignItems: 'center',
              whiteSpace: 'pre',
              filter: discard > 0 ? `blur(${discard * 3}px)` : undefined,
            }}
          >
            <div
              style={{
                width: 12,
                height: 64,
                borderRadius: 6,
                marginRight: 28,
                background: current === i && frame < tPubKey ? colors.math : colors.dim,
              }}
            />
            {line.map((seg, j) => (
              <Segment key={j} seg={seg} lineStart={start} />
            ))}
            {discard > 0 && (
              <div
                style={{
                  position: 'absolute',
                  left: 30,
                  right: -10,
                  top: '50%',
                  height: 6,
                  background: colors.bad,
                  transform: `scaleX(${discard})`,
                  transformOrigin: 'left',
                }}
              />
            )}
          </div>
        );
      })}

      {/* key cards */}
      <Place x={PUB[0]} y={PUB[1]} style={{filter: `drop-shadow(0 0 ${28 * sPubGlow}px ${colors.publicKey})`}}>
        <Card
          color={colors.publicKey}
          title="Public key"
          s={sCards}
          rows={[
            {label: 'e', value: String(X.e), filled: flyE >= 1 ? 1 : 0},
            {label: 'n', value: String(X.n), filled: flyN >= 1 ? 1 : 0},
          ]}
        />
      </Place>
      <Place x={PRIV[0]} y={PRIV[1]} style={{filter: `drop-shadow(0 0 ${28 * sPrivGlow}px ${colors.privateKey})`}}>
        <Card
          color={colors.privateKey}
          title="Private key"
          s={pop(tPair + 8)}
          rows={[{label: 'd', value: String(X.d), filled: flyD >= 1 ? 1 : 0}]}
        />
      </Place>

      {flyer(flyE, srcE, dstE, String(X.e))}
      {flyer(flyN, srcN, dstN, String(X.n))}
      {flyer(flyD, srcD, dstD, String(X.d))}

      <Place x={620} y={920} o={sThrownLabel} s={0.9 + 0.1 * sThrownLabel}>
        <Label size={48} color={colors.bad}>
          p, q and φ(n): thrown away
        </Label>
      </Place>
    </SceneFrame>
  );
};
