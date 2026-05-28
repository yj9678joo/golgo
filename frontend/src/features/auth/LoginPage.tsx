import { BarChart3, ChevronRight, LineChart, ShieldCheck } from 'lucide-react'
import { getOAuthLoginUrl } from '@/lib/api'

const providers = [
  {
    id: 'naver',
    label: 'Naver로 계속하기',
    className: 'bg-[#03C75A] text-white hover:bg-[#02b351]',
  },
  {
    id: 'google',
    label: 'Google로 계속하기',
    className: 'border border-border bg-card text-foreground hover:bg-muted',
  },
] as const

const checkpoints = [
  { label: '계좌 연동 준비', icon: ShieldCheck },
  { label: '목표 비중 관리', icon: BarChart3 },
  { label: '리밸런싱 분석', icon: LineChart },
]

export function LoginPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-5 py-10 lg:grid-cols-[1fr_420px]">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-primary">Golgo</p>
          <h1 className="mt-5 text-4xl font-semibold tracking-normal text-balance sm:text-5xl">
            투자 계정을 한 번에 확인하고 목표 비중까지 이어갑니다
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
            소셜 로그인으로 시작해 증권사 연결, 포트폴리오 최신화, 리밸런싱 가이드까지
            이어지는 개인 투자 관리 흐름입니다.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {checkpoints.map(({ label, icon: Icon }) => (
              <div key={label} className="rounded-lg border border-border bg-card p-4 shadow-sm">
                <Icon className="size-5 text-primary" aria-hidden="true" />
                <p className="mt-3 text-sm font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <h2 className="text-xl font-semibold">로그인</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            등록된 OAuth 앱 정보가 있는 Provider로 인증을 시작합니다.
          </p>
          <div className="mt-6 grid gap-3">
            {providers.map((provider) => (
              <a
                key={provider.id}
                className={`flex h-12 items-center justify-between rounded-md px-4 text-sm font-semibold transition ${provider.className}`}
                href={getOAuthLoginUrl(provider.id)}
              >
                <span>{provider.label}</span>
                <ChevronRight className="size-4" aria-hidden="true" />
              </a>
            ))}
          </div>
          <p className="mt-5 text-xs leading-5 text-muted-foreground">
            카카오 로그인은 백엔드 Provider가 활성화되면 버튼을 추가합니다.
          </p>
        </div>
      </section>
    </main>
  )
}
