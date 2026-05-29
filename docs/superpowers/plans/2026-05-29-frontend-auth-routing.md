# Frontend Auth Routing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `tech-stack.md`와 `roadmap.md` Week2 기준에 맞춰 프론트엔드 인증 구조를 라우트 기반으로 정리하고 SSO 로그인 화면을 구현한다.

**Architecture:** React Router를 도입해 `/login`, `/auth/callback`, `/nickname`, `/` 라우트를 명시한다. 인증 확인은 `AuthGuard`가 담당하고, `App`은 앱 provider와 router 연결만 담당한다. 인증 API, 토큰 저장소, Zustand store, 화면 컴포넌트는 feature 기반 구조로 분리한다.

**Tech Stack:** React 19, TypeScript 5, Vite 6, Tailwind CSS 4, shadcn/ui 스타일 컴포넌트, Zustand 5, Axios, Lucide React, React Router DOM.

---

## Context

### Source Requirements

- `tech-stack.md`
  - React + TypeScript + Tailwind CSS + shadcn/ui
  - Zustand 인증 상태
  - Axios JWT interceptor
  - Vite PWA 구조
  - 모노레포 `frontend/src/components/ui`, `features`, `hooks`, `stores` 권장
- `roadmap.md` Week2
  - 소셜 로그인 화면 UI
  - Axios JWT Interceptor
  - Zustand 인증 스토어
  - 닉네임 설정 화면
  - OAuth callback 동작 확인

### Current State

- `frontend/src/App.tsx`가 route state를 직접 들고 있다.
- 인증 확인 로직은 최근 `AuthRoute.tsx`로 분리됐지만 실제 router는 없다.
- SSO 로그인 화면은 `Golgo_design` 기반으로 만들어졌으나, shadcn/ui Button 기반 구조는 아직 아니다.
- `features/auth` 아래에 page, store, api, route guard가 한 폴더에 섞여 있다.



네이버, 구글 로그인 버튼 이미지는 `src/assts/google_login.png, NAVER_login.png` 사용

---

## Target File Structure

```text
frontend/src/
├── app/
│   ├── App.tsx
│   ├── providers.tsx
│   └── router.tsx
├── assets/
│   └── golgo-lockup-wide.png
├── components/
│   └── ui/
│       └── button.tsx
├── features/
│   └── auth/
│       ├── api/
│       │   └── auth-api.ts
│       ├── components/
│       │   ├── AuthGuard.tsx
│       │   └── SocialLoginButton.tsx
│       ├── pages/
│       │   ├── AuthCallbackPage.tsx
│       │   ├── HomePage.tsx
│       │   ├── LoginPage.tsx
│       │   └── NicknamePage.tsx
│       ├── store/
│       │   └── auth-store.ts
│       └── types.ts
├── lib/
│   ├── api/
│   │   ├── auth-token-storage.ts
│   │   └── client.ts
│   └── utils.ts
└── main.tsx
```

---

## Task 1: Add Router Dependency

**Files:**

- Modify: `frontend/package.json`
- Modify: `frontend/package-lock.json`
- **Step 1: Install React Router**

Run:

```powershell
npm install react-router-dom
```

Expected:

- `react-router-dom` is added to `dependencies`.
- `package-lock.json` is updated.
- **Step 2: Verify dependency install**

Run:

```powershell
npm ls react-router-dom
```

Expected:

- Installed version is printed with exit code 0.

---

## Task 2: Add shadcn/ui Button Primitive

**Files:**

- Create: `frontend/src/components/ui/button.tsx`
- **Step 1: Create Button component**

Create `frontend/src/components/ui/button.tsx`:

```tsx
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline: 'border border-border bg-card text-foreground hover:bg-muted',
        ghost: 'hover:bg-muted',
      },
      size: {
        default: 'h-11 px-4',
        lg: 'h-[54px] rounded-[14px] px-4 text-base',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)

Button.displayName = 'Button'
```

- **Step 2: Verify types**

Run:

```powershell
npm run build
```

Expected:

- Build succeeds.

---

## Task 3: Move API Client and Token Storage

**Files:**

- Create: `frontend/src/lib/api/client.ts`
- Create: `frontend/src/lib/api/auth-token-storage.ts`
- Delete after references move: `frontend/src/lib/api.ts`
- Delete after references move: `frontend/src/lib/auth-storage.ts`
- **Step 1: Move token storage**

Create `frontend/src/lib/api/auth-token-storage.ts` with the current contents of `frontend/src/lib/auth-storage.ts`.

- **Step 2: Move Axios client**

Create `frontend/src/lib/api/client.ts` with the current Axios client logic from `frontend/src/lib/api.ts`.

Update imports inside this file from:

```ts
} from './auth-storage'
```

to:

```ts
} from './auth-token-storage'
```

- **Step 3: Keep OAuth login URL helper**

Keep this function in `client.ts`:

```ts
export function getOAuthLoginUrl(provider: 'google' | 'naver' | 'kakao') {
  return `${API_BASE_URL}/auth/${provider}/login`
}
```

If backend still supports only Google and Naver, the Kakao UI must be disabled and must not call this function.

- **Step 4: Verify no old imports remain**

Run:

```powershell
rg "@/lib/api|@/lib/auth-storage|\\.\\./\\.\\./lib/api|\\.\\./\\.\\./lib/auth-storage" frontend/src
```

Expected:

- No references remain after later tasks update imports.

---

## Task 4: Reorganize Auth Feature Files

**Files:**

- Move: `frontend/src/features/auth/auth-api.ts` -> `frontend/src/features/auth/api/auth-api.ts`
- Move: `frontend/src/features/auth/auth-store.ts` -> `frontend/src/features/auth/store/auth-store.ts`
- Move: `frontend/src/features/auth/AuthCallbackPage.tsx` -> `frontend/src/features/auth/pages/AuthCallbackPage.tsx`
- Move: `frontend/src/features/auth/HomePage.tsx` -> `frontend/src/features/auth/pages/HomePage.tsx`
- Move: `frontend/src/features/auth/LoginPage.tsx` -> `frontend/src/features/auth/pages/LoginPage.tsx`
- Move: `frontend/src/features/auth/NicknamePage.tsx` -> `frontend/src/features/auth/pages/NicknamePage.tsx`
- Move or replace: `frontend/src/features/auth/AuthRoute.tsx` -> `frontend/src/features/auth/components/AuthGuard.tsx`
- **Step 1: Create directories**

Create:

```text
frontend/src/features/auth/api
frontend/src/features/auth/components
frontend/src/features/auth/pages
frontend/src/features/auth/store
```

- **Step 2: Move files**

Move files into the target structure listed above.

- **Step 3: Update imports**

Use these import targets:

```ts
import { api, type ApiResponse } from '@/lib/api/client'
import { useAuthStore } from '@/features/auth/store/auth-store'
import type { AuthUser, NicknameUpdateResponse } from '@/features/auth/types'
```

- **Step 4: Verify build**

Run:

```powershell
npm run build
```

Expected:

- Build succeeds.

---

## Task 5: Implement AuthGuard for Route Protection

**Files:**

- Create or replace: `frontend/src/features/auth/components/AuthGuard.tsx`
- **Step 1: Implement AuthGuard**

Use this behavior:

- If no tokens exist, redirect to `/login`.
- If tokens exist and user is missing, call `loadUser`.
- While loading, show centered spinner.
- If user exists, render child route via `Outlet`.
- If loading fails, store clears tokens and guard redirects to `/login`.

Implementation:

```tsx
import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/auth-store'

export function AuthGuard() {
  const location = useLocation()
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)
  const hasTokens = useAuthStore((state) => state.hasTokens)
  const loadUser = useAuthStore((state) => state.loadUser)

  useEffect(() => {
    if (hasTokens && !user && status !== 'loading') {
      void loadUser()
    }
  }, [hasTokens, loadUser, status, user])

  if (!hasTokens || status === 'anonymous') {
    return <Navigate replace to="/login" state={{ from: location }} />
  }

  if (status === 'loading' || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <Loader2 className="size-7 animate-spin text-primary" aria-hidden="true" />
      </main>
    )
  }

  return <Outlet />
}
```

- **Step 2: Remove old AuthRoute usage**

No file should import `AuthRoute` after router implementation.

---

## Task 6: Create App Router

**Files:**

- Create: `frontend/src/app/router.tsx`
- Create: `frontend/src/app/App.tsx`
- Modify: `frontend/src/main.tsx`
- Delete after move: `frontend/src/App.tsx`
- **Step 1: Create router**

Create `frontend/src/app/router.tsx`:

```tsx
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthGuard } from '@/features/auth/components/AuthGuard'
import { AuthCallbackPage } from '@/features/auth/pages/AuthCallbackPage'
import { HomePage } from '@/features/auth/pages/HomePage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { NicknamePage } from '@/features/auth/pages/NicknamePage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallbackPage />,
  },
  {
    element: <AuthGuard />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/nickname',
        element: <NicknamePage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate replace to="/" />,
  },
])
```

- **Step 2: Create app entry**

Create `frontend/src/app/App.tsx`:

```tsx
import { RouterProvider } from 'react-router-dom'
import { router } from './router'

export function App() {
  return <RouterProvider router={router} />
}
```

- **Step 3: Update main**

Update `frontend/src/main.tsx` import to:

```tsx
import { App } from './app/App'
```

- **Step 4: Verify App no longer checks auth directly**

Run:

```powershell
Get-Content -LiteralPath "frontend\src\app\App.tsx"
```

Expected:

- `App` only renders `RouterProvider`.

---

## Task 7: Update Auth Pages for Router Navigation

**Files:**

- Modify: `frontend/src/features/auth/pages/AuthCallbackPage.tsx`
- Modify: `frontend/src/features/auth/pages/NicknamePage.tsx`
- Modify: `frontend/src/features/auth/pages/HomePage.tsx`
- **Step 1: Update callback navigation**

Remove `onComplete` prop from `AuthCallbackPage`.

Use:

```tsx
const navigate = useNavigate()
```

After successful `loadUser()`:

```tsx
navigate('/nickname', { replace: true })
```

- **Step 2: Update nickname navigation**

Remove `onDone` prop from `NicknamePage`.

After nickname update and `loadUser()`:

```tsx
navigate('/', { replace: true })
```

- **Step 3: Update logout navigation**

In `HomePage`, after `signOut()` completes:

```tsx
void signOut().then(() => navigate('/login', { replace: true }))
```

- **Step 4: Verify callback route is public**

Manually check that `/auth/callback` renders the callback page without `AuthGuard`.

---

## Task 8: Split Login UI Components

**Files:**

- Create: `frontend/src/features/auth/components/SocialLoginButton.tsx`
- Modify: `frontend/src/features/auth/pages/LoginPage.tsx`
- **Step 1: Create SocialLoginButton**

Create a focused component that accepts:

```ts
type SocialProvider = 'kakao' | 'naver' | 'google'

type SocialLoginButtonProps = {
  provider: SocialProvider
  label: string
  href?: string
  disabled?: boolean
}
```

Behavior:

- If `href` exists and `disabled` is false, render `Button asChild` with an anchor.
- If disabled, render disabled `Button`.
- Include provider icon inside the button.
- **Step 2: Update LoginPage**

Use `SocialLoginButton` for:

```ts
[
  { provider: 'kakao', label: '카카오로 시작하기', disabled: true },
  { provider: 'naver', label: '네이버로 시작하기', href: getOAuthLoginUrl('naver') },
  { provider: 'google', label: 'Google로 계속하기', href: getOAuthLoginUrl('google') },
]
```

- **Step 3: Keep Golgo design direction**

Keep these elements:

- Golgo logo lockup
- Text: `자산을 고르게, 종목을 고르게.`
- Text: `AI 기반 리밸런싱 어드바이저`
- Mobile-first app-like layout
- **Step 4: Verify UI compiles**

Run:

```powershell
npm run build
```

Expected:

- Build succeeds.

---

## Task 9: Delete Obsolete Files and Update Imports

**Files:**

- Delete: `frontend/src/App.tsx`
- Delete: `frontend/src/lib/api.ts`
- Delete: `frontend/src/lib/auth-storage.ts`
- Delete if replaced: `frontend/src/features/auth/AuthRoute.tsx`
- Delete old moved page/store/api files from `frontend/src/features/auth/`
- **Step 1: Check old path references**

Run:

```powershell
rg "features/auth/(auth-api|auth-store|AuthCallbackPage|HomePage|LoginPage|NicknamePage|AuthRoute)|@/lib/api|@/lib/auth-storage" frontend/src
```

Expected:

- No references remain.
- **Step 2: Remove obsolete files**

Remove old files only after confirming all imports use new paths.

- **Step 3: Verify source tree**

Run:

```powershell
rg --files frontend/src
```

Expected:

- Auth files match the target structure.

---

## Task 10: Verification

**Files:**

- No source edits unless verification reveals a problem.
- **Step 1: Lint**

Run:

```powershell
npm run lint
```

Expected:

- Exit code 0.
- **Step 2: Build**

Run:

```powershell
npm run build
```

Expected:

- Exit code 0.
- **Step 3: Dev server smoke test**

Run:

```powershell
npm run dev -- --host 127.0.0.1
```

Open:

```text
http://127.0.0.1:3000/login
```

Expected:

- Login screen renders.
- Naver and Google buttons are clickable anchors.
- Kakao button is disabled.
- **Step 4: Route smoke tests**

Check:

```text
http://127.0.0.1:3000/
http://127.0.0.1:3000/nickname
http://127.0.0.1:3000/auth/callback
```

Expected:

- `/` redirects to `/login` when no tokens exist.
- `/nickname` redirects to `/login` when no tokens exist.
- `/auth/callback` renders callback handling UI.

---

## Commit Plan

### Commit 1

Message:

```text
refactor(frontend): 인증 라우팅 구조 정리
```

Includes:

- React Router dependency
- `src/app` router structure
- `AuthGuard`
- auth feature directory reorganization
- API client/token storage move

### Commit 2

Message:

```text
feat(auth): SSO 로그인 화면 구성
```

Includes:

- shadcn/ui `Button`
- `SocialLoginButton`
- final login page implementation
- Golgo design asset usage

---

## Review Checklist

- `App.tsx` does not directly check login state.
- Route protection is handled by `AuthGuard`.
- `/auth/callback` is public.
- JWT request interceptor attaches access token.
- JWT response interceptor refreshes access token once on 401.
- Login screen has Kakao, Naver, Google UI.
- Disabled Kakao does not navigate until backend provider exists.
- `npm run lint` passes.
- `npm run build` passes.
- No push is performed unless explicitly requested.

