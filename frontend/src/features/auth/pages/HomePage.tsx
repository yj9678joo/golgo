import { useNavigate } from 'react-router-dom'
import { ArrowRight, ImageUp, Landmark, LogOut, Sparkles, UserRound } from 'lucide-react'
import { MobilePage } from '@/components/layout/MobilePage'
import { useAuthStore } from '@/features/auth/store/auth-store'

export function HomePage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const signOut = useAuthStore((state) => state.signOut)

  return (
    <MobilePage contentClassName="max-w-[430px]">
      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-primary">Golgo</p>
          <h1 className="mt-2 text-[26px] font-semibold leading-tight">대시보드</h1>
        </div>
        <button
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-medium hover:bg-muted"
          type="button"
          onClick={() => void signOut().then(() => navigate('/login', { replace: true }))}
        >
          <LogOut className="size-4" aria-hidden="true" />
          로그아웃
        </button>
      </header>

      <div className="mt-6 rounded-lg border border-border bg-card p-4 shadow-sm min-[375px]:p-5">
        <div className="flex items-center gap-4">
          {user?.profileImage ? (
            <img
              className="size-14 rounded-full object-cover"
              src={user.profileImage}
              alt=""
            />
          ) : (
            <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-muted">
              <UserRound className="size-6 text-muted-foreground" aria-hidden="true" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-lg font-semibold">{user?.nickname}</p>
            <p className="mt-1 truncate text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <div className="mt-6 grid gap-3">
          <div className="rounded-md bg-muted p-4">
            <p className="text-xs font-semibold text-muted-foreground">연결 Provider</p>
            <p className="mt-2 text-sm font-medium">{user?.connectedProviders.join(', ')}</p>
          </div>
          <div className="rounded-md bg-muted p-4">
            <p className="text-xs font-semibold text-muted-foreground">다음 단계</p>
            <p className="mt-2 text-sm font-medium">
              {user?.onboardingCompleted ? '대시보드 화면 준비 중' : '온보딩 설정'}
            </p>
            <div className="mt-4 grid gap-2">
              {!user?.onboardingCompleted ? (
                <button
                  className="inline-flex h-11 w-full items-center justify-between rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground"
                  type="button"
                  onClick={() => navigate('/onboarding')}
                >
                  <span className="inline-flex items-center gap-2">
                    <Sparkles className="size-4" aria-hidden="true" />
                    온보딩 시작
                  </span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </button>
              ) : null}
              <button
                className="inline-flex h-11 w-full items-center justify-between rounded-md border border-border bg-card px-3 text-sm font-semibold text-foreground"
                type="button"
                onClick={() => navigate('/portfolio/screenshot')}
              >
                <span className="inline-flex items-center gap-2">
                  <ImageUp className="size-4" aria-hidden="true" />
                  MTS 캡처 업로드
                </span>
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
              <button
                className="inline-flex h-11 w-full items-center justify-between rounded-md border border-border bg-card px-3 text-sm font-semibold text-foreground"
                type="button"
                onClick={() => navigate('/broker-setup')}
              >
                <span className="inline-flex items-center gap-2">
                  <Landmark className="size-4" aria-hidden="true" />
                  증권사 설정
                </span>
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </MobilePage>
  )
}
