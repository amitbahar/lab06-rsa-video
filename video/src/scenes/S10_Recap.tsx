// S10 — Recap & outro. See SCRIPT.md § S10.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, fonts} from '../shared/theme';
import {Heading, Key, SceneFrame, TitleCard} from '../shared/components';
import {ease, Globe, T, useSpring} from './B_helpers';

const F = {
  b1: T(1.4), // "Two keys: one public, one private."
  b2: T(4.3), // "Security rests on how hard it is to factor a huge number."
  b3: T(7.6), // "And that simple idea protects almost everything you do online."
  out: [T(8.9), T(9.5)] as const,
  title: T(9.2),
};

const Bullet: React.FC<{y: number; at: number; icon: React.ReactNode; children: React.ReactNode}> = ({
  y,
  at,
  icon,
  children,
}) => {
  const s = useSpring(at, 14);
  return (
    <div
      style={{
        position: 'absolute',
        left: 470,
        top: y,
        height: 160,
        display: 'flex',
        alignItems: 'center',
        gap: 60,
        opacity: Math.min(1, s),
        transform: `translateX(${(1 - s) * -60}px)`,
      }}
    >
      <div style={{width: 240, display: 'flex', justifyContent: 'center', transform: `scale(${0.6 + 0.4 * s})`}}>{icon}</div>
      <div style={{fontSize: 64, fontWeight: 700, whiteSpace: 'nowrap'}}>{children}</div>
    </div>
  );
};

export const S10Recap: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const out = ease(frame, F.out[0], F.out[1]);
  const title = useSpring(F.title, 16);
  const black = interpolate(frame, [durationInFrames - 26, durationInFrames - 2], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <>
      <SceneFrame fade={8}>
        <div style={{opacity: 1 - out, transform: `translateY(${-40 * out}px)`}}>
          <Heading>Recap</Heading>
          <Bullet
            y={250}
            at={F.b1}
            icon={
              <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
                <Key color={colors.publicKey} size={150} />
                <Key color={colors.privateKey} size={150} />
              </div>
            }
          >
            <span style={{color: colors.publicKey}}>Public</span> +{' '}
            <span style={{color: colors.privateKey}}>private</span> key
          </Bullet>
          <Bullet
            y={480}
            at={F.b2}
            icon={
              <div
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 52,
                  fontWeight: 800,
                  color: colors.math,
                  border: `5px solid ${colors.math}`,
                  borderRadius: 20,
                  padding: '14px 22px',
                  whiteSpace: 'nowrap',
                }}
              >
                n = p·q
              </div>
            }
          >
            Factoring <span style={{color: colors.math}}>n</span> is hard
          </Bullet>
          <Bullet y={710} at={F.b3} icon={<Globe size={140} />}>
            Protects the web
          </Bullet>
        </div>
        {frame >= F.title - 2 && <TitleCard progress={title} />}
      </SceneFrame>
      <AbsoluteFill style={{background: '#000', opacity: black}} />
    </>
  );
};
