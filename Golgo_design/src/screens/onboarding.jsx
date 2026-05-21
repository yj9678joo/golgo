// Screen 2 — Onboarding (Investment persona)
function OnboardingScreen({ onNext, onSkip }) {
  const [selected, setSelected] = React.useState('balanced');
  const options = [
    { id: 'conservative', label: '안정형', sub: '원금 보존 우선, 꾸준한 적립',
      glyph: <PersonaGlyph kind="seed" /> },
    { id: 'balanced',     label: '안정 성장형', sub: '지수 ETF 중심, 일부 성장주',
      glyph: <PersonaGlyph kind="balance" /> },
    { id: 'growth',       label: '성장형', sub: '미국 빅테크 + 섹터 집중',
      glyph: <PersonaGlyph kind="rocket" /> },
    { id: 'custom',       label: '직접 설정', sub: '목표 비중을 내가 정할게요',
      glyph: <PersonaGlyph kind="custom" /> },
  ];
  return (
    <AppShell>
      <div style={{ paddingTop: 56, padding: '56px 24px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Step bar */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {[true, true, false, false].map((on, i) => (
            <div key={i} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: on ? 'var(--text)' : 'var(--border)',
            }} />
          ))}
        </div>
        <div style={{ font: 'var(--type-micro)', color: 'var(--text-3)', marginBottom: 8 }}>
          2 / 4 단계
        </div>
        <h1 style={{
          font: 'var(--type-display)', color: 'var(--text)', letterSpacing: '-0.02em',
          lineHeight: 1.25, marginBottom: 8, fontSize: 26,
        }}>
          어떤 투자 성향을<br/>가지고 계신가요?
        </h1>
        <p style={{ font: 'var(--type-body)', color: 'var(--text-2)', marginBottom: 24 }}>
          선택한 성향에 맞춰 목표 비중을 추천해드려요
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
          {options.map(opt => (
            <PersonaCard key={opt.id} label={opt.label} sub={opt.sub} glyph={opt.glyph}
              selected={selected === opt.id}
              onClick={() => setSelected(opt.id)} />
          ))}
        </div>

        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button className="btn btn-accent" onClick={() => onNext(selected)}
            style={{ width: '100%' }}>
            다음
          </button>
          <button onClick={onSkip} style={{
            height: 44, background: 'none', border: 0, cursor: 'pointer',
            color: 'var(--text-3)', font: 'var(--type-callout)',
          }}>
            나중에 설정할게요
          </button>
        </div>
      </div>
    </AppShell>
  );
}

function PersonaCard({ label, sub, glyph, selected, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', textAlign: 'left', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 14,
      padding: 14,
      background: selected ? 'var(--bg-card)' : 'var(--bg-card)',
      border: selected ? '1.5px solid var(--text)' : '1.5px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: selected ? 'var(--shadow)' : 'none',
      transition: 'all .15s',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: selected ? 'var(--bg-inverse)' : 'var(--bg-soft)',
        color: selected ? 'var(--text-on-accent)' : 'var(--text-2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, transition: 'all .15s',
      }}>
        {glyph}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: 'var(--type-headline)', color: 'var(--text)', marginBottom: 3 }}>{label}</div>
        <div style={{ font: 'var(--type-caption)', color: 'var(--text-2)' }}>{sub}</div>
      </div>
      <div style={{
        width: 22, height: 22, borderRadius: 999, flexShrink: 0,
        border: selected ? '0' : '1.5px solid var(--border-2)',
        background: selected ? 'var(--text)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-on-accent)',
      }}>
        {selected && <Ic.check width="12" height="12" />}
      </div>
    </button>
  );
}

function PersonaGlyph({ kind }) {
  if (kind === 'seed') return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22V8"/><path d="M12 8c-3 0-6-2-6-5 3 0 6 2 6 5z"/><path d="M12 8c3 0 6-2 6-5-3 0-6 2-6 5z"/><path d="M5 22h14"/>
    </svg>
  );
  if (kind === 'balance') return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17l6-6 4 4 7-7"/><path d="M14 7h7v7"/>
    </svg>
  );
  if (kind === 'rocket') return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1 0-2.9-.7-.8-2.1-.8-2.9 0z"/>
      <path d="M12 15l-3-3a22 22 0 014-7 11 11 0 016-3.3 11 11 0 01-3.3 6 22 22 0 01-7 4z"/>
      <path d="M9 12H4s.5-2.8 2-4c1.7-1.3 5 0 5 0M12 15v5s2.8-.5 4-2c1.3-1.7 0-5 0-5"/>
    </svg>
  );
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/>
      <line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/>
      <line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>
    </svg>
  );
}

window.OnboardingScreen = OnboardingScreen;
