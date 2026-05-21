// Logo 1 — Balance Scale
// Concept: 고르게 (evenly) → 저울 추가 평형
function Logo1Mark({ size = 56, color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 56 56" width={size} height={size} fill="none">
      {/* center pole */}
      <rect x="27" y="14" width="2" height="32" rx="1" fill={color}/>
      {/* base */}
      <rect x="18" y="44" width="20" height="2" rx="1" fill={color}/>
      {/* crossbar */}
      <rect x="10" y="13" width="36" height="2" rx="1" fill={color}/>
      {/* left pan (heavier) */}
      <circle cx="14" cy="22" r="6" fill={color} fillOpacity=".22"/>
      <path d="M14 16 L14 22 M9 22 L19 22" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      {/* right pan (lighter dot, raised) */}
      <circle cx="42" cy="22" r="6" fill={color}/>
      <path d="M42 16 L42 22 M37 22 L47 22" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
window.Logo1Mark = Logo1Mark;

function Logo1({ darkBg = false }) {
  const c = darkBg ? '#FAFBFC' : '#1A1A18';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Logo1Mark size={48} color={c} />
      <div className="lb-wordmark" style={{ font: '700 32px/1 Spoqa Han Sans Neo', color: c }}>
        고르고
      </div>
    </div>
  );
}
window.Logo1 = Logo1;
