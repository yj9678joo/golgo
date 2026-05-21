// Onboarding Step 1 — Nickname
function NicknameScreen({ onNext }) {
  const [name, setName] = React.useState('');
  const inputRef = React.useRef(null);
  React.useEffect(() => { inputRef.current?.focus(); }, []);

  const valid = name.trim().length >= 2 && name.trim().length <= 10;
  const suggestions = ['투자초보', '오늘도매수', '복리의힘'];

  return (
    <AppShell>
      <div style={{ paddingTop: 56, padding: '56px 24px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {[true, false, false, false].map((on, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2,
              background: on ? 'var(--text)' : 'var(--border)' }} />
          ))}
        </div>
        <div style={{ font: 'var(--type-micro)', color: 'var(--text-3)', marginBottom: 8 }}>
          1 / 4 단계
        </div>
        <h1 style={{
          font: 'var(--type-display)', color: 'var(--text)', letterSpacing: '-0.02em',
          lineHeight: 1.25, marginBottom: 8, fontSize: 26,
        }}>
          어떻게<br/>불러드릴까요?
        </h1>
        <p style={{ font: 'var(--type-body)', color: 'var(--text-2)', marginBottom: 28 }}>
          포트폴리오에 표시되는 이름이에요
        </p>

        {/* Nickname input */}
        <div style={{ position: 'relative', marginBottom: 14 }}>
          <input
            ref={inputRef}
            type="text"
            value={name}
            maxLength={10}
            onChange={(e) => setName(e.target.value)}
            placeholder="닉네임 입력"
            style={{
              width: '100%', height: 56, padding: '0 56px 0 16px',
              border: '1.5px solid ' + (name ? 'var(--text)' : 'var(--border-2)'),
              borderRadius: 'var(--radius)',
              background: 'var(--bg-card)',
              font: 'var(--type-title)',
              color: 'var(--text)', outline: 'none',
              transition: 'border-color .15s',
              fontFamily: 'var(--font-sans)',
            }}
          />
          <span className="num" style={{
            position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
            font: 'var(--type-caption)', color: 'var(--text-3)',
          }}>
            {name.length}/10
          </span>
        </div>
        <div style={{
          font: 'var(--type-caption)',
          color: name && !valid ? 'var(--down-strong)' : 'var(--text-3)',
          marginBottom: 20, paddingLeft: 4,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          {name && !valid && <Ic.warn width="12" height="12" />}
          한글·영문 2~10자로 입력해 주세요
        </div>

        {/* Suggestions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          <div style={{ font: 'var(--type-micro)', color: 'var(--text-3)',
            letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            추천 닉네임
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {suggestions.map(s => (
              <button key={s} onClick={() => setName(s)} style={{
                height: 34, padding: '0 14px', borderRadius: 999,
                border: '1px solid var(--border-2)', background: 'var(--bg-card)',
                color: 'var(--text-2)', font: 'var(--type-callout)', cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <button className="btn btn-accent" disabled={!valid}
          onClick={() => valid && onNext(name.trim())}
          style={{
            width: '100%',
            opacity: valid ? 1 : 0.35,
            cursor: valid ? 'pointer' : 'not-allowed',
          }}>
          다음
        </button>
      </div>
    </AppShell>
  );
}
window.NicknameScreen = NicknameScreen;
