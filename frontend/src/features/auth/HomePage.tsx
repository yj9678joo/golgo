import { LogOut, UserRound } from 'lucide-react'
import { useAuthStore } from './auth-store'

export function HomePage() {
  const user = useAuthStore((state) => state.user)
  const signOut = useAuthStore((state) => state.signOut)

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground">
      <section className="mx-auto w-full max-w-4xl">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary">Golgo</p>
            <h1 className="mt-2 text-3xl font-semibold">인증 완료</h1>
          </div>
          <button
            className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-medium hover:bg-muted"
            type="button"
            onClick={() => void signOut()}
          >
            <LogOut className="size-4" aria-hidden="true" />
            로그아웃
          </button>
        </header>

        <div className="mt-8 rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-4">
            {user?.profileImage ? (
              <img
                className="size-14 rounded-full object-cover"
                src={user.profileImage}
                alt=""
              />
            ) : (
              <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                <UserRound className="size-6 text-muted-foreground" aria-hidden="true" />
              </div>
            )}
            <div>
              <p className="text-lg font-semibold">{user?.nickname}</p>
              <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-md bg-muted p-4">
              <p className="text-xs font-semibold text-muted-foreground">연결 Provider</p>
              <p className="mt-2 text-sm font-medium">{user?.connectedProviders.join(', ')}</p>
            </div>
            <div className="rounded-md bg-muted p-4">
              <p className="text-xs font-semibold text-muted-foreground">다음 단계</p>
              <p className="mt-2 text-sm font-medium">온보딩 및 증권사 연결</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
