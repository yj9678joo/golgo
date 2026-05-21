// Screen 1 — Social Login
function LoginScreen({ onSignIn }) {
  return (
    <AppShell>
      <div style={{ paddingTop: 60, flex: 1, display: 'flex', flexDirection: 'column', padding: '60px 28px 32px' }}>
        {/* Logo + tagline */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 24, paddingBottom: 60 }}>
          <GolgoMark size={68} variant="C" />
          <div>
            <h1 style={{
              font: 'var(--type-display)', color: 'var(--text)', letterSpacing: '-0.02em',
              fontSize: 34, lineHeight: 1.2, marginBottom: 12,
            }}>
              자산을 <span style={{ color: 'var(--accent)' }}>고르게</span>,<br/>
              종목을 <span style={{ color: 'var(--accent)' }}>고르게</span>.
            </h1>
            <p style={{ font: 'var(--type-body)', color: 'var(--text-2)' }}>
              AI 기반 리밸런싱 어드바이저
            </p>
          </div>
        </div>

        {/* Social buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <SocialButton kind="kakao" onClick={() => onSignIn('kakao')} />
          <SocialButton kind="naver" onClick={() => onSignIn('naver')} />
          <SocialButton kind="google" onClick={() => onSignIn('google')} />

          <p style={{
            font: 'var(--type-caption)', color: 'var(--text-3)',
            textAlign: 'center', marginTop: 14, lineHeight: 1.55,
          }}>
            가입 시 <u style={{ color: 'var(--text-2)' }}>서비스 이용약관</u>과<br/>
            <u style={{ color: 'var(--text-2)' }}>개인정보 처리방침</u>에 동의하게 됩니다.
          </p>
        </div>
      </div>
    </AppShell>
  );
}

function Logomark() { return <GolgoMark size={56} variant="C" />; }

function SocialButton({ kind, onClick }) {
  const config = {
    kakao:  { bg: '#FEE500', color: '#191600', label: '카카오로 시작하기', icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M12 3C6.5 3 2 6.5 2 10.8c0 2.8 1.9 5.2 4.7 6.6L5.5 21.2c-.1.3.2.5.5.4l4.7-3.1c.4.1.9.1 1.3.1 5.5 0 10-3.5 10-7.8S17.5 3 12 3z"/>
      </svg>
    )},
    naver:  { bg: '#03C75A', color: '#fff', label: '네이버로 시작하기', icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M14.3 4v8.4L9.6 4H4v16h5.7v-8.4L14.4 20H20V4h-5.7z"/>
      </svg>
    )},
    google: { bg: '#FFFFFF', color: '#1F1F1F', label: 'Google로 시작하기', border: true, icon: (
      <svg viewBox="0 0 24 24" width="20" height="20">
        <path fill="#4285F4" d="M22 12.2c0-.8-.1-1.4-.2-2.1H12v4h5.7c-.2 1.3-1 2.4-2.1 3.1v2.6h3.4c2-1.9 3-4.6 3-7.6z"/>
        <path fill="#34A853" d="M12 22c2.8 0 5.2-.9 6.9-2.5l-3.4-2.6c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.7v2.7C4.4 19.6 7.9 22 12 22z"/>
        <path fill="#FBBC05" d="M6.2 13.6c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V6.9H2.7C2 8.4 1.5 10.1 1.5 12s.5 3.6 1.2 5.1l3.5-2.7-1-.8z"/>
        <path fill="#EA4335" d="M12 5.4c1.5 0 2.9.5 4 1.5l3-3C17.1 2.3 14.7 1.4 12 1.4 7.9 1.4 4.4 3.7 2.7 6.9l3.5 2.7C7 7.2 9.3 5.4 12 5.4z"/>
      </svg>
    )},
  }[kind];
  return (
    <button onClick={onClick} style={{
      height: 54, borderRadius: 14, border: config.border ? '1px solid var(--border-2)' : 'none',
      background: config.bg, color: config.color,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      font: 'var(--type-headline)', cursor: 'pointer',
      transition: 'transform .1s', boxShadow: 'var(--shadow-sm)',
    }}
    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
    onMouseUp={(e) => e.currentTarget.style.transform = ''}
    onMouseLeave={(e) => e.currentTarget.style.transform = ''}>
      {config.icon}
      <span>{config.label}</span>
    </button>
  );
}

window.LoginScreen = LoginScreen;
