export function IdealGasIllustration({ className, style }: { className?: string, style?: React.CSSProperties }) {
  return (
    <svg 
      className={`gas-illustration ${className || ""}`}
      style={{ width: "100%", maxWidth: "220px", height: "auto", ...style }}
      viewBox="0 0 240 240" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <pattern id="grid-gas" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" fill="currentColor" opacity="0.1" />
      </pattern>
      <rect width="240" height="240" fill="url(#grid-gas)" />
      
      {/* Container */}
      <rect x="60" y="80" width="120" height="120" rx="4" stroke="currentColor" strokeWidth="2" opacity="0.4"/>
      
      {/* Piston */}
      <rect x="50" y="70" width="140" height="10" rx="2" fill="currentColor" opacity="0.6"/>
      <rect x="115" y="30" width="10" height="40" fill="currentColor" opacity="0.6"/>
      
      {/* Pressure applied */}
      <path d="M120 10 v15" stroke="var(--color-primary, currentColor)" strokeWidth="3" opacity="0.8"/>
      <path d="M115 20 l5 5 l5 -5" stroke="var(--color-primary, currentColor)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.8"/>

      {/* Particles and velocity vectors */}
      <circle cx="90" cy="110" r="5" fill="var(--color-primary, currentColor)" opacity="0.8"/>
      <path d="M90 110 l15 -10" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
      
      <circle cx="150" cy="130" r="5" fill="currentColor" opacity="0.8"/>
      <path d="M150 130 l-15 -15" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
      
      <circle cx="110" cy="170" r="5" fill="var(--color-primary, currentColor)" opacity="0.8"/>
      <path d="M110 170 l-20 5" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
      
      <circle cx="160" cy="180" r="5" fill="currentColor" opacity="0.8"/>
      <path d="M160 180 l10 15" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
      
      <circle cx="75" cy="150" r="5" fill="currentColor" opacity="0.8"/>
      <path d="M75 150 l10 20" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>

      {/* Bounce indicator */}
      <path d="M175 140 l5 -5" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.4"/>

      {/* Scientific Labels */}
      <g fill="currentColor" opacity="0.6" fontSize="10" fontFamily="monospace" letterSpacing="1">
        <text x="10" y="20">pV=nRT</text>
        <text x="180" y="20">p~1/V</text>
        <text x="10" y="230">V(m³)</text>
        <text x="185" y="230">p(Pa)</text>
      </g>
    </svg>
  );
}
