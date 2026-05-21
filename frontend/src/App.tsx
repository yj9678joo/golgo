import { Activity, BarChart3, ShieldCheck } from 'lucide-react'

const highlights = [
  {
    title: '포트폴리오 동기화',
    description: '증권사 Open API 연동을 위한 프론트엔드 기반을 준비합니다.',
    icon: Activity,
  },
  {
    title: '리밸런싱 가이드',
    description: '목표 비중과 현재 비중 비교 화면을 확장할 수 있습니다.',
    icon: BarChart3,
  },
  {
    title: '리스크 체크',
    description: '초보 투자자도 이해할 수 있는 점검 흐름을 담을 구조입니다.',
    icon: ShieldCheck,
  },
]

export function App() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-5 py-12">
        <p className="text-sm font-medium text-muted-foreground">Golgo Frontend</p>
        <div className="mt-4 max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-normal text-balance sm:text-5xl">
            개인 맞춤형 투자 분석을 위한 React 앱 기반
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
            React 19, TypeScript, Vite, Tailwind CSS, TanStack Query, Zustand
            기반으로 프로젝트 세팅을 완료했습니다.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {highlights.map(({ title, description, icon: Icon }) => (
            <article
              key={title}
              className="rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm"
            >
              <Icon className="size-5 text-primary" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
