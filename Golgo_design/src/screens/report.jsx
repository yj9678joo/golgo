// Screen 5 — AI Analysis Report (hero screen)
function ReportScreen({ onBack, onOpenRebalance }) {
  const R = window.GOLGO_REPORT;
  const D = window.GOLGO_DATA;
  const holding = D.holdings.find(h => h.ticker === R.ticker);

  // verdict styling
  const verdictMap = {
    BUY:   { label: '비중 확대',  pill: 'pill-up',   color: 'var(--up-strong)' },
    HOLD:  { label: '현 비중 유지', pill: 'pill-neutral', color: 'var(--text-2)' },
    TRIM:  { label: '비중 축소',  pill: 'pill-warn', color: 'var(--warn)' },
    SELL:  { label: '비중 청산',  pill: 'pill-down', color: 'var(--down-strong)' },
  };
  const verdict = verdictMap[R.verdict];

  // weakest stage opens by default — most actionable insight
  const weakestId = R.stages.reduce((m, s) => (s.score < m.score ? s : m), R.stages[0]).id;
  const [expanded, setExpanded] = React.useState(weakestId);

  return (
    <AppShell>
      <div style={{ paddingTop: 50 }}>
        <NavBar title="" onBack={onBack} right={
          <div style={{ display: 'flex', gap: 4 }}>
            <button style={iconBtn2}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v13"/></svg>
            </button>
            <button style={iconBtn2}><Ic.more width="18" height="18"/></button>
          </div>
        } />
      </div>

      <ScrollPane>
        <div style={{ padding: '0 16px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* ── Header: ticker + verdict + analyst ───────── */}
          <div style={{ padding: '4px 4px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <TickerBadge holding={holding} size={52} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: 'var(--type-title)', color: 'var(--text)', letterSpacing: '-0.02em',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{R.name}</div>
                <div style={{ font: 'var(--type-caption)', color: 'var(--text-3)' }}>
                  {R.exchange} · <span className="num">{R.generatedAt.split(' ')[0]}</span> 분석
                </div>
              </div>
              <span className={'pill ' + verdict.pill} style={{ height: 28, padding: '0 12px', font: 'var(--type-callout)' }}>
                {verdict.label}
              </span>
            </div>

            {/* Analyst signature removed per request */}
          </div>

          {/* ── Score hero ──────────────────────────────── */}
          <div className="card" style={{ padding: '20px 18px 18px', textAlign: 'center' }}>
            <div style={{ font: 'var(--type-micro)', color: 'var(--text-3)',
              letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
              종합 점수
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
              <ScoreGauge score={R.score} size={216} />
            </div>
            <div style={{
              padding: '14px 14px 12px', borderRadius: 'var(--radius)',
              background: 'var(--bg-soft)',
              borderLeft: `3px solid ${verdict.color}`,
              textAlign: 'left',
            }}>
              <div style={{ font: 'var(--type-micro)', color: 'var(--text-3)', marginBottom: 6,
                letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                오늘의 한 줄
              </div>
              <p style={{ font: '500 16px/1.55 var(--font-sans)', color: 'var(--text)',
                letterSpacing: '-0.01em',
              }}>
                {R.oneLiner}
              </p>
            </div>
          </div>

          {/* ── Investment thesis ───────────────────────── */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Ic.brain width="14" height="14" style={{ color: 'var(--text-2)' }}/>
              <span style={{ font: 'var(--type-callout)', color: 'var(--text-2)',
                letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: 11 }}>
                Investment Thesis
              </span>
            </div>
            <p style={{ font: 'var(--type-body)', color: 'var(--text)', lineHeight: 1.6,
              wordBreak: 'keep-all', textWrap: 'pretty',
            }}>
              {R.thesis}
            </p>
          </div>

          {/* ── 7-stage analysis ────────────────────────── */}
          <div className="card" style={{ padding: '4px 0 4px' }}>
            <div style={{ padding: '14px 16px 6px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ font: 'var(--type-headline)', color: 'var(--text)' }}>
                  7단계 심층 분석
                </div>
                <div style={{ font: 'var(--type-caption)', color: 'var(--text-3)', marginTop: 2 }}>
                  단계를 눌러 자세히 보기
                </div>
              </div>
              <span style={{ font: 'var(--type-caption)', color: 'var(--text-3)' }}>
                평균 <span className="num" style={{ color: 'var(--text)', fontWeight: 600 }}>
                  {(R.stages.reduce((s, x) => s + x.score, 0) / R.stages.length).toFixed(1)}
                </span> / 10
              </span>
            </div>
            {R.stages.map((s, i) => (
              <StageRow key={s.id} stage={s}
                expanded={expanded === s.id}
                onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                isLast={i === R.stages.length - 1}
              />
            ))}
          </div>

          {/* ── Risk checklist ──────────────────────────── */}
          <div className="card">
            <div style={{ font: 'var(--type-headline)', color: 'var(--text)', marginBottom: 12 }}>
              리스크 체크리스트
            </div>
            {R.risks.map((r, i) => (
              <div key={i} style={{
                display: 'flex', gap: 12, padding: '12px 0',
                borderTop: i === 0 ? 0 : '.5px solid var(--divider)',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: r.level === 'high' ? 'var(--down-soft)' : 'var(--warn-soft)',
                  color: r.level === 'high' ? 'var(--down-strong)' : 'var(--warn)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  font: '600 11px/1 var(--font-num)',
                }}>
                  {r.level === 'high' ? '!!' : '!'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ font: 'var(--type-callout)', color: 'var(--text)', marginBottom: 3 }}>
                    {r.title}
                  </div>
                  <div style={{ font: 'var(--type-caption)', color: 'var(--text-2)', lineHeight: 1.5 }}>
                    {r.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Self-rebuttal ───────────────────────────── */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            padding: 18, position: 'relative',
            border: '1px dashed var(--border-2)',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{
              position: 'absolute', top: -10, left: 14, padding: '2px 10px',
              background: 'var(--bg-app)', font: 'var(--type-micro)', color: 'var(--text-3)',
              letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              Self-Rebuttal
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--text-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7.5 4.21l4.5 2.6 4.5-2.6"/><path d="M7.5 19.79V14.6L3 12"/>
                <path d="M21 12l-4.5 2.6v5.19"/><path d="M3.27 6.96L12 12.01l8.73-5.05"/>
                <path d="M12 22.08V12"/>
              </svg>
              <span style={{ font: 'var(--type-callout)', color: 'var(--text-2)' }}>
                {R.selfRebuttal.label}
              </span>
            </div>
            <p style={{ font: 'var(--type-body)', color: 'var(--text)', lineHeight: 1.65,
              wordBreak: 'keep-all', textWrap: 'pretty',
            }}>
              {R.selfRebuttal.body}
            </p>
          </div>

          {/* ── CTAs ───────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            <button className="btn btn-accent" onClick={onOpenRebalance} style={{ width: '100%' }}>
              이 분석으로 리밸런싱 가이드 보기
              <Ic.chev width="16" height="16"/>
            </button>
            <button className="btn btn-soft" style={{ width: '100%' }}>
              다시 분석 요청하기
            </button>
          </div>

          <div style={{ font: 'var(--type-caption)', color: 'var(--text-3)',
            textAlign: 'center', lineHeight: 1.55, padding: '8px 16px',
          }}>
            본 리포트는 정보 제공 목적이며, 투자 판단은 본인 책임입니다.<br/>
            과거 데이터가 미래 수익을 보장하지 않습니다.
          </div>
        </div>
      </ScrollPane>
    </AppShell>
  );
}

function AnalystSignature({ analyst, generatedAt, duration }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
      background: 'var(--bg-card)', borderRadius: 'var(--radius)',
      border: '.5px solid var(--border)',
    }}>
      {/* persona signature mark */}
      <div style={{
        width: 40, height: 40, borderRadius: 999, flexShrink: 0,
        background: 'linear-gradient(135deg, var(--bg-inverse), color-mix(in oklch, var(--bg-inverse) 80%, transparent))',
        color: 'var(--text-on-accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        font: '700 13px/1 var(--font-serif)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,.15)',
        letterSpacing: '-0.02em',
      }}>
        {analyst.signature}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: 'var(--type-callout)', color: 'var(--text)' }}>
          {analyst.name} <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>분석가</span>
        </div>
        <div style={{ font: 'var(--type-caption)', color: 'var(--text-3)' }}>
          {analyst.tag}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div className="num" style={{ font: 'var(--type-caption)', color: 'var(--text-2)' }}>
          {generatedAt.split(' ')[0]}
        </div>
        <div className="num" style={{ font: 'var(--type-micro)', color: 'var(--text-3)' }}>
          {duration}초 소요
        </div>
      </div>
    </div>
  );
}

function StageRow({ stage, expanded, onClick, isLast }) {
  const color = stage.score >= 7.5 ? 'var(--up-strong)' :
                stage.score >= 5 ? 'var(--warn)' : 'var(--down-strong)';
  return (
    <div style={{ borderTop: '.5px solid var(--divider)' }}>
      <button onClick={onClick} style={{
        width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
        background: 'none', border: 0, cursor: 'pointer', textAlign: 'left',
      }}>
        <div style={{
          width: 24, height: 24, borderRadius: 8,
          background: 'var(--bg-soft)', color: 'var(--text-3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          font: '600 11px/1 var(--font-num)', flexShrink: 0,
        }}>
          {stage.id}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ font: 'var(--type-callout)', color: 'var(--text)' }}>
            {stage.label}
          </div>
          <div style={{
            height: 4, borderRadius: 2, background: 'var(--bg-soft)',
            marginTop: 6, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: `${stage.score * 10}%`,
              background: color, borderRadius: 2,
              transition: 'width .4s cubic-bezier(.4,0,.2,1)',
            }} />
          </div>
        </div>
        <div className="num" style={{
          font: '600 15px/1 var(--font-num)', color, minWidth: 36, textAlign: 'right',
        }}>
          {stage.score.toFixed(1)}
        </div>
        <Ic.chev width="12" height="12" style={{
          color: 'var(--text-3)', flexShrink: 0,
          transform: expanded ? 'rotate(90deg)' : 'rotate(0)',
          transition: 'transform .2s',
        }} />
      </button>
      {expanded && (
        <div style={{ padding: '0 16px 14px 52px',
          font: 'var(--type-caption)', color: 'var(--text-2)', lineHeight: 1.6,
        }}>
          {stage.summary}
        </div>
      )}
    </div>
  );
}

const iconBtn2 = {
  width: 38, height: 38, borderRadius: 12, border: 0,
  background: 'transparent', color: 'var(--text-2)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
};

window.ReportScreen = ReportScreen;
