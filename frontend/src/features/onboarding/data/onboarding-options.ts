import {
  BarChart3,
  Landmark,
  Rocket,
  Settings2,
  Shield,
  Sprout,
} from 'lucide-react'
import type { BrokerId, InvestmentPersona } from '../types'

export const personaOptions: Array<{
  id: InvestmentPersona
  label: string
  description: string
  icon: typeof Sprout
}> = [
  {
    id: 'conservative',
    label: '안정형',
    description: '원금 보존 우선, 꾸준한 적립',
    icon: Sprout,
  },
  {
    id: 'balanced',
    label: '안정 성장형',
    description: '지수 ETF 중심, 일부 성장주',
    icon: BarChart3,
  },
  {
    id: 'growth',
    label: '성장형',
    description: '미국 빅테크와 섹터 집중',
    icon: Rocket,
  },
  {
    id: 'custom',
    label: '직접 설정',
    description: '목표 비중을 직접 조정',
    icon: Settings2,
  },
]

export const brokerOptions: Array<{
  id: BrokerId
  name: string
  brandLabel: string
  brandClassName: string
  methods: string[]
}> = [
  {
    id: 'kis',
    name: '한국투자증권',
    brandLabel: 'KIS',
    brandClassName: 'bg-[#0F2D6B] text-white',
    methods: ['App Key', 'MTS 캡처'],
  },
  {
    id: 'mirae',
    name: '미래에셋증권',
    brandLabel: 'M',
    brandClassName: 'bg-[#005BAC] text-white',
    methods: ['MTS 캡처'],
  },
  {
    id: 'other',
    name: '기타 증권사',
    brandLabel: '+',
    brandClassName: 'bg-[#94A3B8] text-white',
    methods: ['MTS 캡처'],
  },
]

export const brokerSetupNotes = [
  { icon: Shield, text: 'API Key는 암호화 저장을 전제로 설계합니다.' },
  { icon: Landmark, text: '현재 화면은 연결 플로우 UI를 먼저 구성합니다.' },
]
