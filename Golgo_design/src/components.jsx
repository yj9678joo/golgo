// Golgo — shared components + utilities
// Mount: <script type="text/babel" src="src/components.jsx"></script>

// ── format helpers ──────────────────────────────────────────
const fmt = {
  krw(n, { sign = false, compact = false } = {}) {
    const abs = Math.abs(Math.round(n));
    let s;
    if (compact && abs >= 10_000_000) s = (abs / 10_000_000).toFixed(1).replace(/\.0$/, '') + '천만';
    else if (compact && abs >= 10_000) s = (abs / 10_000).toFixed(abs >= 100_000 ? 0 : 1).replace(/\.0$/, '') + '만';
    else s = abs.toLocaleString('ko-KR');
    const prefix = sign ? (n < 0 ? '-' : n > 0 ? '+' : '') : (n < 0 ? '-' : '');
    return prefix + s;
  },
  pct(n, { sign = false, d = 1 } = {}) {
    const s = Math.abs(n).toFixed(d) + '%';
    if (sign) return (n < 0 ? '−' : n > 0 ? '+' : '') + s;
    return (n < 0 ? '−' : '') + s;
  },
  short(n) {
    const a = Math.abs(n);
    if (a >= 1e8) return (n / 1e8).toFixed(1).replace(/\.0$/, '') + '억';
    if (a >= 1e4) return (n / 1e4).toFixed(0) + '만';
    return n.toLocaleString();
  },
};
window.fmt = fmt;

// ── Icons (Lucide-ish, hand-drawn for sharper rendering) ────
const Ic = {
  bell:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 004 0"/></svg>,
  settings:(p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33h0a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51h0a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v0a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  back:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M15 18l-6-6 6-6"/></svg>,
  more:    (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>,
  chev:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 18l6-6-6-6"/></svg>,
  home:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 12L12 3l9 9"/><path d="M5 10v10h14V10"/></svg>,
  pie:     (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 12A9 9 0 1112 3v9z"/><path d="M12 3a9 9 0 019 9h-9z" fill="currentColor" opacity=".25" stroke="none"/></svg>,
  sparkle: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3z"/><path d="M19 14l.9 2.3L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.7L19 14z"/></svg>,
  refresh: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 3v6h-6"/><path d="M3 21v-6h6"/><path d="M21 9a9 9 0 00-15.4-4.6L3 9"/><path d="M3 15a9 9 0 0015.4 4.6L21 15"/></svg>,
  warn:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M10.3 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  info:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>,
  check:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 6L9 17l-5-5"/></svg>,
  arrowUp: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>,
  arrowDn: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 5v14"/><path d="M5 12l7 7 7-7"/></svg>,
  minus:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14"/></svg>,
  shield:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  brain:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9.5 2a3 3 0 00-3 3 3 3 0 00-1.5 5.6V13a3 3 0 002 2.8V18a3 3 0 005.5 1.7A3 3 0 0017 18v-2.2a3 3 0 002-2.8v-2.4A3 3 0 0017.5 5a3 3 0 00-3-3 3 3 0 00-2.5 1.3A3 3 0 009.5 2z"/><path d="M9.5 2v18M14.5 2v18"/></svg>,
};
window.Ic = Ic;

// ── Ticker badge (colored chip) ─────────────────────────────
function TickerBadge({ holding, size = 36 }) {
  const fs = size <= 28 ? 9 : size <= 36 ? 10 : 11;
  const initial = holding.ticker.slice(0, 4);
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.28, flexShrink: 0,
      background: `linear-gradient(135deg, var(${holding.colorVar}), color-mix(in oklch, var(${holding.colorVar}) 65%, white))`,
      color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-num)', fontWeight: 700, fontSize: fs, letterSpacing: '-.02em',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,.18), inset 0 -1px 0 rgba(0,0,0,.06)',
    }}>{initial}</div>
  );
}

// ── Sparkline (filled area) ─────────────────────────────────
function Sparkline({ data, w = 280, h = 80, color = 'var(--accent)', fill = true, stroke = 2, smooth = true }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * w,
    h - 6 - ((v - min) / span) * (h - 12),
  ]);
  let d = `M${pts[0][0]},${pts[0][1]}`;
  if (smooth) {
    for (let i = 1; i < pts.length; i++) {
      const [x, y] = pts[i], [px, py] = pts[i - 1];
      const cx = (x + px) / 2;
      d += ` Q${px},${py} ${cx},${(y + py) / 2}`;
    }
    d += ` T${pts[pts.length - 1][0]},${pts[pts.length - 1][1]}`;
  } else {
    for (let i = 1; i < pts.length; i++) d += ` L${pts[i][0]},${pts[i][1]}`;
  }
  const area = `${d} L${w},${h} L0,${h} Z`;
  const gid = 'sparkfill_' + Math.random().toString(36).slice(2, 8);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"  stopColor={color} stopOpacity=".22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#${gid})`} />}
      <path d={d} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
window.Sparkline = Sparkline;

// ── Donut chart ─────────────────────────────────────────────
function Donut({ slices, size = 120, thickness = 22, gap = 2 }) {
  const r = size / 2 - thickness / 2;
  const c = 2 * Math.PI * r;
  const total = slices.reduce((s, x) => s + x.value, 0);
  let acc = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg-soft)" strokeWidth={thickness} />
      {slices.map((s, i) => {
        const frac = s.value / total;
        const len = frac * c - gap;
        const dash = `${len} ${c - len}`;
        const offset = c * 0.25 - acc * c;
        acc += frac;
        return (
          <circle key={i} cx={size/2} cy={size/2} r={r} fill="none"
            stroke={s.color} strokeWidth={thickness}
            strokeDasharray={dash} strokeDashoffset={offset}
            strokeLinecap="butt"
            transform={`rotate(0 ${size/2} ${size/2})`} />
        );
      })}
    </svg>
  );
}
window.Donut = Donut;

// ── Score gauge (semicircular) ──────────────────────────────
function ScoreGauge({ score, max = 10, size = 200, label }) {
  const pct = score / max;
  const r = size / 2 - 14;
  const arc = Math.PI * r;
  const offset = arc * (1 - pct);
  // color based on score band
  const color = score >= 7.5 ? 'var(--up-strong)' : score >= 5 ? 'var(--warn)' : 'var(--down-strong)';
  return (
    <div style={{ position: 'relative', width: size, height: size / 2 + 12 }}>
      <svg viewBox={`0 0 ${size} ${size/2 + 12}`} width={size} height={size/2 + 12}>
        <path d={`M 14 ${size/2} A ${r} ${r} 0 0 1 ${size-14} ${size/2}`}
          fill="none" stroke="var(--bg-soft)" strokeWidth="10" strokeLinecap="round" />
        <path d={`M 14 ${size/2} A ${r} ${r} 0 0 1 ${size-14} ${size/2}`}
          fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={arc} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset .6s cubic-bezier(.4,0,.2,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', top: 18 }}>
        <span className="num" style={{ font: '700 36px/1 var(--font-num)', color }}>
          {score.toFixed(1)}
        </span>
        <span style={{ font: 'var(--type-micro)', color: 'var(--text-3)', marginTop: 4 }}>
          / {max} {label || ''}
        </span>
      </div>
    </div>
  );
}
window.ScoreGauge = ScoreGauge;

// ── Bottom navigation ───────────────────────────────────────
function BottomNav({ current, onChange }) {
  const items = [
    { id: 'home',      label: '홈',         icon: Ic.home    },
    { id: 'portfolio', label: '포트폴리오',  icon: Ic.pie     },
    { id: 'report',    label: 'AI 분석',     icon: Ic.sparkle },
    { id: 'rebalance', label: '리밸런싱',    icon: Ic.refresh },
  ];
  return (
    <div style={{
      display: 'flex', background: 'var(--bg-card)',
      borderTop: '.5px solid var(--border)',
      paddingBottom: 26, // home indicator
    }}>
      {items.map(it => {
        const active = current === it.id;
        return (
          <button key={it.id} onClick={() => onChange(it.id)} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 4, padding: '10px 0 4px', background: 'none', border: 0, cursor: 'pointer',
            color: active ? 'var(--text)' : 'var(--text-3)',
            transition: 'color .15s', minWidth: 0,
          }}>
            <it.icon width="22" height="22" strokeWidth={active ? 2.3 : 1.8} />
            <span style={{ font: 'var(--type-micro)', fontWeight: active ? 600 : 500, whiteSpace: 'nowrap' }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}
window.BottomNav = BottomNav;

// ── Top bar (greeting / nav with title) ─────────────────────
function TopGreet({ user, onSettings, onBell }) {
  return (
    <div style={{
      padding: '10px 18px 8px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ font: 'var(--type-caption)', color: 'var(--text-3)' }}>안녕하세요</div>
        <div style={{ font: 'var(--type-headline)', color: 'var(--text)', whiteSpace: 'nowrap' }}>{user.nickname}님 👋</div>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={onBell} style={iconBtn}>
          <Ic.bell width="20" height="20" />
          <span style={{
            position: 'absolute', top: 8, right: 8, width: 6, height: 6, borderRadius: 999,
            background: 'var(--down)',
          }} />
        </button>
        <button onClick={onSettings} style={iconBtn}>
          <Ic.settings width="20" height="20" />
        </button>
      </div>
    </div>
  );
}
const iconBtn = {
  position: 'relative',
  width: 38, height: 38, borderRadius: 12, border: 0,
  background: 'transparent', color: 'var(--text-2)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
};
window.TopGreet = TopGreet;

function NavBar({ title, onBack, right, transparent = true }) {
  return (
    <div style={{
      padding: '8px 12px 12px', display: 'flex', alignItems: 'center', gap: 4,
      background: transparent ? 'transparent' : 'var(--bg-card)',
      borderBottom: transparent ? 'none' : '.5px solid var(--border)',
    }}>
      {onBack && (
        <button onClick={onBack} style={{ ...iconBtn, width: 40, height: 40 }}>
          <Ic.back width="20" height="20" />
        </button>
      )}
      <div style={{ flex: 1, font: 'var(--type-headline)', color: 'var(--text)', paddingLeft: onBack ? 0 : 8 }}>
        {title}
      </div>
      {right}
    </div>
  );
}
window.NavBar = NavBar;

// ── Compact row used on holdings lists ──────────────────────
function HoldingRow({ h, profitMode = 'global', onClick, showWeight = true }) {
  const up = h.profitPct >= 0;
  return (
    <button onClick={onClick} style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 4px', background: 'none', border: 0, cursor: 'pointer',
      textAlign: 'left',
    }}>
      <TickerBadge holding={h} size={36} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: 'var(--type-callout)', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {h.name}
        </div>
        <div style={{ font: 'var(--type-caption)', color: 'var(--text-3)' }}>
          {h.qty}주 · 평단 <span className="num">{fmt.short(h.avgPrice)}</span>
          {h.currency === 'USD' ? '$' : '원'}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0, whiteSpace: 'nowrap' }}>
        <div className="num" style={{ font: 'var(--type-callout)', color: 'var(--text)' }}>
          {fmt.krw(h.value, { compact: true })}원
        </div>
        <div className={'num ' + (up ? 'up' : 'down')} style={{ font: 'var(--type-caption)' }}>
          {fmt.pct(h.profitPct, { sign: true })}
        </div>
      </div>
    </button>
  );
}
window.HoldingRow = HoldingRow;

// ── Status spec for ios frame: app-shell that fills frame ───
function AppShell({ children }) {
  return (
    <div className="app-shell" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {children}
    </div>
  );
}
window.AppShell = AppShell;

// scrollable middle pane
function ScrollPane({ children, style }) {
  return (
    <div style={{
      flex: 1, overflowY: 'auto', overflowX: 'hidden',
      ...style,
    }}>
      {children}
    </div>
  );
}
window.ScrollPane = ScrollPane;
