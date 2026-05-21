// Logo board - design canvas orchestrator
function LogoBoard() {
  return (
    <DesignCanvas title="Golgo · 로고 시안">
      <DCSection id="logos" title="로고 / 워드마크">
        <DCArtboard id="logo1" label="01 · 균형 저울" width={520} height={360}>
          <LogoArtboard bg="paper" minH={260}><Logo1 /></LogoArtboard>
          <LogoMeta concept="저울추가 평형을 찾아가는 모양 — 리밸런싱 그 자체" usage="신뢰감·직관적·금융 도메인 표준" />
        </DCArtboard>

        <DCArtboard id="logo2" label="02 · 정렬된 막대" width={520} height={360}>
          <LogoArtboard bg="paper" minH={260}><Logo2 /></LogoArtboard>
          <LogoMeta concept="작은→큰 순으로 정렬된 막대 + 골라낸 점" usage="투자·분석·데이터 시각화 톤" />
        </DCArtboard>

        <DCArtboard id="logo3" label="03 · 골라낸 파이" width={520} height={360}>
          <LogoArtboard bg="paper" minH={260}><Logo3 /></LogoArtboard>
          <LogoMeta concept="비중 파이에서 한 조각을 골라낸 모양" usage="포트폴리오·비중 강조에 직관적" />
        </DCArtboard>

        <DCArtboard id="logo4" label="04 · ㄱ 모노그램" width={520} height={360}>
          <LogoArtboard bg="paper" minH={260}><Logo4 /></LogoArtboard>
          <LogoMeta concept="'고르고' 첫 자음 ㄱ을 살린 모노그램" usage="브랜드 인식 강함 · 앱 아이콘 친화적" />
        </DCArtboard>

        <DCArtboard id="logo5" label="05 · 고르게 맞춰가는" width={520} height={360}>
          <LogoArtboard bg="paper" minH={260}><Logo5 /></LogoArtboard>
          <LogoMeta concept="짧은 막대 → 긴 막대로 '고르게 맞춰가는' 모션" usage="동적·진행감 · 리밸런싱 액션 톤" />
        </DCArtboard>

        <DCArtboard id="logo6" label="06 · 워드마크 only" width={520} height={360}>
          <LogoArtboard bg="paper" minH={260}><Logo6 /></LogoArtboard>
          <LogoMeta concept="한글 타입 자체가 마크. '고'와 '고'를 강조한 리듬" usage="텍스트만으로 강한 임팩트 · 미니멀" />
        </DCArtboard>
      </DCSection>

      <DCSection id="appicons" title="앱 아이콘 적용">
        <DCArtboard id="ai1" label="저울" width={260} height={300}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',background:'#F4F1EA'}}>
            <AppIcon bg="#1A1A18"><Logo1Mark size={88} color="#FAFBFC"/></AppIcon>
          </div>
        </DCArtboard>
        <DCArtboard id="ai2" label="정렬" width={260} height={300}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',background:'#F4F1EA'}}>
            <AppIcon bg="#FAFBFC"><Logo2Mark size={88} color="#1A1A18" accent="#3182F6"/></AppIcon>
          </div>
        </DCArtboard>
        <DCArtboard id="ai3" label="파이" width={260} height={300}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',background:'#F4F1EA'}}>
            <AppIcon bg="#0E1014"><Logo3Mark size={88} color="#FAFBFC" accent="#1F8A5B"/></AppIcon>
          </div>
        </DCArtboard>
        <DCArtboard id="ai4" label="ㄱ 모노그램" width={260} height={300}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',background:'#F4F1EA'}}>
            <Logo4Mark size={144} color="#FAFBFC" bg="#1A1A18"/>
          </div>
        </DCArtboard>
        <DCArtboard id="ai5" label="맞춰가는" width={260} height={300}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',background:'#F4F1EA'}}>
            <AppIcon bg="#FBF8F2"><Logo5Mark size={88} color="#1A2237" accent="#D4A574"/></AppIcon>
          </div>
        </DCArtboard>
      </DCSection>

      <DCSection id="dark" title="다크 배경">
        <DCArtboard id="d1" label="저울 · 다크" width={520} height={300}>
          <LogoArtboard bg="dark"><Logo1 darkBg/></LogoArtboard>
        </DCArtboard>
        <DCArtboard id="d2" label="정렬 · 다크" width={520} height={300}>
          <LogoArtboard bg="dark"><Logo2 darkBg/></LogoArtboard>
        </DCArtboard>
        <DCArtboard id="d3" label="파이 · 다크" width={520} height={300}>
          <LogoArtboard bg="dark"><Logo3 darkBg/></LogoArtboard>
        </DCArtboard>
        <DCArtboard id="d4" label="워드마크 · 다크" width={520} height={300}>
          <LogoArtboard bg="dark"><Logo6 darkBg/></LogoArtboard>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(<LogoBoard/>);
