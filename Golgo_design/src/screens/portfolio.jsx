// Screen 4 — Portfolio detail
function PortfolioScreen({ onNav, onOpenHolding }) {
  const D = window.GOLGO_DATA;
  const [view, setView] = React.useState('current'); // current | target

  const sortedByCurrent = [...D.holdings].sort((a, b) => b.current - a.current);

  // donut slices use ticker color vars
  const slices = sortedByCurrent.map(h => ({
    label: h.ticker,
    value: view === 'current' ? h.current : h.target,
    color: `var(${h.colorVar})`,
  }));

  return (
    <AppShell>
      <div style={{ paddingTop: 50 }}>
        <NavBar title="포트폴리오" right={
          <button style={iconBtnStyle}><Ic.more width="20" height="20" /></button>
        } />
      </div>

      <ScrollPane>
        <div style={{ padding: '4px 16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* ── Outdated banner (per-upload date) ───── */}
          <div style={{
            background: 'var(--warn-soft)', borderRadius: 'var(--radius)',
            padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <Ic.refresh width="16" height="16" style={{ color: 'var(--warn)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ font: 'var(--type-callout)', color: 'var(--warn)' }}>
                마지막 업로드 4일 전 기준이에요
              </div>
              <div style={{ font: 'var(--type-caption)', color: 'var(--text-2)', marginTop: 1 }}>
                최신화하면 정확한 리밸런싱 가이드를 받을 수 있어요
              </div>
            </div>
            <button className="btn btn-xs" style={{
              background: 'var(--warn)', color: '#fff', whiteSpace: 'nowrap',
            }}>업로드</button>
          </div>

          {/* ── Donut + legend ────────────────── */}
          <div className="card" style={{ padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ font: 'var(--type-headline)', color: 'var(--text)' }}>자산 비중</span>
              <SegmentSwitch value={view} onChange={setView} options={[
                { v: 'current', label: '현재' }, { v: 'target', label: '목표' }
              ]} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <Donut slices={slices} size={132} thickness={20} gap={2} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sortedByCurrent.map(h => (
                  <div key={h.ticker} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      width: 9, height: 9, borderRadius: 3, flexShrink: 0,
                      background: `var(${h.colorVar})`,
                    }} />
                    <span style={{ font: 'var(--type-caption)', color: 'var(--text-2)', flex: 1,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>{h.ticker}</span>
                    <span className="num" style={{ font: '600 12px/1 var(--font-num)', color: 'var(--text)' }}>
                      {(view === 'current' ? h.current : h.target).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Current vs Target bars ───────── */}
          <div className="card">
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14,
            }}>
              <span style={{ font: 'var(--type-headline)', color: 'var(--text)' }}>
                현재 vs 목표
              </span>
              <div style={{ display: 'flex', gap: 10 }}>
                <Legend swatch="var(--text)" label="현재" />
                <Legend swatch="var(--text-4)" label="목표" />
              </div>
            </div>
            {sortedByCurrent.map(h => {
              const dev = h.current - h.target;
              const max = Math.max(...sortedByCurrent.map(x => Math.max(x.current, x.target)));
              return (
                <div key={h.ticker} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 0', borderTop: '.5px solid var(--divider)',
                }}>
                  <div style={{ width: 76, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: 2,
                      background: `var(${h.colorVar})`, flexShrink: 0,
                    }} />
                    <span style={{ font: 'var(--type-caption)', color: 'var(--text)', whiteSpace: 'nowrap',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>{h.ticker}</span>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ height: 8, borderRadius: 4, background: 'var(--bg-soft)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${(h.current / max) * 100}%`,
                        background: `var(${h.colorVar})`, borderRadius: 4,
                      }} />
                    </div>
                    <div style={{ height: 4, borderRadius: 2, background: 'var(--bg-soft)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${(h.target / max) * 100}%`,
                        background: 'var(--text-4)', borderRadius: 2,
                      }} />
                    </div>
                  </div>
                  <div style={{ width: 54, textAlign: 'right' }}>
                    <span className={
                      Math.abs(dev) < 5 ? 'pill pill-neutral' :
                      dev > 0 ? 'pill pill-warn' : 'pill pill-info'
                    } style={{ font: '500 10px/1 var(--font-num)' }}>
                      {dev > 0 ? '+' : ''}{dev.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Profit by holding ──────────── */}
          <div className="card">
            <div style={{ font: 'var(--type-headline)', color: 'var(--text)', marginBottom: 10 }}>
              종목별 수익률
            </div>
            {sortedByCurrent.map((h, i) => {
              const up = h.profitPct >= 0;
              return (
                <button key={h.ticker} onClick={() => onOpenHolding(h)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 0', borderTop: i === 0 ? 0 : '.5px solid var(--divider)',
                  background: 'none', border: 0, cursor: 'pointer', textAlign: 'left',
                }}>
                  <TickerBadge holding={h} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ font: 'var(--type-callout)', color: 'var(--text)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {h.name}
                    </div>
                    <div style={{ font: 'var(--type-caption)', color: 'var(--text-3)' }}>
                      {h.qty}주 · 평단 <span className="num">{fmt.short(h.avgPrice)}</span>
                      {h.currency === 'USD' ? '$' : '원'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="num" style={{ font: '600 13px/1.3 var(--font-num)', color: 'var(--text)' }}>
                      {fmt.krw(h.value, { compact: true })}원
                    </div>
                    <div className={'num ' + (up ? 'up' : 'down')} style={{
                      font: '500 11px/1.3 var(--font-num)',
                      display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2,
                    }}>
                      {fmt.krw(h.profit, { sign: true, compact: true })} ({fmt.pct(h.profitPct, { sign: true })})
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── Sync status removed per request ─── */}
        </div>
      </ScrollPane>
    </AppShell>
  );
}

function SegmentSwitch({ value, onChange, options }) {
  return (
    <div style={{
      display: 'flex', padding: 2, background: 'var(--bg-soft)',
      borderRadius: 8, gap: 0,
    }}>
      {options.map(o => (
        <button key={o.v} onClick={() => onChange(o.v)} style={{
          height: 26, padding: '0 10px', border: 0, borderRadius: 6, cursor: 'pointer',
          background: value === o.v ? 'var(--bg-card)' : 'transparent',
          boxShadow: value === o.v ? 'var(--shadow-sm)' : 'none',
          color: value === o.v ? 'var(--text)' : 'var(--text-3)',
          font: '500 11px/1 var(--font-sans)',
        }}>{o.label}</button>
      ))}
    </div>
  );
}

function Legend({ swatch, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ width: 10, height: 3, borderRadius: 2, background: swatch }} />
      <span style={{ font: 'var(--type-micro)', color: 'var(--text-3)' }}>{label}</span>
    </div>
  );
}

function SyncRow({ name, status, detail }) {
  const color = status === 'ok' ? 'var(--up-strong)' : status === 'warn' ? 'var(--warn)' : 'var(--down-strong)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '6px 0' }}>
      <span style={{
        width: 8, height: 8, borderRadius: 999, background: color,
        marginRight: 10, boxShadow: `0 0 0 3px ${status === 'ok' ? 'var(--up-soft)' : 'var(--warn-soft)'}`,
      }} />
      <span style={{ flex: 1, font: 'var(--type-callout)', color: 'var(--text)' }}>{name}</span>
      <span style={{ font: 'var(--type-caption)', color: 'var(--text-2)' }}>{detail}</span>
    </div>
  );
}

const iconBtnStyle = {
  width: 38, height: 38, borderRadius: 12, border: 0,
  background: 'transparent', color: 'var(--text-2)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
};

window.PortfolioScreen = PortfolioScreen;
