// Onboarding Step 3 — Connect broker
function BrokerScreen({ onNext, onSkip }) {
  const [selected, setSelected] = React.useState('kis');
  const [otherBroker, setOtherBroker] = React.useState('');
  const brokers = [
    {
      id: 'kis', name: '한국투자증권', brand: '#0F2D6B', wordmark: 'KIS',
      methods: ['App Key', 'MTS 캡처'],
    },
    {
      id: 'other', name: '기타 증권사', brand: '#94A3B8', wordmark: '+',
      methods: ['MTS 캡처'],
    },
  ];

  const otherOptions = [
    '미래에셋증권', 'NH투자증권', '삼성증권', '키움증권',
    'KB증권', '신한투자증권', '메리츠증권', '토스증권',
  ];

  const canProceed = selected === 'kis' || (selected === 'other' && otherBroker);

  return (
    <AppShell>
      <div style={{ paddingTop: 56, padding: '56px 24px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {[true, true, true, false].map((on, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2,
              background: on ? 'var(--text)' : 'var(--border)' }} />
          ))}
        </div>
        <div style={{ font: 'var(--type-micro)', color: 'var(--text-3)', marginBottom: 8 }}>
          3 / 4 단계
        </div>
        <h1 style={{
          font: 'var(--type-display)', color: 'var(--text)', letterSpacing: '-0.02em',
          lineHeight: 1.25, marginBottom: 8, fontSize: 26,
        }}>
          증권사 계좌를<br/>연결해주세요
        </h1>
        <p style={{ font: 'var(--type-body)', color: 'var(--text-2)', marginBottom: 24 }}>
          보유 종목을 자동으로 불러와요
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
          {brokers.map(b => (
            <React.Fragment key={b.id}>
              <BrokerCard broker={b}
                selected={selected === b.id}
                onClick={() => setSelected(b.id)} />
              {b.id === 'other' && selected === 'other' && (
                <div style={{
                  marginTop: -4, marginLeft: 8, marginRight: 8,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '12px 14px',
                }}>
                  <div style={{ font: 'var(--type-caption)', color: 'var(--text-3)', marginBottom: 6 }}>
                    증권사를 선택해 주세요
                  </div>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={otherBroker}
                      onChange={(e) => setOtherBroker(e.target.value)}
                      style={{
                        width: '100%', height: 44, padding: '0 36px 0 12px',
                        border: '1px solid var(--border-2)',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-card)',
                        font: 'var(--type-callout)',
                        color: otherBroker ? 'var(--text)' : 'var(--text-3)',
                        appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer',
                        fontFamily: 'var(--font-sans)',
                      }}>
                      <option value="">증권사 선택</option>
                      {otherOptions.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <Ic.chev width="14" height="14" style={{
                      position: 'absolute', right: 12, top: '50%',
                      transform: 'translateY(-50%) rotate(90deg)',
                      color: 'var(--text-3)', pointerEvents: 'none',
                    }} />
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Security note */}
        <div style={{
          background: 'var(--bg-soft)', borderRadius: 'var(--radius)',
          padding: '12px 14px', display: 'flex', gap: 10, marginTop: 16, marginBottom: 12,
        }}>
          <Ic.shield width="16" height="16" style={{ color: 'var(--text-3)', flexShrink: 0, marginTop: 1 }} />
          <div style={{ font: 'var(--type-caption)', color: 'var(--text-2)', lineHeight: 1.55 }}>
            API Key는 AES-256으로 암호화되어 저장되며, 조회 용도로만 사용됩니다.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button className="btn btn-accent"
            disabled={!canProceed}
            onClick={() => canProceed && onNext(selected === 'other' ? otherBroker : selected)}
            style={{
              width: '100%',
              opacity: canProceed ? 1 : 0.35,
              cursor: canProceed ? 'pointer' : 'not-allowed',
            }}>
            다음
          </button>
          <button onClick={onSkip} style={{
            height: 44, background: 'none', border: 0, cursor: 'pointer',
            color: 'var(--text-3)', font: 'var(--type-callout)',
          }}>
            나중에 연결할게요
          </button>
        </div>
      </div>
    </AppShell>
  );
}

function BrokerCard({ broker, selected, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', textAlign: 'left', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 14,
      padding: 14,
      background: 'var(--bg-card)',
      border: selected ? '1.5px solid var(--text)' : '1.5px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: selected ? 'var(--shadow)' : 'none',
      transition: 'all .15s',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: broker.brand, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        font: '700 14px/1 var(--font-sans)', letterSpacing: '-0.02em',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,.18)',
      }}>
        {broker.wordmark}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: 'var(--type-headline)', color: 'var(--text)', marginBottom: 4 }}>
          {broker.name}
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {broker.methods.map(m => (
            <span key={m} className="pill pill-neutral" style={{ font: 'var(--type-micro)' }}>
              {m}
            </span>
          ))}
        </div>
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

window.BrokerScreen = BrokerScreen;
