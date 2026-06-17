# Week 5 MTS 캡처 업로드 구현 계획서

> **Agent 작업자 필수 지침:** 이 계획을 구현할 때는 `superpowers:subagent-driven-development` 또는 `superpowers:executing-plans`를 사용한다. 각 작업은 체크박스(`- [ ]`) 기준으로 진행 상태를 추적한다.

**목표:** Week 4 KIS API 연동은 스킵하고, Week 5 범위인 MTS 캡처 업로드 기반 포트폴리오 입력 흐름을 구현한다.

**아키텍처:** 백엔드는 캡처 방식 계좌 등록, 이미지 업로드 검증, 파싱 작업 상태, 파싱 결과 수정, 최종 확정 저장을 담당한다. Vision/OCR 연동은 `ScreenshotParser` 인터페이스 뒤로 숨기고, 로컬/테스트 환경에서는 deterministic fake parser를 사용한다. 프론트엔드는 모바일 기준 업로드 화면, 파싱 진행 상태, 결과 확인/수정 화면, 최종 저장 흐름을 TanStack Query 기반으로 구현한다.

**기술 스택:** Spring Boot 3.5, Java 21, Spring Data JPA, Flyway, PostgreSQL/Supabase, React 19, Vite, TanStack Query, Zustand, Tailwind CSS, lucide-react.

## 전역 제약

- Week 4는 스킵한다. KIS 토큰 발급, API Key 동기화, BrokerAdapter, Redis Rate Limit, Spring Batch 토큰 갱신 작업은 구현하지 않는다.
- 이번 범위는 `SCREENSHOT` 방식 계좌만 지원한다.
- 테스트와 로컬 개발에서 유료 Vision API를 호출하지 않는다.
- 업로드 이미지는 우선 로컬 파일 시스템에 저장한다. 추후 Supabase Storage로 교체 가능하도록 storage 인터페이스를 둔다.
- `confirm` 호출 전까지는 `holdings` 테이블에 반영하지 않는다.
- Week 5의 fake parser는 원화 평가금액 계산이 가능한 샘플만 다룬다. 해외주식 환율 환산과 실시간 시세 보정은 Week 6 이후 포트폴리오/시장 데이터 범위로 넘긴다.
- 업로드 응답은 job 모델을 유지하되, fake parser가 동기 처리되면 응답 데이터의 `status`가 즉시 `COMPLETED`일 수 있다. 프론트는 `PROCESSING`과 즉시 완료를 모두 처리한다.
- 변경은 Week 5 캡처 업로드 범위로 제한한다.
- API 응답은 기존 `ApiResponse<T>` 형식을 따른다.
- 인증은 기존 JWT Guard와 `@AuthenticationPrincipal JwtPrincipal`을 사용한다.
- 완료 전 검증은 백엔드 테스트, 프론트 린트, 프론트 빌드, `git diff --check`로 확인한다.

---

## Agent Team 구성

| Agent | 담당 범위 | 주요 작업 | 의존성 |
|---|---|---|---|
| Agent A - 백엔드 도메인 | JPA 엔티티, Repository, Service, Controller | Task 1-3 | Agent B의 parser/storage 인터페이스 |
| Agent B - Parser/Storage | 이미지 저장, 파일 검증, fake parser | Task 4 | Agent A의 업로드 서비스에서 사용 |
| Agent C - 프론트엔드 | 업로드, 폴링, 결과 수정, 최종 저장 UI | Task 5-7 | 백엔드 API 계약 |
| Agent D - 통합 QA | 계약 검증, 전체 테스트, 문서 정리 | Task 8 | A-C 완료 후 실행 |

병렬화 기준:

- Agent A와 Agent B는 인터페이스만 먼저 합의하면 동시에 시작할 수 있다.
- Agent C는 라우팅과 타입 스캐폴딩을 먼저 진행할 수 있으나, 실제 API 연결은 Agent A의 응답 계약 확정 후 진행한다.
- Agent D는 백엔드와 프론트 작업이 모두 합쳐진 뒤 실행한다.

---

## 현재 코드 기준

- `broker_accounts`, `holdings`, `portfolio_screenshots` 테이블은 이미 `backend/src/main/resources/db/migration/V1__init.sql`에 존재한다.
- 아직 백엔드에는 `broker`, `portfolio`, `screenshot` 도메인 패키지가 없다.
- `frontend/src/app/providers.tsx`에는 TanStack Query Provider가 이미 있다.
- `frontend/src/lib/api/client.ts`는 JWT access token 주입과 refresh 처리를 이미 담당한다.
- `frontend/src/features/onboarding/pages/OnboardingPage.tsx`는 MTS 캡처를 온보딩 후 흐름으로 안내하지만 실제 업로드는 없다.
- Week 4를 스킵하므로 Week 5에서 캡처 방식 계좌 등록에 필요한 최소 Broker API를 함께 구현한다.

결정 사항:

- `POST /brokers/connect/screenshot`, `GET /brokers/accounts`만 최소 구현한다.
- `POST /portfolio/screenshot`은 `accountId`를 필수로 받는다.
- 계좌를 자동 생성하며 업로드하는 방식은 API 계약이 흐려지므로 사용하지 않는다.
- `portfolio_screenshots`의 JSONB 컬럼은 문자열 컬럼으로 우회하지 않는다. Hibernate 6의 `@JdbcTypeCode(SqlTypes.JSON)`과 `JsonNode` 또는 명시적 converter를 사용해 PostgreSQL JSONB 타입에 맞춰 저장한다.
- `holdings` 최종 반영은 delete-then-insert를 사용하되, 반드시 단일 `@Transactional` 안에서 수행한다. 동일 계좌의 기존 holdings 삭제, 신규 holdings 저장, 계좌 `last_synced_at` 갱신, screenshot `CONFIRMED` 전이가 모두 함께 성공하거나 함께 롤백되어야 한다.

---

## 파일 구조

### 백엔드 생성/수정 파일

- `backend/src/main/java/com/app/golgo/broker/entity/BrokerAccount.java`
- `backend/src/main/java/com/app/golgo/broker/entity/BrokerConnectionType.java`
- `backend/src/main/java/com/app/golgo/broker/repository/BrokerAccountRepository.java`
- `backend/src/main/java/com/app/golgo/broker/dto/ScreenshotBrokerConnectRequest.java`
- `backend/src/main/java/com/app/golgo/broker/dto/BrokerAccountResponse.java`
- `backend/src/main/java/com/app/golgo/broker/controller/BrokerController.java`
- `backend/src/main/java/com/app/golgo/broker/service/BrokerService.java`
- `backend/src/main/java/com/app/golgo/portfolio/entity/Holding.java`
- `backend/src/main/java/com/app/golgo/portfolio/entity/PortfolioScreenshot.java`
- `backend/src/main/java/com/app/golgo/portfolio/entity/ScreenshotStatus.java`
- `backend/src/main/java/com/app/golgo/portfolio/repository/HoldingRepository.java`
- `backend/src/main/java/com/app/golgo/portfolio/repository/PortfolioScreenshotRepository.java`
- `backend/src/main/java/com/app/golgo/portfolio/dto/*`
- `backend/src/main/java/com/app/golgo/portfolio/parser/*`
- `backend/src/main/java/com/app/golgo/portfolio/storage/*`
- `backend/src/main/java/com/app/golgo/portfolio/controller/PortfolioScreenshotController.java`
- `backend/src/main/java/com/app/golgo/portfolio/service/PortfolioScreenshotService.java`
- `backend/src/main/java/com/app/golgo/portfolio/service/ScreenshotException.java`
- `backend/src/main/java/com/app/golgo/common/api/GlobalExceptionHandler.java`
- `backend/src/main/resources/application.yml`
- `.gitignore` 또는 백엔드 ignore 설정: 로컬 업로드 저장 경로가 Git에 들어가지 않도록 `data/screenshots/` 계열 경로를 제외한다.
- `backend/src/test/java/com/app/golgo/broker/service/BrokerServiceTest.java`
- `backend/src/test/java/com/app/golgo/portfolio/service/PortfolioScreenshotServiceTest.java`
- `backend/src/test/java/com/app/golgo/portfolio/storage/LocalScreenshotStorageTest.java`

### 프론트엔드 생성/수정 파일

- `frontend/src/features/portfolio/types.ts`
- `frontend/src/features/portfolio/api/screenshot-api.ts`
- `frontend/src/features/portfolio/hooks/use-screenshot-upload.ts`
- `frontend/src/features/portfolio/pages/ScreenshotUploadPage.tsx`
- `frontend/src/features/portfolio/pages/ScreenshotReviewPage.tsx`
- `frontend/src/features/portfolio/components/HoldingEditSheet.tsx`
- `frontend/src/features/portfolio/components/ParsingProgress.tsx`
- `frontend/src/app/router.tsx`
- `frontend/src/features/auth/pages/HomePage.tsx`
- `frontend/src/features/onboarding/pages/OnboardingPage.tsx`

---

## Task 1: 캡처 방식 증권사 계좌 기반 구현

**담당:** Agent A - 백엔드 도메인

**목표:** Week 5 업로드가 사용할 `SCREENSHOT` 계좌를 생성하고 조회할 수 있게 한다.

**구현 API:**

- `POST /brokers/connect/screenshot`
- `GET /brokers/accounts`

**핵심 인터페이스:**

- `BrokerService.createScreenshotAccount(UUID userId, ScreenshotBrokerConnectRequest request): BrokerAccountResponse`
- `BrokerService.findActiveAccountForUser(UUID userId, UUID accountId): BrokerAccount`

**작업 절차:**

- [ ] `BrokerConnectionType` enum에 `API_KEY`, `SCREENSHOT`을 정의한다.
- [ ] `BrokerAccount` 엔티티를 `broker_accounts` 테이블에 매핑한다.
- [ ] API Key 관련 컬럼은 nullable로 매핑하되 Week 5에서는 setter를 만들지 않는다.
- [ ] `touchLastSyncedAt(Clock clock)` 같은 도메인 메서드를 만들어 confirm 흐름에서만 `last_synced_at`을 갱신한다.
- [ ] `BrokerAccountRepository`에 사용자 소유 활성 계좌 조회 메서드를 추가한다.
- [ ] `ScreenshotBrokerConnectRequest`에 `brokerCode`, `accountNickname` 검증을 추가한다.
- [ ] `BrokerService`에서 캡처 방식 계좌 생성과 소유권 검증을 구현한다.
- [ ] `BrokerController`에서 인증 사용자 기준 API를 노출한다.
- [ ] `BrokerServiceTest`를 작성한다.

**테스트 기준:**

```powershell
.\gradlew.bat test --tests com.app.golgo.broker.service.BrokerServiceTest
```

성공 기준:

- 캡처 계좌 생성 시 `connectionType`이 `SCREENSHOT`으로 저장된다.
- 다른 사용자의 계좌 조회는 실패한다.
- 삭제된 계좌는 조회되지 않는다.

---

## Task 2: 캡처 파싱 작업 상태 도메인 구현

**담당:** Agent A - 백엔드 도메인

**목표:** 업로드된 캡처 이미지의 파싱 작업 상태를 저장하고 조회할 수 있게 한다.

**구현 API:**

- `GET /portfolio/screenshot/{jobId}`

**핵심 인터페이스:**

- `PortfolioScreenshotService.getJob(UUID userId, UUID jobId): ScreenshotJobResponse`

**작업 절차:**

- [ ] `ScreenshotStatus` enum을 정의한다.
- [ ] `PortfolioScreenshot` 엔티티를 `portfolio_screenshots` 테이블에 매핑한다.
- [ ] `parsed_holdings_json`, `edited_holdings_json`, `warnings_json`은 JSONB로 매핑한다. 우선안은 `@JdbcTypeCode(SqlTypes.JSON)` + `JsonNode`이고, 테스트에서 PostgreSQL/H2 호환 문제가 생기면 AttributeConverter를 명시적으로 둔다.
- [ ] `PortfolioScreenshotRepository`에 사용자 소유 job 조회 메서드를 추가한다.
- [ ] confirm 대상 job 조회는 상태 변경 경쟁을 피하기 위해 서비스 트랜잭션 안에서 한 번만 수행한다. 같은 job을 두 번 confirm하면 두 번째 요청은 `SCREENSHOT_005`로 실패해야 한다.
- [ ] 상태별 응답 DTO를 만든다.
- [ ] `ScreenshotException`을 만들고 `GlobalExceptionHandler`에 매핑한다.
- [ ] `GET /portfolio/screenshot/{jobId}`를 구현한다.
- [ ] 상태 조회 테스트를 작성한다.

**상태별 응답 기준:**

- `PROCESSING`: `jobId`, `status`, `estimatedSeconds`
- `COMPLETED`: 파싱 결과, 신뢰도, 총 자산, 경고
- `PENDING_CONFIRM`: 수정된 holdings, 총 자산
- `FAILED`: 실패 사유와 사용자 메시지
- `CONFIRMED`: 저장 완료 상태와 저장 시각

**테스트 기준:**

```powershell
.\gradlew.bat test --tests com.app.golgo.portfolio.service.PortfolioScreenshotServiceTest
```

---

## Task 3: 업로드, 수정, 최종 저장 플로우 구현

**담당:** Agent A - 백엔드 도메인

**목표:** 캡처 파일을 업로드하고, 파싱 결과를 수정하고, 최종 확정 시 `holdings`에 저장한다.

**구현 API:**

- `POST /portfolio/screenshot`
- `PATCH /portfolio/screenshot/{jobId}/holdings`
- `POST /portfolio/screenshot/{jobId}/confirm`

**핵심 인터페이스:**

- `PortfolioScreenshotService.upload(UUID userId, UUID accountId, MultipartFile image): ScreenshotUploadResponse`
- `PortfolioScreenshotService.updateHoldings(UUID userId, UUID jobId, HoldingEditRequest request): ScreenshotJobResponse`
- `PortfolioScreenshotService.confirm(UUID userId, UUID jobId, HoldingConfirmRequest request): ScreenshotConfirmResponse`

**작업 절차:**

- [ ] `Holding` 엔티티를 `holdings` 테이블에 매핑한다.
- [ ] `HoldingRepository`에 계좌 기준 삭제/저장 흐름을 추가한다.
- [ ] 업로드 파일 검증을 구현한다.
- [ ] 업로드 시 계좌 소유권과 `SCREENSHOT` 방식 여부를 검증한다.
- [ ] 파일 저장 후 parser를 호출한다. fake parser는 동기 실행하지만 service 응답은 job 기반으로 유지한다.
- [ ] 파싱 성공 시 `COMPLETED`, 실패 시 `FAILED` job을 저장한다.
- [ ] holdings 수정 API는 전체 목록을 받아 `edited_holdings_json`으로 교체한다.
- [ ] 수정 시 총 자산은 `quantity * currentPrice` 합계로 재계산한다.
- [ ] 수정/확정 요청의 holdings는 ticker 중복을 거부한다.
- [ ] 수량, 평균가, 현재가는 0 이상 숫자만 허용한다. 수량은 0보다 커야 한다.
- [ ] Week 5에서는 `currency = KRW` 기준으로 `totalAssetKrw`를 계산한다. USD 등 외화 환산은 이번 범위에서 저장하지 않고 경고로 처리하거나 요청을 거부한다.
- [ ] confirm API는 이미 확정된 job을 거부한다.
- [ ] confirm API는 계좌의 기존 holdings를 교체 저장하고 job을 `CONFIRMED`로 변경한다.
- [ ] confirm 시 broker account의 `last_synced_at`도 갱신한다.

**파일 검증 기준:**

- `image/png`, `image/jpeg`만 허용
- 빈 파일 거부
- 10MB 초과 거부

**테스트 기준:**

```powershell
.\gradlew.bat test --tests com.app.golgo.portfolio.service.PortfolioScreenshotServiceTest
```

성공 기준:

- 잘못된 파일 형식은 `SCREENSHOT_001`로 실패한다.
- 10MB 초과는 `SCREENSHOT_002`로 실패한다.
- 업로드 성공 시 job이 생성된다.
- 수정 저장 시 상태가 `PENDING_CONFIRM`이 된다.
- 최종 저장 시 `holdings`가 교체되고 job이 `CONFIRMED`가 된다.
- 확정된 job을 다시 confirm하면 `SCREENSHOT_005`로 실패한다.
- confirm 도중 holdings 저장이 실패하면 screenshot 상태와 계좌 동기화 시각도 롤백된다.

---

## Task 4: Parser와 Local Storage Adapter 구현

**담당:** Agent B - Parser/Storage

**목표:** 실제 Vision API 없이도 Week 5 흐름이 동작하도록 저장소와 fake parser를 구현한다.

**핵심 인터페이스:**

- `ScreenshotParser.parse(Path imagePath): ParsedPortfolio`
- `ScreenshotStorage.store(UUID userId, MultipartFile image): StoredScreenshot`

**작업 절차:**

- [ ] `ParsedHolding`, `ParsedPortfolio` record를 정의한다.
- [ ] `ScreenshotParser` 인터페이스를 정의한다.
- [ ] `FakeScreenshotParser`를 `@Component`로 등록한다.
- [ ] fake parser는 삼성전자 샘플 holdings를 반환한다.
- [ ] `ScreenshotStorage` 인터페이스를 정의한다.
- [ ] `LocalScreenshotStorage`를 구현한다.
- [ ] `application.yml`에 storage 경로 설정을 추가한다.
- [ ] 원본 파일명은 저장 경로에 사용하지 않는다. 서버가 생성한 UUID 파일명과 허용된 확장자만 사용한다.
- [ ] 저장 대상 경로는 설정된 storage root 하위인지 확인한다.
- [ ] local storage 테스트를 작성한다.

**기본 storage 설정:**

```yaml
golgo:
  screenshot:
    storage-dir: ${GOLGO_SCREENSHOT_STORAGE_DIR:./data/screenshots}
```

**샘플 parser 결과:**

- ticker: `005930`
- name: `삼성전자`
- market: `KOSPI`
- quantity: `50`
- avgPrice: `68000`
- currentPrice: `72000`
- currency: `KRW`
- confidence: `0.970`

**테스트 기준:**

```powershell
.\gradlew.bat test --tests com.app.golgo.portfolio.storage.LocalScreenshotStorageTest
```

---

## Task 5: 프론트엔드 API 타입, 훅, 라우팅 구현

**담당:** Agent C - 프론트엔드

**목표:** 캡처 업로드 화면과 결과 확인 화면에서 사용할 API 타입과 TanStack Query 훅을 만든다.

**구현 라우트:**

- `/portfolio/screenshot`
- `/portfolio/screenshot/:jobId`

**작업 절차:**

- [ ] `frontend/src/features/portfolio/types.ts`에 API 계약 타입을 정의한다.
- [ ] `screenshot-api.ts`에 계좌 생성/조회, 업로드, job 조회, 수정, confirm API 함수를 만든다.
- [ ] multipart 업로드는 `FormData`를 사용한다. Axios가 boundary를 설정하도록 직접 `Content-Type`을 강제하지 않는다.
- [ ] `use-screenshot-upload.ts`에 Query/Mutation 훅을 만든다.
- [ ] job 조회 훅은 상태가 `PROCESSING`일 때 1500ms 간격으로 polling한다.
- [ ] upload 응답이 즉시 `COMPLETED`여도 review 화면으로 이동해 바로 결과를 보여준다.
- [ ] `router.tsx`에 업로드/리뷰 라우트를 추가한다.

**주요 훅:**

- `useBrokerAccounts()`
- `useCreateScreenshotAccount()`
- `useUploadScreenshot()`
- `useScreenshotJob(jobId)`
- `useEditScreenshotHoldings(jobId)`
- `useConfirmScreenshot(jobId)`

**검증 기준:**

```powershell
npm run typecheck
```

---

## Task 6: 캡처 업로드 화면과 파싱 진행 UI 구현

**담당:** Agent C - 프론트엔드

**목표:** 사용자가 캡처 방식 계좌를 선택/생성하고 PNG/JPG 이미지를 업로드할 수 있게 한다.

**작업 절차:**

- [ ] `ScreenshotUploadPage.tsx`를 만든다.
- [ ] `MobilePage` 기반 모바일 화면으로 구성한다.
- [ ] 기존 캡처 계좌 목록을 보여준다.
- [ ] 계좌가 없으면 `MIRAE`, `KIS`, `OTHER` 중 선택해 캡처 계좌를 만들 수 있게 한다.
- [ ] 드래그/탭 업로드 영역을 구현한다.
- [ ] 선택된 파일명과 크기를 표시한다.
- [ ] PNG/JPG, 10MB 이하만 클라이언트에서 허용한다.
- [ ] 서버 검증 실패 메시지는 사용자가 바로 수정할 수 있게 “형식”, “크기”, “계좌 선택” 중 무엇이 문제인지 구분해 표시한다.
- [ ] 업로드 성공 시 `/portfolio/screenshot/{jobId}`로 이동한다.
- [ ] `ParsingProgress` 컴포넌트로 파싱 진행 skeleton을 표시한다.
- [ ] `HomePage`에 “MTS 캡처 업로드” CTA를 추가한다.

**검증 기준:**

```powershell
npm run lint
```

---

## Task 7: 파싱 결과 확인, 수정, 최종 저장 UI 구현

**담당:** Agent C - 프론트엔드

**목표:** 사용자가 파싱 결과를 확인하고 holdings를 수정한 뒤 최종 저장할 수 있게 한다.

**작업 절차:**

- [ ] `ScreenshotReviewPage.tsx`를 만든다.
- [ ] `PROCESSING` 상태에서는 `ParsingProgress`를 보여준다.
- [ ] `FAILED` 상태에서는 업로드 재시도 CTA를 보여준다.
- [ ] job 조회 404 또는 권한 오류는 “작업을 찾을 수 없습니다” 화면과 업로드로 돌아가기 CTA를 보여준다.
- [ ] `COMPLETED`, `PENDING_CONFIRM` 상태에서는 holdings 목록을 보여준다.
- [ ] `CONFIRMED` 상태에서는 저장 완료 화면과 대시보드 CTA를 보여준다.
- [ ] holdings row에는 종목코드, 종목명, 시장, 수량, 평균가, 현재가, 평가금액을 표시한다.
- [ ] 평가금액은 `quantity * currentPrice`로 계산한다.
- [ ] `HoldingEditSheet`를 만들어 종목 추가/수정/삭제를 지원한다.
- [ ] “수정 내용 저장” 버튼은 전체 holdings 목록을 PATCH로 저장한다.
- [ ] “최종 저장” 버튼은 confirm API를 호출한다.
- [ ] 수정 내용 저장/최종 저장 중에는 버튼을 disabled 처리하고 중복 클릭을 막는다.
- [ ] PATCH 또는 confirm 실패 시 사용자가 입력한 로컬 편집 상태를 유지한다.

**편집 필드:**

- ticker
- name
- market
- quantity
- avgPrice
- currentPrice
- currency

**검증 기준:**

```powershell
npm run build
```

---

## Task 8: 통합 QA, 문서 정리, 커밋

**담당:** Agent D - 통합 QA

**목표:** Week 5 구현 전체가 API 계약과 UI 흐름을 만족하는지 검증하고 커밋한다.

**작업 절차:**

- [ ] 백엔드 전체 테스트를 실행한다.
- [ ] 프론트 린트를 실행한다.
- [ ] 프론트 빌드를 실행한다.
- [ ] `git diff --check`로 공백 오류를 확인한다.
- [ ] `git status --short`, `git diff --stat`으로 변경 범위를 확인한다.
- [ ] 로컬 smoke test를 수행한다.
- [ ] 로컬 저장 경로에 생성된 이미지가 Git 상태에 나타나지 않는지 확인한다.
- [ ] API 응답이 `api-spec.md`와 다르면 명세를 구현 기준에 맞게 갱신한다.
- [ ] 커밋 전 변경 파일 목록과 핵심 diff 요약을 보고한다.
- [ ] 검증 결과를 보고한 뒤 커밋한다.

**검증 명령:**

```powershell
.\gradlew.bat test
npm run lint
npm run build
git diff --check
```

**Smoke test 시나리오:**

- 로그인 또는 회원가입
- `/portfolio/screenshot` 이동
- 캡처 계좌 생성
- 10MB 이하 PNG/JPG 업로드
- fake parser가 반환한 삼성전자 holdings 확인
- 수량 수정
- 수정 내용 저장
- 최종 저장
- 새로고침 후 `CONFIRMED` 상태 확인

**커밋 메시지:**

```bash
git commit -m "feat(portfolio): MTS 캡처 업로드 구현"
```

Push는 사용자가 명시적으로 요청할 때만 수행한다.

---

## 리스크와 트레이드오프

- 실제 Vision API 파싱은 이번 계획에서 직접 붙이지 않는다. `ScreenshotParser` 뒤로 격리하고 fake parser로 전체 제품 흐름을 먼저 완성한다.
- 로컬 파일 저장은 개발과 smoke test에는 충분하지만, 운영 전에는 Supabase Storage로 교체하는 것이 좋다.
- `api-spec.md`는 업로드 응답을 `202 PROCESSING` 중심으로 설명하지만, fake parser를 동기 실행하면 즉시 `COMPLETED`가 될 수 있다. 구현에서는 job 모델을 유지하고, 최종 구현 후 Agent D가 명세와 실제 응답을 맞춘다.
- Week 4를 스킵했으므로 API Key 계좌 업그레이드와 KIS 실시간 동기화는 범위 밖이다.

## 자체 검토

- Week 5 요구사항인 업로드, 파싱 상태, 결과 수정, 최종 저장, 검증 흐름이 Task 1-8에 포함되어 있다.
- Week 4 KIS/API Key 작업은 명시적으로 제외했다.
- 백엔드 응답 타입과 프론트 타입의 이름을 맞추도록 계획했다.
- 실제 Vision API 의존 없이 구현 가능한 fake parser 전략을 명시했다.

## Autoplan 검토 결과

| Phase | 점수 | 판단 | 반영한 수정 |
|---|---:|---|---|
| CEO | 8/10 | Week 4를 스킵하고도 사용자에게 체험 가능한 캡처 입력 흐름을 먼저 여는 방향은 타당하다. | API Key/KIS 범위 제외를 유지하고, Week 5에서 캡처 계좌 최소 API만 구현하도록 고정했다. |
| Design | 7/10 | 업로드/리뷰/편집의 큰 흐름은 충분하지만 실패 상태와 중복 클릭 방지가 부족했다. | 실패 CTA, 404/권한 오류 화면, 저장 중 disabled, 로컬 편집 상태 유지 요구사항을 추가했다. |
| Eng | 7/10 | 도메인 분리는 적절하지만 JSONB 매핑, confirm 트랜잭션, 중복 confirm 방지가 불명확했다. | JSONB 매핑 방식, 단일 트랜잭션, `SCREENSHOT_005`, holdings 검증, rollback 성공 기준을 추가했다. |
| DX | 8/10 | 에이전트 분리와 검증 명령은 명확하다. 다만 multipart boundary와 로컬 저장 파일 Git 오염 방지 지침이 필요했다. | Axios `Content-Type` 강제 금지, storage root 검증, 저장 파일 ignore 확인을 추가했다. |

### Decision Audit Trail

| # | Phase | Decision | Classification | Rationale | Rejected |
|---|---|---|---|---|---|
| 1 | CEO | Week 4 스킵을 유지하고 Week 5는 캡처 계좌 + 업로드 흐름으로 제한 | Auto-decided | 사용자가 Week 4 스킵을 명시했고, 캡처 방식은 KIS API 없이도 독립 구현 가능하다. | KIS API Key 최소 구현 포함 |
| 2 | Eng | JSONB를 문자열 우회 대신 Hibernate JSON 매핑으로 처리 | Auto-decided | PostgreSQL JSONB 컬럼에 문자열을 그대로 쓰면 타입 캐스팅/테스트 괴리가 생길 수 있다. | 문자열 컬럼 + 수동 Jackson 직렬화만 사용 |
| 3 | Eng | confirm은 단일 트랜잭션으로 holdings 교체, 계좌 sync 시각, job 상태 전이를 묶음 | Auto-decided | 일부만 성공하면 포트폴리오 상태가 깨진다. | 단계별 개별 save |
| 4 | Design | 실패/권한 오류/중복 클릭 상태를 계획에 명시 | Auto-decided | 업로드 플로우는 모바일에서 재시도 가능성이 높고, 저장 중 중복 요청이 실제 데이터 중복 위험으로 이어진다. | 성공 경로 중심 UI |
| 5 | DX | multipart 업로드에서 Axios boundary 자동 설정을 따름 | Auto-decided | 수동 `Content-Type` 지정은 boundary 누락 문제를 만들 수 있다. | `multipart/form-data` 헤더 직접 지정 |

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `$autoplan` | Scope & strategy | 1 | clear | Week 4 스킵 유지, 캡처 방식 독립 구현으로 정리 |
| Design Review | `$autoplan` | UI/UX gaps | 1 | clear | 실패/재시도/중복 클릭 상태 보강 |
| Eng Review | `$autoplan` | Architecture & tests | 1 | clear | JSONB 매핑, confirm 트랜잭션, 중복 confirm 방지 보강 |
| DX Review | `$autoplan` | Developer experience gaps | 1 | clear | multipart boundary, 로컬 저장 파일 Git 오염 방지 보강 |

**VERDICT:** CEO + Design + Eng + DX 검토 반영 완료. Week 5 구현 착수 가능.

NO UNRESOLVED DECISIONS
