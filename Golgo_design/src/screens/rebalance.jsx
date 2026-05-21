// Screen 6 — Rebalancing Guide
function RebalanceScreen({ onBack, onExternalApp }) {
  const D = window.GOLGO_DATA;
  const R = D.rebalance;

  const sells = R.actions.filter(a => a.side === 'sell');
  const buys  = R.actions.filter(a => a.side === 'buy');
  const holds = R.actions.filter(a => a.side === 'hold');

  // total trade amounts
  const totalSell = sells.reduce((s, x) => s + x.amount, 0);
  const totalBuy  = buys.reduce((s, x) => s + x.amount, 0);
  // helper: holding lookup
  const get = (ticker) => D.holdings.find(h => h.ticker === ticker);

  return (
    <AppShell>
      <div style={{ paddingTop: 50 }}>
        <NavBar title="리밸런싱 가이드" onBack={onBack} right={
          <button style={iconBtn3}><Ic.info width="20" height="20"/></button>
        } />
      </div>

      <ScrollPane>
        <div style={{ padding: '0 16px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* ── Hero: shift visualization ─────────── */}
          <div className="card" style={{ padding: '18px 18px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ font: 'var(--type-caption)', color: 'var(--text-3)' }}>오늘의 가이드</span>
              <span className="num" style={{ font: 'var(--type-micro)', color: 'var(--text-3)' }}>
                2026.05.14
              </span>
            </div>
            <div style={{ font: 'var(--type-title)', color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 14 }}>
              <span className="num">{R.targetCount}개 종목</span>으로<br/>
              <span style={{ color: 'var(--accent)' }}>목표 비중을 맞출게요</span>
            </div>

            {/* Before/After stacked bars */}
            <ShiftBars holdings={D.holdings} />

            {/* Summary chips */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14,
              paddingTop: 14, borderTop: '.5px solid var(--divider)',
            }}>
              <ChipStat label="매도 총액" value={fmt.krw(totalSell, { compact: true }) + '원'} tone="down" />
              <ChipStat label="매수 총액" value={fmt.krw(totalBuy,  { compact: true }) + '원'} tone="up" />
</div>
          </div>

          {/* ── SELL ─────────────────────────────── */}
          {sells.length > 0 && (
            <ActionGroup
              kind="sell"
              icon={<Ic.arrowDn width="14" height="14"/>}
              title="매도"
              count={sells.length}
              total={totalSell}
            >
              {sells.map(a => <ActionRow key={a.ticker} action={a} holding={get(a.ticker)} />)}
            </ActionGroup>
          )}

          {/* ── BUY ──────────────────────────────── */}
          {buys.length > 0 && (
            <ActionGroup
              kind="buy"
              icon={<Ic.arrowUp width="14" height="14"/>}
              title="매수"
              count={buys.length}
              total={totalBuy}
            >
              {buys.map(a => <ActionRow key={a.ticker} action={a} holding={get(a.ticker)} />)}
            </ActionGroup>
          )}

          {/* ── HOLD ─────────────────────────────── */}
          {holds.length > 0 && (
            <ActionGroup
              kind="hold"
              icon={<Ic.minus width="14" height="14"/>}
              title="유지"
              count={holds.length}
            >
              {holds.map(a => <ActionRow key={a.ticker} action={a} holding={get(a.ticker)} hold />)}
            </ActionGroup>
          )}
          {/* Cost breakdown removed per request */}

          
          {/* ── Disclaimer ────────────────────────── */}
          <div style={{
            background: 'var(--bg-soft)', borderRadius: 'var(--radius)',
            padding: '12px 14px', display: 'flex', gap: 10,
          }}>
            <Ic.shield width="16" height="16" style={{ color: 'var(--text-3)', flexShrink: 0, marginTop: 1 }}/>
            <div style={{ font: 'var(--type-caption)', color: 'var(--text-2)', lineHeight: 1.6 }}>
              이 가이드는 참고용입니다. 실제 매매는 증권사 앱에서 직접 진행해 주세요.
              시장 변동에 따라 체결 가격이 달라질 수 있습니다.
            </div>
          </div>

          {/* ── CTAs ──────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
            <button className="btn btn-accent" onClick={onExternalApp} style={{ width: '100%' }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                <path d="M15 3h6v6"/><path d="M10 14L21 3"/>
              </svg>
              증권사 앱으로 이동해서 주문하기
            </button>
          </div>
        </div>
      </ScrollPane>
    </AppShell>
  );
}

// Before/After stacked horizontal bar — shows portfolio composition shift
function ShiftBars({ holdings }) {
  const sorted = [...holdings].sort((a, b) => b.current - a.current);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <ShiftRow label="현재" data={sorted} key_="current" />
      <ShiftRow label="목표" data={sorted} key_="target" />
    </div>
  );
}

function ShiftRow({ label, data, key_ }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ font: 'var(--type-micro)', color: 'var(--text-3)', letterSpacing: '0.04em' }}>
          {label}
        </span>
      </div>
      <div style={{ display: 'flex', height: 24, borderRadius: 6, overflow: 'hidden', gap: 1 }}>
        {data.map(h => (
          <div key={h.ticker} style={{
            width: `${h[key_]}%`, background: `var(${h.colorVar})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            font: '600 9.5px/1 var(--font-num)', color: '#fff',
            letterSpacing: '0',
          }} title={`${h.ticker} ${h[key_].toFixed(1)}%`}>
            {h[key_] >= 10 ? h[key_].toFixed(0) + '%' : ''}
          </div>
        ))}
      </div>
    </div>
  );
}

function ChipStat({ label, value, tone }) {
  const color = tone === 'up' ? 'var(--up-strong)' :
                tone === 'down' ? 'var(--down-strong)' : 'var(--text)';
  return (
    <div style={{
      background: 'var(--bg-soft)', borderRadius: 'var(--radius)',
      padding: '10px 12px',
    }}>
      <div style={{ font: 'var(--type-micro)', color: 'var(--text-3)', marginBottom: 4 }}>{label}</div>
      <div className="num" style={{ font: '600 14px/1.2 var(--font-num)', color }}>{value}</div>
    </div>
  );
}

function ActionGroup({ kind, icon, title, count, total, children }) {
  const tones = {
    sell: { bg: 'var(--down-soft)', color: 'var(--down-strong)', label: '매도 추천' },
    buy:  { bg: 'var(--up-soft)',   color: 'var(--up-strong)',   label: '매수 추천' },
    hold: { bg: 'var(--neutral-soft)', color: 'var(--text-2)',   label: '유지' },
  }[kind];
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{
        background: tones.bg, padding: '10px 16px',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 20, height: 20, borderRadius: 999,
          background: 'rgba(255,255,255,.4)', color: tones.color,
        }}>
          {icon}
        </div>
        <span style={{ font: '600 13px/1 var(--font-sans)', color: tones.color, flex: 1 }}>
          {title} <span style={{ opacity: .6, fontWeight: 500 }}>· {count}건</span>
        </span>
        {total != null && (
          <span className="num" style={{ font: '600 12px/1 var(--font-num)', color: tones.color }}>
            {fmt.krw(total, { compact: true })}원
          </span>
        )}
      </div>
      <div style={{ padding: '0 16px' }}>
        {children}
      </div>
    </div>
  );
}

function ActionRow({ action, holding, hold }) {
  const a = action;
  if (!holding) return null;
  const dev = (a.from - a.to);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 0', borderTop: '.5px solid var(--divider)',
    }}>
      <TickerBadge holding={holding} size={36} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: 'var(--type-callout)', color: 'var(--text)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {holding.name}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          font: 'var(--type-caption)', color: 'var(--text-3)', marginTop: 1,
        }}>
          <span className="num">{a.from.toFixed(1)}%</span>
          <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-4)' }}>
            <path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>
          </svg>
          <span className="num" style={{ color: 'var(--text-2)', fontWeight: 600 }}>{a.to.toFixed(1)}%</span>
          <span style={{ marginLeft: 4 }}>· {a.note}</span>
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        {hold ? (
          <span className="pill pill-neutral" style={{ height: 24, font: 'var(--type-micro)' }}>
            그대로
          </span>
        ) : (
          <>
            <div className="num" style={{ font: '600 14px/1.2 var(--font-num)', color: 'var(--text)' }}>
              {a.qty}주
            </div>
            <div className="num" style={{ font: 'var(--type-caption)', color: 'var(--text-3)', marginTop: 1 }}>
              ≈ {fmt.krw(a.amount, { compact: true })}원
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CostRow({ label, value, bold }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '4px 0',
    }}>
      <span style={{
        font: bold ? 'var(--type-callout)' : 'var(--type-caption)',
        color: bold ? 'var(--text)' : 'var(--text-2)',
        fontWeight: bold ? 600 : 400,
      }}>{label}</span>
      <span className="num" style={{
        font: bold ? '600 14px/1.2 var(--font-num)' : '500 12px/1.2 var(--font-num)',
        color: bold ? 'var(--text)' : 'var(--text-2)',
      }}>{value}</span>
    </div>
  );
}

const iconBtn3 = {
  width: 38, height: 38, borderRadius: 12, border: 0,
  background: 'transparent', color: 'var(--text-2)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
};

window.RebalanceScreen = RebalanceScreen;
