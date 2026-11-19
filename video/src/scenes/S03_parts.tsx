// Pieces used only by S03 (the "why it works" beat).
import React from 'react';
import {colors} from '../shared/theme';
import {Key, Padlock} from '../shared/components';
import {Label} from './A_helpers';

/** Anonymous sender: grey circle with a simple head-and-shoulders silhouette. */
export const Anon: React.FC<{size?: number}> = ({size = 130}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="46" fill={`${colors.muted}22`} stroke={colors.muted} strokeWidth="4" />
    <circle cx="50" cy="40" r="15" fill={colors.muted} />
    <path d="M24 80 Q50 52 76 80 Z" fill={colors.muted} />
  </svg>
);

/** One column of the summary card. */
const Column: React.FC<{
  color: string;
  icon: React.ReactNode;
  title: string;
  lines: string[];
}> = ({color, icon, title, lines}) => (
  <div
    style={{
      width: 760,
      height: 520,
      boxSizing: 'border-box',
      borderRadius: 32,
      border: `4px solid ${color}`,
      background: `${color}14`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 22,
    }}
  >
    <div style={{height: 150, display: 'flex', alignItems: 'center'}}>{icon}</div>
    <Label size={66} color={color} weight={800}>
      {title}
    </Label>
    {lines.map((l) => (
      <Label key={l} size={50} weight={600}>
        {l}
      </Label>
    ))}
  </div>
);

export const LockColumn: React.FC = () => (
  <Column
    color={colors.publicKey}
    icon={<Padlock color={colors.publicKey} size={100} closed={1} />}
    title="Lock = encrypt"
    lines={['anyone with', 'the public key']}
  />
);

export const UnlockColumn: React.FC = () => (
  <Column
    color={colors.privateKey}
    icon={<Key color={colors.privateKey} size={200} />}
    title="Unlock = decrypt"
    lines={['only Bob,', 'with the private key']}
  />
);

/** Bob's safe: a pink-bordered vault the private key sits in. */
export const Safe: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div
    style={{
      width: 300,
      height: 190,
      boxSizing: 'border-box',
      borderRadius: 24,
      border: `5px solid ${colors.privateKey}`,
      background: '#0f172acc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: `0 0 40px ${colors.privateKey}44`,
    }}
  >
    {children}
  </div>
);
