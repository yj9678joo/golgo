// Logo 5 — Equal/Balance Symbol
// Concept: = (equal sign) 두 선의 두께 차이로 '맞춰가는' 움직임 표현
function Logo5Mark({ size = 56, color = 'currentColor', accent = '#D4A574' }) {
  return (
    <svg viewBox="0 0 56 56" width={size} height={size} fill="none">
      {/* top bar - shorter */}
      <rect x="14" y="20" width="22" height="6" rx="3" fill={color} fillOpacity=".5"/>
      {/* bottom bar - longer (growing toward equal) */}
      <rect x="14" y="32" width="32" height="6" rx="3" fill={accent}/>
      {/* arrow showing movement */}
      <path d="M40 23 L46 23 L46 27 L40 27 Z" fill={color} fillOpacity=".3"/>
      <path d="M36 22 L40 25 L36 28" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
window.Logo5Mark = Logo5Mark;

function Logo5({ darkBg = false }) {
  const c = darkBg ? '#FAFBFC' : '#1A1A18';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Logo5Mark size={48} color={c} accent="#D4A574" />
      <div className="lb-wordmark" style={{ font: '700 32px/1 Spoqa Han Sans Neo', color: c }}>
        고르고
      </div>
    </div>
  );
}
window.Logo5 = Logo5;
