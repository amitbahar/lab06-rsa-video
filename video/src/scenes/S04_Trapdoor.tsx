// S04 — The one-way trapdoor. See SCRIPT.md § S04.
import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, fonts} from '../shared/theme';
import {Keyhole, Padlock, SceneFrame} from '../shared/components';
import {Chunk, cueOf, ease, Label, Place} from './A_helpers';

const CHUNKS: Chunk[] = [
  [0.0, 1.08, 'To build such a lock,'],
  [1.42, 3.98, 'RSA uses a mathematical trapdoor.'],
  [4.52, 7.4, 'Multiplying two large prime numbers is easy.'],
  [7.96, 11.84, 'But taking the result and finding the original primes is incredibly hard.'],
  [12.48, 13.76, 'Easy in one direction,'],
  [14.08, 15.86, 'practically impossible in the other,'],
  [16.2, 17.6, 'unless you know the secret.'],
];

// primes tried by trial division on 3233 = 53 × 61
const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53];

// 617 pseudo-random digits standing in for a 2048-bit modulus (illustrative only)
const BIG = (() => {
  let x = 20481977;
  let s = '';
  for (let i = 0; i < 617; i++) {
    x = (x * 1103515245 + 12345) % 2147483648;
    s += i === 0 ? String(1 + (x % 9)) : String(Math.floor(x / 65536) % 10);
  }
  return s.slice(0, 616) + '7';
})();

const LEFT_X = 520;
const RIGHT_X = 1400;
const ROW1 = 330;
const ROW2 = 570;

const Arrow: React.FC<{dir: 'right' | 'left'; color: string; progress: number; label: string; width?: number}> = ({
  dir,
  color,
  progress,
  label,
  width = 380,
}) => {
  const len = width * progress;
  return (
    <div style={{width, textAlign: 'center'}}>
      <div style={{fontSize: 44, fontWeight: 800, color, opacity: progress, marginBottom: 6}}>{label}</div>
      <svg width={width} height={40} viewBox={`0 0 ${width} 40`}>
        {dir === 'right' ? (
          <>
            <line x1={0} y1={20} x2={Math.max(0, len - 18)} y2={20} stroke={color} strokeWidth={8} strokeLinecap="round" />
            {progress > 0.05 && <path d={`M${len - 30} 4 L${len} 20 L${len - 30} 36 Z`} fill={color} />}
          </>
        ) : (
          <>
            <line x1={width} y1={20} x2={width - Math.max(0, len - 18)} y2={20} stroke={color} strokeWidth={8} strokeLinecap="round" />
            {progress > 0.05 && <path d={`M${width - len + 30} 4 L${width - len} 20 L${width - len + 30} 36 Z`} fill={color} />}
          </>
        )}
      </svg>
    </div>
  );
};

const Num: React.FC<{children: React.ReactNode; color?: string; size?: number}> = ({children, color = colors.math, size = 80}) => (
  <div style={{fontFamily: fonts.mono, fontWeight: 800, fontSize: size, color, whiteSpace: 'nowrap'}}>{children}</div>
);

export const S04Trapdoor: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = (d: number, damping = 14) => spring({frame: frame - d, fps, config: {damping}});

  const tTrapdoor = cueOf(CHUNKS, 'mathematical trapdoor');
  const tMult = cueOf(CHUNKS, 'Multiplying');
  const tEasy = cueOf(CHUNKS, 'is easy');
  const tBut = cueOf(CHUNKS, 'But taking');
  const tFinding = cueOf(CHUNKS, 'finding the original');
  const tHard = cueOf(CHUNKS, 'incredibly hard');
  const tEasyDir = cueOf(CHUNKS, 'Easy in one direction');
  const tImpossible = cueOf(CHUNKS, 'practically impossible');
  const tUnless = cueOf(CHUNKS, 'unless you know');

  /* ---- intro: the lock needs a trapdoor ---- */
  const sIntro = pop(0);
  const introOut = 1 - ease(frame, tMult - 12, tMult + 4);
  const sTrapWord = pop(tTrapdoor - 4);

  /* ---- row 1: easy ---- */
  const sRow1 = pop(tMult);
  const arrow1 = ease(frame, tMult + 10, tMult + 28);
  const product = Math.round(
    interpolate(frame, [tMult + 24, tMult + 40], [0, 3233], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
  );
  const sProduct = pop(tMult + 22);
  const sInstant = pop(tEasy);

  /* ---- row 2: hard ---- */
  const sRow2 = pop(tBut);
  const arrow2 = ease(frame, tFinding - 6, tFinding + 30);
  const trialStart = tFinding + 10;
  const trialEnd = tHard + 10;
  const idx = Math.floor(
    interpolate(frame, [trialStart, trialEnd], [0, PRIMES.length - 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );
  const found = frame >= trialEnd;
  const sTrial = pop(trialStart - 4);
  const sFound = pop(trialEnd);

  /* ---- emphasis + scale up ---- */
  const glow = ease(frame, tEasyDir - 4, tEasyDir + 10);
  const sBig = pop(tEasyDir + 14, 18);
  const scroll = interpolate(frame, [tEasyDir + 14, tUnless + 20], [0, 5200], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const sAge = pop(tImpossible + 6);
  const bigOut = 1 - ease(frame, tUnless - 4, tUnless + 8);
  const sKeyhole = pop(tUnless + 2);

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
          opacity: pop(tMult - 6),
        }}
      >
        A one-way trapdoor
      </div>

      {/* intro */}
      <Place x={960} y={440} s={sIntro * (0.6 + 0.4 * introOut)} o={sIntro * introOut}>
        <Padlock color={colors.publicKey} size={180} closed={ease(frame, 10, 24)} />
      </Place>
      <Place x={960} y={700} o={sIntro * introOut * (1 - sTrapWord)}>
        <Label size={56}>How do you build such a lock?</Label>
      </Place>
      <Place x={960} y={700} o={sTrapWord * introOut} s={0.9 + 0.1 * sTrapWord}>
        <Label size={64} color={colors.math} weight={800}>
          A mathematical trapdoor
        </Label>
      </Place>

      {/* row 1: multiply (easy) */}
      <div
        style={{
          position: 'absolute',
          left: 300,
          top: ROW1 - 95,
          width: 1320,
          height: 190,
          borderRadius: 28,
          background: `${colors.ok}14`,
          border: `3px solid ${colors.ok}`,
          opacity: glow * 0.9,
        }}
      />
      <Place x={LEFT_X} y={ROW1} o={sRow1} s={0.8 + 0.2 * sRow1}>
        <Num>61 × 53</Num>
      </Place>
      <Place x={960} y={ROW1 - 22} o={sRow1}>
        <Arrow dir="right" color={colors.ok} progress={arrow1} label="easy" />
      </Place>
      <Place x={RIGHT_X} y={ROW1} o={sProduct}>
        <Num>{product}</Num>
      </Place>
      <Place x={960} y={ROW1 + 60} o={sInstant}>
        <Label size={40} color={colors.ok} weight={600}>
          instant
        </Label>
      </Place>

      {/* row 2: factor (hard) */}
      <div
        style={{
          position: 'absolute',
          left: 300,
          top: ROW2 - 95,
          width: 1320,
          height: 190,
          borderRadius: 28,
          background: `${colors.bad}14`,
          border: `3px solid ${colors.bad}`,
          opacity: glow * 0.9,
        }}
      />
      <Place x={RIGHT_X} y={ROW2} o={sRow2} s={0.8 + 0.2 * sRow2}>
        <Num>3233</Num>
      </Place>
      <Place x={960} y={ROW2 - 22} o={sRow2}>
        <Arrow dir="left" color={colors.bad} progress={arrow2} label="hard" />
      </Place>
      <Place x={LEFT_X} y={ROW2} o={sRow2}>
        <Num color={found ? colors.math : colors.muted}>{found ? '53 × 61' : '? × ?'}</Num>
      </Place>
      <Place x={960} y={ROW2 + 62} o={sTrial * (1 - sFound)}>
        <div style={{fontFamily: fonts.mono, fontSize: 40, color: colors.muted, whiteSpace: 'nowrap'}}>
          trying ÷ <span style={{color: colors.bad, fontWeight: 800}}>{String(PRIMES[idx]).padStart(2, ' ')}</span> …
        </div>
      </Place>
      <Place x={960} y={ROW2 + 62} o={sFound}>
        <Label size={40} color={colors.bad} weight={600}>
          {PRIMES.length} tries… n is tiny
        </Label>
      </Place>

      {/* scale up: a real-size modulus */}
      <Place x={960} y={800} o={sBig * bigOut}>
        <div
          style={{
            width: 1500,
            overflow: 'hidden',
            WebkitMaskImage: 'linear-gradient(90deg, transparent, black 12%, black 88%, transparent)',
            maskImage: 'linear-gradient(90deg, transparent, black 12%, black 88%, transparent)',
          }}
        >
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: 56,
              fontWeight: 700,
              color: colors.math,
              whiteSpace: 'nowrap',
              transform: `translateX(${-scroll}px)`,
            }}
          >
            {BIG}
          </div>
        </div>
      </Place>
      <Place x={960} y={880} o={sBig * bigOut * (1 - sAge)}>
        <Label size={44} color={colors.muted} weight={600}>
          a real key: 617 digits
        </Label>
      </Place>
      <Place x={960} y={880} o={sAge * bigOut} s={0.9 + 0.1 * sAge}>
        <Label size={48} color={colors.bad}>
          factoring it: longer than the age of the universe
        </Label>
      </Place>

      {/* trapdoor */}
      <Place x={960} y={840} o={sKeyhole} s={0.7 + 0.3 * sKeyhole}>
        <div style={{display: 'flex', alignItems: 'center', gap: 36}}>
          <Keyhole size={150} color={colors.math} />
          <div style={{textAlign: 'left'}}>
            <Label size={56} color={colors.math} weight={800}>
              trapdoor = knowing p and q
            </Label>
          </div>
        </div>
      </Place>
    </SceneFrame>
  );
};

