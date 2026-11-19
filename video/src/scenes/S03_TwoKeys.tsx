// S03 — Two keys: the padlock idea. See SCRIPT.md § S03.
import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors} from '../shared/theme';
import {Avatar, Eye, Key, Mark, Padlock, SceneFrame, Wire} from '../shared/components';
import {Chunk, cueOf, ease, Label, lerp, MsgBox, Place} from './A_helpers';

const CHUNKS: Chunk[] = [
  [0.0, 1.34, 'In nineteen seventy-seven,'],
  [1.58, 2.14, 'Rivest,'],
  [2.3, 4.68, 'Shamir and Adleman published a different idea:'],
  [5.08, 6.12, 'use two keys.'],
  [6.6, 10.76, 'A public key, which you hand out to everyone, and a private key, which you never share.'],
  [11.36, 13.7, 'Think of the public key as an open padlock.'],
  [14.3, 15.66, 'Anyone can snap it shut,'],
  [15.96, 17.83, 'but only the private key can open it.'],
];

const AX = 300;
const BX = 1620;
const AV_Y = 430;
const W1 = 480;
const W2 = 1440;
const EYE: [number, number] = [960, 255];

/** "Rivest · Shamir · Adleman" that collapses to "RSA" as `collapse` goes 0→1. */
const Names: React.FC<{pops: number[]; collapse: number}> = ({pops, collapse}) => {
  const names = ['Rivest', 'Shamir', 'Adleman'];
  const tail = (w: number, o: number): React.CSSProperties => ({
    display: 'inline-block',
    overflow: 'hidden',
    verticalAlign: 'bottom',
    whiteSpace: 'pre',
    maxWidth: w * (1 - collapse),
    opacity: o * (1 - collapse),
  });
  return (
    <div style={{fontSize: 96, fontWeight: 800, whiteSpace: 'nowrap', letterSpacing: collapse * 12}}>
      {names.map((n, i) => (
        <span key={n} style={{opacity: pops[i]}}>
          <span style={{color: collapse > 0.5 ? colors.text : colors.math}}>{n[0]}</span>
          <span style={tail(420, 1)}>{n.slice(1)}</span>
          {i < 2 && <span style={tail(120, 1)}>{' · '}</span>}
        </span>
      ))}
    </div>
  );
};

export const S03TwoKeys: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = (d: number, damping = 14) => spring({frame: frame - d, fps, config: {damping}});

  const tRivest = cueOf(CHUNKS, 'Rivest');
  const tShamir = cueOf(CHUNKS, 'Shamir');
  const tAdleman = cueOf(CHUNKS, 'Adleman');
  const tTwo = cueOf(CHUNKS, 'use two keys');
  const tPublic = cueOf(CHUNKS, 'A public key');
  const tEveryone = cueOf(CHUNKS, 'hand out to everyone');
  const tPrivate = cueOf(CHUNKS, 'a private key');
  const tNever = cueOf(CHUNKS, 'never share');
  const tThink = cueOf(CHUNKS, 'Think of');
  const tPadlock = cueOf(CHUNKS, 'open padlock');
  const tAnyone = cueOf(CHUNKS, 'Anyone can');
  const tShut = cueOf(CHUNKS, 'shut');
  const tOnly = cueOf(CHUNKS, 'but only');
  const tOpen = cueOf(CHUNKS, 'open it');

  /* ---- title ---- */
  const s1977 = pop(2);
  const collapse = ease(frame, tTwo - 18, tTwo + 8);
  const titleY = lerp(ease(frame, tTwo - 6, tTwo + 16), 440, 110);
  const titleScale = lerp(ease(frame, tTwo - 6, tTwo + 16), 1, 0.85);

  /* ---- cast ---- */
  const sBob = pop(tTwo);
  const sAlice = pop(tEveryone);
  const sEye = pop(tEveryone + 10, 18);

  /* ---- key pair (centre stage) ---- */
  const sPub = pop(tPublic);
  const sPriv = pop(tPrivate);
  const sPubCap = pop(tEveryone + 6);
  const sPrivCap = pop(tNever);
  const capsOut = 1 - ease(frame, tThink, tThink + 12);
  const morph = ease(frame, tThink + 6, tPadlock); // key → padlock
  const fan = ease(frame, tPadlock, tPadlock + 24); // padlock copies fan out
  const privMove = ease(frame, tThink + 10, tPadlock + 10);

  /* ---- lock & send ---- */
  const sMsg = pop(tAnyone - 4);
  const toBox = ease(frame, tAnyone, tShut - 4);
  const snap = ease(frame, tShut - 4, tShut + 4);
  const travel = ease(frame, tShut + 8, tOpen - 6);
  const keyToLock = ease(frame, tOnly + 6, tOpen + 2);
  const unlock = ease(frame, tOpen + 2, tOpen + 12);
  const sCheck = pop(tOpen + 10);
  const sNoEye = pop(tShut + 28);

  const PUB0: [number, number] = [760, 640];
  const PRIV0: [number, number] = [1160, 640];
  const ALICE_LOCK: [number, number] = [AX, 690];
  const EYE_LOCK: [number, number] = [EYE[0] + 190, EYE[1]];
  const PRIV_BOB: [number, number] = [BX, 690];

  // Alice's padlock: from her copy spot onto the message box, then along the wire
  const boxX = lerp(travel, 540, 1300);
  const aliceLockX = lerp(toBox, ALICE_LOCK[0], boxX + 120);
  const aliceLockY = lerp(toBox, ALICE_LOCK[1], AV_Y);
  const aliceLockSize = lerp(toBox, 90, 64);

  const pinkX = lerp(keyToLock, PRIV_BOB[0], 1300 + 120);
  const pinkY = lerp(keyToLock, PRIV_BOB[1], AV_Y + 95);

  return (
    <SceneFrame>
      {/* title: names collapse into RSA */}
      <Place x={960} y={310} o={s1977 * (1 - collapse)} s={0.8 + 0.2 * s1977}>
        <Label size={64} color={colors.math} mono>
          1977
        </Label>
      </Place>
      <Place x={960} y={titleY} s={titleScale}>
        <Names pops={[pop(tRivest), pop(tShamir), pop(tAdleman)]} collapse={collapse} />
      </Place>

      {/* stage */}
      <div style={{opacity: ease(frame, tTwo, tTwo + 15)}}>
        <Wire x1={W1} x2={W2} y={AV_Y} />
      </div>
      <Place x={AX} y={AV_Y} s={sAlice} o={sAlice}>
        <Avatar name="Alice" color={colors.publicKey} size={170} />
      </Place>
      <Place x={BX} y={AV_Y} s={sBob} o={sBob}>
        <Avatar name="Bob" color={colors.privateKey} size={170} />
      </Place>
      <Place x={EYE[0]} y={EYE[1]} s={0.6 + 0.4 * sEye} o={sEye}>
        <Eye size={200} open={sEye} />
      </Place>

      {/* public key → open padlock, fanning out */}
      {morph < 1 && (
        <Place x={lerp(sPub, BX, PUB0[0])} y={lerp(sPub, AV_Y, PUB0[1])} s={sPub * (1 - 0.5 * morph)} o={sPub * (1 - morph)}>
          <Key color={colors.publicKey} size={180} label="Public key" />
        </Place>
      )}
      <Place x={PUB0[0]} y={PUB0[1] + 140} o={sPubCap * capsOut}>
        <Label size={40} color={colors.publicKey} weight={600}>
          hand out to everyone
        </Label>
      </Place>
      {morph > 0 && fan < 1 && (
        <Place x={PUB0[0]} y={PUB0[1]} s={0.5 + 0.5 * morph} o={morph * (1 - fan)}>
          <Padlock color={colors.publicKey} size={110} closed={0} />
        </Place>
      )}
      {fan > 0 && (
        <>
          <Place x={lerp(fan, PUB0[0], EYE_LOCK[0])} y={lerp(fan, PUB0[1], EYE_LOCK[1])} o={fan}>
            <Padlock color={colors.publicKey} size={lerp(fan, 110, 64)} closed={0} />
          </Place>
          {toBox <= 0 ? (
            <Place x={lerp(fan, PUB0[0], ALICE_LOCK[0])} y={lerp(fan, PUB0[1], ALICE_LOCK[1])} o={fan}>
              <Padlock color={colors.publicKey} size={lerp(fan, 110, 90)} closed={0} />
            </Place>
          ) : null}
        </>
      )}
      <Place x={960} y={890} o={pop(tPadlock) * (1 - ease(frame, tOnly - 10, tOnly))}>
        <Label size={52} color={colors.publicKey}>
          Public key = an open padlock anyone can snap shut
        </Label>
      </Place>

      {/* private key */}
      {sPriv > 0 && (
        <Place
          x={keyToLock > 0 ? pinkX : lerp(privMove, lerp(sPriv, BX, PRIV0[0]), PRIV_BOB[0])}
          y={keyToLock > 0 ? pinkY : lerp(privMove, lerp(sPriv, AV_Y, PRIV0[1]), PRIV_BOB[1])}
          s={sPriv * lerp(privMove, 1, 0.75) * lerp(keyToLock, 1, 0.8)}
          o={sPriv}
        >
          <Key color={colors.privateKey} size={180} label={keyToLock < 0.2 ? 'Private key' : undefined} />
        </Place>
      )}
      <Place x={PRIV0[0]} y={PRIV0[1] + 140} o={sPrivCap * capsOut}>
        <Label size={40} color={colors.privateKey} weight={600}>
          never share
        </Label>
      </Place>

      {/* Alice locks a message and sends it */}
      <Place x={boxX} y={AV_Y} s={sMsg} o={sMsg}>
        <MsgBox label="msg" color={unlock > 0.5 ? colors.ok : colors.text} />
      </Place>
      {toBox > 0 && (
        <Place x={aliceLockX} y={aliceLockY} o={1 - unlock * 0.6}>
          <Padlock color={colors.publicKey} size={aliceLockSize} closed={snap * (1 - unlock)} />
        </Place>
      )}
      <Place x={EYE[0] - 230} y={EYE[1]} s={sNoEye} o={sNoEye}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <Label size={40} color={colors.bad}>
            can't open
          </Label>
          <Mark ok={false} size={70} />
        </div>
      </Place>
      <Place x={960} y={890} o={pop(tOnly)}>
        <Label size={52} color={colors.privateKey}>
          Only the private key can open it
        </Label>
      </Place>
      <Place x={1300} y={315} s={sCheck} o={sCheck}>
        <Mark ok size={90} />
      </Place>
    </SceneFrame>
  );
};
