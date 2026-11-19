// Shared design tokens. OWNED BY STEP 0 — scene agents must not edit this file.
export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export const colors = {
  bgInner: '#1e293b',
  bgOuter: '#0b1120',
  text: '#ffffff',
  muted: '#94a3b8',
  dim: '#475569',
  publicKey: '#38bdf8', // sky — public key, public things
  privateKey: '#f472b6', // pink — private key, secrets
  math: '#fbbf24', // amber — numbers, formulas, step lists
  ok: '#4ade80',
  bad: '#f87171',
  sharedKey: '#eab308', // gold — symmetric/shared key (S02, S09)
  panel: 'rgba(148, 163, 184, 0.08)',
  panelBorder: 'rgba(148, 163, 184, 0.25)',
};

export const fonts = {
  sans: 'Inter, Helvetica, Arial, sans-serif',
  mono: '"JetBrains Mono", "Fira Code", Menlo, Consolas, monospace',
};

export const background = `radial-gradient(circle at 50% 30%, ${colors.bgInner}, ${colors.bgOuter})`;

// Running example used across scenes (verified: 7^3 mod 55 = 13, 13^27 mod 55 = 7)
export const RSA_EXAMPLE = {p: 5, q: 11, n: 55, phi: 40, e: 3, d: 27, m: 7, c: 13};
