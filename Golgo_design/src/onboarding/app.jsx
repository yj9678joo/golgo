// Golgo — Onboarding orchestrator (4-step flow)
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "toss",
  "dark": false,
  "accent": "#191F28",
  "profit": "global",
  "startStep": "nickname"
}/*EDITMODE-END*/;

const ACCENT_OPTIONS = ['#191F28', '#3182F6', '#00C896', '#D4A574'];

function OnboardingApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [step, setStep] = React.useState(t.startStep || 'nickname');
  const [data, setData] = React.useState({
    nickname: '', persona: 'balanced', broker: 'kis', targets: null,
  });

  const update = (patch) => setData(d => ({ ...d, ...patch }));

  let body;
  switch (step) {
    case 'nickname':
      body = <NicknameScreen onNext={(name) => { update({ nickname: name }); setStep('persona'); }} />;
      break;
    case 'persona':
      body = <OnboardingScreen
        onNext={(p) => { update({ persona: p }); setStep('broker'); }}
        onSkip={() => setStep('broker')}
      />;
      break;
    case 'broker':
      body = <BrokerScreen
        onNext={(b) => { update({ broker: b }); setStep('targets'); }}
        onSkip={() => setStep('targets')}
      />;
      break;
    case 'targets':
      body = <TargetsScreen persona={data.persona}
        onFinish={(w) => { update({ targets: w }); setStep('done'); }} />;
      break;
    case 'done':
      body = <DoneScreen data={data} onRestart={() => setStep('nickname')} />;
      break;
    default:
      body = <NicknameScreen onNext={() => setStep('persona')} />;
  }

  return (
    <div className="golgo"
      data-theme={t.theme}
      data-dark={t.dark ? '1' : '0'}
      data-profit={t.profit}
      style={{ '--accent-mono': t.accent }}>

      <div className="stage">
        <IOSDevice width={390} height={844} dark={!!t.dark}>
          <AppShell>
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              {body}
            </div>
          </AppShell>
        </IOSDevice>

        <PrototypeRail current={step} onJump={setStep} data={data} />
      </div>

      <TweaksPanel title="Onboarding Tweaks">
        <TweakSection label="시각 방향성">
          <TweakRadio label="테마 톤" value={t.theme}
            options={[
              { value: 'toss', label: '토스' },
              { value: 'robinhood', label: 'Robin' },
              { value: 'analyst', label: '분석가' },
            ]}
            onChange={(v) => {
              const acc = v === 'robinhood' ? '#C8FF3D' : v === 'analyst' ? '#D4A574' : '#191F28';
              setTweak({ theme: v, accent: acc });
            }} />
          <TweakToggle label="다크 모드" value={!!t.dark}
            onChange={(v) => setTweak('dark', v)} />
        </TweakSection>

        <TweakSection label="컬러">
          <TweakColor label="액센트" value={t.accent}
            options={t.theme === 'robinhood'
              ? ['#C8FF3D', '#00FFA3', '#3182F6', '#FF6A3D']
              : ACCENT_OPTIONS}
            onChange={(v) => setTweak('accent', v)} />
        </TweakSection>

        <TweakSection label="단계 점프">
          <TweakSelect label="단계" value={step}
            options={[
              { value: 'nickname', label: '1 · 닉네임' },
              { value: 'persona',  label: '2 · 투자 성향' },
              { value: 'broker',   label: '3 · 증권사 연결' },
              { value: 'targets',  label: '4 · 목표 비중' },
              { value: 'done',     label: '✓ 완료' },
            ]}
            onChange={(v) => setStep(v)} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

// ─── Completion screen ──────────────────────────────────────
function DoneScreen({ data, onRestart }) {
  const D = window.GOLGO_DATA;
  // Build a list of holdings for the user's targets
  const list = data.targets
    ? Object.entries(data.targets).map(([ticker, target]) => ({
        ...D.holdings.find(h => h.ticker === ticker),
        target,
      }))
    : [];

  return (
    <AppShell>
      <div style={{ paddingTop: 56, padding: '56px 24px 24px', display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center', textAlign: 'center' }}>
        {/* Celebration mark */}
        <div style={{ marginTop: 24, marginBottom: 28, position: 'relative' }}>
          <div style={{
            width: 88, height: 88, borderRadius: 28,
            background: 'var(--bg-inverse)', color: 'var(--text-on-accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-lg)',
            transform: 'rotate(-4deg)',
          }}>
            <Ic.check width="44" height="44" />
          </div>
          {/* confetti dots */}
          <span style={confetti(-20, -18, 'var(--up-strong)')} />
          <span style={confetti(94, -8, 'var(--warn)')} />
          <span style={confetti(-30, 64, 'var(--info)')} />
          <span style={confetti(98, 80, 'var(--accent)')} />
        </div>

        <h1 style={{
          font: 'var(--type-display)', color: 'var(--text)', letterSpacing: '-0.02em',
          lineHeight: 1.2, marginBottom: 10, fontSize: 26,
        }}>
          준비 완료!<br/>
          이제 고르고가<br/>
          비중을 맞춰드릴게요
        </h1>
        <p style={{ font: 'var(--type-body)', color: 'var(--text-2)', marginBottom: 26 }}>
          {data.nickname || '회원'}님의 목표 포트폴리오
        </p>

        {/* Summary card */}
        <div className="card" style={{ width: '100%', textAlign: 'left', marginBottom: 16 }}>
          <SummaryRow label="투자 성향" value={personaLabel(data.persona)} />
          <div className="divider" style={{ margin: '12px 0' }} />
          <SummaryRow label="연결 증권사" value={brokerLabel(data.broker)} />
          <div className="divider" style={{ margin: '12px 0' }} />
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          }}>
            <span style={{ font: 'var(--type-caption)', color: 'var(--text-3)', marginTop: 2 }}>
              목표 비중
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
              {list.map(h => (
                <div key={h.ticker} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: 2,
                    background: `var(${h.colorVar})`,
                  }} />
                  <span style={{ font: 'var(--type-caption)', color: 'var(--text)' }}>
                    {h.ticker}
                  </span>
                  <span className="num" style={{
                    font: '600 13px/1 var(--font-num)', color: 'var(--text)', minWidth: 32, textAlign: 'right',
                  }}>
                    {h.target}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <button className="btn btn-accent" style={{ width: '100%' }}
          onClick={() => window.location.href = 'Golgo.html'}>
          대시보드 보러가기
          <Ic.chev width="16" height="16" />
        </button>
        <button onClick={onRestart} style={{
          height: 44, background: 'none', border: 0, cursor: 'pointer',
          color: 'var(--text-3)', font: 'var(--type-callout)', marginTop: 4,
        }}>
          처음부터 다시
        </button>
      </div>
    </AppShell>
  );
}

const confetti = (top, left, color) => ({
  position: 'absolute', top, left, width: 8, height: 8,
  borderRadius: 2, background: color, transform: 'rotate(30deg)',
});

function SummaryRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
      <span style={{ font: 'var(--type-caption)', color: 'var(--text-3)', whiteSpace: 'nowrap' }}>{label}</span>
      <span style={{ font: 'var(--type-callout)', color: 'var(--text)', textAlign: 'right' }}>{value}</span>
    </div>
  );
}
function personaLabel(p) {
  return { conservative: '안정형', balanced: '안정 성장형', growth: '성장형', custom: '직접 설정' }[p] || p;
}
function brokerLabel(b) {
  return { kis: '한국투자증권', mirae: '미래에셋증권', other: '기타 증권사' }[b] || b;
}

// ─── Floating step rail ─────────────────────────────────────
function PrototypeRail({ current, onJump, data }) {
  const steps = [
    { id: 'nickname', label: '닉네임' },
    { id: 'persona',  label: '투자 성향' },
    { id: 'broker',   label: '증권사' },
    { id: 'targets',  label: '목표 비중' },
    { id: 'done',     label: '완료' },
  ];
  return (
    <div style={{
      position: 'fixed', top: '50%', left: 24, transform: 'translateY(-50%)',
      display: 'flex', flexDirection: 'column', gap: 4, zIndex: 100,
      fontFamily: 'var(--font-sans)',
    }}>
      <div style={{
        font: '600 10px/1 var(--font-sans)', color: 'rgba(255,255,255,.4)',
        letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8,
        paddingLeft: 12,
      }}>
        Onboarding
      </div>
      {steps.map((s, i) => (
        <button key={s.id} onClick={() => onJump(s.id)} style={{
          padding: '7px 12px', borderRadius: 8, border: 0, cursor: 'pointer',
          background: current === s.id ? 'rgba(255,255,255,.12)' : 'transparent',
          color: current === s.id ? '#fff' : 'rgba(255,255,255,.55)',
          font: '500 12px/1 var(--font-sans)', textAlign: 'left',
          display: 'flex', gap: 8, alignItems: 'center',
          transition: 'background .15s, color .15s',
        }}>
          <span className="num" style={{
            font: '600 10px/1 var(--font-num)',
            color: current === s.id ? '#fff' : 'rgba(255,255,255,.35)',
            width: 12, textAlign: 'right',
          }}>{i === 4 ? '✓' : i + 1}</span>
          <span>{s.label}</span>
        </button>
      ))}
      <div style={{ height: 1, background: 'rgba(255,255,255,.1)', margin: '10px 12px' }} />
      <a href="Golgo.html" style={{
        padding: '7px 12px', borderRadius: 8,
        color: 'rgba(255,255,255,.45)', textDecoration: 'none',
        font: '500 11px/1.4 var(--font-sans)',
        display: 'flex', gap: 6, alignItems: 'center',
      }}>
        ← 메인 앱으로
      </a>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(<OnboardingApp />);
