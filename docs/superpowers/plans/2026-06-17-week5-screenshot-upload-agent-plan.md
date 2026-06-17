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
- [ ] `parsed_holdings_json`, `edited_holdings_json`, `warnings_json`은 문자열로 매핑하고 서비스에서 Jackson으로 직렬화/역직렬화한다.
- [ ] `PortfolioScreenshotRepository`에 사용자 소유 job 조회 메서드를 추가한다.
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
- [ ] 파일 저장 후 parser를 호출한다.
- [ ] 파싱 성공 시 `COMPLETED`, 실패 시 `FAILED` job을 저장한다.
- [ ] holdings 수정 API는 전체 목록을 받아 `edited_holdings_json`으로 교체한다.
- [ ] 수정 시 총 자산은 `quantity * currentPrice` 합계로 재계산한다.
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
- [ ] multipart 업로드는 `FormData`를 사용한다.
- [ ] `use-screenshot-upload.ts`에 Query/Mutation 훅을 만든다.
- [ ] job 조회 훅은 상태가 `PROCESSING`일 때 1500ms 간격으로 polling한다.
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
- [ ] `COMPLETED`, `PENDING_CONFIRM` 상태에서는 holdings 목록을 보여준다.
- [ ] `CONFIRMED` 상태에서는 저장 완료 화면과 대시보드 CTA를 보여준다.
- [ ] holdings row에는 종목코드, 종목명, 시장, 수량, 평균가, 현재가, 평가금액을 표시한다.
- [ ] 평가금액은 `quantity * currentPrice`로 계산한다.
- [ ] `HoldingEditSheet`를 만들어 종목 추가/수정/삭제를 지원한다.
- [ ] “수정 내용 저장” 버튼은 전체 holdings 목록을 PATCH로 저장한다.
- [ ] “최종 저장” 버튼은 confirm API를 호출한다.

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
- `api-spec.md`는 업로드 응답을 `202 PROCESSING` 중심으로 설명하지만, fake parser를 동기 실행하면 즉시 `COMPLETED`가 될 수 있다. 최종 구현 후 Agent D가 명세와 실제 응답을 맞춘다.
- Week 4를 스킵했으므로 API Key 계좌 업그레이드와 KIS 실시간 동기화는 범위 밖이다.

## 자체 검토

- Week 5 요구사항인 업로드, 파싱 상태, 결과 수정, 최종 저장, 검증 흐름이 Task 1-8에 포함되어 있다.
- Week 4 KIS/API Key 작업은 명시적으로 제외했다.
- 백엔드 응답 타입과 프론트 타입의 이름을 맞추도록 계획했다.
- 실제 Vision API 의존 없이 구현 가능한 fake parser 전략을 명시했다.
