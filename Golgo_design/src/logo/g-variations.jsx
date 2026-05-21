// ㄱ Monogram — refined variations
// Each one explores a different angle: stroke weight, terminal, accent, container

// 4A — Original baseline: sharp ㄱ + dot terminal
function MarkA({ size = 80, color = '#FAFBFC', bg = '#1A1A18', radius = 22 }) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size}>
      <rect width="80" height="80" rx={radius} fill={bg}/>
      <path d="M22 26 L58 26 L58 58" stroke={color} strokeWidth="7" strokeLinecap="square" fill="none"/>
      <circle cx="25" cy="58" r="4.5" fill={color}/>
    </svg>
  );
}

// 4B — Rounded terminals, friendlier
function MarkB({ size = 80, color = '#FAFBFC', bg = '#1A1A18', radius = 22 }) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size}>
      <rect width="80" height="80" rx={radius} fill={bg}/>
      <path d="M22 26 L58 26 L58 58" stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="22" cy="58" r="5" fill={color}/>
    </svg>
  );
}

// 4C — ㄱ + ascending dot (rebalancing motion)
function MarkC({ size = 80, color = '#FAFBFC', bg = '#1A1A18', accent = '#22C55E', radius = 22 }) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size}>
      <rect width="80" height="80" rx={radius} fill={bg}/>
      <path d="M22 32 L52 32 L52 58" stroke={color} strokeWidth="7" strokeLinecap="round" fill="none"/>
      <circle cx="62" cy="22" r="6" fill={accent}/>
    </svg>
  );
}

// 4D — ㄱ inside circle
function MarkD({ size = 80, color = '#FAFBFC', bg = '#1A1A18' }) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size}>
      <circle cx="40" cy="40" r="40" fill={bg}/>
      <path d="M24 28 L56 28 L56 56" stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="24" cy="56" r="4.5" fill={color}/>
    </svg>
  );
}

// 4E — ㄱ where the horizontal bar is a chart line
function MarkE({ size = 80, color = '#FAFBFC', bg = '#1A1A18', accent = '#3182F6', radius = 22 }) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size}>
      <rect width="80" height="80" rx={radius} fill={bg}/>
      {/* zigzag horizontal */}
      <path d="M22 30 L34 26 L46 32 L58 22 L58 58"
        stroke={color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="58" cy="22" r="5" fill={accent}/>
    </svg>
  );
}

// 4F — ㄱ outline only (thin, premium tone)
function MarkF({ size = 80, color = '#1A1A18', bg = '#FBFAF7', radius = 22 }) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size}>
      <rect x="1" y="1" width="78" height="78" rx={radius - 1} fill={bg} stroke={color} strokeOpacity=".12" strokeWidth="1"/>
      <path d="M22 26 L58 26 L58 58" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="22" cy="58" r="4" fill={color}/>
    </svg>
  );
}

// 4G — ㄱ split into two tone bars (current vs target metaphor)
function MarkG({ size = 80, color = '#FAFBFC', bg = '#1A1A18', accent = '#3182F6', radius = 22 }) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size}>
      <rect width="80" height="80" rx={radius} fill={bg}/>
      {/* horizontal in accent */}
      <rect x="22" y="23" width="36" height="7" rx="3.5" fill={accent}/>
      {/* vertical in primary */}
      <rect x="51" y="23" width="7" height="35" rx="3.5" fill={color}/>
      <circle cx="22" cy="58" r="5" fill={color}/>
    </svg>
  );
}

// 4H — Bold heavy ㄱ (workhorse logo, max visibility small sizes)
function MarkH({ size = 80, color = '#FAFBFC', bg = '#1A1A18', radius = 22 }) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size}>
      <rect width="80" height="80" rx={radius} fill={bg}/>
      <path d="M22 24 H58 V60" stroke={color} strokeWidth="10" strokeLinejoin="miter" fill="none"/>
    </svg>
  );
}

Object.assign(window, { MarkA, MarkB, MarkC, MarkD, MarkE, MarkF, MarkG, MarkH });
