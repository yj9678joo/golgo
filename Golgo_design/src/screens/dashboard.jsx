// Screen 3 — Main Dashboard
function DashboardScreen({ onNav, onOpenRebalance, onOpenHolding }) {
  const D = window.GOLGO_DATA;
  const [period, setPeriod] = React.useState('3M');
  const periods = ['1W', '1M', '3M', '6M', '1Y', '전체'];
  const slice = { '1W': 7, '1M': 30, '3M': 60, '6M': 90, '1Y': 90, '전체': 90 }[period] || 90;
  const series = D.history.slice(-slice);
  const profitUp = D.totals.profitPct >= 0;
  const dayUp = D.totals.dayChange >= 0;

  return (
    <AppShell>
      <div style={{ paddingTop: 50 }}>
        <TopGreet user={D.user} onSettings={() => onNav('settings')} onBell={() => onNav('alerts')} />
      </div>

      <ScrollPane>
        <div style={{ padding: '8px 16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* ── Hero asset card ─────────────────── */}
          <div className="card" style={{ padding: '20px 20px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
              <span style={{ font: 'var(--type-caption)', color: 'var(--text-3)', whiteSpace: 'nowrap' }}>총 평가금액</span>
              <span className="pill pill-neutral" style={{ gap: 4, flexShrink: 0 }}>
                {dayUp ? <Ic.arrowUp width="9" height="9"/> : <Ic.arrowDn width="9" height="9"/>}
                <span className="num">오늘 {fmt.pct(D.totals.dayChangePct, { sign: false })}</span>
              </span>
            </div>
            <div className="num" style={{
              font: '700 32px/1.1 var(--font-num)', color: 'var(--text)',
              letterSpacing: '-0.025em', marginBottom: 6, whiteSpace: 'nowrap',
            }}>
              {fmt.krw(D.totals.asset)}<span style={{ font: '500 18px/1 var(--font-sans)', color: 'var(--text-2)', marginLeft: 4 }}>원</span>
            </div>
            <div className={'num ' + (profitUp ? 'up' : 'down')} style={{ font: 'var(--type-callout)' }}>
              {fmt.krw(D.totals.profit, { sign: true })}원 ({fmt.pct(D.totals.profitPct, { sign: true })})
              <span style={{ color: 'var(--text-3)', marginLeft: 6, fontFamily: 'var(--font-sans)' }}>· 원금 대비</span>
            </div>

            {/* Period tabs */}
            <div style={{ display: 'flex', gap: 4, marginTop: 14 }}>
              {periods.map(p => (
                <button key={p} onClick={() => setPeriod(p)} style={{
                  flex: 1, height: 28, border: 0, borderRadius: 8,
                  background: period === p ? 'var(--bg-chip)' : 'transparent',
                  color: period === p ? 'var(--text)' : 'var(--text-3)',
                  font: '500 11px/1 var(--font-sans)', cursor: 'pointer', letterSpacing: '-0.01em',
                }}>{p}</button>
              ))}
            </div>

            {/* Sparkline */}
            <div style={{ margin: '8px -4px 0' }}>
              <Sparkline data={series} h={92} color={profitUp ? 'var(--up-strong)' : 'var(--down-strong)'} />
            </div>

            {/* Stats row */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
              gap: 12, paddingTop: 12, marginTop: 4,
              borderTop: '.5px solid var(--divider)',
            }}>
              <Stat label="원금" value={fmt.krw(D.totals.principal, { compact: true }) + '원'} />
              <Stat label="현금" value={fmt.krw(D.totals.cash, { compact: true }) + '원'} />
              <Stat label="보유 종목" value={`${D.holdings.length}개`} />
            </div>
          </div>

          {/* ── Rebalance alert ─────────────────── */}
          {D.rebalance.needed && (
            <button onClick={onOpenRebalance} style={{
              background: 'var(--bg-card)', border: '1px solid var(--warn-soft)',
              borderLeft: '4px solid var(--warn)',
              borderRadius: 'var(--radius-lg)', padding: 16, cursor: 'pointer',
              display: 'flex', gap: 12, alignItems: 'center', textAlign: 'left',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 12, background: 'var(--warn-soft)',
                color: 'var(--warn)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Ic.warn width="20" height="20" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: 'var(--type-callout)', color: 'var(--text)', marginBottom: 2 }}>
                  리밸런싱이 필요해요
                </div>
                <div style={{ font: 'var(--type-caption)', color: 'var(--text-2)', lineHeight: 1.45 }}>
                  QQQ 비중이 목표 대비 <span className="num" style={{ color: 'var(--warn)', fontWeight: 600 }}>+12.7%p</span><br/>초과됐어요
                </div>
              </div>
              <Ic.chev width="16" height="16" style={{ color: 'var(--text-3)' }} />
            </button>
          )}

          {/* ── Quick actions ──────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <QuickTile
              icon={<Ic.sparkle width="18" height="18"/>}
              label="오늘의 분석"
              sub={`${D.holdings[2].name} · 권고 변경`}
              accent="var(--info)"
              onClick={() => onNav('report')}
            />
            <QuickTile
              icon={<Ic.refresh width="18" height="18"/>}
              label="리밸런싱 가이드"
              sub="2종목 매수 · 1종목 매도"
              accent="var(--accent)"
              onClick={onOpenRebalance}
            />
          </div>

          {/* ── Holdings ───────────────────────── */}<div className="card" style={{ padding: '4px 16px 8px' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8,
              padding: '12px 0 6px',
            }}>
              <span style={{ font: 'var(--type-headline)', color: 'var(--text)', whiteSpace: 'nowrap' }}>보유 종목</span>
              <button onClick={() => onNav('portfolio')} style={{
                background: 'none', border: 0, cursor: 'pointer',
                color: 'var(--text-3)', font: 'var(--type-caption)',
                display: 'flex', alignItems: 'center', gap: 2, whiteSpace: 'nowrap', flexShrink: 0,
              }}>
                전체보기 <Ic.chev width="11" height="11"/>
              </button>
            </div>
            {D.holdings.map((h, i) => (
              <div key={h.ticker} style={{
                borderTop: i === 0 ? 0 : '.5px solid var(--divider)',
              }}>
                <HoldingRow h={h} onClick={() => onOpenHolding(h)} />
              </div>
            ))}
          </div>
        </div>
      </ScrollPane>
    </AppShell>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ font: 'var(--type-micro)', color: 'var(--text-3)', marginBottom: 2, whiteSpace: 'nowrap' }}>{label}</div>
      <div className="num" style={{ font: '600 13px/1.2 var(--font-num)', color: 'var(--text)', whiteSpace: 'nowrap' }}>{value}</div>
    </div>
  );
}

function QuickTile({ icon, label, sub, accent, onClick }) {
  return (
    <button onClick={onClick} className="card" style={{
      padding: 14, cursor: 'pointer', textAlign: 'left',
      display: 'flex', flexDirection: 'column', gap: 10,
      background: 'var(--bg-card)', border: 0,
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 10,
        background: 'var(--bg-soft)', color: accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <div>
        <div style={{ font: 'var(--type-callout)', color: 'var(--text)', marginBottom: 2 }}>
          {label}
        </div>
        <div style={{ font: 'var(--type-caption)', color: 'var(--text-3)' }}>
          {sub}
        </div>
      </div>
    </button>
  );
}

window.DashboardScreen = DashboardScreen;
