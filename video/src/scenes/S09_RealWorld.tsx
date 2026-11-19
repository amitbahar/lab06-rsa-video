// S09 — RSA in the real world. See SCRIPT.md § S09.
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {colors, fonts, RSA_EXAMPLE as X} from '../shared/theme';
import {Avatar, Heading, Key, SceneFrame} from '../shared/components';
import {N2048} from './B_n2048';
import {ease, MiniLock, Place, PopAt, makeT, Txt, useSpring} from './B_helpers';

const T = makeT('S09');

const F = {
  toy: T(1.8), // "five and eleven"
  grow: [T(3.9), T(6.4)] as const, // "They use primes hundreds of digits long"
  primes: T(4.6),
  bits: T(6.6), // "two thousand forty-eight bits or more"
  aOut: [T(9.4), T(9.9)] as const,
  practice: T(9.8), // "And in practice"
  rsaLane: T(11.0), // "RSA is used to exchange or sign a small secret"
  send: [T(12.4), T(14.1)] as const,
  aes: T(14.7), // "while faster algorithms encrypt the actual data"
  footnote: T(15.6),
};

const LANE = {x1: 310, x2: 1610, rsa: 400, aes: 660};

const DigitWall: React.FC = () => {
  const frame = useCurrentFrame();
  const g = ease(frame, F.grow[0], F.grow[1]);
  const shown = Math.round(interpolate(g, [0, 1], [2, N2048.length]));
  const digits = g === 0 ? String(X.n) : N2048.slice(0, shown);
  const size = interpolate(g, [0, 0.35, 1], [120, 44, 30]);
  return (
    <Place x={960} y={500}>
      <div
        style={{
          width: 1720,
          textAlign: 'center',
          fontFamily: fonts.mono,
          fontSize: size,
          lineHeight: 1.35,
          color: colors.math,
          wordBreak: 'break-all',
        }}
      >
        <span style={{color: colors.text, fontWeight: 700}}>n = </span>
        {digits}
      </div>
    </Place>
  );
};

/** RSA-wrapped gold session key, travelling as one packet. */
const WrappedKey: React.FC = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '12px 22px',
      borderRadius: 18,
      background: '#0f172a',
      border: `4px solid ${colors.publicKey}`,
    }}
  >
    <MiniLock size={44} color={colors.publicKey} />
    <Key color={colors.sharedKey} size={110} />
  </div>
);

const AesPipe: React.FC = () => {
  const frame = useCurrentFrame();
  const open = ease(frame, F.aes, F.aes + 15);
  const appear = useSpring(F.rsaLane + 15, 16);
  const W = LANE.x2 - LANE.x1;
  const t = Math.max(0, frame - F.aes);
  const blocks = Array.from({length: 12}).map((_, i) => {
    const x = ((t * 16 + i * ((W + 120) / 12)) % (W + 120)) - 100;
    return x;
  });
  return (
    <div
      style={{
        position: 'absolute',
        left: LANE.x1,
        top: LANE.aes - 60,
        width: W,
        height: 120,
        borderRadius: 60,
        border: `5px solid ${colors.sharedKey}`,
        background: `${colors.sharedKey}14`,
        overflow: 'hidden',
        opacity: Math.min(1, appear) * (0.35 + 0.65 * open),
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 52,
          fontWeight: 800,
          color: colors.sharedKey,
          opacity: 1 - open,
        }}
      >
        AES
      </div>
      {open > 0 &&
        blocks.map((x, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: 30,
              width: 80,
              height: 50,
              borderRadius: 10,
              background: i % 3 === 0 ? colors.sharedKey : `${colors.sharedKey}88`,
              opacity: open,
            }}
          />
        ))}
    </div>
  );
};

export const S09RealWorld: React.FC = () => {
  const frame = useCurrentFrame();
  const aOut = 1 - ease(frame, F.aOut[0], F.aOut[1]);
  const toyOut = 1 - ease(frame, F.grow[0], F.grow[0] + 12);

  const laneIn = useSpring(F.rsaLane, 16);
  const sendP = ease(frame, F.send[0], F.send[1]);
  const pktIn = useSpring(F.send[0] - 10, 14);
  const arrived = useSpring(F.send[1], 12);
  const aliceKey = useSpring(F.rsaLane + 6, 14);
  const pIn = useSpring(F.practice, 16);

  return (
    <SceneFrame>
      <Heading>RSA in the real world</Heading>

      {/* Phase A: toy n → 2048-bit n */}
      <div style={{opacity: aOut}}>
        <DigitWall />
        <PopAt x={960} y={680} delay={F.toy} out={[F.grow[0], F.grow[0] + 12]}>
          <Txt size={50} color={colors.muted} style={{opacity: toyOut}}>
            = {X.p} × {X.q} <span style={{color: colors.bad}}>— a toy example</span>
          </Txt>
        </PopAt>
        <PopAt x={960} y={250} delay={F.primes}>
          <Txt size={46} color={colors.muted}>
            p and q: each about 309 digits long
          </Txt>
        </PopAt>
        <PopAt x={960} y={820} delay={F.bits}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: colors.math,
              padding: '14px 40px',
              borderRadius: 24,
              border: `4px solid ${colors.math}`,
              background: '#0f172a',
              whiteSpace: 'nowrap',
            }}
          >
            2048-bit n ≈ 617 digits
          </div>
        </PopAt>
        <PopAt x={960} y={930} delay={F.bits + 20}>
          <Txt size={42} color={colors.muted}>
            (2048 bits or more)
          </Txt>
        </PopAt>
      </div>

      {/* Phase B: hybrid encryption */}
      <div style={{opacity: Math.min(1, pIn)}}>
        {frame >= F.practice - 2 && (
          <>
            <Place x={960} y={215} o={Math.min(1, pIn)}>
              <Txt size={50} color={colors.muted}>
                In practice: <span style={{color: colors.text}}>hybrid encryption</span>
              </Txt>
            </Place>
            <Place x={170} y={560} o={Math.min(1, pIn)}>
              <Avatar name="Alice" color={colors.publicKey} size={110} />
            </Place>
            <Place x={1750} y={560} o={Math.min(1, pIn)}>
              <Avatar name="Bob" color={colors.privateKey} size={110} />
            </Place>

            {/* RSA lane */}
            <div
              style={{
                position: 'absolute',
                left: LANE.x1,
                top: LANE.rsa - 3,
                width: (LANE.x2 - LANE.x1) * Math.min(1, laneIn),
                height: 6,
                borderRadius: 3,
                background: `repeating-linear-gradient(90deg, ${colors.publicKey}88 0 24px, transparent 24px 36px)`,
              }}
            />
            <PopAt x={960} y={318} delay={F.rsaLane}>
              <Txt size={44} color={colors.publicKey}>
                RSA: wraps a small secret key (slow, but only once)
              </Txt>
            </PopAt>
            <Place x={170} y={410} o={Math.min(1, aliceKey)} s={aliceKey}>
              <Key color={colors.sharedKey} size={110} />
            </Place>
            {frame >= F.send[0] - 10 && (
              <Place
                x={LANE.x1 + 90 + (LANE.x2 - LANE.x1 - 180) * sendP}
                y={LANE.rsa}
                o={Math.min(1, pktIn) * (1 - ease(frame, F.send[1], F.send[1] + 8))}
                s={pktIn}
              >
                <WrappedKey />
              </Place>
            )}
            {/* both now hold the gold session key */}
            <Place x={1750} y={410} o={Math.min(1, arrived)} s={arrived}>
              <Key color={colors.sharedKey} size={110} />
            </Place>

            {/* AES pipe */}
            <AesPipe />
            <PopAt x={960} y={790} delay={F.aes}>
              <Txt size={44} color={colors.sharedKey}>
                AES with that key: fast, for all the actual data
              </Txt>
            </PopAt>
            <PopAt x={960} y={1000} delay={F.footnote}>
              <Txt size={34} weight={500} color={colors.muted}>
                Real systems also use padding (OAEP / PSS).
              </Txt>
            </PopAt>
          </>
        )}
      </div>
    </SceneFrame>
  );
};
