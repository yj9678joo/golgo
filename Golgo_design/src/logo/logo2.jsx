// Logo 2 — Sorted Bars
// Concept: 종목을 골라 정렬한다 → 막대그래프 정렬
function Logo2Mark({ size = 56, color = 'currentColor', accent = '#3182F6' }) {
  return (
    <svg viewBox="0 0 56 56" width={size} height={size} fill="none">
      <rect x="9"  y="32" width="8" height="16" rx="2" fill={color} fillOpacity=".35"/>
      <rect x="20" y="22" width="8" height="26" rx="2" fill={color} fillOpacity=".62"/>
      <rect x="31" y="14" width="8" height="34" rx="2" fill={color}/>
      <circle cx="46" cy="12" r="5" fill={accent}/>
    </svg>
  );
}
window.Logo2Mark = Logo2Mark;

function Logo2({ darkBg = false }) {
  const c = darkBg ? '#FAFBFC' : '#1A1A18';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Logo2Mark size={48} color={c} accent="#3182F6" />
      <div className="lb-wordmark" style={{ font: '700 32px/1 Spoqa Han Sans Neo', color: c }}>
        고르고
      </div>
    </div>
  );
}
window.Logo2 = Logo2;
