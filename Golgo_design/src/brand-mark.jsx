// Golgo — Brand Mark
//
// Primary: C (ㄱ + ascending green dot)
// Backup:  A (ㄱ + base dot — used in fallbacks / monochrome contexts)

// The mark — themed via CSS vars so it adapts to current theme automatically.
// `variant` switches between primary (C) and backup (A).
function GolgoMark({ size = 40, variant = 'C', radius, container = true, accent }) {
  const r = radius != null ? radius : size * 0.275;
  const stroke = Math.max(3, size * 0.0875);
  // Container — uses inverse bg + on-accent text so it looks crisp on any theme
  const bg   = container ? 'var(--bg-inverse, #1A1A18)' : 'transparent';
  const fg   = container ? 'var(--text-on-accent, #FAFBFC)' : 'var(--text, #1A1A18)';
  const dot  = accent || 'var(--brand-dot, #22C55E)';

  if (variant === 'A') {
    // Backup: dot at bottom-left
    return (
      <svg viewBox="0 0 80 80" width={size} height={size} style={{ flexShrink: 0 }}>
        {container && <rect width="80" height="80" rx={r * 80 / size} fill={bg}/>}
        <path d="M22 26 L58 26 L58 58"
              stroke={fg} strokeWidth={stroke * 80 / size}
              strokeLinecap="square" fill="none"/>
        <circle cx="25" cy="58" r={4.5 * 80 / size / 12 * 12} fill={fg}/>
      </svg>
    );
  }
  // C — primary
  return (
    <svg viewBox="0 0 80 80" width={size} height={size} style={{ flexShrink: 0 }}>
      {container && <rect width="80" height="80" rx={r * 80 / size} fill={bg}/>}
      <path d="M22 32 L52 32 L52 58"
            stroke={fg} strokeWidth={stroke * 80 / size}
            strokeLinecap="round" fill="none"/>
      <circle cx="62" cy="22" r="6" fill={dot}/>
    </svg>
  );
}
window.GolgoMark = GolgoMark;

// Wordmark — 한글 워드마크 (Spoqa)
function GolgoWordmark({ size = 22, color }) {
  return (
    <span style={{
      fontFamily: "'Spoqa Han Sans Neo', system-ui",
      fontWeight: 700, fontSize: size, lineHeight: 1,
      letterSpacing: '-0.04em',
      color: color || 'var(--text, #1A1A18)',
    }}>고르고</span>
  );
}
window.GolgoWordmark = GolgoWordmark;

// Lockup — mark + wordmark
function GolgoLockup({ size = 40, wordSize, gap = 10, variant = 'C', accent }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap }}>
      <GolgoMark size={size} variant={variant} accent={accent} />
      <GolgoWordmark size={wordSize || size * 0.6} />
    </div>
  );
}
window.GolgoLockup = GolgoLockup;
