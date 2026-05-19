export function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id="secondaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      {/* Base Ring / Dock */}
      <circle cx="50" cy="50" r="38" stroke="url(#primaryGrad)" strokeWidth="8" strokeLinecap="round" strokeDasharray="180 50" />
      
      {/* Inner Docking Nodes */}
      <circle cx="50" cy="50" r="22" stroke="url(#secondaryGrad)" strokeWidth="5" strokeLinecap="round" strokeDasharray="80 30" />
      
      {/* Central Core Connection */}
      <path d="M 50 18 L 50 36 M 50 64 L 50 82 M 18 50 L 36 50 M 64 50 L 82 50" stroke="url(#primaryGrad)" strokeWidth="5" strokeLinecap="round" />
      
      {/* Center Core dot */}
      <circle cx="50" cy="50" r="8" fill="url(#primaryGrad)" />
    </svg>
  );
}

