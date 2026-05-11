export function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Left Person */}
      <circle cx="30" cy="38" r="7" fill="currentColor" />
      <path d="M 18 56 C 18 48, 42 48, 42 56 Z" fill="currentColor" />

      {/* Right Person */}
      <circle cx="70" cy="38" r="7" fill="currentColor" />
      <path d="M 58 56 C 58 48, 82 48, 82 56 Z" fill="currentColor" />

      {/* Center Person */}
      <circle cx="50" cy="28" r="9" fill="currentColor" />
      <path d="M 34 56 C 34 44, 66 44, 66 56 Z" fill="currentColor" />

      {/* Table Top (Curved Bar) */}
      <path d="M 15 58 Q 50 54 85 58 C 88 58, 88 62, 85 62 Q 50 58 15 62 C 12 62, 12 58, 15 58 Z" fill="currentColor" />

      {/* Table Base (Triangle Shadow) */}
      <path d="M 22 62 Q 50 68 50 72 Q 50 68 78 62 L 50 78 Z" fill="currentColor" />
    </svg>
  );
}
