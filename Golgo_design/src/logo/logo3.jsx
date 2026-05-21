// Logo 3 — Pie Slice / Picked Slice
// Concept: 비중 파이에서 하나를 골라낸 모양
function Logo3Mark({ size = 56, color = 'currentColor', accent = '#1F8A5B' }) {
  return (
    <svg viewBox="0 0 56 56" width={size} height={size} fill="none">
      {/* base pie ring */}
      <circle cx="28" cy="28" r="18" stroke={color} strokeWidth="3" fill="none" strokeOpacity=".25"/>
      {/* picked slice (pulled out) */}
      <path d="M28 8 A20 20 0 0 1 47.3 22 L28 28 Z"
        fill={accent}
        transform="translate(2 -2)"/>
      {/* inner dot */}
      <circle cx="28" cy="28" r="3" fill={color}/>
    </svg>
  );
}
window.Logo3Mark = Logo3Mark;

function Logo3({ darkBg = false }) {
  const c = darkBg ? '#FAFBFC' : '#1A1A18';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Logo3Mark size={48} color={c} accent="#1F8A5B" />
      <div className="lb-wordmark" style={{ font: '700 32px/1 Spoqa Han Sans Neo', color: c }}>
        고르고
      </div>
    </div>
  );
}
window.Logo3 = Logo3;
