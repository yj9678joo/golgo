# shadcn/ui Common Component Conversion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 현재 화면 스타일을 유지하면서 네이티브 `button`, `input`, `label`, 카드형 `section`을 shadcn/ui 공통 컴포넌트 사용으로 전환한다.

**Architecture:** 먼저 `frontend/src/components/ui`에 필요한 shadcn/ui 래퍼를 추가한다. 이후 화면 단위로 `Button`, `Input`, `Label`, `Card`, `Sheet`, `Badge`, `Progress`, `Skeleton`을 적용하되, 기존 Tailwind 클래스는 호출부 `className`으로 유지해 시각 변화 범위를 최소화한다.

**Tech Stack:** React 19, TypeScript 5, Vite 6, Tailwind CSS 4, shadcn/ui 패턴, Radix UI 기반 컴포넌트, Lucide React.

## Global Constraints

- 프론트엔드 공통 UI는 shadcn/ui 컴포넌트를 우선 사용한다.
- 필요한 shadcn/ui 컴포넌트만 `frontend/src/components/ui`에 복사/구현한다.
- 기존 화면 스타일을 유지한다. 전환 작업에서 색상, 간격, 라운드, 그림자, 문구를 임의 변경하지 않는다.
- 변경은 화면 단위로 작게 나누고, 각 단계마다 `npm run typecheck`, `npm run lint`, 필요 시 `npm run build`를 실행한다.
- push는 사용자가 명시적으로 요청하기 전까지 실행하지 않는다.

---

## Current Inventory

### 이미 shadcn/ui 적용됨

- `frontend/src/components/ui/button.tsx`: `Button`
- `frontend/src/components/ui/input.tsx`: `Input`
- `frontend/src/features/auth/components/SocialLoginButton.tsx`: `Button` 사용
- `frontend/src/features/portfolio/components/HoldingEditSheet.tsx`: `Input`만 사용, `Button`/`Label`/`Sheet` 미적용

### 전환 대상 화면 및 컴포넌트

| 파일 | 현재 미적용 요소 | 전환 후보 |
| --- | --- | --- |
| `frontend/src/features/auth/pages/HomePage.tsx` | 네이티브 `button` 4개, 카드형 `div` | `Button`, 필요 시 `Card` |
| `frontend/src/features/auth/pages/LoginPage.tsx` | `form`, `label`, `input`, `button` | `Input`, `Label`, `Button`, 필요 시 `Card` |
| `frontend/src/features/auth/pages/RegisterPage.tsx` | 뒤로가기/추천/제출 `button`, `label`, `input` | `Button`, `Input`, `Label`, 필요 시 `Card` |
| `frontend/src/features/auth/pages/NicknamePage.tsx` | 로그아웃/추천/제출 `button`, `label`, `input` | `Button`, `Input`, `Label` |
| `frontend/src/features/onboarding/pages/OnboardingPage.tsx` | 단계 이동/선택/제출 `button` | `Button` |
| `frontend/src/features/onboarding/pages/BrokerSetupPage.tsx` | 뒤로가기/선택/제출 `button`, 카드형 영역 | `Button`, 필요 시 `Card`, 상태 표시는 `Badge` 검토 |
| `frontend/src/features/onboarding/components/SelectableOption.tsx` | 선택 옵션 `button` | `Button` |
| `frontend/src/features/portfolio/pages/DashboardPage.tsx` | 액션 `button`, 카드형 `section` | `Button`, `Card`, 필요 시 `Badge` |
| `frontend/src/features/portfolio/pages/PortfolioDetailPage.tsx` | 액션 `button`, 카드형 `section` | `Button`, `Card`, 필요 시 `Badge` |
| `frontend/src/features/portfolio/pages/ScreenshotUploadPage.tsx` | 뒤로가기/업로드/제출 `button`, file `input` | `Button`, `Input` 또는 file input은 숨김 유지 |
| `frontend/src/features/portfolio/pages/ScreenshotReviewPage.tsx` | 뒤로가기/추가/행/저장/확정 `button`, 카드형 `section` | `Button`, `Card`, `Sheet` |
| `frontend/src/features/portfolio/components/HoldingEditSheet.tsx` | 네이티브 `button`, `label`, 직접 만든 sheet overlay | `Button`, `Label`, `Sheet` |
| `frontend/src/features/portfolio/components/OutdatedPortfolioBanner.tsx` | 액션 `button`, 알림 카드 | `Button`, 필요 시 `Card` |
| `frontend/src/components/common/ErrorState.tsx` | 재시도 `button`, 상태 카드 | `Button`, 필요 시 `Card` |
| `frontend/src/components/common/EmptyState.tsx` | 상태 카드 | 필요 시 `Card` |
| `frontend/src/features/portfolio/components/AssetDonutChart.tsx` | 카드형 `section` | 필요 시 `Card` |
| `frontend/src/features/auth/pages/AuthCallbackPage.tsx` | 상태 카드 | 필요 시 `Card` |

### 제외 대상

- `frontend/src/components/layout/MobilePage.tsx`: 페이지 레이아웃 컨테이너이므로 shadcn `Card` 전환 대상이 아니다.
- `frontend/src/components/ui/input.tsx`: shadcn 래퍼 내부의 네이티브 `input`은 정상이다.
- 숨김 file input은 접근성과 브라우저 파일 선택 동작 때문에 `Input`으로 감싸더라도 `className="hidden"` 유지가 필요하다.

---

### Task 1: shadcn/ui 기본 컴포넌트 보강

**Files:**
- Create: `frontend/src/components/ui/label.tsx`
- Create: `frontend/src/components/ui/card.tsx`
- Create: `frontend/src/components/ui/badge.tsx`
- Create: `frontend/src/components/ui/sheet.tsx`
- Create: `frontend/src/components/ui/progress.tsx`
- Create: `frontend/src/components/ui/skeleton.tsx`
- Modify: `frontend/package.json`

**Interfaces:**
- Produces: `Label`, `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `Badge`, `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle`, `SheetDescription`, `Progress`, `Skeleton`
- Consumes: existing `cn` from `frontend/src/lib/utils.ts`

- [ ] **Step 1: Add only required dependencies**

Run:

```bash
cd frontend
npm install @radix-ui/react-label @radix-ui/react-dialog @radix-ui/react-progress
```

Expected: `package.json` and lockfile update with the three Radix packages.

- [ ] **Step 2: Add shadcn/ui wrappers**

Use shadcn-compatible wrappers under `frontend/src/components/ui`. Keep wrappers generic and avoid app-specific colors.

- [ ] **Step 3: Verify wrappers compile**

Run:

```bash
cd frontend
npm run typecheck
npm run lint
```

Expected: both commands pass.

- [ ] **Step 4: Commit**

```bash
git -C frontend add package.json package-lock.json src/components/ui/label.tsx src/components/ui/card.tsx src/components/ui/badge.tsx src/components/ui/sheet.tsx src/components/ui/progress.tsx src/components/ui/skeleton.tsx
git -C frontend commit -m "feat(ui): shadcn 공통 컴포넌트 추가"
```

---

### Task 2: Auth 화면 입력/버튼 전환

**Files:**
- Modify: `frontend/src/features/auth/pages/LoginPage.tsx`
- Modify: `frontend/src/features/auth/pages/RegisterPage.tsx`
- Modify: `frontend/src/features/auth/pages/NicknamePage.tsx`
- Modify: `frontend/src/features/auth/pages/HomePage.tsx`
- Modify: `frontend/src/features/auth/pages/AuthCallbackPage.tsx`

**Interfaces:**
- Consumes: `Button`, `Input`, `Label`, `Card`
- Produces: Auth 화면에서 네이티브 `button`, `input`, `label` 제거

- [ ] **Step 1: Convert LoginPage**

Replace login form `input` with `Input`, label text wrappers with `Label`, submit/register `button` with `Button`. Preserve every existing `className`, `type`, `disabled`, `autoComplete`, `name`, `value`, and `onChange`.

- [ ] **Step 2: Convert RegisterPage**

Replace back button, nickname suggestion buttons, submit button with `Button`. Replace all local `input` with `Input` and visible labels with `Label`. Keep `TextField` abstraction if it still reduces duplication.

- [ ] **Step 3: Convert NicknamePage**

Replace logout/back-like action, nickname suggestion buttons, submit button with `Button`. Replace nickname `input` with `Input`; keep `sr-only` label behavior via `Label`.

- [ ] **Step 4: Convert HomePage and AuthCallbackPage cards/actions**

Replace action buttons with `Button`. Convert only true framed panels to `Card`; do not convert layout-only wrappers.

- [ ] **Step 5: Verify Auth flow**

Run:

```bash
cd frontend
npm run typecheck
npm run lint
npm run build
```

Expected: all commands pass. Build may keep the existing Vite chunk size warning.

- [ ] **Step 6: Commit**

```bash
git -C frontend add src/features/auth/pages
git -C frontend commit -m "refactor(auth): shadcn 공통 컴포넌트 적용"
```

---

### Task 3: Onboarding 화면 버튼/선택 옵션 전환

**Files:**
- Modify: `frontend/src/features/onboarding/pages/OnboardingPage.tsx`
- Modify: `frontend/src/features/onboarding/pages/BrokerSetupPage.tsx`
- Modify: `frontend/src/features/onboarding/components/SelectableOption.tsx`

**Interfaces:**
- Consumes: `Button`, optionally `Card`, `Badge`
- Produces: Onboarding 영역에서 네이티브 `button` 제거

- [ ] **Step 1: Convert SelectableOption**

Replace the root option `button` with `Button`. Preserve selection state classes and accessibility attributes.

- [ ] **Step 2: Convert OnboardingPage**

Replace step navigation and submit buttons with `Button`. Keep existing option rendering and selected styling unchanged.

- [ ] **Step 3: Convert BrokerSetupPage**

Replace all native buttons with `Button`. Convert repeated broker/status panels to `Card` only where they are framed content blocks, not layout wrappers.

- [ ] **Step 4: Verify Onboarding flow**

Run:

```bash
cd frontend
npm run typecheck
npm run lint
```

Expected: both commands pass.

- [ ] **Step 5: Commit**

```bash
git -C frontend add src/features/onboarding
git -C frontend commit -m "refactor(onboarding): shadcn 공통 컴포넌트 적용"
```

---

### Task 4: Portfolio 주요 화면 버튼/카드 전환

**Files:**
- Modify: `frontend/src/features/portfolio/pages/DashboardPage.tsx`
- Modify: `frontend/src/features/portfolio/pages/PortfolioDetailPage.tsx`
- Modify: `frontend/src/features/portfolio/components/OutdatedPortfolioBanner.tsx`
- Modify: `frontend/src/features/portfolio/components/AssetDonutChart.tsx`
- Modify: `frontend/src/components/common/ErrorState.tsx`
- Modify: `frontend/src/components/common/EmptyState.tsx`

**Interfaces:**
- Consumes: `Button`, `Card`, optionally `Badge`, `Skeleton`
- Produces: Portfolio 주요 화면의 액션 버튼과 반복 카드가 shadcn/ui 공통 컴포넌트를 사용

- [ ] **Step 1: Convert shared states**

Replace `ErrorState` retry button with `Button`. Convert `ErrorState` and `EmptyState` framed sections to `Card` only if the resulting markup stays simpler than the current section.

- [ ] **Step 2: Convert portfolio banners/charts**

Replace `OutdatedPortfolioBanner` action button with `Button`. Convert `AssetDonutChart` framed section to `Card` if no layout regression occurs.

- [ ] **Step 3: Convert DashboardPage**

Replace native buttons with `Button`. Convert framed dashboard panels to `Card`, preserving current class names on `Card` or `CardContent`.

- [ ] **Step 4: Convert PortfolioDetailPage**

Replace native buttons with `Button`. Convert framed holdings/summary panels to `Card`, preserving spacing and shadow classes.

- [ ] **Step 5: Verify Portfolio display tests**

Run:

```bash
cd frontend
npm run typecheck
npm run lint
npm run test:portfolio-display
npm run build
```

Expected: all commands pass. Build may keep the existing Vite chunk size warning.

- [ ] **Step 6: Commit**

```bash
git -C frontend add src/features/portfolio/pages/DashboardPage.tsx src/features/portfolio/pages/PortfolioDetailPage.tsx src/features/portfolio/components/OutdatedPortfolioBanner.tsx src/features/portfolio/components/AssetDonutChart.tsx src/components/common/ErrorState.tsx src/components/common/EmptyState.tsx
git -C frontend commit -m "refactor(portfolio): 주요 화면 shadcn 적용"
```

---

### Task 5: Screenshot 업로드/검토 플로우 전환

**Files:**
- Modify: `frontend/src/features/portfolio/pages/ScreenshotUploadPage.tsx`
- Modify: `frontend/src/features/portfolio/pages/ScreenshotReviewPage.tsx`
- Modify: `frontend/src/features/portfolio/components/HoldingEditSheet.tsx`

**Interfaces:**
- Consumes: `Button`, `Input`, `Label`, `Card`, `Sheet`
- Produces: Screenshot 플로우에서 네이티브 액션 버튼 제거, 편집 시트는 shadcn `Sheet` 기반으로 변경

- [ ] **Step 1: Convert ScreenshotUploadPage**

Replace back/upload/submit buttons with `Button`. For hidden file input, either keep native `input` with a comment explaining browser file picker usage, or use `Input` with `className="hidden"` if behavior remains identical.

- [ ] **Step 2: Convert ScreenshotReviewPage actions**

Replace back/add/row/save/confirm buttons with `Button`. Preserve row button layout by passing the current row classes to `Button`.

- [ ] **Step 3: Convert HoldingEditSheet to Sheet**

Replace custom fixed overlay and panel with `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle`. Replace local labels with `Label` and footer buttons with `Button`. Keep `lockBodyScroll` only if the selected `Sheet` wrapper does not already manage body scroll; otherwise remove it with a focused regression check.

- [ ] **Step 4: Verify screenshot contracts**

Run:

```bash
cd frontend
npm run typecheck
npm run lint
npm run test:screenshot-job-contract
npm run test:portfolio-contract
npm run build
```

Expected: all commands pass. Build may keep the existing Vite chunk size warning.

- [ ] **Step 5: Commit**

```bash
git -C frontend add src/features/portfolio/pages/ScreenshotUploadPage.tsx src/features/portfolio/pages/ScreenshotReviewPage.tsx src/features/portfolio/components/HoldingEditSheet.tsx
git -C frontend commit -m "refactor(portfolio): 캡처 플로우 shadcn 적용"
```

---

### Task 6: Final audit

**Files:**
- Read: `frontend/src/**/*.tsx`

**Interfaces:**
- Consumes: all changes from previous tasks
- Produces: final audit result showing no unintended native controls outside `components/ui`

- [ ] **Step 1: Search native controls**

Run:

```bash
cd frontend
rg "<(button|input|select|textarea|label|table)\\b" src -g "*.tsx"
```

Expected: matches remain only inside `src/components/ui/*` or intentionally documented exceptions such as hidden file input.

- [ ] **Step 2: Search shadcn imports**

Run:

```bash
cd frontend
rg "@/components/ui" src -g "*.tsx"
```

Expected: converted screens import `Button`, `Input`, `Label`, `Card`, `Sheet`, or other appropriate UI wrappers.

- [ ] **Step 3: Run full verification**

Run:

```bash
cd frontend
npm run typecheck
npm run lint
npm run build
```

Expected: all commands pass. Build may keep the existing Vite chunk size warning.

- [ ] **Step 4: Commit audit cleanup if needed**

```bash
git -C frontend add src
git -C frontend commit -m "refactor(ui): shadcn 전환 잔여 정리"
```

Skip this commit if no cleanup changes are needed.

---

## Recommended Execution Order

1. Task 1: 공통 컴포넌트 추가
2. Task 2: Auth 화면
3. Task 3: Onboarding 화면
4. Task 4: Portfolio 주요 화면
5. Task 5: Screenshot 업로드/검토 플로우
6. Task 6: 최종 검색/검증

## Risk Notes

- `HoldingEditSheet`를 Radix `Sheet`로 바꾸면 기존 `lockBodyScroll()`과 책임이 겹칠 수 있다. 전환 시 body scroll lock 동작을 실제로 확인해야 한다.
- `Button` 기본 클래스와 기존 호출부 클래스가 병합되므로 `rounded`, `h-*`, `bg-*`, `text-*` 충돌은 `tailwind-merge` 결과를 확인해야 한다.
- file input은 브라우저 기본 동작 의존성이 있어 무리하게 추상화하지 않는 편이 안전하다.
- `Card` 전환은 마크업이 길어질 수 있으므로, 단순 레이아웃 `section`까지 강제로 전환하지 않는다.
