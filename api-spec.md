# Golgo (고르고) Backend API 명세서

> RESTful API · Base URL: `https://api.golgo.app/api/v1` 인증 방식: JWT Bearer Token (Header: `Authorization: Bearer {token}`)

---

## 0. 공통 규약

### 표준 응답 포맷

**성공 응답**

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-05-14T10:00:00Z"
}
```

**실패 응답**

```json
{
  "success": false,
  "error": {
    "code": "BROKER_001",
    "message": "증권사 토큰이 만료되었습니다",
    "detail": "Token expired at 2026-05-14T09:00:00Z"
  },
  "timestamp": "2026-05-14T10:00:00Z"
}
```

### HTTP 상태 코드

|코드|의미|
|---|---|
|200|정상 처리|
|201|리소스 생성 완료|
|204|정상 처리, 응답 본문 없음|
|400|요청 형식 오류|
|401|인증 필요 / 토큰 만료|
|403|권한 없음|
|404|리소스 없음|
|429|Rate Limit 초과|
|500|서버 오류|
|503|외부 API (증권사/LLM) 장애|

---

## 1. 인증 (Auth)

> 1차 구현은 **ID/PW 회원가입·로그인**을 우선 지원한다. 소셜 로그인은 배포 후 고도화 항목으로 분리하며, 추후 네이버·카카오·구글 OAuth 2.0을 다시 활성화한다.

### 계정 병합 정책

동일 이메일로 여러 소셜 Provider 로그인 시 **하나의 계정으로 자동 병합**.

```
예시:
① 구글(user@gmail.com)로 최초 가입 → userId: uuid-xxx 생성
② 카카오(user@gmail.com)로 로그인 시도
   → 이메일 일치 감지 → 기존 uuid-xxx 계정에 카카오 Provider 추가 연결
   → 이후 구글·카카오 둘 다로 로그인 가능
```

### 닉네임 정책

- 최초 가입 시: Provider에서 받은 닉네임 자동 설정 (기본값)
- 이후: 사용자가 언제든 직접 수정 가능
- 제약: 2~12자, 특수문자 불가, 중복 불가

### ID/PW 인증 흐름

```
① 프론트 → POST /auth/register 또는 POST /auth/login
② 백엔드 → 입력값 검증 및 비밀번호 BCrypt 검증
③ 백엔드 → 자체 JWT accessToken, refreshToken 발급
④ 프론트 → 토큰 저장 후 /auth/me 조회
⑤ 신규 가입자 → 온보딩 화면으로 이동
```

|Method|Endpoint|설명|인증|
|---|---|---|---|
|POST|`/auth/register`|ID/PW 회원가입 후 JWT 발급|❌|
|POST|`/auth/login`|ID/PW 로그인 후 JWT 발급|❌|
|POST|`/auth/refresh`|Access Token 갱신|❌ (Refresh Token 필요)|
|POST|`/auth/logout`|로그아웃 (Refresh Token 무효화)|✅|
|GET|`/auth/me`|내 정보 조회|✅|
|PATCH|`/auth/me/nickname`|닉네임 수정|✅|
|GET|`/auth/me/providers`|연결된 소셜 Provider 목록|✅|
|DELETE|`/auth/me/providers/{provider}`|소셜 Provider 연결 해제|✅|
|DELETE|`/auth/me`|회원 탈퇴|✅|

> `{provider}` 허용값: `kakao` · `naver` · `google`

### 1.1 POST `/auth/register`

사용자 계정을 생성하고 JWT를 발급한다.

**Request**

```json
{
  "loginId": "golgo01",
  "password": "Password!1",
  "name": "홍길동",
  "email": "user@example.com",
  "nickname": "투자초보"
}
```

**제약 조건**

|항목|규칙|
|---|---|
|loginId|4~50자, 중복 불가|
|password|대문자 1개 이상, 특수문자 1개 이상, 8자 이상|
|name|1~50자|
|email|이메일 형식, 중복 불가|
|nickname|한글, 영문, 숫자 2~12자, 중복 불가|

**Response (200)**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 900
  }
}
```

### 1.2 POST `/auth/login`

ID/PW를 검증하고 JWT를 발급한다.

**Request**

```json
{
  "loginId": "golgo01",
  "password": "Password!1"
}
```

**Response (200)**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 900
  }
}
```

### 1.8 GET `/auth/{provider}/login`

> 배포 후 소셜 로그인 고도화에서 재활성화한다.

브라우저를 각 Provider의 OAuth 인증 페이지로 Redirect.

**동작**: 서버가 302 Redirect → Provider 로그인 페이지

### 1.9 GET `/auth/{provider}/callback`

> 배포 후 소셜 로그인 고도화에서 재활성화한다.

Provider 인증 완료 후 자동 호출되는 Callback 엔드포인트.

**Query Parameters (Provider → 서버 전달)**

|파라미터|설명|
|---|---|
|`code`|Provider 발급 인가 코드|
|`state`|CSRF 방지용 난수값|

**처리 흐름**

1. `code`로 Provider Access Token 교환
2. Provider에서 사용자 정보 조회 (`providerId`, `email`, `nickname`, `profileImage`)
3. 이메일 기준 계정 병합 판단:
    - 이메일 미존재 → 신규 User 생성 + Provider 연결
    - 이메일 존재 + 해당 Provider 미연결 → 기존 계정에 Provider 추가 병합
    - 이메일 존재 + 해당 Provider 연결 → 기존 계정으로 로그인
4. 자체 JWT 발급 후 프론트로 Redirect

**Response**: 302 Redirect → `https://golgo.app/auth/callback?accessToken=eyJ...&refreshToken=eyJ...`

> 🔒 토큰을 URL에 그대로 노출하는 대신 단기 `code`로 교환하는 방식도 고려 가능 (보안 강화 시)

### 1.3 POST `/auth/refresh`

**Request**

```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response (200)**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "expiresIn": 900
  }
}
```

### 1.4 GET `/auth/me`

**Response (200)**

```json
{
  "success": true,
  "data": {
    "userId": "uuid-xxx",
    "email": "user@example.com",
    "nickname": "투자초보",
    "profileImage": "https://k.kakaocdn.net/...",
    "connectedProviders": ["KAKAO", "GOOGLE"],
    "createdAt": "2026-05-14T10:00:00Z"
  }
}
```

### 1.5 PATCH `/auth/me/nickname`

**Request**

```json
{
  "nickname": "고르고마스터"
}
```

**제약 조건**

|항목|규칙|
|---|---|
|길이|2 ~ 12자|
|허용 문자|한글, 영문, 숫자|
|중복|불가|

**Response (200)**

```json
{
  "success": true,
  "data": {
    "nickname": "고르고마스터",
    "updatedAt": "2026-05-14T10:00:00Z"
  }
}
```

### 1.6 GET `/auth/me/providers`

연결된 소셜 Provider 목록 조회.

**Response (200)**

```json
{
  "success": true,
  "data": {
    "providers": [
      {
        "provider": "KAKAO",
        "connectedAt": "2026-05-01T09:00:00Z"
      },
      {
        "provider": "GOOGLE",
        "connectedAt": "2026-05-14T10:00:00Z"
      }
    ]
  }
}
```

### 1.7 DELETE `/auth/me/providers/{provider}`

소셜 Provider 연결 해제.

> ⚠️ 마지막 남은 Provider는 해제 불가 (탈퇴 유도)

**Response (200)**

```json
{
  "success": true,
  "data": {
    "remainingProviders": ["GOOGLE"]
  }
}
```

---

## 2. 증권사 연동 (Broker)

> ### 연동 방식 정책
> 
> |증권사|지원 방식|비고|
> |---|---|---|
> |**한국투자증권 (KIS)**|`API_KEY` + `SCREENSHOT` 병행|사용자가 방식 선택|
> |**미래에셋증권**|`SCREENSHOT` 전용|공식 REST API 미제공|
> |추후 추가 증권사|`API_KEY` 또는 `SCREENSHOT`|`connectionType`으로 구분|
> 
> **KIS API_KEY 방식**: 사용자가 KIS 개발자 포털에서 본인 계좌 App Key를 직접 발급 후 등록 → 실시간 자동 동기화 **SCREENSHOT 방식**: MTS 보유종목 화면 캡처 업로드 → Vision API 파싱 → 수동 동기화

|Method|Endpoint|설명|인증|
|---|---|---|---|
|GET|`/brokers`|지원 증권사 목록 (방식별 지원 여부 포함)|✅|
|POST|`/brokers/connect/api-key`|App Key 방식 계좌 연결 (KIS 전용)|✅|
|POST|`/brokers/connect/screenshot`|캡처 방식 계좌 등록|✅|
|GET|`/brokers/accounts`|연결된 계좌 목록|✅|
|PATCH|`/brokers/accounts/{accountId}`|계좌 연결 방식 변경 (캡처 → API Key 업그레이드)|✅|
|DELETE|`/brokers/accounts/{accountId}`|계좌 연결 해제|✅|
|POST|`/brokers/accounts/{accountId}/sync`|API Key 방식 잔고 수동 동기화|✅|

### 2.1 GET `/brokers`

**Response (200)**

```json
{
  "success": true,
  "data": [
    {
      "brokerCode": "KIS",
      "name": "한국투자증권",
      "supportedConnectionTypes": ["API_KEY", "SCREENSHOT"],
      "supported": true
    },
    {
      "brokerCode": "MIRAE",
      "name": "미래에셋증권",
      "supportedConnectionTypes": ["SCREENSHOT"],
      "supported": true
    },
    {
      "brokerCode": "KIWOOM",
      "name": "키움증권",
      "supportedConnectionTypes": ["API_KEY", "SCREENSHOT"],
      "supported": false,
      "comingSoon": true
    }
  ]
}
```

### 2.2 POST `/brokers/connect/api-key`

KIS App Key 방식 계좌 연결. 사용자가 KIS 개발자 포털에서 직접 발급한 키를 등록.

**Request**

```json
{
  "brokerCode": "KIS",
  "appKey": "PSxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "appSecret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "accountNumber": "12345678-01",
  "accountNickname": "한투 메인계좌"
}
```

> 🔒 `appKey`, `appSecret`은 서버에서 AES-256 암호화 후 저장 💡 App Key 발급 방법 가이드: `GET /brokers/KIS/guide`

**Response (201)**

```json
{
  "success": true,
  "data": {
    "accountId": "acc-uuid-xxx",
    "brokerCode": "KIS",
    "connectionType": "API_KEY",
    "accountNickname": "한투 메인계좌",
    "accountNumber": "12345678-01",
    "connectedAt": "2026-05-14T10:00:00Z"
  }
}
```

### 2.3 POST `/brokers/connect/screenshot`

캡처 방식 계좌 등록. 실제 잔고 데이터는 이후 캡처 업로드로 별도 입력.

**Request**

```json
{
  "brokerCode": "MIRAE",
  "accountNickname": "미래에셋 메인"
}
```

**Response (201)**

```json
{
  "success": true,
  "data": {
    "accountId": "acc-uuid-xxx",
    "brokerCode": "MIRAE",
    "connectionType": "SCREENSHOT",
    "accountNickname": "미래에셋 메인",
    "connectedAt": "2026-05-14T10:00:00Z",
    "notice": "캡처 이미지를 업로드하면 보유 종목이 자동으로 구성됩니다."
  }
}
```

### 2.4 PATCH `/brokers/accounts/{accountId}`

캡처 방식 → App Key 방식으로 업그레이드. KIS 계좌에서만 사용 가능.

**Request**

```json
{
  "connectionType": "API_KEY",
  "appKey": "PSxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "appSecret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "accountNumber": "12345678-01"
}
```

**Response (200)**

```json
{
  "success": true,
  "data": {
    "accountId": "acc-uuid-xxx",
    "connectionType": "API_KEY",
    "upgradedAt": "2026-05-14T10:00:00Z"
  }
}
```

### 2.5 POST `/brokers/accounts/{accountId}/sync`

API Key 방식 계좌 전용 실시간 동기화.

**Response (200)**

```json
{
  "success": true,
  "data": {
    "accountId": "acc-uuid-xxx",
    "connectionType": "API_KEY",
    "syncedAt": "2026-05-14T10:00:00Z",
    "totalAssetKrw": 12500000,
    "holdingsCount": 7
  }
}
```

### 2.6 GET `/brokers/{brokerCode}/guide`

App Key 발급 단계별 가이드 (인앱 가이드용).

**Response (200)**

```json
{
  "success": true,
  "data": {
    "brokerCode": "KIS",
    "steps": [
      {
        "step": 1,
        "title": "KIS Developers 접속",
        "description": "apiportal.koreainvestment.com 에 접속하세요",
        "imageUrl": "https://assets.golgo.app/guides/kis-step1.png"
      },
      {
        "step": 2,
        "title": "서비스 신청",
        "description": "로그인 후 'KIS Developers 서비스 신청하기'를 클릭하세요",
        "imageUrl": "https://assets.golgo.app/guides/kis-step2.png"
      },
      {
        "step": 3,
        "title": "App Key 확인",
        "description": "신청 완료 후 발급된 App Key와 App Secret을 복사하세요",
        "imageUrl": "https://assets.golgo.app/guides/kis-step3.png"
      }
    ]
  }
}
```

---

## 2-B. 캡처 이미지 업로드 (공통)

KIS 캡처 방식 및 미래에셋 모두 동일 엔드포인트 사용.

### 2-B.1 POST `/portfolio/screenshot`

**Request** `multipart/form-data`

|필드|타입|필수|설명|
|---|---|---|---|
|image|file|✅|PNG/JPG, 최대 10MB|
|accountId|string|✅|연결된 계좌 ID|

**Response (202 Accepted)**

```json
{
  "success": true,
  "data": {
    "jobId": "job-uuid-xxx",
    "status": "PROCESSING",
    "estimatedSeconds": 10
  }
}
```

### 2-B.2 GET `/portfolio/screenshot/{jobId}`

**Response (200) — 파싱 완료**

```json
{
  "success": true,
  "data": {
    "jobId": "job-uuid-xxx",
    "status": "COMPLETED",
    "brokerCode": "MIRAE",
    "accountNickname": "미래에셋 메인",
    "parsedAt": "2026-05-14T10:00:05Z",
    "confidence": 0.97,
    "holdings": [
      {
        "ticker": "005930",
        "name": "삼성전자",
        "market": "KOSPI",
        "quantity": 50,
        "avgPrice": 68000,
        "currentPrice": 72000,
        "currentValueKrw": 3600000,
        "profitRate": 5.88
      },
      {
        "ticker": "AAPL",
        "name": "Apple Inc.",
        "market": "NASDAQ",
        "quantity": 10,
        "avgPrice": 178.50,
        "currentPrice": 195.30,
        "currentValueKrw": 2700000,
        "profitRate": 9.41
      }
    ],
    "totalAssetKrw": 12500000,
    "warnings": [
      "일부 항목의 인식 신뢰도가 낮습니다. 직접 확인을 권장합니다."
    ]
  }
}
```

**Response (200) — 파싱 실패**

```json
{
  "success": true,
  "data": {
    "jobId": "job-uuid-xxx",
    "status": "FAILED",
    "errorReason": "PARSE_ERROR",
    "message": "이미지에서 보유 종목을 인식할 수 없습니다. 캡처 화면을 확인해 주세요."
  }
}
```

> ⚠️ `confidence` 0.85 미만 시 사용자에게 수동 확인 요청 권고 💡 지원 화면: 미래에셋 M-Stock 잔고·보유종목, KIS MTS 보유종목

### 2-B.3 PATCH `/portfolio/screenshot/{jobId}/holdings`

파싱 완료 후 사용자가 인식된 종목 내용을 직접 수정.

- 종목 추가 / 수정 / 삭제 모두 가능
- 저장 전 최종 확인 단계에서만 호출 (임시 수정 상태 유지)

**Request**

```json
{
  "holdings": [
    {
      "action": "UPDATE",
      "ticker": "005930",
      "name": "삼성전자",
      "market": "KOSPI",
      "quantity": 55,
      "avgPrice": 67500,
      "currentPrice": 72000
    },
    {
      "action": "DELETE",
      "ticker": "AAPL"
    },
    {
      "action": "ADD",
      "ticker": "MSFT",
      "name": "Microsoft Corp.",
      "market": "NASDAQ",
      "quantity": 5,
      "avgPrice": 410.00,
      "currentPrice": 425.00
    }
  ]
}
```

|`action`|설명|
|---|---|
|`UPDATE`|수량·단가 수정|
|`DELETE`|종목 삭제|
|`ADD`|종목 직접 추가|

**Response (200)**

```json
{
  "success": true,
  "data": {
    "jobId": "job-uuid-xxx",
    "status": "PENDING_CONFIRM",
    "holdings": [
      {
        "ticker": "005930",
        "name": "삼성전자",
        "market": "KOSPI",
        "quantity": 55,
        "avgPrice": 67500,
        "currentPrice": 72000,
        "currentValueKrw": 3960000,
        "profitRate": 6.67,
        "isManuallyEdited": true
      },
      {
        "ticker": "MSFT",
        "name": "Microsoft Corp.",
        "market": "NASDAQ",
        "quantity": 5,
        "avgPrice": 410.00,
        "currentPrice": 425.00,
        "currentValueKrw": 3102500,
        "profitRate": 3.66,
        "isManuallyEdited": true
      }
    ],
    "totalAssetKrw": 13500000
  }
}
```

> 💡 `isManuallyEdited: true` 항목은 프론트에서 수정됨 뱃지로 표시

### 2-B.4 POST `/portfolio/screenshot/{jobId}/confirm`

수정 완료 후 최종 저장. `HOLDINGS` 테이블에 UPSERT 실행.

**Request**

```json
{
  "confirmedHoldings": [
    {
      "ticker": "005930",
      "name": "삼성전자",
      "market": "KOSPI",
      "quantity": 55,
      "avgPrice": 67500,
      "currentPrice": 72000
    }
  ],
  "totalAssetKrw": 13500000
}
```

**Response (200)**

```json
{
  "success": true,
  "data": {
    "jobId": "job-uuid-xxx",
    "status": "CONFIRMED",
    "savedHoldingsCount": 3,
    "savedAt": "2026-05-14T10:05:00Z"
  }
}
```

> ⚠️ `confirm` 호출 전까지는 `HOLDINGS` 테이블에 반영되지 않음 💡 `confirm` 이후 포트폴리오 스냅샷 자동 생성

---

## 3. 포트폴리오 (Portfolio)

|Method|Endpoint|설명|인증|
|---|---|---|---|
|GET|`/portfolio`|통합 포트폴리오 조회|✅|
|GET|`/portfolio/holdings`|보유 종목 목록|✅|
|GET|`/portfolio/holdings/{ticker}`|특정 종목 상세|✅|
|GET|`/portfolio/history`|자산 변동 이력 (기간별)|✅|
|GET|`/portfolio/performance`|수익률 통계|✅|
|GET|`/portfolio/accounts/sync-status`|계좌별 동기화 상태 조회|✅|
|POST|`/portfolio/screenshot`|캡처 업로드로 포트폴리오 최신화|✅|
|GET|`/portfolio/screenshot/{jobId}`|캡처 파싱 진행 상태 조회|✅|
|PATCH|`/portfolio/screenshot/{jobId}/holdings`|파싱 결과 수동 수정|✅|
|POST|`/portfolio/screenshot/{jobId}/confirm`|수정 내용 최종 저장|✅|
|GET|`/portfolio/screenshot/history`|캡처 업로드 이력|✅|
|PATCH|`/portfolio/holdings/{ticker}`|보유 종목 직접 수정 (수동 포트폴리오용)|✅|
|POST|`/portfolio/holdings`|종목 직접 추가|✅|
|DELETE|`/portfolio/holdings/{ticker}`|종목 직접 삭제|✅|

### 3.1 GET `/portfolio`

**Query Parameters**

|파라미터|타입|필수|설명|
|---|---|---|---|
|accountId|string|❌|특정 계좌만 조회 (생략 시 전체)|

**Response (200)**

```json
{
  "success": true,
  "data": {
    "totalAssetKrw": 12500000,
    "totalProfitKrw": 1500000,
    "profitRate": 13.6,
    "accounts": [
      {
        "accountId": "acc-uuid-xxx",
        "brokerCode": "KIS",
        "accountNickname": "한투 메인",
        "connectionType": "API_KEY",
        "lastSyncedAt": "2026-05-14T10:00:00Z",
        "syncStatus": "SYNCED"
      },
      {
        "accountId": "acc-uuid-yyy",
        "brokerCode": "MIRAE",
        "accountNickname": "미래에셋 메인",
        "connectionType": "SCREENSHOT",
        "lastSyncedAt": "2026-05-12T09:30:00Z",
        "syncStatus": "OUTDATED",
        "daysSinceSync": 2
      }
    ],
    "holdings": [
      {
        "ticker": "AAPL",
        "name": "Apple Inc.",
        "market": "NASDAQ",
        "quantity": 10,
        "avgPrice": 180.50,
        "currentPrice": 195.30,
        "currentValueKrw": 2700000,
        "weight": 21.6,
        "profitRate": 8.2,
        "accountId": "acc-uuid-xxx"
      }
    ],
    "updatedAt": "2026-05-14T10:00:00Z"
  }
}
```

> 💡 `syncStatus` 값: `SYNCED`(정상), `OUTDATED`(3일 이상 미업데이트), `ERROR`(연동 오류) 💡 `OUTDATED` 계좌가 있으면 프론트에서 "캡처 최신화" 배너 노출

### 3.2 GET `/portfolio/accounts/sync-status`

계좌별 동기화 상태를 가볍게 조회하는 전용 엔드포인트 (대시보드 배너 표시용).

**Response (200)**

```json
{
  "success": true,
  "data": [
    {
      "accountId": "acc-uuid-xxx",
      "brokerCode": "KIS",
      "connectionType": "API_KEY",
      "syncStatus": "SYNCED",
      "lastSyncedAt": "2026-05-14T10:00:00Z"
    },
    {
      "accountId": "acc-uuid-yyy",
      "brokerCode": "MIRAE",
      "connectionType": "SCREENSHOT",
      "syncStatus": "OUTDATED",
      "lastSyncedAt": "2026-05-12T09:30:00Z",
      "daysSinceSync": 2,
      "nudgeMessage": "미래에셋 포트폴리오가 2일 전 기준입니다. 최신화해 주세요."
    }
  ]
}
```

### 3.5 GET `/portfolio/screenshot/history`

캡처 업로드 이력 조회. 계좌별 마지막 업로드 시점 확인용.

**Query Parameters**

|파라미터|타입|필수|설명|
|---|---|---|---|
|accountId|string|❌|특정 계좌 필터|
|limit|number|❌|기본 10|

**Response (200)**

```json
{
  "success": true,
  "data": [
    {
      "jobId": "job-uuid-xxx",
      "accountId": "acc-uuid-yyy",
      "brokerCode": "MIRAE",
      "accountNickname": "미래에셋 메인",
      "status": "COMPLETED",
      "confidence": 0.97,
      "holdingsCount": 5,
      "totalAssetKrw": 12500000,
      "requestedAt": "2026-05-14T10:00:00Z"
    }
  ]
}
```

---

### 3.7 GET `/portfolio/history`

**Query Parameters** | interval | string | ❌ | `DAILY`, `WEEKLY` (기본 `DAILY`) |

**Response (200)**

```json
{
  "success": true,
  "data": {
    "period": "1M",
    "snapshots": [
      { "date": "2026-04-14", "totalAssetKrw": 11000000 },
      { "date": "2026-04-15", "totalAssetKrw": 11200000 }
    ]
  }
}
```

---

## 4. 투자 전략 (Strategy)

|Method|Endpoint|설명|인증|
|---|---|---|---|
|GET|`/strategies`|전략 템플릿 목록|✅|
|GET|`/strategies/my`|내 활성 전략 조회|✅|
|POST|`/strategies/my`|내 전략 생성/수정|✅|
|PUT|`/strategies/my/target-weights`|목표 비중 설정|✅|

### 4.1 GET `/strategies`

**Response (200)**

```json
{
  "success": true,
  "data": [
    {
      "strategyCode": "PASSIVE_INDEX",
      "name": "적립식 지수 투자",
      "description": "S&P500, KOSPI200 등 지수 ETF 중심의 안정 적립",
      "riskLevel": "LOW"
    },
    {
      "strategyCode": "AGGRESSIVE_SECTOR",
      "name": "공격적 섹터 투자",
      "description": "AI/반도체 등 고성장 섹터 집중",
      "riskLevel": "HIGH"
    }
  ]
}
```

### 4.2 POST `/strategies/my`

**Request**

```json
{
  "strategyCode": "AGGRESSIVE_SECTOR",
  "riskTolerance": "HIGH",
  "investmentHorizon": "LONG_TERM",
  "monthlyDepositKrw": 500000,
  "preferredSectors": ["AI", "SEMICONDUCTOR", "BIOTECH"]
}
```

**Response (201)**

```json
{
  "success": true,
  "data": {
    "strategyId": "stg-uuid-xxx",
    "strategyCode": "AGGRESSIVE_SECTOR",
    "activatedAt": "2026-05-14T10:00:00Z"
  }
}
```

### 4.3 PUT `/strategies/my/target-weights`

**Request**

```json
{
  "weights": [
    { "ticker": "AAPL", "targetWeight": 30.0 },
    { "ticker": "NVDA", "targetWeight": 40.0 },
    { "ticker": "QQQ", "targetWeight": 30.0 }
  ]
}
```

> ⚠️ `targetWeight` 합계는 반드시 100.0

---

## 5. AI 분석 (Analysis)

|Method|Endpoint|설명|인증|
|---|---|---|---|
|POST|`/analysis/reports`|신규 분석 리포트 생성 (비동기)|✅|
|GET|`/analysis/reports/{reportId}`|분석 리포트 조회|✅|
|GET|`/analysis/reports`|내 리포트 이력|✅|
|GET|`/analysis/reports/{reportId}/status`|분석 진행 상태|✅|

### 5.1 POST `/analysis/reports`

**Request**

```json
{
  "ticker": "NVDA",
  "analysisType": "DEEP_INFERENCE",
  "llmProvider": "GEMINI"
}
```

|analysisType|설명|
|---|---|
|`QUICK`|핵심 요약만 (3단계)|
|`DEEP_INFERENCE`|7단계 심층 분석|

**Response (202 Accepted)**

```json
{
  "success": true,
  "data": {
    "reportId": "rpt-uuid-xxx",
    "status": "PROCESSING",
    "estimatedSeconds": 45
  }
}
```

### 5.2 GET `/analysis/reports/{reportId}`

**Response (200) — Structured Output 강제**

```json
{
  "success": true,
  "data": {
    "reportId": "rpt-uuid-xxx",
    "ticker": "NVDA",
    "status": "COMPLETED",
    "generatedAt": "2026-05-14T10:01:30Z",
    "sections": {
      "businessModel": {
        "summary": "GPU 설계 및 CUDA 생태계 기반 AI 인프라 공급",
        "revenueStreams": ["데이터센터", "게이밍", "오토모티브"],
        "score": 9
      },
      "industryStructure": {
        "moat": "STRONG",
        "cyclePosition": "EXPANSION",
        "competitors": ["AMD", "Intel"],
        "score": 8
      },
      "financials": {
        "roic": 45.2,
        "fcfMarginPct": 38.5,
        "earningsQuality": "HIGH",
        "score": 9
      },
      "valuation": {
        "per": 65.2,
        "pbr": 32.1,
        "psr": 28.5,
        "dcfFairValue": 850.00,
        "judgment": "OVERVALUED",
        "score": 5
      },
      "earningsCall": {
        "guidanceChange": "RAISED",
        "managementTone": "POSITIVE",
        "score": 8
      },
      "macroPolicy": {
        "interestRateImpact": "NEGATIVE",
        "fxImpact": "NEUTRAL",
        "regulationRisk": "MEDIUM",
        "score": 6
      },
      "catalystsAndRisks": {
        "catalysts": ["Blackwell 출시", "AI 수요 지속"],
        "risks": ["중국 수출 규제", "고객 집중도"],
        "selfRebuttal": "AI 수요가 둔화되면 PER 30배까지 조정 가능",
        "score": 7
      }
    },
    "investmentThesis": "단기 밸류에이션 부담 있으나 장기 AI 인프라 독점력 유효",
    "overallScore": 7.4,
    "recommendation": "HOLD"
  }
}
```

### 5.3 GET `/analysis/reports/{reportId}/status`

> 💡 폴링용 가벼운 엔드포인트 (Redis 캐시 기반)

**Response (200)**

```json
{
  "success": true,
  "data": {
    "reportId": "rpt-uuid-xxx",
    "status": "PROCESSING",
    "progressPct": 60,
    "currentStep": "VALUATION"
  }
}
```

---

## 6. 리밸런싱 (Rebalancing)

|Method|Endpoint|설명|인증|
|---|---|---|---|
|GET|`/rebalancing/preview`|리밸런싱 시뮬레이션|✅|
|POST|`/rebalancing/execute`|매매 실행 (Phase 4)|✅|
|GET|`/rebalancing/history`|리밸런싱 이력|✅|

### 6.1 GET `/rebalancing/preview`

**Query Parameters**

|파라미터|타입|필수|설명|
|---|---|---|---|
|accountId|string|✅|대상 계좌|
|threshold|number|❌|괴리율 임계치 (%) 기본 5.0|

**Response (200)**

```json
{
  "success": true,
  "data": {
    "accountId": "acc-uuid-xxx",
    "totalAssetKrw": 12500000,
    "rebalanceActions": [
      {
        "ticker": "AAPL",
        "currentWeight": 21.6,
        "targetWeight": 30.0,
        "deviation": -8.4,
        "action": "BUY",
        "quantity": 5,
        "estimatedAmountKrw": 1050000
      },
      {
        "ticker": "NVDA",
        "currentWeight": 45.0,
        "targetWeight": 40.0,
        "deviation": 5.0,
        "action": "SELL",
        "quantity": 2,
        "estimatedAmountKrw": 625000
      },
      {
        "ticker": "QQQ",
        "currentWeight": 33.4,
        "targetWeight": 30.0,
        "deviation": 3.4,
        "action": "HOLD",
        "quantity": 0,
        "estimatedAmountKrw": 0
      }
    ],
    "estimatedFeeKrw": 8500,
    "calculatedAt": "2026-05-14T10:00:00Z"
  }
}
```

### 6.2 POST `/rebalancing/execute`

> ⚠️ Phase 4 기능. 모의투자 환경에서만 활성화

**Request**

```json
{
  "accountId": "acc-uuid-xxx",
  "actions": [
    { "ticker": "AAPL", "action": "BUY", "quantity": 5, "orderType": "MARKET" },
    { "ticker": "NVDA", "action": "SELL", "quantity": 2, "orderType": "LIMIT", "limitPrice": 195.00 }
  ],
  "confirmationToken": "user-otp-xxx"
}
```

**Response (200)**

```json
{
  "success": true,
  "data": {
    "executionId": "exec-uuid-xxx",
    "status": "SUBMITTED",
    "orders": [
      { "ticker": "AAPL", "orderId": "ord-xxx-1", "status": "PENDING" },
      { "ticker": "NVDA", "orderId": "ord-xxx-2", "status": "PENDING" }
    ]
  }
}
```

---

## 7. 알림 (Notifications)

|Method|Endpoint|설명|인증|
|---|---|---|---|
|POST|`/notifications/subscribe`|PWA Push 구독 등록|✅|
|DELETE|`/notifications/subscribe`|구독 해제|✅|
|GET|`/notifications`|알림 이력|✅|
|PUT|`/notifications/{id}/read`|읽음 처리|✅|
|GET|`/notifications/settings`|알림 설정 조회|✅|
|PUT|`/notifications/settings`|알림 설정 변경|✅|

### 7.1 POST `/notifications/subscribe`

**Request (Web Push Subscription)**

```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/xxx",
  "keys": {
    "p256dh": "BNc...",
    "auth": "tBHI..."
  },
  "deviceType": "IOS_PWA"
}
```

**Response (201)**

```json
{
  "success": true,
  "data": {
    "subscriptionId": "sub-uuid-xxx"
  }
}
```

### 7.2 PUT `/notifications/settings`

**Request**

```json
{
  "rebalanceAlert": true,
  "deviationThreshold": 5.0,
  "priceAlert": false,
  "weeklyReport": true,
  "quietHours": { "start": "22:00", "end": "08:00" }
}
```

---

## 8. 시장 데이터 (Market) — 보조

|Method|Endpoint|설명|인증|
|---|---|---|---|
|GET|`/market/quote/{ticker}`|실시간 시세 (캐시 30초)|✅|
|GET|`/market/search`|종목 검색|✅|

### 8.1 GET `/market/quote/{ticker}`

**Response (200)**

```json
{
  "success": true,
  "data": {
    "ticker": "NVDA",
    "name": "NVIDIA Corp.",
    "currentPrice": 875.50,
    "changePct": 2.3,
    "volume": 45000000,
    "marketCap": 2150000000000,
    "currency": "USD",
    "fetchedAt": "2026-05-14T10:00:00Z"
  }
}
```

---

## 9. 에러 코드 표

|코드|HTTP|설명|
|---|---|---|
|`AUTH_001`|401|토큰 만료|
|`AUTH_002`|401|유효하지 않은 토큰|
|`AUTH_003`|403|권한 없음|
|`AUTH_004`|502|소셜 Provider 응답 오류|
|`AUTH_005`|400|유효하지 않은 OAuth state (CSRF 감지)|
|`AUTH_006`|409|닉네임 중복|
|`AUTH_007`|400|닉네임 형식 오류 (길이·문자 제약 위반)|
|`AUTH_008`|400|마지막 Provider 해제 불가|
|`BROKER_001`|503|증권사 토큰 만료|
|`BROKER_002`|503|증권사 API 응답 오류|
|`BROKER_003`|429|증권사 Rate Limit 초과|
|`BROKER_004`|400|잘못된 계좌번호|
|`BROKER_005`|400|해당 증권사는 API Key 방식 미지원|
|`BROKER_006`|409|이미 API Key 방식으로 연결된 계좌|
|`SCREENSHOT_001`|400|지원하지 않는 이미지 형식|
|`SCREENSHOT_002`|400|이미지 파일 크기 초과 (10MB)|
|`SCREENSHOT_003`|422|이미지에서 보유 종목 인식 실패|
|`SCREENSHOT_004`|404|파싱 작업(jobId) 없음|
|`SCREENSHOT_005`|400|이미 confirm된 작업은 수정 불가|
|`SCREENSHOT_006`|400|종목 코드를 찾을 수 없음 (ADD 시)|
|`PORTFOLIO_001`|404|보유 종목 없음|
|`STRATEGY_001`|400|비중 합계 100% 불일치|
|`LLM_001`|503|LLM API 응답 오류|
|`LLM_002`|500|LLM 응답 파싱 실패|
|`LLM_003`|429|LLM 호출 한도 초과|
|`REBALANCE_001`|400|매매 가능 시간 외|
|`REBALANCE_002`|400|잔고 부족|

---

## 10. Rate Limiting

|엔드포인트 그룹|제한|비고|
|---|---|---|
|`/auth/*`|10 req / min|무차별 대입 방지|
|`/analysis/reports` (POST)|5 req / hour|LLM 비용 절감|
|`/portfolio/screenshot` (POST)|10 req / hour|Vision API 비용 절감|
|`/brokers/accounts/*/sync`|20 req / min|증권사 Rate Limit 대응|
|그 외|60 req / min|기본값|

> 🔧 Upstash Redis를 활용한 Sliding Window 카운터로 구현

---

## 11. 데이터 모델 요약

```
User ─┬─ BrokerAccount ─── Holding
      │   └─ (connectionType: REST_API | SCREENSHOT)
      ├─ PortfolioScreenshot ─── Holding (캡처 파싱 결과)
      ├─ Strategy ──── TargetWeight
      ├─ AnalysisReport ─── ReportSection
      ├─ RebalanceExecution ─── Order
      └─ NotificationSubscription
```
