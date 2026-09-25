export function ThermalIllustration({ className, style }: { className?: string, style?: React.CSSProperties }) {
  return (
    <svg 
      className={`thermal-illustration ${className || ""}`}
      style={{ width: "100%", maxWidth: "220px", height: "auto", ...style }}
      viewBox="0 0 240 240" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <pattern id="grid-thermal" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" fill="currentColor" opacity="0.1" />
      </pattern>
      <rect width="240" height="240" fill="url(#grid-thermal)" />
      
      {/* Thermometer */}
      <rect x="110" y="50" width="20" height="110" rx="10" stroke="currentColor" strokeWidth="2" opacity="0.4"/>
      <circle cx="120" cy="165" r="20" stroke="currentColor" strokeWidth="2" opacity="0.4"/>
      <rect x="114" y="90" width="12" height="70" fill="var(--color-primary, currentColor)" opacity="0.8"/>
      <circle cx="120" cy="165" r="14" fill="var(--color-primary, currentColor)" opacity="0.8"/>
      
      {/* Temperature marks */}
      <path d="M135 60h10M135 80h5M135 100h10M135 120h5M135 140h10" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
      
      {/* Heat waves */}
      <path d="M70 180 Q80 160 70 140 T70 100" stroke="var(--color-primary, currentColor)" strokeWidth="2" fill="none" opacity="0.6"/>
      <path d="M50 160 Q60 140 50 120 T50 80" stroke="var(--color-primary, currentColor)" strokeWidth="2" fill="none" opacity="0.4"/>
      <path d="M170 180 Q160 160 170 140 T170 100" stroke="var(--color-primary, currentColor)" strokeWidth="2" fill="none" opacity="0.6"/>
      <path d="M190 160 Q180 140 190 120 T190 80" stroke="var(--color-primary, currentColor)" strokeWidth="2" fill="none" opacity="0.4"/>

      {/* Moving Particles */}
      <circle cx="60" cy="60" r="4" fill="currentColor" opacity="0.7"/>
      <path d="M60 60 l15 -10" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.5"/>
      
      <circle cx="180" cy="50" r="4" fill="currentColor" opacity="0.7"/>
      <path d="M180 50 l-10 -15" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.5"/>
      
      <circle cx="80" cy="200" r="4" fill="currentColor" opacity="0.7"/>
      <path d="M80 200 l15 10" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.5"/>

      {/* Scientific Labels */}
      <g fill="currentColor" opacity="0.6" fontSize="10" fontFamily="monospace" letterSpacing="1">
        <text x="10" y="20">Q=mcΔT</text>
        <text x="190" y="20">ΔU=Q+A</text>
        <text x="10" y="230">T(K)</text>
      </g>
    </svg>
  );
}
