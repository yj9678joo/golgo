# 온보딩 및 증권사 설정 화면 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `Golgo_design` 온보딩 디자인을 참고해 닉네임 설정, 온보딩, 증권사 설정 화면을 모바일 PWA 기준으로 구현한다.

**Architecture:** 기존 인증 화면 구조를 유지하면서 `features/onboarding` 영역을 새로 만들고, 닉네임 화면은 기존 `/nickname` 기능을 디자인 기준으로 개편한다. 온보딩 상태는 우선 프론트 로컬 상태로 관리하고, 백엔드 저장 API가 없는 항목은 화면 전환과 입력 검증까지만 구현한다.

**Tech Stack:** React 19, React Router, Zustand, Tailwind CSS v4, Lucide React, 기존 `MobilePage`, 기존 auth store/API.

---

## 구현 기준

- 참고 디자인:
  - `D:\04.YJ\project\golgo\Golgo_design\src\onboarding\nickname.jsx`
  - `D:\04.YJ\project\golgo\Golgo_design\src\screens\onboarding.jsx`
  - `D:\04.YJ\project\golgo\Golgo_design\src\onboarding\broker.jsx`
  - `D:\04.YJ\project\golgo\Golgo_design\src\onboarding\targets.jsx`
- 모바일 기준 폭은 기존 앱과 동일하게 `max-w-[430px]`, 실제 설계 기준은 390px로 맞춘다.
- 카드 안에 카드를 중첩하지 않는다.
- 화면 첫 진입은 마케팅/설명 페이지가 아니라 실제 입력/선택 화면이어야 한다.
- 백엔드 API가 아직 없는 온보딩 항목은 mock 저장 없이 화면 상태만 유지한다.
- 기존 `frontend/vite.config.ts` 미커밋 변경은 이 작업 범위에 포함하지 않는다.

## 화면 흐름

```text
로그인 성공
  -> /nickname
  -> /onboarding
     1. 투자 성향 선택
     2. 증권사 선택
     3. 목표 비중 설정
     4. 완료
  -> /

설정 또는 홈 CTA
  -> /broker-setup
     1. 증권사 선택
     2. 연결 방식 선택
     3. 준비 안내 또는 완료 상태
```

## 파일 구조

### 새로 만들 파일

- `frontend/src/features/onboarding/types.ts`
  - 온보딩 단계, 투자 성향, 증권사, 목표 비중 타입 정의
- `frontend/src/features/onboarding/data/onboarding-options.ts`
  - 투자 성향 옵션, 증권사 옵션, 추천 목표 비중 상수
- `frontend/src/features/onboarding/components/OnboardingStepBar.tsx`
  - 3~4단계 진행 표시 공통 컴포넌트
- `frontend/src/features/onboarding/components/SelectableOption.tsx`
  - 투자 성향/증권사 선택 카드 공통 컴포넌트
- `frontend/src/features/onboarding/components/TargetWeightEditor.tsx`
  - 목표 비중 합계, 막대, 슬라이더/스텝 버튼 UI
- `frontend/src/features/onboarding/pages/OnboardingPage.tsx`
  - 투자 성향, 증권사 선택, 목표 비중, 완료 단계 orchestrator
- `frontend/src/features/onboarding/pages/BrokerSetupPage.tsx`
  - 증권사 설정 단독 화면

### 수정할 파일

- `frontend/src/features/auth/pages/NicknamePage.tsx`
  - 디자인 기준의 스텝바/추천 닉네임/하단 CTA 구조로 개편
  - 저장 성공 시 `/onboarding`으로 이동
- `frontend/src/features/auth/pages/HomePage.tsx`
  - 임시 홈 카드에 온보딩/증권사 설정 진입 버튼 추가
- `frontend/src/app/router.tsx`
  - `/onboarding`, `/broker-setup` protected route 추가

---

## Task 1: 온보딩 타입과 옵션 데이터 추가

**Files:**
- Create: `frontend/src/features/onboarding/types.ts`
- Create: `frontend/src/features/onboarding/data/onboarding-options.ts`

- [ ] **Step 1: 타입 파일 작성**

```ts
export type OnboardingStep = 'persona' | 'broker' | 'targets' | 'done'

export type InvestmentPersona = 'conservative' | 'balanced' | 'growth' | 'custom'

export type BrokerId = 'kis' | 'mirae' | 'nh' | 'samsung' | 'kiwoom' | 'kb' | 'shinhan' | 'toss' | 'other'

export type BrokerConnectionMethod = 'api-key' | 'screenshot'

export type TargetWeight = {
  ticker: string
  name: string
  sector: string
  colorClassName: string
  weight: number
}
```

- [ ] **Step 2: 옵션 데이터 작성**

```ts
import {
  BarChart3,
  Landmark,
  Rocket,
  Settings2,
  Shield,
  Sprout,
} from 'lucide-react'
import type { BrokerId, InvestmentPersona, TargetWeight } from '../types'

export const personaOptions: Array<{
  id: InvestmentPersona
  label: string
  description: string
  icon: typeof Sprout
}> = [
  { id: 'conservative', label: '안정형', description: '원금 보존 우선, 꾸준한 적립', icon: Sprout },
  { id: 'balanced', label: '안정 성장형', description: '지수 ETF 중심, 일부 성장주', icon: BarChart3 },
  { id: 'growth', label: '성장형', description: '미국 빅테크와 섹터 집중', icon: Rocket },
  { id: 'custom', label: '직접 설정', description: '목표 비중을 직접 조정', icon: Settings2 },
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

export const recommendedWeights: Record<InvestmentPersona, TargetWeight[]> = {
  conservative: [
    { ticker: 'KODEX200', name: 'KODEX 200', sector: '국내 지수', colorClassName: 'bg-[#3182F6]', weight: 50 },
    { ticker: 'TIGER', name: 'TIGER 미국S&P500', sector: '미국 지수', colorClassName: 'bg-[#00A37A]', weight: 50 },
  ],
  balanced: [
    { ticker: 'KODEX200', name: 'KODEX 200', sector: '국내 지수', colorClassName: 'bg-[#3182F6]', weight: 20 },
    { ticker: 'TIGER', name: 'TIGER 미국S&P500', sector: '미국 지수', colorClassName: 'bg-[#00A37A]', weight: 25 },
    { ticker: 'QQQ', name: 'Invesco QQQ', sector: '미국 성장', colorClassName: 'bg-[#191F28]', weight: 35 },
    { ticker: 'SPY', name: 'SPDR S&P 500', sector: '미국 대표', colorClassName: 'bg-[#D4A574]', weight: 20 },
  ],
  growth: [
    { ticker: 'TIGER', name: 'TIGER 미국S&P500', sector: '미국 지수', colorClassName: 'bg-[#00A37A]', weight: 15 },
    { ticker: 'QQQ', name: 'Invesco QQQ', sector: '미국 성장', colorClassName: 'bg-[#191F28]', weight: 50 },
    { ticker: 'SPY', name: 'SPDR S&P 500', sector: '미국 대표', colorClassName: 'bg-[#D4A574]', weight: 25 },
    { ticker: 'SSE', name: '반도체 ETF', sector: '섹터 집중', colorClassName: 'bg-[#F97316]', weight: 10 },
  ],
  custom: [
    { ticker: 'KODEX200', name: 'KODEX 200', sector: '국내 지수', colorClassName: 'bg-[#3182F6]', weight: 25 },
    { ticker: 'TIGER', name: 'TIGER 미국S&P500', sector: '미국 지수', colorClassName: 'bg-[#00A37A]', weight: 25 },
    { ticker: 'QQQ', name: 'Invesco QQQ', sector: '미국 성장', colorClassName: 'bg-[#191F28]', weight: 25 },
    { ticker: 'SPY', name: 'SPDR S&P 500', sector: '미국 대표', colorClassName: 'bg-[#D4A574]', weight: 25 },
  ],
}
```

- [ ] **Step 3: 타입 검증**

Run:

```powershell
npm run typecheck
```

Expected:

```text
tsc -b
```

---

## Task 2: 공통 온보딩 UI 컴포넌트 추가

**Files:**
- Create: `frontend/src/features/onboarding/components/OnboardingStepBar.tsx`
- Create: `frontend/src/features/onboarding/components/SelectableOption.tsx`

- [ ] **Step 1: 진행 바 컴포넌트 작성**

```tsx
type OnboardingStepBarProps = {
  current: number
  total: number
}

export function OnboardingStepBar({ current, total }: OnboardingStepBarProps) {
  return (
    <div className="grid gap-2">
      <div className="flex gap-1.5">
        {Array.from({ length: total }, (_, index) => {
          const isActive = index < current

          return (
            <div
              key={index}
              className={isActive ? 'h-1 flex-1 rounded-full bg-[#191F28]' : 'h-1 flex-1 rounded-full bg-[#DDE2E7]'}
            />
          )
        })}
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-normal text-[#8B95A1]">
        {current} / {total} 단계
      </p>
    </div>
  )
}
```

- [ ] **Step 2: 선택 카드 컴포넌트 작성**

```tsx
import type { ComponentType } from 'react'
import { Check } from 'lucide-react'

type SelectableOptionProps = {
  icon?: ComponentType<{ className?: string }>
  title: string
  description: string
  selected: boolean
  badge?: string
  onClick: () => void
}

export function SelectableOption({
  icon: Icon,
  title,
  description,
  selected,
  badge,
  onClick,
}: SelectableOptionProps) {
  return (
    <button
      className={
        selected
          ? 'flex w-full items-center gap-3 rounded-[16px] border border-[#191F28] bg-white p-3.5 text-left shadow-sm'
          : 'flex w-full items-center gap-3 rounded-[16px] border border-[#E5E8EB] bg-white p-3.5 text-left'
      }
      type="button"
      onClick={onClick}
    >
      <span
        className={
          selected
            ? 'flex size-11 shrink-0 items-center justify-center rounded-[12px] bg-[#191F28] text-white'
            : 'flex size-11 shrink-0 items-center justify-center rounded-[12px] bg-[#F2F4F6] text-[#4E5968]'
        }
      >
        {Icon ? <Icon className="size-5" aria-hidden="true" /> : badge}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-[#191F28]">{title}</span>
        <span className="mt-1 block text-[12px] leading-5 text-[#6B7684]">{description}</span>
      </span>
      <span
        className={
          selected
            ? 'flex size-5 shrink-0 items-center justify-center rounded-full bg-[#191F28] text-white'
            : 'size-5 shrink-0 rounded-full border border-[#DDE2E7]'
        }
      >
        {selected ? <Check className="size-3" aria-hidden="true" /> : null}
      </span>
    </button>
  )
}
```

- [ ] **Step 3: 린트 실행**

Run:

```powershell
npm run lint
```

Expected:

```text
eslint .
```

---

## Task 3: 닉네임 설정 화면 디자인 개편

**Files:**
- Modify: `frontend/src/features/auth/pages/NicknamePage.tsx`

- [ ] **Step 1: 현재 기능 유지 기준 확인**

유지해야 하는 기능:

- `updateNickname(nickname)` 호출
- 성공 후 `loadUser()`
- 로그아웃 버튼
- 닉네임 정규식 `^[가-힣A-Za-z0-9]{2,12}$`

- [ ] **Step 2: 디자인 구조 적용**

구현 구조:

```tsx
<MobilePage className="bg-[#F2F4F6] text-[#191F28]" contentClassName="flex max-w-[430px]">
  <div className="flex min-h-[calc(100svh-2rem)] w-full flex-col px-2 py-4">
    <OnboardingStepBar current={1} total={4} />
    <header className="mt-5 flex items-start justify-between gap-3">
      <div>
        <h1>어떻게<br />불러드릴까요?</h1>
        <p>포트폴리오에 표시되는 이름이에요</p>
      </div>
      <button aria-label="로그아웃">...</button>
    </header>
    <form className="mt-7 flex flex-1 flex-col">
      <input />
      <p>한글·영문·숫자 2~12자로 입력해 주세요</p>
      <section>추천 닉네임 버튼 3개</section>
      <button className="mt-auto">다음</button>
    </form>
  </div>
</MobilePage>
```

- [ ] **Step 3: 추천 닉네임 추가**

추천 닉네임:

```ts
const nicknameSuggestions = ['투자초보', '오늘도매수', '복리의힘']
```

각 버튼은 클릭 시 `setNickname(suggestion)`을 수행한다.

- [ ] **Step 4: 저장 성공 이동 경로 변경**

기존:

```ts
navigate('/', { replace: true })
```

변경:

```ts
navigate('/onboarding', { replace: true })
```

- [ ] **Step 5: 검증**

Run:

```powershell
npm run lint
npm run build
```

Expected:

```text
eslint .
tsc -b && vite build
```

---

## Task 4: 목표 비중 편집 컴포넌트 추가

**Files:**
- Create: `frontend/src/features/onboarding/components/TargetWeightEditor.tsx`

- [ ] **Step 1: props 정의**

```tsx
import { Minus, Plus, RotateCcw } from 'lucide-react'
import type { TargetWeight } from '../types'

type TargetWeightEditorProps = {
  weights: TargetWeight[]
  onChange: (ticker: string, weight: number) => void
  onReset: () => void
}
```

- [ ] **Step 2: 합계와 막대 UI 작성**

컴포넌트 내부 계산:

```ts
const total = weights.reduce((sum, item) => sum + item.weight, 0)
const diff = 100 - total
const isExact = total === 100
```

합계 카드에는 다음 상태를 표시한다.

- `isExact === true`: `완료`
- `diff > 0`: `${diff}% 부족`
- `diff < 0`: `${Math.abs(diff)}% 초과`

- [ ] **Step 3: 각 종목 조정 UI 작성**

각 종목은 다음 요소를 가진다.

- ticker 배지
- 종목명
- 섹터명
- `-` 버튼: 5% 감소
- `+` 버튼: 5% 증가
- `input type="range"`: 0~100, step 5

감소/증가 함수:

```ts
function clampWeight(value: number) {
  return Math.max(0, Math.min(100, value))
}
```

- [ ] **Step 4: 컴포넌트 단독 검증**

Run:

```powershell
npm run typecheck
```

Expected:

```text
tsc -b
```

---

## Task 5: 온보딩 화면 구현

**Files:**
- Create: `frontend/src/features/onboarding/pages/OnboardingPage.tsx`

- [ ] **Step 1: 상태 정의**

```tsx
const [step, setStep] = useState<OnboardingStep>('persona')
const [persona, setPersona] = useState<InvestmentPersona>('balanced')
const [brokerId, setBrokerId] = useState<BrokerId>('kis')
const [weights, setWeights] = useState<TargetWeight[]>(recommendedWeights.balanced)
```

- [ ] **Step 2: 투자 성향 단계 작성**

디자인 기준:

- 상단 `OnboardingStepBar current={2} total={4}`
- 제목: `어떤 투자 성향을 가지고 계신가요?`
- 설명: `선택한 성향에 맞춰 목표 비중을 추천해드려요`
- `personaOptions`를 `SelectableOption`으로 렌더링
- `다음` 버튼 클릭 시:

```ts
setWeights(recommendedWeights[persona])
setStep('broker')
```

- `나중에 설정할게요` 버튼 클릭 시 기본 `balanced`로 다음 단계 이동

- [ ] **Step 3: 증권사 선택 단계 작성**

디자인 기준:

- 상단 `OnboardingStepBar current={3} total={4}`
- 제목: `증권사 계좌를 연결해주세요`
- 설명: `보유 종목을 자동으로 불러와요`
- `brokerOptions` 렌더링
- 보안 안내 영역:

```text
API Key는 암호화 저장을 전제로 설계합니다.
```

- `다음` 버튼 클릭 시 `targets` 단계 이동
- `나중에 연결할게요` 버튼 클릭 시 `targets` 단계 이동

- [ ] **Step 4: 목표 비중 단계 작성**

디자인 기준:

- 상단 `OnboardingStepBar current={4} total={4}`
- 제목: `자산 목표 비중을 정해볼까요?`
- 설명: `추천 비중을 그대로 쓰거나 직접 조정할 수 있어요`
- `TargetWeightEditor` 사용
- 합계가 100이 아니면 CTA disabled
- CTA 문구:
  - 합계 100: `고르고 시작하기`
  - 합계 미달/초과: `합계를 100%로 맞춰주세요`

- [ ] **Step 5: 완료 단계 작성**

완료 화면:

- 제목: `준비 완료!`
- 설명: `이제 고르고가 비중을 맞춰드릴게요`
- 요약:
  - 투자 성향
  - 연결 증권사
  - 목표 비중
- CTA: `대시보드 보러가기`
- 클릭 시:

```ts
navigate('/', { replace: true })
```

- [ ] **Step 6: 빌드 검증**

Run:

```powershell
npm run build
```

Expected:

```text
tsc -b && vite build
```

---

## Task 6: 증권사 설정 단독 화면 구현

**Files:**
- Create: `frontend/src/features/onboarding/pages/BrokerSetupPage.tsx`

- [ ] **Step 1: 화면 목적 정의**

`BrokerSetupPage`는 온보딩 중 증권사 선택과 별개로 홈/설정에서 진입 가능한 계좌 연결 화면이다. 백엔드 연결 API가 없으므로 현재 구현은 선택과 안내 완료까지 담당한다.

- [ ] **Step 2: 상태 정의**

```tsx
const [selectedBrokerId, setSelectedBrokerId] = useState<BrokerId>('kis')
const [method, setMethod] = useState<BrokerConnectionMethod>('api-key')
const [isDone, setIsDone] = useState(false)
```

- [ ] **Step 3: 증권사 선택 UI 작성**

구성:

- 상단 뒤로가기 버튼
- 제목: `증권사 설정`
- 설명: `보유 종목을 불러올 방식을 선택해주세요`
- `brokerOptions` 선택 카드

- [ ] **Step 4: 연결 방식 선택 UI 작성**

KIS 선택 시:

- `App Key 연결`
- `MTS 캡처로 시작`

기타 증권사 선택 시:

- `MTS 캡처로 시작`만 활성화

CTA 클릭 시:

```ts
setIsDone(true)
```

- [ ] **Step 5: 완료/준비 안내 UI 작성**

완료 상태 문구:

```text
증권사 설정 준비가 완료됐어요
다음 단계에서 실제 App Key 등록 또는 캡처 업로드 기능을 연결할 수 있어요.
```

CTA:

```ts
navigate('/', { replace: true })
```

- [ ] **Step 6: 검증**

Run:

```powershell
npm run lint
npm run build
```

Expected:

```text
eslint .
tsc -b && vite build
```

---

## Task 7: 라우팅과 홈 진입점 연결

**Files:**
- Modify: `frontend/src/app/router.tsx`
- Modify: `frontend/src/features/auth/pages/HomePage.tsx`

- [ ] **Step 1: 라우트 추가**

`router.tsx` protected children에 추가:

```tsx
{
  path: '/onboarding',
  element: <OnboardingPage />,
},
{
  path: '/broker-setup',
  element: <BrokerSetupPage />,
},
```

필요 import:

```tsx
import { BrokerSetupPage } from '@/features/onboarding/pages/BrokerSetupPage'
import { OnboardingPage } from '@/features/onboarding/pages/OnboardingPage'
```

- [ ] **Step 2: 홈 화면 CTA 추가**

`HomePage`의 `다음 단계` 카드에 버튼 2개 추가:

```tsx
<button type="button" onClick={() => navigate('/onboarding')}>
  온보딩 시작
</button>
<button type="button" onClick={() => navigate('/broker-setup')}>
  증권사 설정
</button>
```

버튼은 모바일에서 가로 폭을 넘지 않도록 `grid gap-2` 또는 `flex-col`로 배치한다.

- [ ] **Step 3: 검증**

Run:

```powershell
npm run lint
npm run build
```

Expected:

```text
eslint .
tsc -b && vite build
```

---

## Task 8: 모바일 레이아웃 QA

**Files:**
- Verify only

- [ ] **Step 1: 개발 서버 실행**

Run:

```powershell
npm run dev
```

Expected:

```text
Local: http://localhost:3000/
Network: http://<PC_IP>:3000/
```

- [ ] **Step 2: 브라우저 확인**

확인 경로:

- `http://localhost:3000/nickname`
- `http://localhost:3000/onboarding`
- `http://localhost:3000/broker-setup`

확인 항목:

- 390px 모바일 폭에서 텍스트 겹침 없음
- 버튼 텍스트 줄바꿈/잘림 없음
- 하단 CTA가 safe-area에 가려지지 않음
- 선택 카드 높이가 선택 상태에서 튀지 않음
- 목표 비중 합계가 100이 아닐 때 CTA disabled
- 완료 화면에서 `/` 이동 가능

- [ ] **Step 3: 최종 검증**

Run:

```powershell
npm run lint
npm run build
```

Expected:

```text
eslint .
tsc -b && vite build
```

---

## 커밋 계획

구현 시 다음처럼 관심사별로 커밋한다.

1. 온보딩 공통 모델/컴포넌트

```text
feat(onboarding): 온보딩 공통 UI 추가
```

2. 닉네임 및 온보딩 화면

```text
feat(onboarding): 모바일 온보딩 화면 구현
```

3. 증권사 설정 화면과 라우트

```text
feat(onboarding): 증권사 설정 화면 추가
```

## 실행 방식 제안

agent 팀을 사용할 경우:

- 백엔드 담당자는 이번 작업 범위에 없음
- 프론트 담당자 `Terry`가 Task 1~8을 담당

작업 시작 전 사용자가 이 계획서를 확인하고 수정한 뒤, 수정된 계획서를 기준으로 구현한다.
