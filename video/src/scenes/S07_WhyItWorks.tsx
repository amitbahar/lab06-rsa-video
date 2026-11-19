// S07 — Why it works. See SCRIPT.md § S07.
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {colors, fonts, RSA_EXAMPLE as X} from '../shared/theme';
import {Heading, Keyhole, SceneFrame} from '../shared/components';
import {ease, MiniLock, Place, PopAt, Sup, makeT, Txt, useSpring} from './B_helpers';

const T = makeT('S07');

const F = {
  inverse: T(2.9), // "chosen as inverses"
  me: T(4.4), // "raising to e"
  d: T(5.4), // "and then to d"
  ed: T(6.9), // "the same as raising to e times d"
  m: T(9.3), // "brings every message back to itself"
  example: T(10.0),
  chainLabel: T(10.9),
  boxD: T(11.2), // "To find d"
  boxPhi: T(12.9), // "needs phi of n"
  boxPQ: T(14.1), // "and to get phi"
  boxFactor: T(15.5), // "they need to factor n"
  trapdoor: T(16.9), // "That's the trapdoor"
};

const Bit: React.FC<{at: number; children: React.ReactNode; color?: string}> = ({at, children, color}) => {
  const s = useSpring(at, 15);
  return (
    <span style={{opacity: Math.min(1, s), display: 'inline-block', transform: `translateY(${(1 - s) * 20}px)`, color}}>
      {children}
    </span>
  );
};

const ChainBox: React.FC<{
  x: number;
  at: number;
  label: React.ReactNode;
  sub: string;
  color: string;
  border?: string;
  glow?: number;
  lock?: boolean;
}> = ({x, at, label, sub, color, border = colors.dim, glow = 0, lock}) => {
  const s = useSpring(at, 13);
  return (
    <>
      <Place x={x} y={790} o={Math.min(1, s)} s={0.6 + 0.4 * s}>
        <div
          style={{
            width: 270,
            height: 140,
            borderRadius: 24,
            border: `4px solid ${border}`,
            background: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            fontFamily: fonts.mono,
            fontSize: 58,
            fontWeight: 800,
            color,
            boxShadow: `0 0 ${50 * glow}px ${colors.math}${glow > 0 ? '99' : '00'}`,
            whiteSpace: 'nowrap',
          }}
        >
          {label}
          {lock && <MiniLock size={44} color={colors.bad} />}
        </div>
      </Place>
      <Place x={x} y={905} o={Math.min(1, s)}>
        <Txt size={38} weight={600} color={colors.muted}>
          {sub}
        </Txt>
      </Place>
    </>
  );
};

const Arrow: React.FC<{x: number; at: number}> = ({x, at}) => {
  const s = useSpring(at, 16);
  return (
    <Place x={x} y={790} o={Math.min(1, s)} style={{transform: `translate(-50%, -50%) translateX(${(1 - s) * 30}px)`}}>
      <Txt size={64} color={colors.muted}>
        ←
      </Txt>
    </Place>
  );
};

export const S07WhyItWorks: React.FC = () => {
  const frame = useCurrentFrame();
  const topDim = interpolate(frame, [F.chainLabel, F.chainLabel + 20], [1, 0.6], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const loopBack = ease(frame, F.m, F.m + 20);
  const trap = useSpring(F.trapdoor, 12);
  const factorBad = ease(frame, F.boxFactor + 6, F.boxFactor + 16);

  return (
    <SceneFrame>
      <Heading>Why it works</Heading>

      <div style={{opacity: topDim}}>
        {/* Main chain */}
        <Place x={960} y={290}>
          <div style={{fontFamily: fonts.mono, fontSize: 80, color: colors.math, whiteSpace: 'nowrap'}}>
            <Bit at={F.me}>
              (m<Sup color={colors.publicKey}>e</Sup>)
            </Bit>
            <Bit at={F.d}>
              <Sup color={colors.privateKey}>d</Sup>
            </Bit>
            <Bit at={F.ed}>
              {'\u00a0'}= m
              <Sup>
                <span style={{color: colors.publicKey}}>e</span>·<span style={{color: colors.privateKey}}>d</span>
              </Sup>
            </Bit>
            <Bit at={F.m}>
              {'\u00a0'}≡{'\u00a0'}
              <span
                style={{
                  color: colors.ok,
                  fontWeight: 800,
                  display: 'inline-block',
                  transform: `scale(${1 + 0.25 * Math.sin(loopBack * Math.PI)})`,
                }}
              >
                m
              </span>{' '}
              <span style={{fontSize: 56}}>(mod n)</span>
            </Bit>
          </div>
        </Place>

        {/* Inverse condition */}
        <PopAt x={960} y={420} delay={F.inverse}>
          <div style={{fontSize: 52, whiteSpace: 'nowrap', color: colors.muted, fontWeight: 600}}>
            because{' '}
            <span style={{fontFamily: fonts.mono, color: colors.math, fontWeight: 400}}>
              <span style={{color: colors.publicKey}}>e</span> · <span style={{color: colors.privateKey}}>d</span> ≡ 1
              (mod φ(n))
            </span>
          </div>
        </PopAt>

        {/* Worked example */}
        <PopAt x={960} y={515} delay={F.example}>
          <div style={{fontFamily: fonts.mono, fontSize: 44, whiteSpace: 'nowrap', color: `${colors.math}cc`}}>
            <span style={{fontFamily: fonts.sans, color: colors.muted, fontWeight: 600}}>e.g. </span>(7
            <Sup>{X.e}</Sup>)<Sup>{X.d}</Sup> = 7<Sup>81</Sup> ≡ <span style={{color: colors.ok}}>7</span> (mod {X.n}),
            since 81 = 2·{X.phi} + 1
          </div>
        </PopAt>
      </div>

      {/* Attacker's dependency chain */}
      <PopAt x={960} y={640} delay={F.chainLabel}>
        <Txt size={46} color={colors.bad}>
          An attacker who wants d must…
        </Txt>
      </PopAt>
      <ChainBox x={230} at={F.boxD} label="d" sub="private key" color={colors.privateKey} />
      <Arrow x={415} at={F.boxPhi} />
      <ChainBox x={600} at={F.boxPhi} label="φ(n)" sub="= (p−1)(q−1)" color={colors.math} />
      <Arrow x={785} at={F.boxPQ} />
      <ChainBox
        x={970}
        at={F.boxPQ}
        label="p, q"
        sub="secret primes"
        color={colors.math}
        border={trap > 0.05 ? colors.math : colors.dim}
        glow={trap}
      />
      <Arrow x={1155} at={F.boxFactor} />
      <ChainBox
        x={1350}
        at={F.boxFactor}
        label={<span style={{fontSize: 50, color: colors.text, fontFamily: fonts.sans}}>factor n</span>}
        sub="infeasible!"
        color={colors.text}
        border={factorBad > 0.5 ? colors.bad : colors.dim}
        lock
      />

      {/* Trapdoor keyhole (as in S04) */}
      <Place x={1720} y={775} o={Math.min(1, trap)} s={0.5 + 0.5 * trap}>
        <Keyhole size={150} />
      </Place>
      <Place x={1720} y={925} o={Math.min(1, trap)}>
        <Txt size={40} color={colors.math} style={{lineHeight: 1.15}}>
          trapdoor =<br />
          knowing p, q
        </Txt>
      </Place>
    </SceneFrame>
  );
};
