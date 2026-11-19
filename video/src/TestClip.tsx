import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

const Key: React.FC<{label: string; color: string; delay: number; x: number}> = ({label, color, delay, x}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 14}});
  return (
    <div style={{position: 'absolute', left: 960 + x - 200, top: 560, width: 400, textAlign: 'center',
      transform: `scale(${s})`, opacity: s}}>
      <div style={{fontSize: 140}}>🔑</div>
      <div style={{fontSize: 48, fontWeight: 700, color}}>{label}</div>
    </div>
  );
};

export const TestClip: React.FC = () => {
  const frame = useCurrentFrame();
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp'});
  const titleY = interpolate(frame, [0, 20], [40, 0], {extrapolateRight: 'clamp'});
  const fadeOut = interpolate(frame, [130, 150], [1, 0], {extrapolateLeft: 'clamp'});
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 30%, #1e293b, #0b1120)',
      fontFamily: 'Inter, Helvetica, Arial, sans-serif', color: 'white', opacity: fadeOut}}>
      <div style={{position: 'absolute', top: 220, width: '100%', textAlign: 'center',
        opacity: titleOpacity, transform: `translateY(${titleY}px)`}}>
        <div style={{fontSize: 160, fontWeight: 800, letterSpacing: 12}}>RSA</div>
        <div style={{fontSize: 44, color: '#94a3b8'}}>Public-key cryptography</div>
      </div>
      <Key label="Public key" color="#38bdf8" delay={45} x={-300} />
      <Key label="Private key" color="#f472b6" delay={75} x={300} />
    </AbsoluteFill>
  );
};
