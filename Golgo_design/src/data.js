// Golgo — sample portfolio data (지수 ETF 중심)
// 5 holdings · KR + US blend · realistic numbers in KRW
window.GOLGO_DATA = {
  user: { nickname: '준호', age: 32, persona: '안정 성장형' },
  totals: {
    asset: 28_420_000,      // 총평가금액
    principal: 24_500_000,  // 투자 원금
    profit: 3_920_000,
    profitPct: 16.0,
    dayChange: 142_300,
    dayChangePct: 0.5,
    cash: 1_180_000,
  },
  holdings: [
    {
      ticker: 'KODEX200',
      code: '069500',
      name: 'KODEX 200',
      exchange: 'KRX',
      sector: '국내 지수',
      currency: 'KRW',
      colorVar: '--t-kodex',
      qty: 120,
      avgPrice: 35_400,
      price: 38_120,
      value: 4_574_400,
      profit: 326_400,
      profitPct: 7.7,
      current: 16.1,      // 현재 비중 (%)
      target: 20.0,       // 목표 비중 (%)
      lastAnalyzedDays: 3,
    },
    {
      ticker: 'TIGER',
      code: '360750',
      name: 'TIGER 미국S&P500',
      exchange: 'KRX',
      sector: '해외 지수 (KRX)',
      currency: 'KRW',
      colorVar: '--t-tiger',
      qty: 320,
      avgPrice: 16_800,
      price: 19_950,
      value: 6_384_000,
      profit: 1_008_000,
      profitPct: 18.8,
      current: 22.5,
      target: 25.0,
      lastAnalyzedDays: 1,
    },
    {
      ticker: 'QQQ',
      code: 'QQQ',
      name: 'Invesco QQQ',
      exchange: 'NASDAQ',
      sector: '해외 지수 · 나스닥100',
      currency: 'USD',
      colorVar: '--t-qqq',
      qty: 18,
      avgPrice: 485,
      price: 542,
      value: 13_550_000,  // 환산 KRW
      profit: 1_910_000,
      profitPct: 16.4,
      current: 47.7,
      target: 35.0,       // 비중 초과 (리밸런싱 필요)
      lastAnalyzedDays: 0,
    },
    {
      ticker: 'SPY',
      code: 'SPY',
      name: 'SPDR S&P 500',
      exchange: 'NYSEARCA',
      sector: '해외 지수 · S&P 500',
      currency: 'USD',
      colorVar: '--t-spy',
      qty: 4,
      avgPrice: 540,
      price: 612,
      value: 3_400_000,
      profit: 400_000,
      profitPct: 13.3,
      current: 12.0,
      target: 15.0,
      lastAnalyzedDays: 2,
    },
    {
      ticker: 'SSE',
      code: '005930',
      name: '삼성전자',
      exchange: 'KRX',
      sector: '국내 개별 · 반도체',
      currency: 'KRW',
      colorVar: '--t-sse',
      qty: 5,
      avgPrice: 71_200,
      price: 67_800,
      value: 339_000,
      profit: -17_000,
      profitPct: -4.8,
      current: 1.2,
      target: 5.0,        // 비중 부족
      lastAnalyzedDays: 12,
    },
  ],
  rebalance: {
    threshold: 5.0,
    needed: true,
    actions: [
      { ticker: 'QQQ',     side: 'sell', from: 47.7, to: 35.0, qty: 5,  amount: 3_760_000, note: '비중 초과 12.7%p' },
      { ticker: 'SSE',     side: 'buy',  from: 1.2,  to: 5.0,  qty: 15, amount: 1_080_000, note: '비중 부족 3.8%p' },
      { ticker: 'KODEX200',side: 'buy',  from: 16.1, to: 20.0, qty: 30, amount: 1_140_000, note: '비중 부족 3.9%p' },
      { ticker: 'TIGER',   side: 'buy',  from: 22.5, to: 25.0, qty: 35, amount: 700_000,   note: '비중 부족 2.5%p' },
      { ticker: 'SPY',     side: 'hold', from: 12.0, to: 15.0, qty: 0,  amount: 0,         note: '임계치 미만' },
    ],
    estCost: 12_400,
    estTax:   18_700,
    targetCount: 4,
  },
  // 90 days of asset history (in 만원 단위, monotonic-ish)
  history: (() => {
    const out = []; let v = 2450;
    for (let i = 0; i < 90; i++) {
      const noise = (Math.sin(i*0.3) + Math.sin(i*0.7+1.2)) * 18 + (Math.random()-.5)*22;
      v += noise + 2.4;
      out.push(Math.round(v));
    }
    out[89] = 2842;
    return out;
  })(),
};

// 7-stage AI report on QQQ — primary deep dive
window.GOLGO_REPORT = {
  ticker: 'QQQ',
  name: 'Invesco QQQ',
  exchange: 'NASDAQ · 나스닥 100 ETF',
  analyst: { name: '강도현', tag: '거시·매크로 · 50년 경력 베테랑', signature: 'KDH' },
  generatedAt: '2026.05.14 09:23',
  durationSec: 47,
  verdict: 'TRIM',           // BUY | HOLD | TRIM | SELL
  verdictLabel: '비중 축소 권고',
  score: 6.4,
  thesis: '나스닥 빅테크 7개 종목 집중도가 사상 최고치인 51.2%에 도달했습니다. 장기 펀더멘털은 견고하나, 단기 밸류에이션 부담이 누적되었습니다.',
  oneLiner: '"지금은 잠시 비중을 덜어둘 시간이지, 시장을 떠날 시간이 아닙니다."',
  stages: [
    { id: 1, label: '비즈니스 모델',    short: '수익 모델', score: 8.5, summary: 'ETF 자체의 운영 모델 견고. 운용보수 0.2%, 추적오차 미미.' },
    { id: 2, label: '산업 · 경쟁 구조', short: '산업 구조', score: 8.0, summary: 'AI 인프라 사이클 후반부 진입. Moat는 견고하나 신규 진입자 위협 증가.' },
    { id: 3, label: '재무 분석',       short: '재무',     score: 7.8, summary: '구성 종목 평균 ROIC 22%, FCF 마진 28%. 자사주 매입 활발.' },
    { id: 4, label: '밸류에이션',      short: '밸류',     score: 4.2, summary: 'PER 32배 · 10년 평균 대비 +38%. PEG 1.9. 부담 구간.' },
    { id: 5, label: '실적 · 컨콜',     short: '실적',     score: 7.4, summary: 'Q1 어닝 서프라이즈 비율 78%. 다만 가이던스 상향 폭은 둔화.' },
    { id: 6, label: '거시경제',       short: '거시',     score: 5.8, summary: '금리 인하 사이클 진입했으나 인플레이션 재반등 리스크 부각.' },
    { id: 7, label: '촉매 · 리스크',   short: '촉매',     score: 5.6, summary: '하반기 빅테크 어닝 시즌 + 미 대선 정책 불확실성.' },
  ],
  risks: [
    { level: 'high', title: '빅테크 7종 집중도 51.2%', detail: 'NVDA·AAPL·MSFT 비중이 ETF의 절반 초과. 개별 종목 충격에 ETF가 직격.' },
    { level: 'mid',  title: 'AI 자본지출 사이클 둔화', detail: '하이퍼스케일러 CapEx 가이던스 상향 폭이 3분기 연속 감소.' },
    { level: 'mid',  title: '환율 (USD/KRW 1,420 돌파)', detail: '원화 약세가 환차익을 만들고 있으나, 되돌림 시 손실 확대.' },
  ],
  selfRebuttal: {
    label: '내가 틀린다면?',
    body: 'AI 인프라 투자가 2027년까지 가속화되고, Fed의 추가 인하가 4회 단행될 경우 현재 밸류에이션은 정당화될 수 있습니다. 이 경우 6개월 내 +18% 추가 상승 여력 존재. 비중을 0으로 줄이는 것이 아니라 35%까지 줄여 잔여 익스포저를 유지하는 이유입니다.',
  },
};
