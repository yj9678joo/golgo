// Golgo — main app shell (navigation + theme + tweaks)
//
// Inline-edit & host-persist defaults — wrapped in EDITMODE markers so the
// Tweaks panel can rewrite them on disk.
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "toss",
  "dark": false,
  "accent": "#191F28",
  "profit": "global",
  "startScreen": "home"
}/*EDITMODE-END*/;

const ACCENT_OPTIONS = [
  '#191F28',  // mono (toss default)
  '#3182F6',  // toss blue
  '#00C896',  // mint
  '#D4A574',  // copper (analyst tone)
];

function GolgoApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [screen, setScreen] = React.useState(t.startScreen || 'login');

  // navigation
  const go = React.useCallback((s) => setScreen(s), []);

  // on theme change, swap robinhood accent automatically
  React.useEffect(() => {
    if (t.theme === 'robinhood' && !['#C8FF3D', ...ACCENT_OPTIONS].includes(t.accent)) {
      // keep as-is; robinhood theme uses its own default
    }
  }, [t.theme]);

  // build screen
  let body;
  switch (screen) {
    case 'login':       body = <LoginScreen onSignIn={() => go('onboarding')} />; break;
    case 'onboarding':  body = <OnboardingScreen onNext={() => go('home')} onSkip={() => go('home')} />; break;
    case 'home':        body = <DashboardScreen onNav={go} onOpenRebalance={() => go('rebalance')} onOpenHolding={() => go('report')} />; break;
    case 'portfolio':   body = <PortfolioScreen onNav={go} onOpenHolding={() => go('report')} />; break;
    case 'report':      body = <ReportScreen onBack={() => go('home')} onOpenRebalance={() => go('rebalance')} />; break;
    case 'rebalance':   body = <RebalanceScreen onBack={() => go('home')} onExternalApp={() => alert('증권사 앱으로 이동')} />; break;
    default:            body = <DashboardScreen onNav={go} onOpenRebalance={() => go('rebalance')} onOpenHolding={() => go('report')} />;
  }

  const showBottomNav = ['home', 'portfolio', 'report', 'rebalance'].includes(screen);

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
            {showBottomNav && (
              <BottomNav current={screenToTab(screen)} onChange={(id) => go(tabToScreen(id))} />
            )}
          </AppShell>
        </IOSDevice>

        {/* Floating prototype nav (visible at all times for demo) */}
        <PrototypeNav current={screen} onJump={go} />
      </div>

      <TweaksPanel title="Golgo Tweaks">
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
          <TweakColor label="액센트"
            value={t.accent}
            options={t.theme === 'robinhood'
              ? ['#C8FF3D', '#00FFA3', '#3182F6', '#FF6A3D']
              : ACCENT_OPTIONS}
            onChange={(v) => setTweak('accent', v)} />
          <TweakRadio label="수익 색상" value={t.profit}
            options={[
              { value: 'global', label: '글로벌 (초록↑)' },
              { value: 'kr',     label: '한국 (빨강↑)' },
            ]}
            onChange={(v) => setTweak('profit', v)} />
        </TweakSection>

        <TweakSection label="화면 점프">
          <TweakSelect label="화면" value={screen}
            options={[
              { value: 'login',      label: '1 · 로그인' },
              { value: 'onboarding', label: '2 · 온보딩' },
              { value: 'home',       label: '3 · 대시보드' },
              { value: 'portfolio',  label: '4 · 포트폴리오' },
              { value: 'report',     label: '5 · AI 리포트' },
              { value: 'rebalance',  label: '6 · 리밸런싱' },
            ]}
            onChange={(v) => go(v)} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

function screenToTab(s) {
  if (s === 'home') return 'home';
  if (s === 'portfolio') return 'portfolio';
  if (s === 'report') return 'report';
  if (s === 'rebalance') return 'rebalance';
  return 'home';
}
function tabToScreen(id) { return id; }

// ── Floating prototype nav strip (visible outside the device) ──────────────
function PrototypeNav({ current, onJump }) {
  const screens = [
    { id: 'login',      label: '로그인' },
    { id: 'onboarding', label: '온보딩' },
    { id: 'home',       label: '대시보드' },
    { id: 'portfolio',  label: '포트폴리오' },
    { id: 'report',     label: 'AI 리포트' },
    { id: 'rebalance',  label: '리밸런싱' },
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
        Screens
      </div>
      {screens.map((s, i) => (
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
          }}>{i + 1}</span>
          <span>{s.label}</span>
        </button>
      ))}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(<GolgoApp />);
