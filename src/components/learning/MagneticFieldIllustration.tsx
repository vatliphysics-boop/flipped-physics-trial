export function MagneticFieldIllustration({ className, style }: { className?: string, style?: React.CSSProperties }) {
  return (
    <svg 
      className={`magnetic-illustration ${className || ""}`}
      style={{ width: "100%", maxWidth: "220px", height: "auto", ...style }}
      viewBox="0 0 240 240" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <pattern id="grid-magnetic" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" fill="currentColor" opacity="0.1" />
      </pattern>
      <rect width="240" height="240" fill="url(#grid-magnetic)" />
      
      {/* Magnet / Coil loop */}
      <ellipse cx="120" cy="120" rx="40" ry="80" stroke="currentColor" strokeWidth="4" opacity="0.8" fill="none"/>
      
      {/* Current indicator */}
      <path d="M120 40 l10 -5 l0 10 z" fill="var(--color-primary, currentColor)" opacity="0.9"/>
      
      {/* Field Lines - Right */}
      <path d="M140 70 Q200 70 200 120 T140 170" stroke="var(--color-primary, currentColor)" strokeWidth="1.5" strokeDasharray="4 4" fill="none" opacity="0.5"/>
      <path d="M130 90 Q170 90 170 120 T130 150" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" fill="none" opacity="0.4"/>
      
      {/* Field Lines - Left */}
      <path d="M100 70 Q40 70 40 120 T100 170" stroke="var(--color-primary, currentColor)" strokeWidth="1.5" strokeDasharray="4 4" fill="none" opacity="0.5"/>
      <path d="M110 90 Q70 90 70 120 T110 150" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" fill="none" opacity="0.4"/>

      {/* Center Field Line */}
      <path d="M120 20 v200" stroke="var(--color-primary, currentColor)" strokeWidth="1.5" fill="none" opacity="0.6"/>
      <path d="M115 180 l5 10 l5 -10 z" fill="var(--color-primary, currentColor)" opacity="0.8"/>

      {/* Vector B arrows */}
      <path d="M200 120 l-5 -5 l10 0 z" fill="var(--color-primary, currentColor)" opacity="0.5" transform="rotate(90 200 120)"/>
      <path d="M40 120 l-5 -5 l10 0 z" fill="var(--color-primary, currentColor)" opacity="0.5" transform="rotate(-90 40 120)"/>

      {/* Scientific Labels */}
      <g fill="currentColor" opacity="0.6" fontSize="10" fontFamily="monospace" letterSpacing="1">
        <text x="10" y="20">B=μ₀nI</text>
        <text x="180" y="20">F=qvB</text>
        <text x="10" y="230">Φ=BScosα</text>
      </g>
    </svg>
  );
}
