# Login Onboarding Routing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 모든 로그인 방식에서 온보딩 완료 사용자를 `/`로, 미완료 사용자를 기존 설정 화면으로 이동시킨다.

**Architecture:** `AuthUser.onboardingCompleted`로 목적지를 결정하는 순수 함수를 auth 모듈에 추가한다. 비밀번호 로그인과 소셜 로그인 콜백은 로그인 성공 후 반환받은 사용자와 각 흐름의 미완료 경로를 함수에 전달한다.

**Tech Stack:** React 19, TypeScript, React Router, Node.js built-in test runner

## Global Constraints

- 새로운 API와 외부 테스트 의존성을 추가하지 않는다.
- 완료 사용자의 대시보드 경로는 현재 진입점인 `/`를 사용한다.
- 미완료 사용자는 비밀번호 로그인에서 `/onboarding`, 소셜 로그인에서 `/nickname`으로 이동한다.
- 기존 `.gitignore` 변경은 수정하거나 커밋하지 않는다.

---

### Task 1: 로그인 후 목적지 결정

**Files:**
- Create: `frontend/src/features/auth/utils/get-post-login-path.ts`
- Create: `frontend/src/features/auth/utils/get-post-login-path.test.mjs`
- Modify: `frontend/package.json`

**Interfaces:**
- Consumes: `onboardingCompleted: boolean`, `incompletePath: string`
- Produces: `getPostLoginPath(onboardingCompleted, incompletePath): string`

- [ ] **Step 1: Write the failing test**

Node 내장 테스트로 완료 사용자는 `/`, 미완료 사용자는 전달된 설정 경로를 반환하는 두 사례를 작성하고 `package.json`에 `test:auth-routing` 명령을 추가한다.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:auth-routing`
Expected: FAIL because `get-post-login-path.ts` does not exist.

- [ ] **Step 3: Write minimal implementation**

```ts
export function getPostLoginPath(
  onboardingCompleted: boolean,
  incompletePath: string,
) {
  return onboardingCompleted ? '/' : incompletePath
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:auth-routing`
Expected: 2 tests pass.

### Task 2: 두 로그인 흐름 연결

**Files:**
- Modify: `frontend/src/features/auth/pages/LoginPage.tsx`
- Modify: `frontend/src/features/auth/pages/AuthCallbackPage.tsx`
- Test: `frontend/src/features/auth/utils/get-post-login-path.test.mjs`

**Interfaces:**
- Consumes: Task 1의 `getPostLoginPath`
- Produces: 비밀번호·소셜 로그인 성공 후 온보딩 상태 기반 화면 이동

- [ ] **Step 1: Connect password login**

`loginWithPassword` 반환 사용자를 받아 `getPostLoginPath(user.onboardingCompleted, '/onboarding')` 결과로 이동한다.

- [ ] **Step 2: Connect social login**

`loadUser` 반환 사용자를 받아 `getPostLoginPath(user.onboardingCompleted, '/nickname')` 결과로 이동한다.

- [ ] **Step 3: Verify focused behavior**

Run: `npm run test:auth-routing`
Expected: 2 tests pass.

- [ ] **Step 4: Verify frontend quality gates**

Run: `npm run lint`
Expected: exit code 0.

Run: `npm run build`
Expected: exit code 0.

- [ ] **Step 5: Commit implementation**

Stage only the plan and auth routing files, then commit with `feat(auth): 온보딩 상태별 로그인 이동 적용`.

### Task 3: Master 병합

**Files:**
- No source changes

**Interfaces:**
- Consumes: 검증 및 커밋된 feature branch
- Produces: feature commit이 포함된 local `master`

- [ ] **Step 1: Switch to master preserving unrelated changes**

현재 `.gitignore` 변경이 유지되는지 확인한 후 `master`로 전환한다.

- [ ] **Step 2: Merge feature branch**

Run: `git merge codex/week5-screenshot-upload`
Expected: fast-forward or clean merge.

- [ ] **Step 3: Verify merged result**

Run: `npm run test:auth-routing`, `npm run lint`, `npm run build`
Expected: all commands exit code 0.

- [ ] **Step 4: Delete merged feature branch**

Run: `git branch -d codex/week5-screenshot-upload`
Expected: branch deleted; no push performed.
