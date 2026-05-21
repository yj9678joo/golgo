// Logo 6 — Wordmark only (typography focus)
// Concept: 한글 자체가 핵심. 자음 'ㄱ' 두 개의 리듬 살린 커스텀 타입
function Logo6({ darkBg = false, accent = '#3182F6' }) {
  const c = darkBg ? '#FAFBFC' : '#1A1A18';
  return (
    <div className="lb-wordmark" style={{
      position: 'relative', display: 'inline-flex', alignItems: 'baseline',
      font: '700 56px/1 Spoqa Han Sans Neo', color: c, letterSpacing: '-0.06em',
    }}>
      <span>고르고</span>
      {/* underline on '고' to mark rebalance motion */}
      <span style={{
        position: 'absolute', bottom: -4, left: 0, width: 36, height: 4,
        background: accent, borderRadius: 2,
      }} />
      <span style={{
        position: 'absolute', bottom: -10, right: 0, width: 36, height: 4,
        background: c, borderRadius: 2, opacity: .85,
      }} />
    </div>
  );
}
window.Logo6 = Logo6;
