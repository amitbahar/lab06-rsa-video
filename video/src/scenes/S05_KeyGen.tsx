// S05 — Generating the keys. See SCRIPT.md § S05.
import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, fonts, RSA_EXAMPLE as X} from '../shared/theme';
import {Eye, Key, Keyhole, Padlock, SceneFrame} from '../shared/components';
import {Chunk, cueOf, ease, Label, lerp, Place} from './A_helpers';
import {sentencesOf} from '../shared/timewarp';
import {Arrow, Card, CARD_W, FS, Pill, Seg, Segment} from './S05_parts';

/*
 * Timing. SENTENCES are the exact sentence timings of the current narration (durations.json).
 * PHRASES refine them with pause boundaries found by silence detection on public/audio/S05.wav
 * (RMS < 2 % of peak for ≥ 0.12 s), so value highlights land on the spoken words.
 */
const SENTENCES: Chunk[] = sentencesOf('S05');
const PHRASES: Chunk[] = [
  [0.11, 1.78, "Let's build a tiny key pair."],
  [2.36, 3.33, 'Pick two primes:'],
  [3.72, 6.09, 'p equals five, and q equals eleven.'],
  [6.71, 8.16, 'Multiply them to get n,'],
  [8.34, 9.09, 'fifty-five.'],
  [9.74, 11.27, 'Next, compute phi of n:'],
  [11.77, 12.74, 'p minus one,'],
  [12.92, 15.11, 'times q minus one, which is forty.'],
  [15.79, 17.41, 'Choose a public exponent e'],
  [17.82, 19.79, 'that shares no factors with forty.'],
  [20.51, 21.55, "We'll use three."],
  [22.23, 22.75, 'Finally,'],
  [22.9, 23.52, 'find d,'],
  [24.07, 28.18, 'so that e times d leaves a remainder of one when divided by forty.'],
  [28.78, 29.74, "That's twenty-seven,"],
  [30.08, 30.4, 'because'],
  [30.61, 32.73, 'eighty-one is two forties plus one.'],
  [33.38, 35.22, 'Notice why Bob could do this.'],
  [35.8, 37.53, 'Finding d needed phi of n,'],
  [38.02, 40.23, 'and phi came straight from p and q,'],
  [40.55, 41.81, 'which only Bob knows.'],
  [42.58, 45.29, 'Both keys grow out of the same secret primes,'],
  [45.71, 48.37, 'so they fit together like a padlock and its key.'],
  [48.96, 51.73, 'Bob publishes e and n as his public key,'],
  [52.2, 54.02, 'and keeps d as his private key.'],
  [54.71, 56.36, 'Everyone else sees only n.'],
  [57.16, 57.88, 'To get d,'],
  [58.25, 61.34, 'they would first have to factor n back into p and q,'],
  [61.86, 64.4, 'and that is exactly the hard direction of the trapdoor.'],
];

const c = (phrase: string, at: 'start' | 'end' = 'start') => {
  try {
    return cueOf(PHRASES, phrase, at);
  } catch {
    return cueOf(SENTENCES, phrase, at);
  }
};

/* ---------- step list ---------- */

const LEFT = 170;
const ROWS = [250, 380, 510, 640, 770];
const CH = FS * 0.6; // mono char width

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

/* ---------- layout constants ---------- */

const PUB: [number, number] = [1590, 390];
const PRIV: [number, number] = [1590, 730];
const CARD_X0 = PUB[0] - CARD_W / 2 + 34; // first char of a card row
const PUB_ROW1 = PUB[1] - 10; // y of "e = …" in the public card (measured on stills)
const PUB_ROW2 = PUB[1] + 68; // y of "n = …"
const PRIV_ROW1 = PRIV[1] + 30; // y of "d = …"

// "same secret primes" tree
const ROOT: [number, number] = [660, 300];
const LCHILD: [number, number] = [370, 540];
const RCHILD: [number, number] = [950, 540];
const LOCK: [number, number] = [370, 800];
const KEY0: [number, number] = [950, 842];
const TCH = 52 * 0.6; // tree pill char width

// attacker path (row)
const PY = 740;

/* ---------- scene ---------- */

export const S05KeyGen: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = (d: number, damping = 14) => spring({frame: frame - d, fps, config: {damping}});
  const steps = buildSteps();

  // cues
  const tPair = c('tiny key pair');
  const tPick = c('Pick two primes');
  const tNotice = c('Notice why');
  const tFindD = c('Finding d needed');
  const tPhiFrom = c('and phi came');
  const tOnlyBob = c('which only Bob');
  const tBoth = c('Both keys grow');
  const tSame = c('same secret primes');
  const tFit = c('fit together');
  const tPadlock = c('like a padlock');
  const tPub = c('Bob publishes');
  const tE = c('e and n as');
  const tN = c('n as his');
  const tKeeps = c('keeps d');
  const tD = c('d as his private');
  const tEveryone = c('Everyone else');
  const tOnlyN = c('only n');
  const tToGet = c('To get d');
  const tFactor = c('factor n back');
  const tIntoPQ = c('into p and q');
  const tExactly = c('that is exactly');
  const tHard = c('hard direction');
  const tTrap = c('trapdoor');

  /* phase switches */
  const listOut = ease(frame, tBoth - 8, tBoth + 16); // step list slides away
  const treeOut = ease(frame, tEveryone - 4, tEveryone + 16);
  const spot = ease(frame, tEveryone - 4, tEveryone + 14); // everything but the public card dims

  /* ---------- heading (cross-fades between the three parts) ---------- */
  const h1 = pop(0) * (1 - ease(frame, tNotice - 12, tNotice - 2));
  const h2 = ease(frame, tNotice, tNotice + 12) * (1 - ease(frame, tEveryone - 12, tEveryone - 2));
  const h3 = ease(frame, tEveryone, tEveryone + 12);
  const heading = (text: string, o: number, color: string = colors.text) =>
    o > 0 ? (
      <div
        style={{
          position: 'absolute',
          top: 70,
          width: '100%',
          textAlign: 'center',
          fontSize: 64,
          fontWeight: 800,
          color,
          opacity: o,
          transform: `translateY(${(1 - o) * 20}px)`,
        }}
      >
        {text}
      </div>
    ) : null;

  /* ---------- step list ---------- */
  const lineStarts = steps.map((l, i) => (i === 0 ? tPick : l[0].cue));
  const current = lineStarts.reduce((acc, t, i) => (frame >= t - 2 ? i : acc), -1);
  const focus = ease(frame, tNotice, tNotice + 15); // "Notice why…": dependency path in focus
  const arrPhiD = ease(frame, tFindD, tFindD + 22);
  const arrPQPhi = ease(frame, tPhiFrom, tPhiFrom + 22);
  const rowGlow = [arrPQPhi, 0, Math.max(arrPhiD, arrPQPhi), 0, arrPhiD];
  const sTag = pop(tOnlyBob);

  /* ---------- tree ---------- */
  const sRoot = pop(tBoth);
  const sSame = pop(tSame);
  const brL = ease(frame, tBoth + 8, tBoth + 30);
  const brR = ease(frame, tBoth + 14, tBoth + 36);
  const sL = pop(tBoth + 26);
  const sR = pop(tBoth + 32);
  const stem = ease(frame, tFit - 12, tFit + 6);
  const sLock = pop(tFit);
  const sKey = pop(tFit + 6);
  const slide = ease(frame, tPadlock, tPadlock + 28);
  const click = ease(frame, tPadlock + 28, tPadlock + 36);
  const flash = click * (1 - ease(frame, tPadlock + 40, tPadlock + 70));
  const sMatch = pop(tPadlock + 30);
  const keyPos: [number, number] = [lerp(slide, KEY0[0], LOCK[0] + 92), KEY0[1]];

  /* ---------- flights into the cards ---------- */
  const flight = (t: number) => ease(frame, t, t + 22);
  const flyE = flight(tE);
  const flyN = flight(tN);
  const flyD = flight(tD);
  const lPill = LCHILD[0] - (14 * TCH + 52) / 2; // left edge of "e = 3   n = 55"
  const rPill = RCHILD[0] - (6 * TCH + 52) / 2;
  const srcE: [number, number] = [lPill + 26 + 4.5 * TCH, LCHILD[1]];
  const srcN: [number, number] = [lPill + 26 + 13 * TCH, LCHILD[1]];
  const srcD: [number, number] = [rPill + 26 + 5 * TCH, RCHILD[1]];
  const CW = 52 * 0.6;
  const dstE: [number, number] = [CARD_X0 + 4.5 * CW, PUB_ROW1];
  const dstN: [number, number] = [CARD_X0 + 5 * CW, PUB_ROW2];
  const dstD: [number, number] = [CARD_X0 + 5 * CW, PRIV_ROW1];
  const filled = (p: number, t: number) => (p >= 1 ? Math.max(0.001, ease(frame, t + 22, t + 34)) : 0);
  const flyer = (p: number, from: [number, number], to: [number, number], text: string, color: string) =>
    p > 0 && p < 1 ? (
      <Place x={lerp(p, from[0], to[0])} y={lerp(p, from[1], to[1]) - Math.sin(p * Math.PI) * 90} s={1 + 0.3 * Math.sin(p * Math.PI)}>
        <div style={{fontFamily: fonts.mono, fontWeight: 800, fontSize: 52, color, textShadow: `0 0 18px ${color}`}}>{text}</div>
      </Place>
    ) : null;

  const pubGlow = Math.max(
    ease(frame, tPub - 4, tPub + 10) * (1 - ease(frame, tKeeps - 4, tKeeps + 8)),
    0.8 * spot,
  );
  const privGlow = ease(frame, tKeeps - 4, tKeeps + 10) * (1 - ease(frame, tEveryone - 4, tEveryone + 8));

  /* ---------- everyone else ---------- */
  const eyeOpen = ease(frame, tEveryone + 4, tEveryone + 16);
  const sight = ease(frame, tOnlyN, tOnlyN + 14);
  const sSees = pop(tOnlyN);
  const EYE: [number, number] = [1090, PUB_ROW2];
  const nGlow = sight * (0.6 + 0.4 * Math.sin((frame - tOnlyN) / 6));

  /* ---------- attacker's reverse path ---------- */
  const sPn = pop(tToGet);
  const sPd = pop(tToGet + 8);
  const aFactor = ease(frame, tFactor, tFactor + 20);
  const sPq = pop(tIntoPQ);
  const aPhi = ease(frame, tIntoPQ + 14, tIntoPQ + 30);
  const sPhi = pop(tIntoPQ + 24);
  const aD = ease(frame, tIntoPQ + 34, tIntoPQ + 50);
  const sBob = pop(tIntoPQ + 40);
  const sHole = pop(tExactly);
  const hardPulse = spring({frame: frame - tHard, fps, config: {damping: 8}});
  const trapGlow = ease(frame, tTrap, tTrap + 12);

  return (
    <SceneFrame>
      {heading('Generating a tiny key pair', h1)}
      {heading('Why Bob can make both keys', h2)}
      {heading('What everyone else sees', h3)}

      {/* ===== step list (slides away once the tree takes over) ===== */}
      {listOut < 1 && (
        <div style={{position: 'absolute', inset: 0, opacity: 1 - listOut, transform: `translateX(${-260 * listOut}px)`}}>
          {steps.map((line, i) => {
            const start = lineStarts[i];
            const sLine = pop(start, 18);
            if (frame < start - 2) return null;
            const onPath = i % 2 === 0;
            const g = rowGlow[i];
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: LEFT,
                  top: ROWS[i],
                  transform: `translate(${(1 - sLine) * -40}px, -50%)`,
                  opacity: Math.min(1, sLine) * (onPath ? 1 : 1 - 0.65 * focus),
                  fontFamily: fonts.mono,
                  display: 'flex',
                  alignItems: 'center',
                  whiteSpace: 'pre',
                  padding: '4px 18px 4px 0',
                  borderRadius: 18,
                  background: `rgba(244, 114, 182, ${0.12 * g})`,
                  boxShadow: g > 0 ? `0 0 ${34 * g}px rgba(244, 114, 182, ${0.55 * g})` : 'none',
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 64,
                    borderRadius: 6,
                    marginRight: 28,
                    background: g > 0.5 ? colors.privateKey : current === i && frame < tNotice ? colors.math : colors.dim,
                  }}
                />
                {line.map((seg, j) => (
                  <Segment key={j} seg={seg} lineStart={start} />
                ))}
              </div>
            );
          })}

          {/* dependency arrows in the left gutter: p, q → φ(n) → d */}
          <Arrow
            d={`M ${LEFT - 22} ${ROWS[0] + 24} C ${LEFT - 130} ${ROWS[0] + 70}, ${LEFT - 130} ${ROWS[2] - 70}, ${LEFT - 26} ${ROWS[2] - 20}`}
            p={arrPQPhi}
            color={colors.privateKey}
            head={[LEFT - 24, ROWS[2] - 20, 25]}
            glow
          />
          <Arrow
            d={`M ${LEFT - 22} ${ROWS[2] + 24} C ${LEFT - 130} ${ROWS[2] + 70}, ${LEFT - 130} ${ROWS[4] - 70}, ${LEFT - 26} ${ROWS[4] - 20}`}
            p={arrPhiD}
            color={colors.privateKey}
            head={[LEFT - 24, ROWS[4] - 20, 25]}
            glow
          />

          {/* "only Bob knows" tag on p, q */}
          <div
            style={{
              position: 'absolute',
              left: LEFT + 40 + 15 * CH + 30,
              top: ROWS[0],
              transform: `translateY(-50%) scale(${0.7 + 0.3 * sTag})`,
              transformOrigin: 'left center',
              opacity: sTag,
              padding: '8px 24px',
              borderRadius: 999,
              background: `${colors.privateKey}26`,
              border: `3px solid ${colors.privateKey}`,
              color: colors.privateKey,
              fontSize: 42,
              fontWeight: 800,
              whiteSpace: 'nowrap',
            }}
          >
            only Bob knows
          </div>
        </div>
      )}

      {/* ===== "same secret primes" tree ===== */}
      {frame >= tBoth - 2 && treeOut < 1 && (
        <div style={{position: 'absolute', inset: 0, opacity: 1 - treeOut}}>
          <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
            <path
              d={`M ${ROOT[0]} ${ROOT[1] + 46} C ${ROOT[0]} ${ROOT[1] + 130}, ${LCHILD[0]} ${LCHILD[1] - 130}, ${LCHILD[0]} ${LCHILD[1] - 46}`}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - brL}
              stroke={colors.publicKey}
              strokeWidth={8}
              fill="none"
              strokeLinecap="round"
            />
            <path
              d={`M ${ROOT[0]} ${ROOT[1] + 46} C ${ROOT[0]} ${ROOT[1] + 130}, ${RCHILD[0]} ${RCHILD[1] - 130}, ${RCHILD[0]} ${RCHILD[1] - 46}`}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - brR}
              stroke={colors.privateKey}
              strokeWidth={8}
              fill="none"
              strokeLinecap="round"
            />
            <line x1={LCHILD[0]} y1={LCHILD[1] + 46} x2={LCHILD[0]} y2={lerp(stem, LCHILD[1] + 46, LOCK[1] - 100)} stroke={colors.publicKey} strokeWidth={6} strokeDasharray="14 12" opacity={stem} />
            <line x1={RCHILD[0]} y1={RCHILD[1] + 46} x2={RCHILD[0]} y2={lerp(stem, RCHILD[1] + 46, KEY0[1] - 70)} stroke={colors.privateKey} strokeWidth={6} strokeDasharray="14 12" opacity={stem * (1 - slide)} />
          </svg>

          <Place x={ROOT[0]} y={ROOT[1] - 90} o={sSame} s={0.8 + 0.2 * sSame}>
            <Label size={44} color={colors.privateKey}>
              same secret primes
            </Label>
          </Place>
          <Place x={ROOT[0]} y={ROOT[1]} o={sRoot} s={0.6 + 0.4 * sRoot}>
            <Pill color={colors.privateKey} size={56} glow={0.6}>
              <span style={{color: colors.math}}>p = 5,  q = 11</span>
            </Pill>
          </Place>
          <Place x={LCHILD[0]} y={LCHILD[1]} o={sL} s={0.6 + 0.4 * sL}>
            <Pill color={colors.publicKey}>
              {'e = '}
              <span style={{color: colors.math, opacity: flyE > 0 ? 0.35 : 1}}>{X.e}</span>
              {'   n = '}
              <span style={{color: colors.math, opacity: flyN > 0 ? 0.35 : 1}}>{X.n}</span>
            </Pill>
          </Place>
          <Place x={RCHILD[0]} y={RCHILD[1]} o={sR} s={0.6 + 0.4 * sR}>
            <Pill color={colors.privateKey}>
              {'d = '}
              <span style={{color: colors.math, opacity: flyD > 0 ? 0.35 : 1}}>{X.d}</span>
            </Pill>
          </Place>

          {/* key (drawn under the padlock so it looks inserted) */}
          <Place x={keyPos[0]} y={keyPos[1]} o={sKey} s={0.6 + 0.4 * sKey} rot={180}>
            <Key color={colors.privateKey} size={200} />
          </Place>
          <Place
            x={LOCK[0]}
            y={LOCK[1]}
            o={sLock}
            s={(0.6 + 0.4 * sLock) * (1 + 0.12 * flash)}
            style={{filter: `drop-shadow(0 0 ${40 * flash}px ${colors.ok})`}}
          >
            <Padlock color={colors.publicKey} size={130} closed={1} />
          </Place>
          <Place x={(LOCK[0] + KEY0[0]) / 2 + 40} y={LOCK[1] - 10} o={sMatch} s={0.8 + 0.2 * sMatch}>
            <Label size={46} color={colors.ok}>
              ✓ they fit
            </Label>
          </Place>
        </div>
      )}

      {/* ===== key cards ===== */}
      <Place x={PUB[0]} y={PUB[1]} style={{filter: `drop-shadow(0 0 ${30 * pubGlow}px ${colors.publicKey})`}}>
        <Card
          color={colors.publicKey}
          title="Public key"
          s={pop(tPair)}
          rows={[
            {label: 'e', value: String(X.e), filled: filled(flyE, tE)},
            {label: 'n', value: String(X.n), filled: filled(flyN, tN)},
          ]}
        />
      </Place>
      <Place
        x={PRIV[0]}
        y={PRIV[1]}
        o={1 - 0.75 * spot}
        style={{filter: `drop-shadow(0 0 ${30 * privGlow}px ${colors.privateKey})`}}
      >
        <Card
          color={colors.privateKey}
          title="Private key"
          s={pop(tPair + 8)}
          rows={[{label: 'd', value: String(X.d), filled: filled(flyD, tD)}]}
        />
      </Place>

      {flyer(flyE, srcE, dstE, String(X.e), colors.publicKey)}
      {flyer(flyN, srcN, dstN, String(X.n), colors.publicKey)}
      {flyer(flyD, srcD, dstD, String(X.d), colors.privateKey)}

      {/* ===== everyone else sees only n ===== */}
      {spot > 0 && (
        <>
          {/* ring around n = 55 in the public card */}
          <div
            style={{
              position: 'absolute',
              left: CARD_X0 - 16,
              top: PUB_ROW2 - 44,
              width: 7 * CW + 32,
              height: 88,
              borderRadius: 18,
              border: `4px solid ${colors.bad}`,
              opacity: sight,
              boxShadow: `0 0 ${30 * nGlow}px ${colors.bad}`,
            }}
          />
          <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
            <line
              x1={EYE[0] + 95}
              y1={EYE[1]}
              x2={lerp(sight, EYE[0] + 95, CARD_X0 - 26)}
              y2={EYE[1]}
              stroke={colors.bad}
              strokeWidth={6}
              strokeDasharray="16 12"
              opacity={sight}
            />
          </svg>
          <Place x={EYE[0]} y={EYE[1]} o={spot} s={0.7 + 0.3 * spot}>
            <Eye size={170} open={eyeOpen} />
          </Place>
          <Place x={EYE[0]} y={EYE[1] - 105} o={sSees} s={0.8 + 0.2 * sSees}>
            <Label size={44} color={colors.bad}>
              sees only n
            </Label>
          </Place>
        </>
      )}

      {/* ===== attacker's reverse path: n → p, q → φ → d ===== */}
      {frame >= tToGet - 2 && (
        <>
          <Arrow d={`M 312 ${PY} L 520 ${PY}`} p={aFactor} color={colors.bad} head={[536, PY, 0]} width={10} glow />
          <Arrow d={`M 710 ${PY} L 790 ${PY}`} p={aPhi} color={colors.dim} head={[806, PY, 0]} width={8} />
          <Arrow d={`M 990 ${PY} L 1066 ${PY}`} p={aD} color={colors.dim} head={[1082, PY, 0]} width={8} />

          <Place x={424} y={PY - 52} o={aFactor}>
            <Label size={42} color={colors.bad}>
              factor
            </Label>
          </Place>

          <Place x={200} y={PY} o={sPn} s={0.6 + 0.4 * sPn}>
            <Pill color={colors.publicKey} size={50}>
              {'n = '}
              <span style={{color: colors.math}}>{X.n}</span>
            </Pill>
          </Place>
          <Place x={628} y={PY} o={sPq} s={0.6 + 0.4 * sPq}>
            <Pill color={colors.privateKey} size={50} dashed>
              <span style={{filter: 'blur(9px)', color: colors.math}}>p, q</span>
            </Pill>
          </Place>
          <Place x={900} y={PY} o={sPhi} s={0.6 + 0.4 * sPhi}>
            <Pill color={colors.privateKey} size={50} dashed>
              <span style={{filter: 'blur(9px)', color: colors.math}}>φ(n)</span>
            </Pill>
          </Place>
          <Place x={1180} y={PY} o={sPd} s={0.6 + 0.4 * sPd}>
            <Pill color={colors.privateKey} size={50} dashed>
              {'d = '}
              <span style={{color: colors.privateKey}}>?</span>
            </Pill>
          </Place>

          {/* Bob's side: the bits only Bob has */}
          <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity: sBob}}>
            <path
              d={`M 552 ${PY + 62} V ${PY + 80} H 976 V ${PY + 62}`}
              fill="none"
              stroke={colors.privateKey}
              strokeWidth={5}
              strokeLinecap="round"
            />
          </svg>
          <Place x={764} y={PY + 126} o={sBob} s={0.8 + 0.2 * sBob}>
            <Label size={42} color={colors.privateKey}>
              hidden on Bob's side
            </Label>
          </Place>

          {/* the trapdoor: factoring is the hard direction */}
          <Place
            x={392}
            y={PY + 150}
            o={sHole}
            s={(0.6 + 0.4 * sHole) * (1 + 0.1 * Math.sin(Math.min(1, hardPulse) * Math.PI))}
            style={{filter: `drop-shadow(0 0 ${30 * trapGlow}px ${colors.math})`}}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
              <Keyhole size={110} color={colors.math} />
              <div style={{fontSize: 56, fontWeight: 900, color: colors.bad}}>hard</div>
            </div>
          </Place>
        </>
      )}
    </SceneFrame>
  );
};
