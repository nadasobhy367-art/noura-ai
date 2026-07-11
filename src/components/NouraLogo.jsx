import { useId } from 'react';

export function NouraLogoHero({ size = 160 }) {
  return <NouraLogo size={size} />;
}

export default function NouraLogo({ size = 80, boxed = true }) {
  const id = useId().replace(/:/g, '');

  const shieldBorder = `shieldBorder-${id}`;
  const shieldFill = `shieldFill-${id}`;
  const crossGrad = `crossGrad-${id}`;
  const shieldClip = `shieldClip-${id}`;
  const glow = `glow-${id}`;
  const blueGlow = `blueGlow-${id}`;

  const logoSvg = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width={size} height={size}>
      <defs>
        <linearGradient id={shieldBorder} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8ab4d4" />
          <stop offset="40%" stopColor="#c8dff0" />
          <stop offset="70%" stopColor="#4a90c8" />
          <stop offset="100%" stopColor="#1a6aaa" />
        </linearGradient>

        <linearGradient id={shieldFill} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#07122a" />
          <stop offset="100%" stopColor="#0b1e3d" />
        </linearGradient>

        <linearGradient id={crossGrad} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#29b6f6" />
          <stop offset="100%" stopColor="#1565c0" />
        </linearGradient>

        <clipPath id={shieldClip}>
          <path d="M100,18 L168,45 L168,110 Q168,158 100,185 Q32,158 32,110 L32,45 Z" />
        </clipPath>

        <filter id={glow} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id={blueGlow} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <path
        d="M100,18 L168,45 L168,110 Q168,158 100,185 Q32,158 32,110 L32,45 Z"
        fill={`url(#${shieldBorder})`}
      />
      <path
        d="M100,24 L162,49 L162,110 Q162,153 100,178 Q38,153 38,110 L38,49 Z"
        fill={`url(#${shieldFill})`}
      />
      <rect
        x="100"
        y="18"
        width="70"
        height="170"
        fill="#0d47a1"
        opacity="0.22"
        clipPath={`url(#${shieldClip})`}
      />

      <g
        clipPath={`url(#${shieldClip})`}
        filter={`url(#${glow})`}
        stroke="#b0c8e8"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M97,68 C97,68 80,64 72,70 C64,76 62,86 65,94 C60,96 57,104 62,110 C60,116 63,124 70,126 C72,132 78,136 85,134 C88,140 95,142 98,138 L98,68" />
        <line x1="98" y1="68" x2="98" y2="138" />
        <line x1="74" y1="80" x2="60" y2="80" />
        <circle cx="60" cy="80" r="2.2" fill="#b0c8e8" />
        <line x1="69" y1="92" x2="55" y2="92" />
        <line x1="55" y1="92" x2="55" y2="102" />
        <circle cx="55" cy="102" r="2.2" fill="#b0c8e8" />
        <line x1="71" y1="104" x2="58" y2="104" />
        <circle cx="58" cy="104" r="2.2" fill="#b0c8e8" />
        <line x1="76" y1="116" x2="62" y2="116" />
        <line x1="62" y1="116" x2="62" y2="108" />
        <circle cx="62" cy="108" r="2.2" fill="#b0c8e8" />
        <line x1="83" y1="126" x2="70" y2="126" />
        <circle cx="70" cy="126" r="2.2" fill="#b0c8e8" />
        <line x1="82" y1="72" x2="82" y2="82" />
        <line x1="89" y1="76" x2="89" y2="88" />
        <line x1="84" y1="98" x2="84" y2="108" />
        <line x1="90" y1="112" x2="90" y2="122" />
      </g>

      <g clipPath={`url(#${shieldClip})`} filter={`url(#${blueGlow})`}>
        <rect
          x="116"
          y="72"
          width="18"
          height="52"
          rx="3"
          fill={`url(#${crossGrad})`}
          opacity="0.92"
        />
        <rect
          x="103"
          y="85"
          width="44"
          height="18"
          rx="3"
          fill={`url(#${crossGrad})`}
          opacity="0.92"
        />
        <polyline
          points="103,104 112,104 116,94 120,116 124,88 128,116 132,104 147,104"
          fill="none"
          stroke="#e3f2fd"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.95"
        />
      </g>

      <line
        x1="100"
        y1="26"
        x2="100"
        y2="176"
        stroke="#1a6aaa"
        strokeWidth="1"
        opacity="0.5"
        clipPath={`url(#${shieldClip})`}
      />
    </svg>
  );

  if (!boxed) {
    return logoSvg;
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.175,
        boxShadow: [
          '0 0 0 1px rgba(26,106,170,0.22)',
          `0 ${size * 0.04}px ${size * 0.18}px rgba(11,30,61,0.24)`,
          `0 ${size * 0.02}px ${size * 0.08}px rgba(13,71,161,0.14)`,
          'inset 0 1px 0 rgba(255,255,255,0.55)',
        ].join(', '),
        background: 'linear-gradient(145deg, #eaf4ff 0%, #d9ebff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {logoSvg}
    </div>
  );
}
