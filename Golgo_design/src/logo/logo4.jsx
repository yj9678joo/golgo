// Logo 4 — Circular Mark with G initial
// Concept: 'ㄱ' (고르고 첫 자음) + 원 안에 새기는 brand monogram
function Logo4Mark({ size = 56, color = '#FAFBFC', bg = '#1A1A18' }) {
  return (
    <svg viewBox="0 0 56 56" width={size} height={size}>
      <rect width="56" height="56" rx="14" fill={bg}/>
      {/* ㄱ shape - stylized */}
      <path d="M16 18 L40 18 L40 40"
        stroke={color} strokeWidth="5" strokeLinecap="square" fill="none"/>
      {/* dot accent */}
      <circle cx="18" cy="40" r="3" fill={color}/>
    </svg>
  );
}
window.Logo4Mark = Logo4Mark;

function Logo4({ darkBg = false }) {
  const c = darkBg ? '#FAFBFC' : '#1A1A18';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Logo4Mark size={48} color={darkBg ? '#1A1A18' : '#FAFBFC'} bg={darkBg ? '#FAFBFC' : '#1A1A18'} />
      <div className="lb-wordmark" style={{ font: '700 32px/1 Spoqa Han Sans Neo', color: c }}>
        고르고
      </div>
    </div>
  );
}
window.Logo4 = Logo4;
