# 직접 테스트 로그인 구현 계획

## 목표

네이버 OAuth 승인이 완료되기 전에도 프론트 인증 플로우를 테스트할 수 있도록 직접 로그인 기능을 추가한다. 테스트 계정 `id: test01`, `pw: test01`로 로그인하면 기존 JWT 발급, refresh token 저장, `/auth/me` 조회, 닉네임/홈 이동 흐름을 그대로 사용할 수 있게 한다.

## 현재 인증 흐름

1. 프론트 SSO 버튼이 `/api/auth/{provider}/login`으로 이동한다.
2. 백엔드가 Spring Security OAuth URL로 redirect한다.
3. OAuth 성공 시 `OAuth2LoginSuccessHandler`가 JWT `accessToken`, `refreshToken`을 발급한다.
4. 프론트 `/auth/callback`이 query string에서 토큰을 읽고 store에 저장한다.
5. 프론트가 `/auth/me`를 호출해 사용자 정보를 로드한다.

## 직접 로그인 설계

OAuth 흐름을 우회하는 개발용 endpoint를 추가한다.

```text
POST /api/auth/test-login
```

요청:

```json
{
  "loginId": "test01",
  "password": "test01"
}
```

응답:

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

프론트는 응답 토큰을 기존 `useAuthStore.setTokens()`로 저장하고 `loadUser()`를 호출한다. 즉, OAuth callback에서 하던 후속 흐름과 동일한 인증 상태를 만든다.

## DB 설계

기존 `users` 테이블에는 비밀번호 컬럼이 없다. OAuth 계정과 분리하고 영향 범위를 줄이기 위해 개발용 credential 테이블을 추가한다.

```sql
CREATE TABLE test_login_credentials (
    login_id VARCHAR(50) PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

테스트 seed:

- user email: `test01@golgo.local`
- nickname: `test01`
- login_id: `test01`
- password: `test01`

비밀번호는 평문 저장하지 않고 BCrypt hash로 저장한다. Spring Security의 `BCryptPasswordEncoder`를 사용한다.

## 작업 1: 백엔드 DB 마이그레이션 추가

### 파일

- 생성: `backend/src/main/resources/db/migration/V2__test_login_credentials.sql`

### 내용

- `test_login_credentials` 테이블 생성
- `users`에 `test01` 계정 insert
- `test_login_credentials`에 `test01` credential insert
- 중복 실행 방지를 위해 `ON CONFLICT` 사용

## 작업 2: 백엔드 DTO 추가

### 파일

- 생성: `backend/src/main/java/com/app/golgo/auth/dto/TestLoginRequest.java`

### 내용

```java
public record TestLoginRequest(
    @NotBlank String loginId,
    @NotBlank String password
) {
}
```

## 작업 3: 백엔드 Entity/Repository 추가

### 파일

- 생성: `backend/src/main/java/com/app/golgo/auth/entity/TestLoginCredential.java`
- 생성: `backend/src/main/java/com/app/golgo/auth/repository/TestLoginCredentialRepository.java`

### 역할

- `test_login_credentials` 테이블을 조회한다.
- `loginId`로 credential을 찾고 연결된 `User`를 가져온다.

## 작업 4: 백엔드 인증 서비스 확장

### 파일

- 수정: `backend/src/main/java/com/app/golgo/auth/service/AuthService.java`

### 변경

- `TestLoginCredentialRepository`와 `PasswordEncoder`를 주입한다.
- `loginWithTestCredential(loginId, password)` 메서드를 추가한다.
- loginId가 없거나 password가 맞지 않으면 `AuthException(HttpStatus.UNAUTHORIZED, "AUTH_010", "아이디 또는 비밀번호가 올바르지 않습니다.")`를 던진다.
- 성공 시 기존 `issueTokenPair(user)`를 재사용한다.

## 작업 5: 백엔드 SecurityConfig 수정

### 파일

- 수정: `backend/src/main/java/com/app/golgo/auth/security/SecurityConfig.java`

### 변경

- `POST /auth/test-login`을 permitAll에 추가한다.
- `PasswordEncoder` bean을 추가한다.

## 작업 6: 백엔드 Controller 수정

### 파일

- 수정: `backend/src/main/java/com/app/golgo/auth/controller/AuthController.java`

### 변경

- `POST /auth/test-login` endpoint 추가
- 응답은 기존 `ApiResponse<TokenPair>` 사용

## 작업 7: 백엔드 테스트 추가

### 파일

- 수정 또는 생성: `backend/src/test/java/com/app/golgo/auth/service/AuthServiceTest.java`

### 검증

- 올바른 `test01/test01` 입력 시 `TokenPair`가 발급된다.
- 잘못된 비밀번호 입력 시 `AuthException`이 발생한다.

## 작업 8: 프론트 API 추가

### 파일

- 수정: `frontend/src/features/auth/api/auth-api.ts`

### 변경

- `directLogin(loginId, password)` API 추가
- 응답 타입은 기존 token pair 형태를 사용한다.

## 작업 9: 프론트 Auth Store 확장

### 파일

- 수정: `frontend/src/features/auth/store/auth-store.ts`

### 변경

- `loginWithPassword(loginId, password)` action 추가
- API 호출 후 `setTokens`, `loadUser` 흐름을 수행한다.
- 실패 시 error 상태를 설정한다.

## 작업 10: 프론트 로그인 화면에 직접 로그인 UI 추가

### 파일

- 수정: `frontend/src/features/auth/pages/LoginPage.tsx`

### 변경

- SSO 버튼 아래 또는 위에 직접 로그인 영역 추가
- 입력 필드:
  - 아이디
  - 비밀번호
- 기본값은 테스트 편의를 위해 `test01`, `test01`로 채울 수 있다.
- 버튼 문구: `테스트 계정으로 로그인`
- 성공 시 기존 인증 흐름과 동일하게 사용자 로드 후 `/nickname` 또는 `/`로 이동한다.

## 검증 계획

### 백엔드

```powershell
.\gradlew.bat test
```

### 프론트엔드

```powershell
npm run lint
npm run build
```

### 수동 확인

1. 백엔드 실행
2. 프론트 실행
3. 로그인 화면에서 `test01 / test01` 입력
4. 로그인 성공 alert 확인
5. `/nickname` 또는 `/` 이동 확인
6. `/auth/me`가 정상 호출되는지 확인

## 커밋 계획

변경 범위가 백엔드와 프론트엔드 양쪽에 걸치므로 관심사별로 2개 커밋으로 나눈다.

1. 백엔드 직접 로그인 API

```text
feat(auth): 테스트 직접 로그인 API 추가
```

2. 프론트 직접 로그인 UI

```text
feat(auth): 테스트 직접 로그인 화면 추가
```
