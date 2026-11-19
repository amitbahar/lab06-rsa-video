// S01 — Hook. See SCRIPT.md § S01.
import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors} from '../shared/theme';
import {Eye, Packet, SceneFrame, TitleCard, Wire} from '../shared/components';
import {Chunk, cueOf, ease, Label, Laptop, Place, Server} from './A_helpers';
import {warpChunks} from '../shared/timewarp';

const CHUNKS: Chunk[] = warpChunks('S01', [
  [0.0, 1.9, 'Every time you buy something online,'],
  [2.18, 5.28, 'your browser shares a secret with a computer it has never met,'],
  [5.74, 7.76, 'over a network anyone can listen to.'],
  [8.28, 9.62, 'How is that even possible?'],
  [10.06, 11.65, 'The answer is RSA.'],
]);

const X1 = 470;
const X2 = 1450;
const WIRE_Y = 560;

export const S01Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = (d: number, damping = 14) => spring({frame: frame - d, fps, config: {damping}});

  const tSecret = cueOf(CHUNKS, 'secret');
  const tNever = cueOf(CHUNKS, 'never met');
  const tNetwork = cueOf(CHUNKS, 'over a network');
  const tListen = cueOf(CHUNKS, 'listen');
  const tHow = cueOf(CHUNKS, 'How is');
  const tCut = cueOf(CHUNKS, 'The answer');

  if (frame >= tCut) {
    // hard cut to the title card
    return (
      <SceneFrame>
        <TitleCard progress={pop(tCut, 16)} />
      </SceneFrame>
    );
  }

  const sLaptop = pop(0);
  const sServer = pop(8);
  const sWire = ease(frame, 6, 26);
  const sNever = pop(tNever);
  const sEye = pop(tNetwork, 18);
  const eyeOpen = interpolate(frame, [tNetwork, tNetwork + 20], [0.1, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const sListen = pop(tListen);
  const sHow = pop(tHow);
  const secretOn = frame >= tSecret - 4;

  // stream of packets left → right
  const PERIOD = 96;
  const packets = [0, 1, 2].map((k) => {
    const local = frame - 18 - (k * PERIOD) / 3;
    if (local < 0) return null;
    const p = (local % PERIOD) / PERIOD;
    const o = interpolate(p, [0, 0.08, 0.9, 1], [0, 1, 1, 0]);
    return (
      <Place key={k} x={X1 + 90 + (X2 - X1 - 180) * p} y={WIRE_Y} o={o}>
        <Packet label={secretOn ? 'secret' : '• • •'} color={secretOn ? colors.math : colors.muted} />
      </Place>
    );
  });

  // pupil "watches" the leading packet
  const lead = ((Math.max(0, frame - 18) % PERIOD) / PERIOD) * 3;
  const look = Math.sin(lead * Math.PI * 2) * 18;

  return (
    <SceneFrame>
      <div style={{opacity: sWire}}>
        <Wire x1={X1} x2={X2} y={WIRE_Y} />
      </div>
      {packets}

      <Place x={300} y={WIRE_Y} s={sLaptop} o={sLaptop}>
        <Laptop size={260} />
      </Place>
      <Place x={300} y={WIRE_Y + 150} o={sLaptop}>
        <Label color={colors.publicKey}>Your browser</Label>
      </Place>

      <Place x={1620} y={WIRE_Y} s={sServer} o={sServer}>
        <Server size={230} />
      </Place>
      <Place x={1620} y={WIRE_Y + 150} o={sServer}>
        <Label>A server</Label>
      </Place>
      <Place x={1620} y={WIRE_Y + 210} o={sNever} s={0.8 + 0.2 * sNever}>
        <Label color={colors.math} size={40}>
          never met before
        </Label>
      </Place>

      <Place x={960 + look} y={300} o={sEye} s={0.6 + 0.4 * sEye}>
        <Eye size={240} open={eyeOpen} />
      </Place>
      <Place x={960} y={420} o={sListen}>
        <Label color={colors.bad} size={42}>
          anyone can listen
        </Label>
      </Place>

      <Place x={960} y={900} o={sHow} s={0.85 + 0.15 * sHow}>
        <Label size={64} weight={800}>
          How is that even possible?
        </Label>
      </Place>
    </SceneFrame>
  );
};
