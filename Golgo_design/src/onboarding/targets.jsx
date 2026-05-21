// Onboarding Step 4 — Target weights
function TargetsScreen({ persona, onFinish }) {
  // Recommended split by persona — picks 3-4 ETFs and gives weights summing to 100
  const recommendations = {
    conservative: [
      { ticker: 'KODEX200', target: 50 },
      { ticker: 'TIGER',    target: 50 },
    ],
    balanced: [
      { ticker: 'KODEX200', target: 20 },
      { ticker: 'TIGER',    target: 25 },
      { ticker: 'QQQ',      target: 35 },
      { ticker: 'SPY',      target: 20 },
    ],
    growth: [
      { ticker: 'TIGER',    target: 15 },
      { ticker: 'QQQ',      target: 50 },
      { ticker: 'SPY',      target: 25 },
      { ticker: 'SSE',      target: 10 },
    ],
    custom: [
      { ticker: 'KODEX200', target: 25 },
      { ticker: 'TIGER',    target: 25 },
      { ticker: 'QQQ',      target: 25 },
      { ticker: 'SPY',      target: 25 },
    ],
  };
  const D = window.GOLGO_DATA;
  const initialKey = recommendations[persona] ? persona : 'balanced';

  const [weights, setWeights] = React.useState(
    Object.fromEntries(recommendations[initialKey].map(x => [x.ticker, x.target]))
  );

  const holdings = recommendations[initialKey].map(r => ({
    ...D.holdings.find(h => h.ticker === r.ticker),
    target: weights[r.ticker],
  }));
  const total = Object.values(weights).reduce((s, x) => s + x, 0);
  const diff = 100 - total;
  const isExact = total === 100;

  const update = (ticker, value) => {
    const clamped = Math.max(0, Math.min(100, value));
    setWeights(w => ({ ...w, [ticker]: clamped }));
  };
  const resetToRecommended = () => {
    setWeights(Object.fromEntries(recommendations[initialKey].map(x => [x.ticker, x.target])));
  };

  return (
    <AppShell>
      <div style={{ paddingTop: 56, padding: '56px 24px 16px', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {[true, true, true, true].map((on, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2,
              background: on ? 'var(--text)' : 'var(--border)' }} />
          ))}
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 8,
        }}>
          <span style={{ font: 'var(--type-micro)', color: 'var(--text-3)' }}>4 / 4 단계</span>
          <button onClick={resetToRecommended} style={{
            background: 'none', border: 0, cursor: 'pointer',
            color: 'var(--text-3)', font: 'var(--type-caption)',
            display: 'flex', alignItems: 'center', gap: 3, padding: 0,
          }}>
            <Ic.refresh width="12" height="12" /> 추천 비중으로 초기화
          </button>
        </div>
        <h1 style={{
          font: 'var(--type-display)', color: 'var(--text)', letterSpacing: '-0.02em',
          lineHeight: 1.25, marginBottom: 8, fontSize: 26,
        }}>
          자산 목표 비중을<br/>정해볼까요?
        </h1>
        <p style={{ font: 'var(--type-body)', color: 'var(--text-2)', marginBottom: 18 }}>
          추천 비중을 그대로 쓰거나 직접 조정할 수 있어요
        </p>

        {/* Total bar */}
        <div className="card" style={{ marginBottom: 12, padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <span style={{ font: 'var(--type-callout)', color: 'var(--text-2)' }}>합계</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span className="num" style={{
                font: '700 22px/1 var(--font-num)',
                color: isExact ? 'var(--up-strong)' : 'var(--text)',
              }}>{total}</span>
              <span style={{ font: 'var(--type-callout)', color: 'var(--text-3)' }}>/ 100%</span>
              {!isExact && (
                <span className={'pill ' + (diff > 0 ? 'pill-warn' : 'pill-down')}
                  style={{ marginLeft: 4 }}>
                  {diff > 0 ? `${diff}% 부족` : `${-diff}% 초과`}
                </span>
              )}
              {isExact && (
                <span className="pill pill-up" style={{ marginLeft: 4 }}>
                  <Ic.check width="9" height="9"/> 완료
                </span>
              )}
            </div>
          </div>
          {/* Stacked bar visualization */}
          <div style={{
            height: 8, borderRadius: 4, background: 'var(--bg-soft)',
            display: 'flex', gap: 1, overflow: 'hidden',
          }}>
            {holdings.map(h => h.target > 0 && (
              <div key={h.ticker} style={{
                width: `${h.target}%`,
                background: `var(${h.colorVar})`,
                transition: 'width .2s',
              }} />
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0,
          display: 'flex', flexDirection: 'column', gap: 4, margin: '0 -4px',
        }}>
          {holdings.map(h => (
            <WeightSlider key={h.ticker} holding={h}
              value={weights[h.ticker]}
              onChange={(v) => update(h.ticker, v)} />
          ))}
        </div>

        <button className="btn btn-accent" disabled={!isExact}
          onClick={() => isExact && onFinish(weights)}
          style={{
            width: '100%', marginTop: 16,
            opacity: isExact ? 1 : 0.35,
            cursor: isExact ? 'pointer' : 'not-allowed',
          }}>
          {isExact ? '고르고 시작하기' : `합계를 100%로 맞춰주세요`}
        </button>
      </div>
    </AppShell>
  );
}

function WeightSlider({ holding, value, onChange }) {
  const color = `var(${holding.colorVar})`;
  return (
    <div style={{ padding: '10px 4px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
      }}>
        <TickerBadge holding={holding} size={32} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ font: 'var(--type-callout)', color: 'var(--text)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {holding.name}
          </div>
          <div style={{ font: 'var(--type-caption)', color: 'var(--text-3)' }}>
            {holding.sector}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={() => onChange(value - 5)} disabled={value <= 0} style={stepBtn}>
            <Ic.minus width="14" height="14" />
          </button>
          <div className="num" style={{
            minWidth: 48, textAlign: 'center',
            font: '600 17px/1 var(--font-num)', color: 'var(--text)',
          }}>
            {value}<span style={{ font: '500 12px/1 var(--font-sans)', color: 'var(--text-3)' }}>%</span>
          </div>
          <button onClick={() => onChange(value + 5)} disabled={value >= 100} style={stepBtn}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14"/><path d="M5 12h14"/>
            </svg>
          </button>
        </div>
      </div>
      <div style={{ position: 'relative', height: 28, display: 'flex', alignItems: 'center' }}>
        <div style={{
          position: 'absolute', left: 0, right: 0, height: 4, borderRadius: 2,
          background: 'var(--bg-soft)',
        }} />
        <div style={{
          position: 'absolute', left: 0, height: 4, borderRadius: 2,
          width: `${value}%`,
          background: color,
        }} />
        <input
          type="range" min={0} max={100} step={5}
          value={value} onChange={(e) => onChange(Number(e.target.value))}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: 28, margin: 0,
            background: 'transparent', WebkitAppearance: 'none',
            opacity: 0, cursor: 'pointer',
          }}
        />
        <div style={{
          position: 'absolute', left: `calc(${value}% - 9px)`,
          width: 18, height: 18, borderRadius: 999,
          background: 'var(--bg-card)',
          border: `3px solid ${color}`,
          boxShadow: 'var(--shadow-sm)',
          pointerEvents: 'none',
        }} />
      </div>
    </div>
  );
}

const stepBtn = {
  width: 28, height: 28, borderRadius: 8,
  border: 0, background: 'var(--bg-soft)', color: 'var(--text-2)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
};

window.TargetsScreen = TargetsScreen;
