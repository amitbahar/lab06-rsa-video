// S03 — Two keys: the padlock idea. See SCRIPT.md § S03.
import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors} from '../shared/theme';
import {Avatar, Eye, Key, Mark, Padlock, SceneFrame, Wire} from '../shared/components';
import {Chunk, cueOf, ease, Label, lerp, MsgBox, Place} from './A_helpers';
import {sentencesOf} from '../shared/timewarp';
import {Anon, LockColumn, Safe, UnlockColumn} from './S03_parts';

/**
 * Speech timing of the current narration. The sentence table (durations.json) is exact;
 * FINE splits each sentence at its internal pauses (silence detection on S03.wav, ≥ 0.12 s),
 * which makes word cues inside the long sentences more accurate. If the narration text ever
 * changes and FINE no longer matches, we fall back to the plain sentence table.
 */
const SENTENCES: Chunk[] = sentencesOf('S03');
const FINE: Chunk[] = [
  [0.0, 1.55, 'In nineteen seventy-seven,'],
  [1.77, 2.3, 'Rivest,'],
  [2.55, 4.92, 'Shamir and Adleman published a different idea:'],
  [5.42, 6.53, 'use two keys.'],
  [7.14, 9.48, 'A public key, which you hand out to everyone,'],
  [9.73, 11.74, 'and a private key, which you never share.'],
  [12.33, 13.48, 'Think of the public key'],
  [13.69, 14.91, 'as an open padlock.'],
  [15.65, 17.09, 'Anyone can snap it shut,'],
  [17.57, 19.47, 'but only the private key can open it.'],
  [20.32, 22.3, 'Here is why that solves the problem.'],
  [23.12, 26.59, 'Bob can hand out as many open padlocks as he likes,'],
  [27.01, 28.24, 'even to the eavesdropper.'],
  [28.88, 30.01, 'Anyone who has one'],
  [30.28, 31.74, 'can lock a message for Bob.'],
  [32.58, 35.3, 'But locking a box does not let you unlock it,'],
  [35.81, 37.79, 'not even for the person who just locked it.'],
  [38.64, 40.72, 'So encrypting is open to everyone,'],
  [41.19, 43.38, 'while decrypting belongs to Bob alone.'],
  [44.09, 46.47, 'And because the private key never leaves Bob,'],
  [46.94, 49.23, 'there is nothing on the network worth stealing.'],
];
const norm = (c: Chunk[]) => c.map((x) => x[2]).join(' ').replace(/\s+/g, ' ').trim();
const CHUNKS: Chunk[] = norm(FINE) === norm(SENTENCES) ? FINE : SENTENCES;

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
  /** Fade in at a, out at b (b optional). */
  const win = (a: number, b = 1e9, len = 10) => ease(frame, a, a + len) * (1 - ease(frame, b, b + len));

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
  // --- why it works ---
  const tWhy = cueOf(CHUNKS, 'Here is why');
  const tHand = cueOf(CHUNKS, 'Bob can hand out');
  const tMany = cueOf(CHUNKS, 'as many open padlocks');
  const tEven = cueOf(CHUNKS, 'even to the eavesdropper');
  const tWho = cueOf(CHUNKS, 'Anyone who has one');
  const tLockMsg = cueOf(CHUNKS, 'can lock a message');
  const tForBob = cueOf(CHUNKS, 'for Bob');
  const tBut = cueOf(CHUNKS, 'But locking a box');
  const tUnlockIt = cueOf(CHUNKS, 'unlock it');
  const tNotEven = cueOf(CHUNKS, 'not even for the person');
  const tSo = cueOf(CHUNKS, 'So encrypting');
  const tWhile = cueOf(CHUNKS, 'while decrypting');
  const tAlone = cueOf(CHUNKS, 'Bob alone', 'end');
  const tAnd = cueOf(CHUNKS, 'And because');
  const tLeaves = cueOf(CHUNKS, 'never leaves Bob');
  const tNothing = cueOf(CHUNKS, 'there is nothing');

  /* ---- title ---- */
  const s1977 = pop(2);
  const collapse = ease(frame, tTwo - 18, tTwo + 8);
  const titleY = lerp(ease(frame, tTwo - 6, tTwo + 16), 440, 110);
  const titleScale = lerp(ease(frame, tTwo - 6, tTwo + 16), 1, 0.85);

  /* ---- global phases ---- */
  const out1 = 1 - ease(frame, tWhy - 10, tWhy + 8); // part-1 props leave
  const cardIn = ease(frame, tSo - 24, tSo - 4); // stage clears before the summary card arrives
  const cardFade = ease(frame, tAlone - 4, tAlone + 8); // card leaves...
  const cardOut = ease(frame, tAlone + 8, tAnd + 12); // ...then the stage returns
  const stage = 1 - cardIn + cardOut; // cast/wire visibility
  const focus = ease(frame, tBut, tBut + 18) * (1 - cardIn); // beat 8: dim everyone but Alice
  const dim = 1 - 0.7 * focus;
  const crowd = ease(frame, tWhy + 6, tWhy + 30) * (1 - cardIn); // anon senders (beats 6–8 only)

  /* ---- cast ---- */
  const sBob = pop(tTwo);
  const sAlice = pop(tEveryone);
  const sEye = pop(tEveryone + 10, 18);
  const scanT = frame - (tAnd + 10);
  const scan = ease(frame, tAnd + 4, tAnd + 24) * (1 - ease(frame, tNothing - 10, tNothing + 6));
  const eyeX = EYE[0] + 250 * Math.sin(Math.max(0, scanT) / 16) * scan;

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
  const keyBack = ease(frame, tWhy, tWhy + 24);

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

  /* ---- beats 6–8: padlocks for everyone, many senders, Alice can't reopen ---- */
  const SENDERS = [
    {y: AV_Y, pile: AV_Y}, // Alice (keeps her box for beat 8)
    {y: 650, pile: 565},
    {y: 860, pile: 700},
  ];
  const LOCK_X = 480;
  const BOX_X = 640;
  const PILE_X = 1330;
  const give = SENDERS.map((_, i) => ease(frame, tHand + 6 + i * 14, tHand + 34 + i * 14));
  const giveEye = ease(frame, tEven - 4, tEven + 22);
  const boxPop = SENDERS.map((_, i) => pop(tWho + i * 8, 16));
  const lockOn = SENDERS.map((_, i) => ease(frame, tWho + 8 + i * 8, tLockMsg - 2 + i * 6));
  const lockSnap = SENDERS.map((_, i) => ease(frame, tLockMsg - 2 + i * 6, tLockMsg + 6 + i * 6));
  const send = SENDERS.map((_, i) => (i === 0 ? 0 : ease(frame, tForBob - 6 + i * 6, tForBob + 30 + i * 6)));
  const beat6 = 1 - cardIn;

  // Alice's own box, under the spotlight in beat 8
  const grow = ease(frame, tBut, tBut + 20);
  const aBoxX = lerp(grow, BOX_X, 700);
  const aBoxS = lerp(grow, 1, 1.45);
  const shakeEnv = ease(frame, tBut + 24, tBut + 34) * (1 - ease(frame, tUnlockIt + 6, tUnlockIt + 16));
  const shake = Math.sin(frame * 1.7) * 12 * shakeEnv;
  const sCross = pop(tUnlockIt);
  const sNotEven = pop(tNotEven, 12);

  /* ---- beat 9: summary card ---- */
  const sLeft = pop(tSo);
  const sRight = pop(tWhile);

  /* ---- beat 10: key in the safe, harmless traffic on the wire ---- */
  const sSafe = pop(tAnd + 6);
  const traffic = ease(frame, tAnd, tAnd + 15);
  const LANE2 = 570;
  const laneFade = (x: number) => ease(x, W1, W1 + 70) * (1 - ease(x, W2 - 70, W2));
  const flow = Math.max(0, frame - tAnd) * 5;

  const Caption: React.FC<{o: number; color?: string; children: React.ReactNode}> = ({o, color, children}) => (
    <Place x={960} y={985} o={o} s={0.92 + 0.08 * o}>
      <Label size={52} color={color}>
        {children}
      </Label>
    </Place>
  );

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
      <div style={{opacity: ease(frame, tTwo, tTwo + 15) * stage * (1 - 0.6 * focus)}}>
        <Wire x1={W1} x2={W2} y={AV_Y} />
      </div>
      <div style={{opacity: traffic * cardOut}}>
        <Wire x1={W1} x2={W2} y={LANE2} />
      </div>
      <Place x={AX} y={AV_Y} s={sAlice} o={sAlice * stage}>
        <Avatar name="Alice" color={colors.publicKey} size={170} />
      </Place>
      <Place x={BX} y={AV_Y} s={sBob} o={sBob * stage * dim}>
        <Avatar name="Bob" color={colors.privateKey} size={170} />
      </Place>
      <Place x={eyeX} y={EYE[1]} s={0.6 + 0.4 * sEye} o={sEye * stage * dim}>
        <Eye size={200} open={sEye} />
      </Place>

      {/* anonymous senders (beats 6–8) */}
      {SENDERS.slice(1).map((p, i) => (
        <Place key={p.y} x={AX} y={p.y} s={0.7 + 0.3 * crowd} o={crowd * dim}>
          <Anon size={140} />
        </Place>
      ))}

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
      {fan > 0 && out1 > 0 && (
        <>
          <Place x={lerp(fan, PUB0[0], EYE_LOCK[0])} y={lerp(fan, PUB0[1], EYE_LOCK[1])} o={fan * out1}>
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

      {/* beat 10: Bob's safe (drawn under the key) */}
      <Place x={PRIV_BOB[0]} y={PRIV_BOB[1] + 5} s={0.8 + 0.2 * sSafe} o={sSafe * cardOut}>
        <Safe>
          <span />
        </Safe>
      </Place>
      {/* private key: with Bob; travels to the box; back to Bob; into the safe */}
      {sPriv > 0 && (
        <Place
          x={keyToLock > 0 ? lerp(keyBack, pinkX, PRIV_BOB[0]) : lerp(privMove, lerp(sPriv, BX, PRIV0[0]), PRIV_BOB[0])}
          y={keyToLock > 0 ? lerp(keyBack, pinkY, PRIV_BOB[1]) : lerp(privMove, lerp(sPriv, AV_Y, PRIV0[1]), PRIV_BOB[1])}
          s={sPriv * lerp(privMove, 1, 0.75) * lerp(keyToLock * (1 - keyBack), 1, 0.8)}
          o={sPriv * stage * dim}
        >
          <Key color={colors.privateKey} size={180} label={keyToLock < 0.2 || keyBack > 0.8 ? 'Private key' : undefined} />
        </Place>
      )}
      <Place x={PRIV0[0]} y={PRIV0[1] + 140} o={sPrivCap * capsOut}>
        <Label size={40} color={colors.privateKey} weight={600}>
          never share
        </Label>
      </Place>

      {/* Alice locks a message and sends it */}
      <Place x={boxX} y={AV_Y} s={sMsg} o={sMsg * out1}>
        <MsgBox label="msg" color={unlock > 0.5 ? colors.ok : colors.text} />
      </Place>
      {toBox > 0 && (
        <Place x={aliceLockX} y={aliceLockY} o={(1 - unlock * 0.6) * out1}>
          <Padlock color={colors.publicKey} size={aliceLockSize} closed={snap * (1 - unlock)} />
        </Place>
      )}
      <Place x={EYE[0] - 230} y={EYE[1]} s={sNoEye} o={sNoEye * out1}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <Label size={40} color={colors.bad}>
            can't open
          </Label>
          <Mark ok={false} size={70} />
        </div>
      </Place>
      <Place x={960} y={890} o={pop(tOnly) * out1}>
        <Label size={52} color={colors.privateKey}>
          Only the private key can open it
        </Label>
      </Place>
      <Place x={1300} y={315} s={sCheck} o={sCheck * out1}>
        <Mark ok size={90} />
      </Place>

      {/* ===== why it works ===== */}

      {/* beat 6: Bob hands out open padlocks to everyone, even the eye */}
      {SENDERS.map((p, i) => {
        const g = give[i];
        if (g <= 0 || cardIn >= 1) return null;
        const on = lockOn[i];
        const bx = i === 0 ? aBoxX : lerp(send[i], BOX_X, PILE_X);
        const by = lerp(send[i], p.y, p.pile);
        const bs = i === 0 ? aBoxS : 1;
        const handX = lerp(g, BX - 110, LOCK_X);
        const handY = lerp(g, AV_Y, p.y);
        const x = lerp(on, handX, bx + 73 * bs) + (i === 0 ? shake : 0);
        const y = lerp(on, handY, by - 43 * bs);
        const o = Math.min(1, g * 3) * beat6 * (i === 0 ? 1 : dim);
        return (
          <React.Fragment key={i}>
            <Place x={bx} y={by} s={boxPop[i] * bs} o={boxPop[i] * o}>
              <MsgBox label="msg" />
            </Place>
            <Place x={x} y={y} o={o}>
              <Padlock color={colors.publicKey} size={lerp(on, 84, 64) * bs} closed={lockSnap[i]} />
            </Place>
          </React.Fragment>
        );
      })}
      {giveEye > 0 && (
        <Place x={lerp(giveEye, BX - 110, EYE_LOCK[0])} y={lerp(giveEye, AV_Y, EYE_LOCK[1])} o={Math.min(1, giveEye * 3) * beat6 * dim}>
          <Padlock color={colors.publicKey} size={64} closed={0} />
        </Place>
      )}
      <Place x={EYE[0]} y={EYE[1] + 95} s={pop(tEven + 8)} o={pop(tEven + 8) * win(tEven + 8, tWho - 6)}>
        <Label size={42} color={colors.publicKey}>
          even the eavesdropper!
        </Label>
      </Place>
      {/* "as many as he likes": a row of padlock copies multiplies out */}
      {[0, 1, 2, 3, 4, 5, 6].map((k) => {
        const sk = pop(tMany + 4 + k * 5, 12);
        return (
          <Place key={k} x={870 + k * 70} y={560} s={sk} o={sk * win(tMany, tWho - 8)}>
            <Padlock color={colors.publicKey} size={46} closed={0} />
          </Place>
        );
      })}
      <Place x={1080} y={650} o={win(tMany + 10, tWho - 8)}>
        <Label size={46} color={colors.publicKey}>
          as many as he likes
        </Label>
      </Place>

      {/* beat 8: Alice tries to reopen her own box */}
      <Place x={920} y={AV_Y} s={sCross} o={sCross * (1 - cardIn)}>
        <Mark ok={false} size={120} />
      </Place>
      <Place x={700} y={AV_Y + 125} o={win(tBut + 20, tUnlockIt + 4) * (1 - cardIn)}>
        <Label size={42} color={colors.muted}>
          reopen?
        </Label>
      </Place>
      <Place x={700} y={AV_Y + 125} s={sNotEven} o={sNotEven * (1 - cardIn)}>
        <Label size={42} color={colors.bad}>
          stays locked
        </Label>
      </Place>

      {/* beat 9: two-column summary */}
      <Place x={540} y={560} s={0.85 + 0.15 * sLeft} o={sLeft * (1 - cardFade)}>
        <LockColumn />
      </Place>
      <Place x={1380} y={560} s={0.85 + 0.15 * sRight} o={sRight * (1 - cardFade)}>
        <UnlockColumn />
      </Place>

      {/* beat 10: the private key stays in Bob's safe; the wire carries nothing useful */}
      {traffic > 0 &&
        [0, 1].map((i) => {
          const x = W1 + ((flow + i * 480) % 960);
          return (
            <Place key={`b${i}`} x={x} y={AV_Y} o={traffic * cardOut * laneFade(x)} s={0.8}>
              <div style={{position: 'relative'}}>
                <MsgBox label="#%&" color={colors.publicKey} />
                <div style={{position: 'absolute', left: 120, top: -40}}>
                  <Padlock color={colors.publicKey} size={60} closed={1} />
                </div>
              </div>
            </Place>
          );
        })}
      {traffic > 0 &&
        [0, 1].map((i) => {
          const x = W2 - ((flow + i * 480 + 240) % 960);
          return (
            <Place key={`p${i}`} x={x} y={LANE2} o={traffic * cardOut * laneFade(x)}>
              <Padlock color={colors.publicKey} size={60} closed={0} />
            </Place>
          );
        })}
      <Place x={EYE[0] + 300} y={EYE[1]} s={pop(tNothing)} o={pop(tNothing)}>
        <Label size={42} color={colors.bad}>
          nothing to steal
        </Label>
      </Place>

      {/* captions */}
      <Caption o={win(tWhy + 4, tHand - 8)}>Why does this solve the problem?</Caption>
      <Caption o={win(tHand + 4, tWho - 8)} color={colors.publicKey}>
        Open padlocks for everyone
      </Caption>
      <Caption o={win(tWho, tBut - 8)} color={colors.publicKey}>
        Anyone with one can lock a message for Bob
      </Caption>
      <Caption o={win(tBut + 4, tNotEven - 8)}>Locking does not let you unlock</Caption>
      <Caption o={win(tNotEven, tSo - 16)} color={colors.bad}>
        Not even Alice can reopen her own box
      </Caption>
      <Caption o={win(tLeaves - 6, tNothing - 6)} color={colors.privateKey}>
        The private key never leaves Bob
      </Caption>
      <Caption o={win(tNothing)} color={colors.ok}>
        Nothing on the network worth stealing
      </Caption>
    </SceneFrame>
  );
};
