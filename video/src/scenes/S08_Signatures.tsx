// S08 — Digital signatures. See SCRIPT.md § S08.
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {colors, fonts} from '../shared/theme';
import {Avatar, Heading, Key, SceneFrame} from '../shared/components';
import {Doc, ease, Face, MiniLock, Place, PopAt, makeT, Txt, useSpring} from './B_helpers';

const T = makeT('S08');

const F = {
  sub: T(0.4), // "RSA also works in reverse"
  bob: T(2.6), // "If Bob encrypts something"
  stamp: [T(3.7), T(4.6)] as const, // "with his private key"
  crowd: T(5.3), // "anyone can check it"
  check1: [T(6.0), T(7.0)] as const, // "with his public key"
  back1: [T(7.2), T(7.8)] as const,
  mallory: T(7.6), // "Only Bob could have produced it"
  forge: [T(8.0), T(8.7)] as const,
  check2: [T(8.85), T(9.4)] as const,
  sigLabel: T(9.95), // "That's a digital signature"
  aOut: [T(10.7), T(11.3)] as const,
  browser: T(11.1), // "and it's how your browser knows..."
  url: T(11.8),
  cert: T(12.8),
  verify: T(14.0),
};

const SEAL = {x: 1090, y: 670};

const Seal: React.FC<{ring: string; ringGlow: number; letter: string; forged?: boolean}> = ({ring, ringGlow, letter, forged}) => (
  <div
    style={{
      width: 130,
      height: 130,
      borderRadius: '50%',
      background: forged ? '#be185d' : colors.privateKey,
      border: `8px ${forged ? 'dashed' : 'solid'} ${ring}`,
      boxShadow: `0 0 ${60 * ringGlow}px ${ring}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 64,
      fontWeight: 900,
      color: '#fff',
      boxSizing: 'border-box',
    }}
  >
    {letter}
  </div>
);

const BrowserScene: React.FC = () => {
  const frame = useCurrentFrame();
  const win = useSpring(F.browser, 16);
  const lockGlow = interpolate(frame - F.verify, [0, 10, 30], [0, 1, 0.5], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const urlS = useSpring(F.url, 14);
  return (
    <Place x={960} y={590} o={Math.min(1, win)} s={0.85 + 0.15 * win}>
      <div
        style={{
          width: 1400,
          height: 560,
          borderRadius: 24,
          background: '#0f172a',
          border: `3px solid ${colors.panelBorder}`,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* title bar */}
        <div style={{height: 150, background: '#1e293b', display: 'flex', alignItems: 'center', padding: '0 36px', gap: 22}}>
          {[colors.bad, colors.math, colors.ok].map((c) => (
            <div key={c} style={{width: 26, height: 26, borderRadius: '50%', background: c, opacity: 0.8}} />
          ))}
          <div
            style={{
              marginLeft: 30,
              flex: 1,
              height: 92,
              borderRadius: 46,
              background: '#0b1120',
              display: 'flex',
              alignItems: 'center',
              padding: '0 34px',
              gap: 24,
              fontSize: 50,
              fontFamily: fonts.mono,
              opacity: Math.min(1, urlS),
            }}
          >
            <div style={{transform: `scale(${1 + 0.25 * lockGlow})`, filter: `drop-shadow(0 0 ${14 * lockGlow}px ${colors.ok})`}}>
              <MiniLock size={46} color={frame >= F.verify ? colors.ok : colors.muted} />
            </div>
            <span style={{color: colors.muted}}>https://</span>
            <span style={{color: colors.text, marginLeft: -24}}>bank.example</span>
          </div>
        </div>
        {/* certificate */}
        <div style={{position: 'absolute', left: 80, top: 210, right: 80}}>
          <PopAtInline at={F.cert}>
            <div style={{display: 'flex', alignItems: 'center', gap: 40}}>
              <Seal ring={frame >= F.verify ? colors.ok : colors.privateKey} ringGlow={lockGlow} letter="CA" />
              <div>
                <div style={{fontSize: 48, fontWeight: 800}}>Certificate for bank.example</div>
                <div style={{fontSize: 42, color: colors.privateKey, fontWeight: 600, marginTop: 8}}>
                  signed with the authority's private key
                </div>
              </div>
            </div>
          </PopAtInline>
          <div style={{height: 50}} />
          <PopAtInline at={F.verify}>
            <div style={{fontSize: 46, fontWeight: 700, color: colors.ok}}>
              ✓ checked with its public key: really bank.example
            </div>
          </PopAtInline>
        </div>
      </div>
    </Place>
  );
};

const PopAtInline: React.FC<{at: number; children: React.ReactNode}> = ({at, children}) => {
  const s = useSpring(at, 15);
  return <div style={{opacity: Math.min(1, s), transform: `translateY(${(1 - s) * 30}px)`}}>{children}</div>;
};

export const S08Signatures: React.FC = () => {
  const frame = useCurrentFrame();

  const aOut = 1 - ease(frame, F.aOut[0], F.aOut[1]);

  // Bob's private key stamps the seal
  const bobIn = useSpring(F.bob, 14);
  const stamp = ease(frame, F.stamp[0], F.stamp[1]);
  const pinkKeyO = Math.min(1, bobIn) * (1 - ease(frame, F.stamp[1], F.stamp[1] + 10));
  const sealIn = useSpring(F.stamp[1], 10);

  // Verifiers' public key
  const crowdIn = useSpring(F.crowd, 14);
  const go1 = ease(frame, F.check1[0], F.check1[0] + 22);
  const back1 = ease(frame, F.back1[0], F.back1[1]);
  const go2 = ease(frame, F.check2[0], F.check2[0] + 12);
  const blueT = go1 * (1 - back1) + go2;

  // Forger
  const malIn = useSpring(F.mallory, 14);
  const forge = ease(frame, F.forge[0], F.forge[0] + 15);
  const fakeKeyO = Math.min(1, malIn) * (1 - ease(frame, F.forge[1], F.forge[1] + 8));
  const forgedIn = useSpring(F.forge[1], 10);
  const forged = frame >= F.forge[1];

  const verified = frame >= F.check1[1] && !forged;
  const invalid = frame >= F.check2[1];
  const ring = invalid ? colors.bad : verified ? colors.ok : '#9d174d';
  const ringGlow = invalid
    ? interpolate(frame - F.check2[1], [0, 8, 30], [0, 1, 0.5], {extrapolateRight: 'clamp'})
    : verified
      ? interpolate(frame - F.check1[1], [0, 8, 30], [0, 1, 0.5], {extrapolateRight: 'clamp'})
      : 0;

  const lerp = (t: number, a: number, b: number) => a + (b - a) * t;
  const subSwap = ease(frame, F.sigLabel, F.sigLabel + 12);

  return (
    <SceneFrame>
      <Heading>Digital signatures</Heading>
      {/* subtitle → "That's a digital signature" */}
      <PopAt x={960} y={205} delay={F.sub}>
        <div style={{position: 'relative', width: 1400, height: 60}}>
          <Txt size={44} style={{position: 'absolute', width: '100%', opacity: 1 - subSwap}}>
            <span style={{color: colors.privateKey}}>private key signs</span>
            <span style={{color: colors.muted}}> · </span>
            <span style={{color: colors.publicKey}}>public key verifies</span>
          </Txt>
          <Txt size={48} color={colors.math} style={{position: 'absolute', width: '100%', opacity: subSwap}}>
            Only Bob's private key can make it → a digital signature
          </Txt>
        </div>
      </PopAt>

      <div style={{opacity: aOut}}>
        {/* Bob */}
        <Place x={230} y={420} o={Math.min(1, bobIn)} s={0.7 + 0.3 * bobIn}>
          <Avatar name="Bob" color={colors.privateKey} size={120} />
        </Place>
        <Place
          x={lerp(stamp, 450, SEAL.x)}
          y={lerp(stamp, 400, SEAL.y)}
          o={pinkKeyO}
          s={1 - 0.15 * Math.sin(stamp * Math.PI)}
        >
          <Key color={colors.privateKey} size={150} />
        </Place>

        {/* Document + seal */}
        <PopAt x={940} y={520} delay={8}>
          <Doc title="From Bob" border={invalid ? colors.bad : verified ? colors.ok : colors.muted} />
        </PopAt>
        <Place x={SEAL.x} y={SEAL.y} o={Math.min(1, sealIn) * (forged ? 0 : 1)} s={sealIn}>
          <Seal ring={ring} ringGlow={ringGlow} letter="B" />
        </Place>
        <Place x={SEAL.x} y={SEAL.y} o={forged ? Math.min(1, forgedIn) : 0} s={forgedIn}>
          <Seal ring={ring} ringGlow={ringGlow} letter="B" forged />
        </Place>

        {/* Status under the doc */}
        <PopAt x={940} y={820} delay={F.check1[1]} out={[F.forge[1] - 6, F.forge[1]]}>
          <Txt size={50} color={colors.ok}>
            ✓ Verified: Bob
          </Txt>
        </PopAt>
        <PopAt x={940} y={820} delay={F.check2[1]}>
          <Txt size={50} color={colors.bad}>
            ✗ Invalid signature
          </Txt>
        </PopAt>

        {/* Anyone: verifiers with Bob's public key */}
        <Place x={1700} y={400} o={Math.min(1, crowdIn)} s={0.7 + 0.3 * crowdIn}>
          <div style={{display: 'flex', gap: 0, alignItems: 'flex-end'}}>
            <Avatar name="Alice" color={colors.publicKey} size={110} />
          </div>
        </Place>
        <Place x={1600} y={630} o={Math.min(1, crowdIn)} s={0.7 + 0.3 * crowdIn}>
          <Face initial="C" size={100} />
        </Place>
        <Place x={1800} y={630} o={Math.min(1, crowdIn)} s={0.7 + 0.3 * crowdIn}>
          <Face initial="D" size={100} />
        </Place>
        <Place x={1700} y={750} o={Math.min(1, crowdIn)}>
          <Txt size={42} color={colors.muted}>
            anyone
          </Txt>
        </Place>
        <Place
          x={lerp(blueT, 1430, SEAL.x + 150)}
          y={lerp(blueT, 520, SEAL.y)}
          o={Math.min(1, crowdIn)}
          s={0.7 + 0.3 * crowdIn}
          style={{transform: `translate(-50%, -50%) scale(${0.7 + 0.3 * crowdIn}) scaleX(-1)`}}
        >
          <Key color={colors.publicKey} size={150} />
        </Place>

        {/* Forger */}
        <Place x={230} y={790} o={Math.min(1, malIn)} s={0.7 + 0.3 * malIn}>
          <Avatar name="Mallory" size={110} color={colors.bad} />
        </Place>
        <Place
          x={lerp(forge, 450, SEAL.x)}
          y={lerp(forge, 790, SEAL.y)}
          o={fakeKeyO}
        >
          <div style={{textAlign: 'center'}}>
            <Key color={colors.privateKey} size={130} />
            <Txt size={40} color={colors.bad}>
              fake key
            </Txt>
          </div>
        </Place>
      </div>

      {frame >= F.browser - 2 && <BrowserScene />}
    </SceneFrame>
  );
};
