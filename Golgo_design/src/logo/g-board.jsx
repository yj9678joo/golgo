// ㄱ Monogram refinement board
//
// IMPORTANT: DCSection filters children by `c.type === DCArtboard` (strict
// identity check). Wrapping DCArtboard in a helper component breaks the
// filter — every artboard must appear as a literal <DCArtboard> child.
// Use the makeCard fn below to expand inline rather than abstracting it.

function VariationCard({ id, label, desc, mark, appBg = '#F4F1EA' }) {
  // Returned content of a DCArtboard — NOT wrapping DCArtboard itself
  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',background:'#FFFFFF',fontFamily:'Spoqa Han Sans Neo'}}>
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',background:appBg}}>
        {mark}
      </div>
      <div style={{padding:'14px 18px 16px',borderTop:'.5px solid rgba(0,0,0,.08)',background:'#FBFAF7'}}>
        <div style={{font:'500 12px/1.5 Spoqa Han Sans Neo',color:'#5F5E5A'}}>{desc}</div>
      </div>
    </div>
  );
}

function GBoard() {
  return (
    <DesignCanvas title="고르고 · ㄱ 모노그램 정제">
      <DCSection id="variations" title="베리에이션 8종">
        <DCArtboard id="va" label="A · 기본형 (현재 시안)" width={340} height={420}>
          <VariationCard desc="현재 4번 시안. 정확하고 산세리프적" mark={<MarkA size={120}/>} />
        </DCArtboard>
        <DCArtboard id="vb" label="B · 둥근 끝" width={340} height={420}>
          <VariationCard desc="더 친근하고 부드러운 톤" mark={<MarkB size={120}/>} />
        </DCArtboard>
        <DCArtboard id="vc" label="C · 상승 점" width={340} height={420}>
          <VariationCard desc="우상향 점 — 리밸런싱 결과 강조" mark={<MarkC size={120}/>} />
        </DCArtboard>
        <DCArtboard id="vd" label="D · 원 컨테이너" width={340} height={420}>
          <VariationCard desc="친밀한 SNS 톤" mark={<MarkD size={120}/>} />
        </DCArtboard>
        <DCArtboard id="ve" label="E · ㄱ + 차트" width={340} height={420}>
          <VariationCard desc="가로획이 주가 차트" mark={<MarkE size={120}/>} />
        </DCArtboard>
        <DCArtboard id="vf" label="F · 라이트 모드" width={340} height={420}>
          <VariationCard desc="얇은 선 · 분석가 톤" mark={<MarkF size={120}/>} />
        </DCArtboard>
        <DCArtboard id="vg" label="G · 투톤" width={340} height={420}>
          <VariationCard desc="현재/목표 비중 메타포" mark={<MarkG size={120}/>} />
        </DCArtboard>
        <DCArtboard id="vh" label="H · 헤비" width={340} height={420}>
          <VariationCard desc="작은 사이즈에서도 명확" mark={<MarkH size={120}/>} />
        </DCArtboard>
      </DCSection>

      <DCSection id="contexts" title="실제 적용 컨텍스트">
        <DCArtboard id="ctx-home" label="홈 화면 (iOS)" width={360} height={500}>
          <HomeIconCtx />
        </DCArtboard>
        <DCArtboard id="ctx-app-header" label="앱 헤더" width={360} height={200}>
          <AppHeaderCtx />
        </DCArtboard>
        <DCArtboard id="ctx-loading" label="스플래시 / 로딩" width={360} height={500}>
          <SplashCtx />
        </DCArtboard>
        <DCArtboard id="ctx-business" label="명함 톤" width={400} height={240}>
          <BizCardCtx />
        </DCArtboard>
      </DCSection>

      <DCSection id="sizes" title="축소 테스트 (작은 사이즈 가독성)">
        <DCArtboard id="sz-a" label="A · 기본형" width={520} height={180}>
          <SizeRowContent Mark={MarkA} />
        </DCArtboard>
        <DCArtboard id="sz-b" label="B · 둥근 끝" width={520} height={180}>
          <SizeRowContent Mark={MarkB} />
        </DCArtboard>
        <DCArtboard id="sz-h" label="H · 헤비" width={520} height={180}>
          <SizeRowContent Mark={MarkH} />
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

function HomeIconCtx() {
  const apps = [
    { name: '고르고', mark: <MarkB size={56} radius={14}/> },
    { name: '카카오톡', bg: '#FEE500', label: 'K', color: '#191600' },
    { name: '토스', bg: '#0064FF', label: 'toss', fs: 11 },
    { name: '카메라', bg: '#1C1C1E', label: '📷' },
    { name: '메시지', bg: '#34C759', label: '💬' },
    { name: '갤러리', bg: '#5856D6', label: '🖼' },
    { name: '시계', bg: '#000', label: '⏰' },
    { name: '설정', bg: '#8E8E93', label: '⚙' },
  ];
  return (
    <div style={{height:'100%',background:'linear-gradient(180deg,#A0BACE 0%,#7593B0 100%)',padding:24,fontFamily:'Spoqa Han Sans Neo'}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:20}}>
        {apps.map((a,i)=>(
          <div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
            {a.mark || (
              <div style={{width:56,height:56,borderRadius:14,background:a.bg,display:'flex',alignItems:'center',justifyContent:'center',color:a.color||'#fff',font:`700 ${a.fs||16}px/1 system-ui`}}>
                {a.label}
              </div>
            )}
            <div style={{font:'500 10px/1 Spoqa Han Sans Neo',color:'#fff',textShadow:'0 1px 2px rgba(0,0,0,.3)'}}>{a.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AppHeaderCtx() {
  return (
    <div style={{height:'100%',background:'#FFFFFF',display:'flex',alignItems:'center',padding:'0 24px',gap:14,fontFamily:'Spoqa Han Sans Neo'}}>
      <MarkB size={36} radius={9}/>
      <span style={{font:'700 22px/1 Spoqa Han Sans Neo',color:'#191F28',letterSpacing:'-0.03em'}}>고르고</span>
      <div style={{flex:1}}/>
      <div style={{width:36,height:36,borderRadius:18,background:'#F2F4F6'}}/>
      <div style={{width:36,height:36,borderRadius:18,background:'#F2F4F6'}}/>
    </div>
  );
}

function SplashCtx() {
  return (
    <div style={{height:'100%',background:'#0E1014',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:18,fontFamily:'Spoqa Han Sans Neo'}}>
      <MarkB size={96} radius={22}/>
      <div style={{font:'700 32px/1 Spoqa Han Sans Neo',color:'#FAFBFC',letterSpacing:'-0.04em'}}>고르고</div>
      <div style={{font:'400 13px/1 Spoqa Han Sans Neo',color:'rgba(255,255,255,.45)'}}>AI 리밸런싱 어드바이저</div>
    </div>
  );
}

function BizCardCtx() {
  return (
    <div style={{height:'100%',background:'#FBFAF7',padding:28,display:'flex',flexDirection:'column',justifyContent:'space-between',fontFamily:'Spoqa Han Sans Neo'}}>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <MarkB size={40} radius={10}/>
        <div>
          <div style={{font:'700 18px/1 Spoqa Han Sans Neo',color:'#191F28',letterSpacing:'-0.03em'}}>고르고</div>
          <div style={{font:'400 10px/1.4 Spoqa Han Sans Neo',color:'#8B8A85',marginTop:4}}>AI Rebalancing Advisor</div>
        </div>
      </div>
      <div>
        <div style={{font:'500 11px/1.5 Spoqa Han Sans Neo',color:'#191F28'}}>김준호 · Product Lead</div>
        <div style={{font:'400 10px/1.5 Spoqa Han Sans Neo',color:'#5F5E5A'}}>junho@golgo.kr · 02-0000-0000</div>
      </div>
    </div>
  );
}

function SizeRowContent({ Mark }) {
  const sizes = [96, 64, 48, 32, 24, 16];
  return (
    <div style={{height:'100%',background:'#FBFAF7',display:'flex',alignItems:'center',justifyContent:'space-around',padding:'0 20px',fontFamily:'Spoqa Han Sans Neo'}}>
      {sizes.map(s=>(
        <div key={s} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
          <Mark size={s} radius={s*0.22}/>
          <div style={{font:'500 9px/1 Spoqa Han Sans Neo',color:'#8B8A85'}}>{s}px</div>
        </div>
      ))}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(<GBoard/>);
