# Direct ID/Password Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Week 2 인증 범위를 OAuth 중심에서 운영용 ID/PW 로그인과 회원가입 중심으로 전환하고, 소셜 로그인은 UI에서 숨긴 뒤 추후 고도화 항목으로 보류한다.

**Architecture:** 기존 JWT 발급, refresh token, `/auth/me`, 인증 store 흐름은 유지한다. 개발용 `test_login_credentials` 기반 로그인은 `users` 테이블의 `login_id`, `password_hash`, `name` 컬럼 기반 운영 로그인으로 대체한다. 프론트는 로그인 화면에 실제 ID/PW 폼과 회원가입 진입을 제공하고, 닉네임 설정 화면의 입력/검증 UI는 회원가입 화면 내부로 흡수한다.

**Tech Stack:** Spring Boot, Spring Security, JPA, Flyway, PostgreSQL, BCrypt, JWT, React, TypeScript, Vite, Zustand, Axios, Tailwind CSS.

## Global Constraints

- 필요한 부분만 수정한다. OAuth 관련 백엔드 코드는 추후 고도화를 위해 삭제하지 않고 UI와 라우팅 노출만 막는다.
- 비밀번호는 BCrypt hash만 저장한다. 평문 비밀번호는 DB, log, response에 남기지 않는다.
- 비밀번호 정책은 대문자 1개 이상, 특수문자 1개 이상, 전체 8자 이상이다.
- 회원가입 입력값은 `id`, `pw`, `이름`, `이메일`, `닉네임`이다.
- 닉네임 검증은 기존 정책인 한글/영문/숫자 2~12자를 유지한다.
- 자동 push는 하지 않는다.

---

## Assumptions

- `id`는 로그인용 ID이며 DB 컬럼명은 `login_id`로 둔다.
- `pw`는 request 필드에서는 `password`, DB 컬럼은 `password_hash`로 둔다.
- `이름`은 실명 또는 표시용 사용자 이름이며 DB 컬럼명은 `name`으로 둔다.
- 이메일과 닉네임은 현재처럼 각각 unique 제약을 유지한다.
- 소셜 로그인은 현재 구현을 제거하지 않고, `LoginPage`에서 버튼 렌더링을 숨겨 사용자가 접근하지 못하게 한다.

## Target API

### POST `/auth/register`

Request:

```json
{
  "loginId": "golgo01",
  "password": "Password!1",
  "name": "홍길동",
  "email": "user@example.com",
  "nickname": "투자초보"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "expiresIn": 900
  },
  "timestamp": "..."
}
```

### POST `/auth/login`

Request:

```json
{
  "loginId": "golgo01",
  "password": "Password!1"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "expiresIn": 900
  },
  "timestamp": "..."
}
```

## File Structure

- Modify: `backend/src/main/resources/db/migration/V1__init.sql`
  - `users` 테이블에 `login_id`, `password_hash`, `name` 컬럼을 추가한다.
- Create: `backend/src/main/resources/db/migration/V3__direct_login_users.sql`
  - 기존 로컬 DB가 `V1`, `V2`를 적용한 상태에서도 새 컬럼을 받을 수 있도록 alter migration을 추가한다.
- Modify: `backend/src/main/java/com/app/golgo/auth/entity/User.java`
  - 운영 로그인 필드와 factory method를 추가한다.
- Modify: `backend/src/main/java/com/app/golgo/auth/repository/UserRepository.java`
  - `loginId`, `email`, `nickname` 중복 검사와 로그인 조회 메서드를 추가한다.
- Create: `backend/src/main/java/com/app/golgo/auth/dto/LoginRequest.java`
- Create: `backend/src/main/java/com/app/golgo/auth/dto/RegisterRequest.java`
- Modify: `backend/src/main/java/com/app/golgo/auth/service/AuthService.java`
  - `register`, `loginWithPassword`를 추가하고 `loginWithTestCredential` 의존성은 제거한다.
- Modify: `backend/src/main/java/com/app/golgo/auth/controller/AuthController.java`
  - `POST /auth/register`, `POST /auth/login`을 추가하고 `POST /auth/test-login`은 제거한다.
- Modify: `backend/src/main/java/com/app/golgo/auth/security/SecurityConfig.java`
  - `/auth/register`, `/auth/login`을 `permitAll`로 열고 `/auth/test-login`은 제거한다.
- Modify: `backend/src/test/java/com/app/golgo/auth/service/AuthServiceTest.java`
  - 회원가입, 로그인, 중복, 비밀번호 정책 테스트를 추가한다.
- Modify: `frontend/src/features/auth/types.ts`
  - 로그인/회원가입 request 타입을 추가한다.
- Modify: `frontend/src/features/auth/api/auth-api.ts`
  - `directLogin`을 `/auth/login`으로 전환하고 `register` API를 추가한다.
- Modify: `frontend/src/features/auth/store/auth-store.ts`
  - `registerWithPassword` action을 추가하고 기존 `loginWithPassword`를 운영 로그인 API에 맞춘다.
- Modify: `frontend/src/features/auth/pages/LoginPage.tsx`
  - 테스트 계정 기본값 제거, 실제 로그인 영역 문구 변경, 회원가입 링크 추가, 소셜 영역 숨김.
- Create: `frontend/src/features/auth/pages/RegisterPage.tsx`
  - ID, 비밀번호, 이름, 이메일, 닉네임 입력 화면을 구현한다.
- Modify: `frontend/src/app/router.tsx`
  - `/register` public route를 추가한다.
- Modify: `roadmap.md`
  - Week 2 인증 항목을 직접 로그인 우선으로 갱신하고 소셜 로그인은 배포 후 고도화 항목으로 이동한다.
- Modify: `api-spec.md`
  - OAuth 전용 문구를 직접 로그인 우선 정책으로 갱신한다.
- Modify: `erd-spec.md`
  - `users` 테이블 컬럼 정의를 갱신한다.

---

### Task 1: Update Auth Specs And Roadmap

**Files:**
- Modify: `roadmap.md`
- Modify: `api-spec.md`
- Modify: `erd-spec.md`

**Interfaces:**
- Consumes: 사용자가 지정한 정책 변경.
- Produces: 구현 기준 문서.

- [ ] **Step 1: Update roadmap Week 2**

Change Week 2 title from `인증 (소셜 로그인)` to `인증 (ID/PW 로그인 우선)`.

Replace OAuth-first tasks with:

```markdown
| 작업 | 담당 | 상세 |
|------|------|------|
| 직접 로그인 DB 컬럼 추가 | 🤖 | users 테이블에 login_id, password_hash, name 추가 |
| 회원가입 API | 🤖 | id, pw, 이름, 이메일, 닉네임 입력 및 중복 검증 |
| 로그인 API | 🤖 | login_id/password 검증 후 JWT 발급 |
| JWT 발급·갱신·무효화 | 🤖 | 기존 JwtProvider, JwtFilter 흐름 유지 |
| 로그인 화면 UI | 🤖 | 테스트 계정 UI를 실제 ID/PW 입력 폼으로 전환 |
| 회원가입 화면 UI | 🤖 | 닉네임 설정 UI를 회원가입 폼 일부로 재사용 |
| 소셜 로그인 UI 숨김 | 🤖 | OAuth 버튼은 렌더링하지 않고 추후 고도화로 보류 |
| Axios JWT Interceptor | 🤖 | 토큰 자동 갱신 훅 유지 |
| Zustand 인증 스토어 | 🤖 | login/register action 구성 |
| 🧑 검토 포인트 | 🧑 | 회원가입 → 로그인 → 온보딩 진입 확인, 비밀번호 정책 확인 |
```

- [ ] **Step 2: Move social login to advanced backlog**

Add a Phase 4 or post-deploy enhancement section:

```markdown
### 소셜 로그인 고도화

| 작업 | 담당 | 상세 |
|------|------|------|
| 카카오·네이버·구글 OAuth 앱 등록 | 🧑 | 각 플랫폼 개발자 콘솔 직접 등록 |
| Spring Security OAuth2 설정 재활성화 | 🤖 | 기존 OAuth 코드 검증 및 보강 |
| 계정 병합 로직 구현 | 🤝 | 이메일 기준 직접 계정과 소셜 계정 병합 |
| 소셜 Provider 관리 화면 | 🤖 | 연결·해제 UI |
```

- [ ] **Step 3: Update API spec**

In `api-spec.md`, replace "자체 회원가입/로그인 없음" with direct login first policy and add `POST /auth/register`, `POST /auth/login`.

Expected auth endpoint table:

```markdown
|Method|Endpoint|설명|인증|
|---|---|---|---|
|POST|`/auth/register`|ID/PW 회원가입 후 JWT 발급|❌|
|POST|`/auth/login`|ID/PW 로그인 후 JWT 발급|❌|
|POST|`/auth/refresh`|Access Token 갱신|❌ (Refresh Token 필요)|
|POST|`/auth/logout`|로그아웃 (Refresh Token 무효화)|✅|
|GET|`/auth/me`|내 정보 조회|✅|
|PATCH|`/auth/me/nickname`|닉네임 수정|✅|
```

- [ ] **Step 4: Update ERD spec**

Add these rows to `USERS`:

```markdown
|login_id|VARCHAR(50)|UNIQUE, NOT NULL|로그인 ID|
|password_hash|VARCHAR(255)|NOT NULL|BCrypt 비밀번호 해시|
|name|VARCHAR(50)|NOT NULL|사용자 이름|
```

Add index:

```markdown
- `idx_users_login_id` (login_id) — ID/PW 로그인 시 조회
```

- [ ] **Step 5: Verify docs diff only includes auth policy changes**

Run:

```powershell
git diff -- roadmap.md api-spec.md erd-spec.md
```

Expected: Diff only changes Week 2 auth, Auth API, and users table sections.

- [ ] **Step 6: Commit docs**

```powershell
git add roadmap.md api-spec.md erd-spec.md
git commit -m "docs(auth): 직접 로그인 정책 반영"
```

---

### Task 2: Add User Login Columns

**Files:**
- Modify: `backend/src/main/resources/db/migration/V1__init.sql`
- Create: `backend/src/main/resources/db/migration/V3__direct_login_users.sql`
- Modify: `backend/src/main/java/com/app/golgo/auth/entity/User.java`
- Modify: `backend/src/main/java/com/app/golgo/auth/repository/UserRepository.java`
- Test: `backend/src/test/java/com/app/golgo/auth/entity/AuthEntityIdGenerationTest.java`

**Interfaces:**
- Consumes: `users` table.
- Produces: `User.createLocal(...)`, `UserRepository.findByLoginIdAndDeletedAtIsNull(...)`.

- [ ] **Step 1: Write entity/repository test expectations**

Update or add tests that create a local user with:

```java
User user = User.createLocal(
	"golgo01",
	passwordEncoder.encode("Password!1"),
	"홍길동",
	"user@example.com",
	"투자초보",
	CLOCK
);
```

Expected assertions:

```java
assertThat(user.getLoginId()).isEqualTo("golgo01");
assertThat(user.getPasswordHash()).startsWith("$2");
assertThat(user.getName()).isEqualTo("홍길동");
assertThat(user.getEmail()).isEqualTo("user@example.com");
assertThat(user.getNickname()).isEqualTo("투자초보");
```

- [ ] **Step 2: Verify test fails before implementation**

Run:

```powershell
.\gradlew.bat test --tests "*AuthEntityIdGenerationTest*"
```

Expected: compile failure because `createLocal`, `loginId`, `passwordHash`, `name` do not exist yet.

- [ ] **Step 3: Update Flyway migrations**

In `V1__init.sql`, change `users` table:

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_v7(),
    login_id VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    nickname VARCHAR(12) NOT NULL UNIQUE,
    profile_image TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_users_login_id ON users (login_id);
```

Create `V3__direct_login_users.sql` for existing local databases:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_id VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(50);

UPDATE users
SET
    login_id = COALESCE(login_id, split_part(email, '@', 1)),
    password_hash = COALESCE(password_hash, '$2a$10$hMyP/eGrIGtc1GhJoeJ5FuhxyJwGgQlof7LSBHxGGKOmr2wURaXEe'),
    name = COALESCE(name, nickname)
WHERE login_id IS NULL OR password_hash IS NULL OR name IS NULL;

ALTER TABLE users ALTER COLUMN login_id SET NOT NULL;
ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;
ALTER TABLE users ALTER COLUMN name SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_login_id ON users (login_id);
```

- [ ] **Step 4: Update User entity**

Add fields:

```java
@Column(name = "login_id", nullable = false, unique = true, length = 50)
private String loginId;

@Column(name = "password_hash", nullable = false)
private String passwordHash;

@Column(nullable = false, length = 50)
private String name;
```

Add factory:

```java
public static User createLocal(
	String loginId,
	String passwordHash,
	String name,
	String email,
	String nickname,
	Clock clock
) {
	return new User(loginId, passwordHash, name, email, nickname, null, clock);
}
```

Keep `User.create(...)` for OAuth compatibility, but route it through fallback values so compilation remains stable:

```java
public static User create(String email, String nickname, String profileImage, Clock clock) {
	String fallbackLoginId = email.substring(0, email.indexOf('@'));
	return new User(fallbackLoginId, "", nickname, email, nickname, profileImage, clock);
}
```

- [ ] **Step 5: Update repository**

Add:

```java
Optional<User> findByLoginIdAndDeletedAtIsNull(String loginId);

boolean existsByLoginIdAndDeletedAtIsNull(String loginId);

boolean existsByEmailAndDeletedAtIsNull(String email);
```

- [ ] **Step 6: Verify backend compiles**

Run:

```powershell
.\gradlew.bat test --tests "*AuthEntityIdGenerationTest*"
```

Expected: PASS.

- [ ] **Step 7: Commit DB/entity changes**

```powershell
git add backend/src/main/resources/db/migration/V1__init.sql backend/src/main/resources/db/migration/V3__direct_login_users.sql backend/src/main/java/com/app/golgo/auth/entity/User.java backend/src/main/java/com/app/golgo/auth/repository/UserRepository.java backend/src/test/java/com/app/golgo/auth/entity/AuthEntityIdGenerationTest.java
git commit -m "feat(auth): 사용자 로그인 컬럼 추가"
```

---

### Task 3: Implement Register And Login API

**Files:**
- Create: `backend/src/main/java/com/app/golgo/auth/dto/LoginRequest.java`
- Create: `backend/src/main/java/com/app/golgo/auth/dto/RegisterRequest.java`
- Modify: `backend/src/main/java/com/app/golgo/auth/service/AuthService.java`
- Modify: `backend/src/main/java/com/app/golgo/auth/controller/AuthController.java`
- Modify: `backend/src/main/java/com/app/golgo/auth/security/SecurityConfig.java`
- Modify: `backend/src/test/java/com/app/golgo/auth/service/AuthServiceTest.java`

**Interfaces:**
- Consumes: `User.createLocal(...)`, `UserRepository.findByLoginIdAndDeletedAtIsNull(...)`.
- Produces: `AuthService.register(RegisterRequest)`, `AuthService.loginWithPassword(String, String)`.

- [ ] **Step 1: Write failing service tests**

Add tests:

```java
@Test
void registerCreatesUserAndIssuesTokenPair() {
	RegisterRequest request = new RegisterRequest(
		"golgo01",
		"Password!1",
		"홍길동",
		"user@example.com",
		"투자초보"
	);
	when(userRepository.existsByLoginIdAndDeletedAtIsNull("golgo01")).thenReturn(false);
	when(userRepository.existsByEmailAndDeletedAtIsNull("user@example.com")).thenReturn(false);
	when(userRepository.existsByNicknameAndDeletedAtIsNull("투자초보")).thenReturn(false);
	when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
		User user = invocation.getArgument(0);
		user.assignIdForTest(USER_ID);
		return user;
	});

	TokenPair tokens = authService.register(request);

	assertThat(tokens.accessToken()).isNotBlank();
	assertThat(tokens.refreshToken()).isNotBlank();
}
```

```java
@Test
void loginIssuesTokenPairWhenPasswordMatches() {
	User user = User.createLocal("golgo01", passwordEncoder.encode("Password!1"), "홍길동", "user@example.com", "투자초보", CLOCK);
	user.assignIdForTest(USER_ID);
	when(userRepository.findByLoginIdAndDeletedAtIsNull("golgo01")).thenReturn(Optional.of(user));

	TokenPair tokens = authService.loginWithPassword("golgo01", "Password!1");

	assertThat(tokens.accessToken()).isNotBlank();
	assertThat(tokens.refreshToken()).isNotBlank();
}
```

```java
@Test
void registerRejectsWeakPassword() {
	RegisterRequest request = new RegisterRequest("golgo01", "password", "홍길동", "user@example.com", "투자초보");

	Throwable thrown = catchThrowable(() -> authService.register(request));

	assertThat(thrown)
		.isInstanceOf(AuthException.class)
		.hasMessage("비밀번호는 대문자, 특수문자를 포함해 8자 이상이어야 합니다.");
}
```

- [ ] **Step 2: Verify tests fail**

Run:

```powershell
.\gradlew.bat test --tests "*AuthServiceTest*"
```

Expected: compile failure because DTOs and service methods do not exist.

- [ ] **Step 3: Add DTOs**

`LoginRequest.java`:

```java
package com.app.golgo.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
	@NotBlank String loginId,
	@NotBlank String password
) {
}
```

`RegisterRequest.java`:

```java
package com.app.golgo.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
	@NotBlank @Size(min = 4, max = 50) String loginId,
	@NotBlank String password,
	@NotBlank @Size(max = 50) String name,
	@NotBlank @Email String email,
	@NotBlank @Pattern(regexp = "^[가-힣A-Za-z0-9]{2,12}$") String nickname
) {
}
```

- [ ] **Step 4: Implement service methods**

Add password pattern:

```java
private static final Pattern PASSWORD_PATTERN = Pattern.compile("^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$");
```

Add register:

```java
@Transactional
public TokenPair register(RegisterRequest request) {
	validatePassword(request.password());
	if (userRepository.existsByLoginIdAndDeletedAtIsNull(request.loginId())) {
		throw new AuthException(HttpStatus.CONFLICT, "AUTH_011", "이미 사용 중인 아이디입니다.");
	}
	if (userRepository.existsByEmailAndDeletedAtIsNull(request.email())) {
		throw new AuthException(HttpStatus.CONFLICT, "AUTH_012", "이미 사용 중인 이메일입니다.");
	}
	if (userRepository.existsByNicknameAndDeletedAtIsNull(request.nickname())) {
		throw new AuthException(HttpStatus.CONFLICT, "AUTH_006", "이미 사용 중인 닉네임입니다.");
	}
	User user = userRepository.save(User.createLocal(
		request.loginId(),
		passwordEncoder.encode(request.password()),
		request.name(),
		request.email(),
		request.nickname(),
		clock
	));
	return issueTokenPair(user);
}
```

Add login:

```java
@Transactional
public TokenPair loginWithPassword(String loginId, String password) {
	User user = userRepository.findByLoginIdAndDeletedAtIsNull(loginId)
		.orElseThrow(this::invalidLogin);
	if (!passwordEncoder.matches(password, user.getPasswordHash())) {
		throw invalidLogin();
	}
	return issueTokenPair(user);
}
```

Add helpers:

```java
private void validatePassword(String password) {
	if (!PASSWORD_PATTERN.matcher(password).matches()) {
		throw new AuthException(HttpStatus.BAD_REQUEST, "AUTH_013", "비밀번호는 대문자, 특수문자를 포함해 8자 이상이어야 합니다.");
	}
}

private AuthException invalidLogin() {
	return new AuthException(HttpStatus.UNAUTHORIZED, "AUTH_010", "아이디 또는 비밀번호가 올바르지 않습니다.");
}
```

- [ ] **Step 5: Update controller**

Add:

```java
@PostMapping("/register")
public ApiResponse<TokenPair> register(@Valid @RequestBody RegisterRequest request) {
	return ApiResponse.ok(authService.register(request));
}

@PostMapping("/login")
public ApiResponse<TokenPair> login(@Valid @RequestBody LoginRequest request) {
	return ApiResponse.ok(authService.loginWithPassword(request.loginId(), request.password()));
}
```

Remove:

```java
@PostMapping("/test-login")
```

- [ ] **Step 6: Update SecurityConfig**

Change permitAll:

```java
.requestMatchers(HttpMethod.POST, "/auth/register", "/auth/login").permitAll()
```

Remove:

```java
.requestMatchers(HttpMethod.POST, "/auth/test-login").permitAll()
```

- [ ] **Step 7: Remove test-login-only classes**

Delete only if no references remain:

```text
backend/src/main/java/com/app/golgo/auth/dto/TestLoginRequest.java
backend/src/main/java/com/app/golgo/auth/entity/TestLoginCredential.java
backend/src/main/java/com/app/golgo/auth/repository/TestLoginCredentialRepository.java
```

Do not delete OAuth classes.

- [ ] **Step 8: Run backend tests**

Run:

```powershell
.\gradlew.bat test
```

Expected: BUILD SUCCESSFUL.

- [ ] **Step 9: Commit backend auth API**

```powershell
git add backend
git commit -m "feat(auth): 직접 로그인과 회원가입 API 추가"
```

---

### Task 4: Convert Login Page To Real ID/PW Login

**Files:**
- Modify: `frontend/src/features/auth/api/auth-api.ts`
- Modify: `frontend/src/features/auth/store/auth-store.ts`
- Modify: `frontend/src/features/auth/pages/LoginPage.tsx`
- Modify: `frontend/src/features/auth/types.ts`

**Interfaces:**
- Consumes: `POST /auth/login`.
- Produces: `useAuthStore.loginWithPassword(loginId, password)`.

- [ ] **Step 1: Write frontend API/store changes first**

Change `directLogin`:

```ts
export async function login(loginId: string, password: string) {
  const response = await api.post<ApiResponse<TokenPair>>('/auth/login', {
    loginId,
    password,
  })
  return response.data.data
}
```

Update store import:

```ts
import { fetchMe, login, logout } from '@/features/auth/api/auth-api'
```

Update action:

```ts
const tokens = await login(loginId, password)
```

- [ ] **Step 2: Update LoginPage state defaults**

Change:

```ts
const [loginId, setLoginId] = useState('')
const [password, setPassword] = useState('')
```

- [ ] **Step 3: Change submit copy**

Use:

```ts
const message = '아이디 또는 비밀번호를 확인해 주세요.'
```

Button text:

```tsx
{isSubmitting ? '로그인 중...' : '로그인'}
```

- [ ] **Step 4: Hide social login area**

Remove render usage:

```tsx
{providers.map((provider) => (
  <SocialLoginButton key={provider.provider} {...provider} />
))}
```

Keep `SocialLoginButton.tsx` file and OAuth helper untouched for future work.

- [ ] **Step 5: Add register navigation**

Below login button, add:

```tsx
<button
  className="mt-3 h-11 w-full text-[14px] font-semibold text-[#00A37A]"
  type="button"
  onClick={() => navigate('/register')}
>
  회원가입
</button>
```

- [ ] **Step 6: Verify no social login button is visible**

Run:

```powershell
npm run build
```

Expected: Build succeeds, and `LoginPage` no longer imports `SocialLoginButton` or `getOAuthLoginUrl`.

- [ ] **Step 7: Commit frontend login**

```powershell
git add frontend/src/features/auth/api/auth-api.ts frontend/src/features/auth/store/auth-store.ts frontend/src/features/auth/pages/LoginPage.tsx frontend/src/features/auth/types.ts
git commit -m "feat(auth): 실제 로그인 화면으로 전환"
```

---

### Task 5: Add Register Page With Nickname UI

**Files:**
- Create: `frontend/src/features/auth/pages/RegisterPage.tsx`
- Modify: `frontend/src/features/auth/api/auth-api.ts`
- Modify: `frontend/src/features/auth/store/auth-store.ts`
- Modify: `frontend/src/features/auth/types.ts`
- Modify: `frontend/src/app/router.tsx`

**Interfaces:**
- Consumes: `POST /auth/register`.
- Produces: `/register` route and authenticated session after signup.

- [ ] **Step 1: Add register API**

In `auth-api.ts`:

```ts
export type RegisterPayload = {
  loginId: string
  password: string
  name: string
  email: string
  nickname: string
}

export async function register(payload: RegisterPayload) {
  const response = await api.post<ApiResponse<TokenPair>>('/auth/register', payload)
  return response.data.data
}
```

- [ ] **Step 2: Add store action**

Add to `AuthState`:

```ts
registerWithPassword: (payload: RegisterPayload) => Promise<AuthUser>
```

Implement:

```ts
registerWithPassword: async (payload) => {
  set({ status: 'loading', error: null })
  try {
    const tokens = await register(payload)
    get().setTokens(tokens)
    const user = await get().loadUser()
    if (!user) {
      throw new Error('회원가입 사용자 정보를 확인할 수 없습니다.')
    }
    return user
  } catch (error) {
    const message = error instanceof Error ? error.message : '회원가입에 실패했습니다.'
    set({ status: getAccessToken() ? 'idle' : 'anonymous', error: message })
    throw error
  }
}
```

- [ ] **Step 3: Create RegisterPage**

Use the existing `NicknamePage` nickname input pattern:

```ts
const nicknamePattern = /^[가-힣A-Za-z0-9]{2,12}$/
const passwordPattern = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/
```

Required form fields:

```text
loginId
password
name
email
nickname
```

Submit behavior:

```ts
await registerWithPassword({ loginId, password, name, email, nickname })
navigate('/onboarding', { replace: true })
```

Validation messages:

```text
아이디를 입력해 주세요.
비밀번호는 대문자, 특수문자를 포함해 8자 이상이어야 합니다.
이름을 입력해 주세요.
이메일 형식을 확인해 주세요.
닉네임은 한글, 영문, 숫자 2~12자로 입력해 주세요.
```

- [ ] **Step 4: Add route**

In `frontend/src/app/router.tsx`:

```tsx
{
  path: '/register',
  element: <RegisterPage />,
}
```

- [ ] **Step 5: Verify frontend**

Run:

```powershell
npm run lint
npm run build
```

Expected: both pass.

- [ ] **Step 6: Commit frontend register**

```powershell
git add frontend/src/features/auth/pages/RegisterPage.tsx frontend/src/features/auth/api/auth-api.ts frontend/src/features/auth/store/auth-store.ts frontend/src/features/auth/types.ts frontend/src/app/router.tsx
git commit -m "feat(auth): 회원가입 화면 추가"
```

---

### Task 6: End-To-End Verification

**Files:**
- No source edits unless verification reveals a direct auth bug.

**Interfaces:**
- Consumes: all prior tasks.
- Produces: verified direct auth flow.

- [ ] **Step 1: Run backend tests**

```powershell
.\gradlew.bat test
```

Expected: BUILD SUCCESSFUL.

- [ ] **Step 2: Run frontend lint and build**

```powershell
npm run lint
npm run build
```

Expected: both exit 0.

- [ ] **Step 3: Manual API smoke**

Start backend and frontend using the project’s usual local commands.

Register:

```http
POST /auth/register
{
  "loginId": "golgo01",
  "password": "Password!1",
  "name": "홍길동",
  "email": "golgo01@example.com",
  "nickname": "투자초보"
}
```

Expected:

```text
200 OK with accessToken, refreshToken, expiresIn
```

Login:

```http
POST /auth/login
{
  "loginId": "golgo01",
  "password": "Password!1"
}
```

Expected:

```text
200 OK with accessToken, refreshToken, expiresIn
```

Weak password:

```http
POST /auth/register
{
  "loginId": "weak01",
  "password": "password",
  "name": "홍길동",
  "email": "weak01@example.com",
  "nickname": "약한비번"
}
```

Expected:

```text
400 BAD_REQUEST with AUTH_013
```

- [ ] **Step 4: Manual frontend smoke**

Check:

```text
/login
/register
```

Expected:

- `/login` shows ID/PW login and 회원가입 entry.
- `/login` does not show Naver, Google, Kakao buttons.
- `/register` shows ID, password, name, email, nickname inputs.
- Weak password blocks submission.
- Successful signup stores tokens and navigates to `/onboarding`.
- Existing user can log out and log in again.

- [ ] **Step 5: Final diff review**

Run:

```powershell
git status --short
git diff --stat
```

Expected:

- No unrelated files changed.
- Changes are limited to auth docs, auth backend, auth frontend.

---

## Commit Plan

1. `docs(auth): 직접 로그인 정책 반영`
2. `feat(auth): 사용자 로그인 컬럼 추가`
3. `feat(auth): 직접 로그인과 회원가입 API 추가`
4. `feat(auth): 실제 로그인 화면으로 전환`
5. `feat(auth): 회원가입 화면 추가`

## Self-Review

- Spec coverage: user requirements 1-6 are covered by Tasks 2-5.
- Placeholder scan: no `TBD`, `TODO`, or undefined task references remain.
- Type consistency: backend uses `loginId/password/name/email/nickname`; DB uses `login_id/password_hash/name/email/nickname`; frontend payload matches backend DTO names.
- Scope check: OAuth backend removal is intentionally out of scope because user requested social login to be classified for later development, not deleted.
