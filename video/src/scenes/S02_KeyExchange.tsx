// S02 — The key-exchange problem. See SCRIPT.md § S02.
import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors} from '../shared/theme';
import {Avatar, Eye, Key, Mark, Padlock, SceneFrame, Wire} from '../shared/components';
import {Chunk, cueOf, ease, Label, lerp, MsgBox, Place} from './A_helpers';

const CHUNKS: Chunk[] = [
  [0.0, 2.42, 'Classic encryption uses one shared key.'],
  [3.0, 5.52, 'The same key locks and unlocks the message.'],
  [6.0, 8.28, 'That works great, if you already share the key.'],
  [8.84, 10.32, 'But how do you send the key itself,'],
  [10.64, 12.36, 'when anyone can read what you send?'],
  [12.82, 13.58, 'For centuries,'],
  [13.84, 16.55, 'this was the unsolved problem of cryptography.'],
];

const AX = 300;
const BX = 1620;
const AV_Y = 430;
const WIRE_Y = 400;
const KEY_Y = 650;
const W1 = 480;
const W2 = 1440;

export const S02KeyExchange: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = (d: number, damping = 14) => spring({frame: frame - d, fps, config: {damping}});

  const tShared = cueOf(CHUNKS, 'shared key');
  const tLocks = cueOf(CHUNKS, 'locks');
  const tUnlocks = cueOf(CHUNKS, 'unlocks');
  const tMsgEnd = cueOf(CHUNKS, 'the message', 'end');
  const tWorks = cueOf(CHUNKS, 'That works great');
  const tIf = cueOf(CHUNKS, 'if you already');
  const tBut = cueOf(CHUNKS, 'But how');
  const tSend = cueOf(CHUNKS, 'send the key');
  const tAnyone = cueOf(CHUNKS, 'when anyone');
  const tCent = cueOf(CHUNKS, 'For centuries');
  const tUnsolved = cueOf(CHUNKS, 'unsolved');

  const sA = pop(0);
  const sB = pop(8);
  const sKeys = pop(tShared - 6);

  /* ---- phase A: shared key works ---- */
  const phaseAOut = 1 - ease(frame, tBut, tBut + 14);
  const sMsg = pop(tLocks - 22);
  const lockClose = ease(frame, tLocks, tLocks + 10);
  const travel = ease(frame, tLocks + 14, tMsgEnd - 4);
  const unlock = ease(frame, tMsgEnd, tMsgEnd + 10);
  const msgX = lerp(travel, AX + 260, BX - 260);
  // Bob's key slides up to the lock as it arrives
  const bobKeyLift = ease(frame, tUnlocks + 4, tMsgEnd) * (1 - ease(frame, tMsgEnd + 14, tMsgEnd + 28));
  const sCheck = pop(tWorks - 4);
  const sIf = pop(tIf);

  /* ---- phase B: sending the key itself ---- */
  const bobKeyGone = ease(frame, tBut, tBut + 14);
  const sQ = pop(tBut + 10);
  const kTravel = ease(frame, tSend, tSend + 75);
  const keyX = lerp(kTravel, AX + 240, BX - 240);
  const sEye = pop(tAnyone - 16, 18);
  const eyeOpen = interpolate(frame, [tAnyone - 16, tAnyone + 4], [0.1, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const tCopy = tSend + 38; // key passes under the eye
  const copyUp = ease(frame, tCopy, tCopy + 22);
  const sCopy = frame >= tCopy ? 1 : 0;
  const sX = pop(tCopy + 20);
  const sHow = pop(tCent - 6);
  const sUnsolved = pop(tUnsolved);
  const phaseB = frame >= tBut;

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
          opacity: sA,
        }}
      >
        {phaseB ? 'Sending the key itself' : 'Classic encryption: one shared key'}
      </div>

      <Wire x1={W1} x2={W2} y={WIRE_Y} />

      <Place x={AX} y={AV_Y} s={sA} o={sA}>
        <Avatar name="Alice" color={colors.publicKey} size={170} />
      </Place>
      <Place x={BX} y={AV_Y} s={sB} o={sB}>
        <Avatar name="Bob" color={colors.privateKey} size={170} />
      </Place>

      {/* Alice's gold key */}
      <Place x={AX} y={KEY_Y} s={sKeys} o={sKeys}>
        <Key color={colors.sharedKey} size={150} label="key" />
      </Place>
      {/* Bob's identical key (gone in phase B) */}
      <Place
        x={BX}
        y={lerp(bobKeyLift, KEY_Y, WIRE_Y + 120)}
        s={sKeys * (1 - 0.4 * bobKeyGone)}
        o={sKeys * (1 - bobKeyGone)}
      >
        <Key color={colors.sharedKey} size={150} label="key" />
      </Place>
      <Place x={BX} y={KEY_Y} s={sQ} o={sQ}>
        <Label size={110} weight={900} color={colors.muted}>
          ?
        </Label>
      </Place>

      {/* phase A: locked message travels */}
      <Place x={msgX} y={WIRE_Y} s={sMsg} o={sMsg * phaseAOut}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <MsgBox label="msg" />
          <Padlock color={colors.sharedKey} size={64} closed={lockClose * (1 - unlock)} />
        </div>
      </Place>
      <Place x={960} y={560} s={sCheck} o={sCheck * phaseAOut}>
        <Mark ok size={120} />
      </Place>
      <Place x={960} y={850} s={0.9 + 0.1 * sIf} o={sIf * phaseAOut}>
        <Label size={52} color={colors.ok}>
          Works great… if you already share the key
        </Label>
      </Place>

      {/* phase B: the key itself on the wire */}
      <Place x={960} y={235} s={0.6 + 0.4 * sEye} o={sEye}>
        <Eye size={220} open={eyeOpen} />
      </Place>
      {phaseB && (
        <Place x={keyX} y={WIRE_Y} o={ease(frame, tSend - 6, tSend + 4)}>
          <Key color={colors.sharedKey} size={150} />
        </Place>
      )}
      {sCopy > 0 && (
        <Place
          x={lerp(copyUp, 960, 760)}
          y={lerp(copyUp, WIRE_Y, 235)}
          s={lerp(copyUp, 1, 0.75)}
        >
          <Key color={colors.sharedKey} size={150} />
        </Place>
      )}
      <Place x={1250} y={235} s={sX} o={sX}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          <Mark ok={false} size={100} />
          <Label color={colors.bad} size={44}>
            copied!
          </Label>
        </div>
      </Place>

      <Place x={960} y={850} s={0.9 + 0.1 * sHow} o={sHow}>
        <Label size={64} weight={800} color={colors.sharedKey}>
          How do you share the key?
        </Label>
      </Place>
      <Place x={960} y={940} o={sUnsolved}>
        <Label size={44} color={colors.muted} weight={600}>
          Unsolved for centuries
        </Label>
      </Place>
    </SceneFrame>
  );
};
