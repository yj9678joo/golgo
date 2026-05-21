// Artboards — the visual containers wrapping each logo presentation
function LogoArtboard({ children, bg = 'paper', minH = 280 }) {
  return (
    <div className={`lb-board`}>
      <div className={`lb-stage bg-${bg}`} style={{ minHeight: minH }}>
        {children}
      </div>
    </div>
  );
}
window.LogoArtboard = LogoArtboard;

function LogoMeta({ name, concept, usage }) {
  return (
    <div className="lb-meta">
      <div className="lb-meta-row">
        <span className="lb-meta-label">Concept</span>
        <span className="lb-meta-value">{concept}</span>
      </div>
      {usage && (
        <div className="lb-meta-row">
          <span className="lb-meta-label">Usage</span>
          <span className="lb-meta-value">{usage}</span>
        </div>
      )}
    </div>
  );
}
window.LogoMeta = LogoMeta;

// App icon — squircle with the mark + brand color background
function AppIcon({ children, bg = '#1A1A18', size = 144, radius = 32 }) {
  return (
    <div className="lb-app-icon" style={{
      background: bg, width: size, height: size, borderRadius: radius,
    }}>
      {children}
    </div>
  );
}
window.AppIcon = AppIcon;
