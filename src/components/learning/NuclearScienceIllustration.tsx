export function NuclearScienceIllustration({ className, style }: { className?: string, style?: React.CSSProperties }) {
  return (
    <svg 
      className={`nuclear-illustration ${className || ""}`}
      style={{ width: "100%", maxWidth: "220px", height: "auto", ...style }}
      viewBox="0 0 240 240" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Background Grid / Scientific marks */}
      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" fill="currentColor" opacity="0.1" />
      </pattern>
      <rect width="240" height="240" fill="url(#grid)" />
      
      {/* Outer Glow / Field */}
      <circle cx="120" cy="120" r="90" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" opacity="0.2" />
      <circle cx="120" cy="120" r="70" stroke="currentColor" strokeWidth="1" opacity="0.1" fill="currentColor" />

      {/* Trajectories */}
      <ellipse cx="120" cy="120" rx="80" ry="25" stroke="currentColor" strokeWidth="1.5" opacity="0.4" transform="rotate(30 120 120)" />
      <ellipse cx="120" cy="120" rx="80" ry="25" stroke="currentColor" strokeWidth="1.5" opacity="0.4" transform="rotate(90 120 120)" />
      <ellipse cx="120" cy="120" rx="80" ry="25" stroke="currentColor" strokeWidth="1.5" opacity="0.4" transform="rotate(150 120 120)" />

      {/* Particles on trajectories */}
      <circle cx="46" cy="78" r="4" fill="currentColor" opacity="0.8" />
      <circle cx="120" cy="195" r="4" fill="currentColor" opacity="0.8" />
      <circle cx="188" cy="98" r="4" fill="currentColor" opacity="0.8" />

      {/* Nucleus Center (Protons and Neutrons) */}
      <g transform="translate(120, 120)">
        <circle cx="0" cy="0" r="22" fill="currentColor" opacity="0.2" />
        <circle cx="-6" cy="-8" r="6" fill="currentColor" opacity="0.9" />
        <circle cx="8" cy="-6" r="6" fill="var(--color-primary, currentColor)" opacity="0.8" />
        <circle cx="-8" cy="6" r="6" fill="var(--color-primary, currentColor)" opacity="0.8" />
        <circle cx="5" cy="8" r="6" fill="currentColor" opacity="0.9" />
        <circle cx="0" cy="0" r="6" fill="currentColor" opacity="0.95" />
      </g>

      {/* Scientific Labels */}
      <g fill="currentColor" opacity="0.6" fontSize="10" fontFamily="monospace" letterSpacing="1">
        <text x="10" y="20">N=A−Z</text>
        <text x="190" y="20">A=Z+N</text>
        <text x="10" y="230">E=mc²</text>
        <text x="175" y="230">Δm&gt;0</text>
      </g>
    </svg>
  );
}
