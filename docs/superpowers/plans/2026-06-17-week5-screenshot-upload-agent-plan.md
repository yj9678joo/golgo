# Week 5 Screenshot Upload Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Week 4 KIS API work is skipped, so Week 5 delivers the screenshot-based portfolio ingestion flow without depending on API Key broker integration.

**Architecture:** The backend owns screenshot account creation, multipart upload validation, parse job state, editable parsed holdings, and final confirmation into `holdings`. The Vision/OCR integration is isolated behind a parser port so local development can use a deterministic fake parser until real Vision credentials and prompts are approved. The frontend adds a mobile upload flow, polling, review/edit UI, and confirm flow using TanStack Query and the existing JWT API client.

**Tech Stack:** Spring Boot 3.5, Java 21, Spring Data JPA, Flyway, PostgreSQL/Supabase, React 19, Vite, TanStack Query, Zustand auth store, Tailwind CSS, lucide-react.

## Global Constraints

- Week 4 is skipped: do not implement KIS token issuance, API Key sync, BrokerAdapter, Redis rate limit, or Spring Batch token jobs.
- Screenshot uploads must work through `SCREENSHOT` broker accounts only.
- Do not call paid Vision APIs by default in tests or local development.
- Store uploaded image files under a configurable local storage path for now; Supabase Storage can replace this behind the same storage interface later.
- Confirming a screenshot job is the first point where parsed holdings are written to `holdings`.
- Keep changes surgical and scoped to Week 5 screenshot ingestion.
- Use existing API response shape: `ApiResponse<T>`.
- Use existing JWT guard and `@AuthenticationPrincipal JwtPrincipal`.
- Verification before completion: run backend tests, frontend lint, frontend build, and `git diff --check`.

---

## Agent Team

| Agent | Scope | Owns | Blocks |
|---|---|---|---|
| Agent A - Backend Domain | JPA entities, repositories, services, screenshot API | Tasks 1-3 | Agent C frontend API integration needs response contracts |
| Agent B - Parser and Storage | file validation/storage, parser port, deterministic fake parser | Task 4 | Agent A upload service depends on parser/storage contracts |
| Agent C - Frontend Flow | upload page, polling, review/edit, confirm UI | Tasks 5-7 | Needs Agent A API contracts |
| Agent D - Integration QA | cross-layer contract tests, final verification, docs/API spec cleanup | Task 8 | Runs after Agents A-C finish |

Parallelization:
- Agents A and B can start together after agreeing on interfaces in Task 1.
- Agent C can scaffold types and routes while Agent A builds APIs, but must wait for final response contracts before wiring requests.
- Agent D runs only after backend and frontend changes are merged locally.

---

## Existing Context

- `broker_accounts`, `holdings`, and `portfolio_screenshots` already exist in `backend/src/main/resources/db/migration/V1__init.sql`.
- No backend `portfolio`, `broker`, or `screenshot` package exists yet.
- `frontend/src/app/providers.tsx` already provides a TanStack Query client.
- `frontend/src/lib/api/client.ts` already injects JWT access tokens and refreshes expired tokens.
- `frontend/src/features/onboarding/pages/OnboardingPage.tsx` already presents MTS capture as the post-onboarding path, but does not upload files.
- Because Week 4 is skipped, Week 5 must include a minimal screenshot broker account endpoint or create a screenshot account implicitly during upload.

Decision:
- Implement `POST /brokers/connect/screenshot` and `GET /brokers/accounts` as the minimal broker surface needed by screenshot upload.
- Implement `POST /portfolio/screenshot` with `accountId`, not implicit account creation, so the API remains aligned with `api-spec.md`.

---

## File Structure

### Backend Files

- Create `backend/src/main/java/com/app/golgo/broker/entity/BrokerAccount.java`: maps `broker_accounts`.
- Create `backend/src/main/java/com/app/golgo/broker/entity/BrokerConnectionType.java`: enum `API_KEY`, `SCREENSHOT`.
- Create `backend/src/main/java/com/app/golgo/broker/repository/BrokerAccountRepository.java`: active account lookup by user.
- Create `backend/src/main/java/com/app/golgo/broker/dto/ScreenshotBrokerConnectRequest.java`: validates `brokerCode`, `accountNickname`.
- Create `backend/src/main/java/com/app/golgo/broker/dto/BrokerAccountResponse.java`: frontend account list contract.
- Create `backend/src/main/java/com/app/golgo/broker/controller/BrokerController.java`: minimal screenshot account endpoints.
- Create `backend/src/main/java/com/app/golgo/broker/service/BrokerService.java`: account creation and ownership checks.
- Create `backend/src/main/java/com/app/golgo/portfolio/entity/Holding.java`: maps `holdings`.
- Create `backend/src/main/java/com/app/golgo/portfolio/entity/PortfolioScreenshot.java`: maps `portfolio_screenshots`.
- Create `backend/src/main/java/com/app/golgo/portfolio/entity/ScreenshotStatus.java`: enum `PROCESSING`, `COMPLETED`, `PENDING_CONFIRM`, `CONFIRMED`, `FAILED`.
- Create `backend/src/main/java/com/app/golgo/portfolio/repository/HoldingRepository.java`: upsert support via delete-then-save for account holdings.
- Create `backend/src/main/java/com/app/golgo/portfolio/repository/PortfolioScreenshotRepository.java`: job lookup by id and user.
- Create `backend/src/main/java/com/app/golgo/portfolio/dto/*`: upload, status, holding edit, confirm DTOs.
- Create `backend/src/main/java/com/app/golgo/portfolio/parser/ScreenshotParser.java`: parser port.
- Create `backend/src/main/java/com/app/golgo/portfolio/parser/FakeScreenshotParser.java`: deterministic local parser.
- Create `backend/src/main/java/com/app/golgo/portfolio/storage/ScreenshotStorage.java`: storage port.
- Create `backend/src/main/java/com/app/golgo/portfolio/storage/LocalScreenshotStorage.java`: local filesystem implementation.
- Create `backend/src/main/java/com/app/golgo/portfolio/controller/PortfolioScreenshotController.java`: screenshot endpoints.
- Create `backend/src/main/java/com/app/golgo/portfolio/service/PortfolioScreenshotService.java`: upload, parse, edit, confirm.
- Create `backend/src/main/java/com/app/golgo/portfolio/service/ScreenshotException.java`: domain error with `SCREENSHOT_*` codes.
- Modify `backend/src/main/java/com/app/golgo/common/api/GlobalExceptionHandler.java`: handle `ScreenshotException`.
- Modify `backend/src/main/resources/application.yml`: add `golgo.screenshot.storage-dir`.
- Create tests under `backend/src/test/java/com/app/golgo/broker/service` and `backend/src/test/java/com/app/golgo/portfolio/service`.

### Frontend Files

- Create `frontend/src/features/portfolio/types.ts`: screenshot account, job, holding contracts.
- Create `frontend/src/features/portfolio/api/screenshot-api.ts`: broker account and screenshot API functions.
- Create `frontend/src/features/portfolio/hooks/use-screenshot-upload.ts`: upload/poll/edit/confirm mutations.
- Create `frontend/src/features/portfolio/pages/ScreenshotUploadPage.tsx`: B-4 upload screen.
- Create `frontend/src/features/portfolio/pages/ScreenshotReviewPage.tsx`: B-5 review screen.
- Create `frontend/src/features/portfolio/components/HoldingEditSheet.tsx`: B-6 edit bottom sheet.
- Create `frontend/src/features/portfolio/components/ParsingProgress.tsx`: polling skeleton.
- Modify `frontend/src/app/router.tsx`: add `/portfolio/screenshot` and `/portfolio/screenshot/:jobId`.
- Modify `frontend/src/features/auth/pages/HomePage.tsx`: add dashboard placeholder CTA to screenshot upload.
- Modify `frontend/src/features/onboarding/pages/OnboardingPage.tsx`: after onboarding done, route toward upload CTA when user chooses MTS capture.

---

## Task 1: Backend Broker Screenshot Account Foundation

**Agent:** Agent A - Backend Domain

**Files:**
- Create: `backend/src/main/java/com/app/golgo/broker/entity/BrokerConnectionType.java`
- Create: `backend/src/main/java/com/app/golgo/broker/entity/BrokerAccount.java`
- Create: `backend/src/main/java/com/app/golgo/broker/repository/BrokerAccountRepository.java`
- Create: `backend/src/main/java/com/app/golgo/broker/dto/ScreenshotBrokerConnectRequest.java`
- Create: `backend/src/main/java/com/app/golgo/broker/dto/BrokerAccountResponse.java`
- Create: `backend/src/main/java/com/app/golgo/broker/service/BrokerService.java`
- Create: `backend/src/main/java/com/app/golgo/broker/controller/BrokerController.java`
- Test: `backend/src/test/java/com/app/golgo/broker/service/BrokerServiceTest.java`

**Interfaces:**
- Produces: `BrokerService.createScreenshotAccount(UUID userId, ScreenshotBrokerConnectRequest request): BrokerAccountResponse`
- Produces: `BrokerService.findActiveAccountForUser(UUID userId, UUID accountId): BrokerAccount`
- Produces: `GET /brokers/accounts`
- Produces: `POST /brokers/connect/screenshot`

- [ ] **Step 1: Write service tests**

```java
@Test
void createScreenshotAccountStoresScreenShotConnectionOnly() {
	User user = User.createLocal("golgo01", "hash", "홍길동", "user@example.com", "투자초보", CLOCK);
	user.assignIdForTest(USER_ID);
	when(userRepository.findByIdAndDeletedAtIsNull(USER_ID)).thenReturn(Optional.of(user));
	when(brokerAccountRepository.save(any(BrokerAccount.class))).thenAnswer(invocation -> {
		BrokerAccount account = invocation.getArgument(0);
		account.assignIdForTest(ACCOUNT_ID);
		return account;
	});

	BrokerAccountResponse response = brokerService.createScreenshotAccount(
		USER_ID,
		new ScreenshotBrokerConnectRequest("MIRAE", "미래에셋 메인")
	);

	assertThat(response.accountId()).isEqualTo(ACCOUNT_ID);
	assertThat(response.brokerCode()).isEqualTo("MIRAE");
	assertThat(response.connectionType()).isEqualTo("SCREENSHOT");
	assertThat(response.accountNickname()).isEqualTo("미래에셋 메인");
}

@Test
void findActiveAccountForUserRejectsOtherUsersAccount() {
	when(brokerAccountRepository.findByIdAndUserIdAndDeletedAtIsNull(ACCOUNT_ID, USER_ID))
		.thenReturn(Optional.empty());

	Throwable thrown = catchThrowable(() -> brokerService.findActiveAccountForUser(USER_ID, ACCOUNT_ID));

	assertThat(thrown)
		.isInstanceOf(IllegalArgumentException.class)
		.hasMessage("계좌를 찾을 수 없습니다.");
}
```

- [ ] **Step 2: Run backend test and confirm failure**

Run:

```powershell
.\gradlew.bat test --tests com.app.golgo.broker.service.BrokerServiceTest
```

Expected: compile failure because broker classes do not exist.

- [ ] **Step 3: Implement broker entity and repository**

Implement `BrokerAccount` with fields matching `broker_accounts`: `id`, `user`, `brokerCode`, `connectionType`, `accountNickname`, `createdAt`, `updatedAt`, `deletedAt`. Keep API Key fields nullable but do not expose setters for them in Week 5.

- [ ] **Step 4: Implement service and controller**

`POST /brokers/connect/screenshot` accepts:

```json
{
  "brokerCode": "MIRAE",
  "accountNickname": "미래에셋 메인"
}
```

It returns HTTP 200 with:

```json
{
  "accountId": "uuid",
  "brokerCode": "MIRAE",
  "connectionType": "SCREENSHOT",
  "accountNickname": "미래에셋 메인",
  "connectedAt": "2026-06-17T00:00:00Z",
  "notice": "캡처 이미지를 업로드하면 보유 종목을 구성할 수 있습니다."
}
```

- [ ] **Step 5: Run broker tests**

Run:

```powershell
.\gradlew.bat test --tests com.app.golgo.broker.service.BrokerServiceTest
```

Expected: test passes.

---

## Task 2: Backend Screenshot Job Entity and Status API

**Agent:** Agent A - Backend Domain

**Files:**
- Create: `backend/src/main/java/com/app/golgo/portfolio/entity/ScreenshotStatus.java`
- Create: `backend/src/main/java/com/app/golgo/portfolio/entity/PortfolioScreenshot.java`
- Create: `backend/src/main/java/com/app/golgo/portfolio/repository/PortfolioScreenshotRepository.java`
- Create: `backend/src/main/java/com/app/golgo/portfolio/dto/ScreenshotUploadResponse.java`
- Create: `backend/src/main/java/com/app/golgo/portfolio/dto/ScreenshotJobResponse.java`
- Create: `backend/src/main/java/com/app/golgo/portfolio/dto/ParsedHoldingResponse.java`
- Create: `backend/src/main/java/com/app/golgo/portfolio/service/ScreenshotException.java`
- Create: `backend/src/main/java/com/app/golgo/portfolio/service/PortfolioScreenshotService.java`
- Create: `backend/src/main/java/com/app/golgo/portfolio/controller/PortfolioScreenshotController.java`
- Modify: `backend/src/main/java/com/app/golgo/common/api/GlobalExceptionHandler.java`
- Test: `backend/src/test/java/com/app/golgo/portfolio/service/PortfolioScreenshotServiceTest.java`

**Interfaces:**
- Consumes: `BrokerService.findActiveAccountForUser(UUID userId, UUID accountId): BrokerAccount`
- Produces: `PortfolioScreenshotService.getJob(UUID userId, UUID jobId): ScreenshotJobResponse`
- Produces: `GET /portfolio/screenshot/{jobId}`

- [ ] **Step 1: Write status lookup tests**

```java
@Test
void getJobReturnsParsedHoldingsForOwner() {
	PortfolioScreenshot screenshot = PortfolioScreenshot.completed(
		user,
		account,
		"MIRAE",
		"/local/test.png",
		List.of(new ParsedHolding("005930", "삼성전자", "KOSPI", new BigDecimal("50"), new BigDecimal("68000"), new BigDecimal("72000"), "KRW")),
		new BigDecimal("0.970"),
		new BigDecimal("3600000"),
		List.of("일부 항목은 직접 확인해 주세요."),
		CLOCK
	);
	screenshot.assignIdForTest(JOB_ID);
	when(portfolioScreenshotRepository.findByIdAndUserId(JOB_ID, USER_ID)).thenReturn(Optional.of(screenshot));

	ScreenshotJobResponse response = service.getJob(USER_ID, JOB_ID);

	assertThat(response.jobId()).isEqualTo(JOB_ID);
	assertThat(response.status()).isEqualTo("COMPLETED");
	assertThat(response.holdings()).hasSize(1);
}

@Test
void getJobThrowsWhenJobIsMissing() {
	when(portfolioScreenshotRepository.findByIdAndUserId(JOB_ID, USER_ID)).thenReturn(Optional.empty());

	Throwable thrown = catchThrowable(() -> service.getJob(USER_ID, JOB_ID));

	assertThat(thrown)
		.isInstanceOf(ScreenshotException.class)
		.hasMessage("파싱 작업을 찾을 수 없습니다.");
}
```

- [ ] **Step 2: Run test and confirm failure**

Run:

```powershell
.\gradlew.bat test --tests com.app.golgo.portfolio.service.PortfolioScreenshotServiceTest
```

Expected: compile failure because portfolio classes do not exist.

- [ ] **Step 3: Implement entity JSON mapping simply**

Use string columns in the entity for `parsedHoldingsJson`, `editedHoldingsJson`, and `warningsJson`, and serialize/deserialize with Jackson `ObjectMapper` in the service. This avoids adding custom Hibernate JSON types.

- [ ] **Step 4: Implement `GET /portfolio/screenshot/{jobId}`**

Return status-specific responses:
- `PROCESSING`: `jobId`, `status`, `estimatedSeconds`
- `COMPLETED` or `PENDING_CONFIRM`: parsed or edited holdings, `confidence`, `totalAssetKrw`, `warnings`
- `FAILED`: `jobId`, `status`, `errorReason`, `message`
- `CONFIRMED`: same as confirmed state with `confirmedAt`

- [ ] **Step 5: Run status tests**

Run:

```powershell
.\gradlew.bat test --tests com.app.golgo.portfolio.service.PortfolioScreenshotServiceTest
```

Expected: test passes.

---

## Task 3: Backend Upload, Edit, and Confirm Flow

**Agent:** Agent A - Backend Domain

**Files:**
- Create: `backend/src/main/java/com/app/golgo/portfolio/entity/Holding.java`
- Create: `backend/src/main/java/com/app/golgo/portfolio/repository/HoldingRepository.java`
- Create: `backend/src/main/java/com/app/golgo/portfolio/dto/HoldingEditRequest.java`
- Create: `backend/src/main/java/com/app/golgo/portfolio/dto/HoldingConfirmRequest.java`
- Create: `backend/src/main/java/com/app/golgo/portfolio/dto/ScreenshotConfirmResponse.java`
- Modify: `backend/src/main/java/com/app/golgo/portfolio/service/PortfolioScreenshotService.java`
- Modify: `backend/src/main/java/com/app/golgo/portfolio/controller/PortfolioScreenshotController.java`
- Test: `backend/src/test/java/com/app/golgo/portfolio/service/PortfolioScreenshotServiceTest.java`

**Interfaces:**
- Consumes: `ScreenshotParser.parse(Path imagePath): ParsedPortfolio`
- Consumes: `ScreenshotStorage.store(UUID userId, MultipartFile image): StoredScreenshot`
- Produces: `POST /portfolio/screenshot`
- Produces: `PATCH /portfolio/screenshot/{jobId}/holdings`
- Produces: `POST /portfolio/screenshot/{jobId}/confirm`

- [ ] **Step 1: Write upload validation tests**

```java
@Test
void uploadRejectsNonImageFile() {
	MockMultipartFile file = new MockMultipartFile("image", "note.txt", "text/plain", "hello".getBytes(StandardCharsets.UTF_8));

	Throwable thrown = catchThrowable(() -> service.upload(USER_ID, ACCOUNT_ID, file));

	assertThat(thrown)
		.isInstanceOf(ScreenshotException.class)
		.hasMessage("지원하지 않는 이미지 형식입니다.");
}

@Test
void uploadStoresParsedCompletedJob() {
	MockMultipartFile file = new MockMultipartFile("image", "mts.png", "image/png", new byte[] {1, 2, 3});
	when(brokerService.findActiveAccountForUser(USER_ID, ACCOUNT_ID)).thenReturn(account);
	when(storage.store(USER_ID, file)).thenReturn(new StoredScreenshot("/tmp/mts.png", Path.of("D:/tmp/mts.png")));
	when(parser.parse(Path.of("D:/tmp/mts.png"))).thenReturn(ParsedPortfolio.sample());
	when(portfolioScreenshotRepository.save(any(PortfolioScreenshot.class))).thenAnswer(invocation -> {
		PortfolioScreenshot screenshot = invocation.getArgument(0);
		screenshot.assignIdForTest(JOB_ID);
		return screenshot;
	});

	ScreenshotUploadResponse response = service.upload(USER_ID, ACCOUNT_ID, file);

	assertThat(response.jobId()).isEqualTo(JOB_ID);
	assertThat(response.status()).isEqualTo("COMPLETED");
}
```

- [ ] **Step 2: Write confirm tests**

```java
@Test
void confirmReplacesAccountHoldingsAndMarksJobConfirmed() {
	when(portfolioScreenshotRepository.findByIdAndUserId(JOB_ID, USER_ID)).thenReturn(Optional.of(completedScreenshot));

	ScreenshotConfirmResponse response = service.confirm(
		USER_ID,
		JOB_ID,
		new HoldingConfirmRequest(List.of(new ConfirmedHoldingRequest("005930", "삼성전자", "KOSPI", new BigDecimal("55"), new BigDecimal("67500"), new BigDecimal("72000"), "KRW")), new BigDecimal("3960000"))
	);

	verify(holdingRepository).deleteAllByBrokerAccountId(ACCOUNT_ID);
	verify(holdingRepository).saveAll(anyList());
	assertThat(response.status()).isEqualTo("CONFIRMED");
	assertThat(response.savedHoldingsCount()).isEqualTo(1);
}
```

- [ ] **Step 3: Implement upload**

Validate:
- content type is `image/png` or `image/jpeg`
- file size is greater than 0
- file size is at most 10MB
- account belongs to the authenticated user
- account connection type is `SCREENSHOT`

Then store file, parse it synchronously for Week 5, save screenshot job as `COMPLETED` or `FAILED`, and return `ScreenshotUploadResponse`.

- [ ] **Step 4: Implement edit**

`PATCH /portfolio/screenshot/{jobId}/holdings` replaces the edited holdings JSON with the request holdings, recalculates `totalAssetKrw` as `quantity * currentPrice` for each holding, sets `isManuallyEdited = true`, and changes status to `PENDING_CONFIRM`.

- [ ] **Step 5: Implement confirm**

`POST /portfolio/screenshot/{jobId}/confirm` rejects already confirmed jobs, writes confirmed holdings to `holdings`, sets `lastSyncedAt` on the broker account, marks the screenshot as `CONFIRMED`, and returns saved count.

- [ ] **Step 6: Run portfolio service tests**

Run:

```powershell
.\gradlew.bat test --tests com.app.golgo.portfolio.service.PortfolioScreenshotServiceTest
```

Expected: test passes.

---

## Task 4: Parser and Local Storage Adapter

**Agent:** Agent B - Parser and Storage

**Files:**
- Create: `backend/src/main/java/com/app/golgo/portfolio/parser/ScreenshotParser.java`
- Create: `backend/src/main/java/com/app/golgo/portfolio/parser/ParsedPortfolio.java`
- Create: `backend/src/main/java/com/app/golgo/portfolio/parser/ParsedHolding.java`
- Create: `backend/src/main/java/com/app/golgo/portfolio/parser/FakeScreenshotParser.java`
- Create: `backend/src/main/java/com/app/golgo/portfolio/storage/ScreenshotStorage.java`
- Create: `backend/src/main/java/com/app/golgo/portfolio/storage/StoredScreenshot.java`
- Create: `backend/src/main/java/com/app/golgo/portfolio/storage/LocalScreenshotStorage.java`
- Modify: `backend/src/main/resources/application.yml`
- Test: `backend/src/test/java/com/app/golgo/portfolio/storage/LocalScreenshotStorageTest.java`

**Interfaces:**
- Produces: `ScreenshotParser.parse(Path imagePath): ParsedPortfolio`
- Produces: `ScreenshotStorage.store(UUID userId, MultipartFile image): StoredScreenshot`

- [ ] **Step 1: Define parser result model**

Use immutable records:

```java
public record ParsedHolding(
	String ticker,
	String name,
	String market,
	BigDecimal quantity,
	BigDecimal avgPrice,
	BigDecimal currentPrice,
	String currency
) {
}

public record ParsedPortfolio(
	List<ParsedHolding> holdings,
	BigDecimal confidence,
	List<String> warnings
) {
	public static ParsedPortfolio sample() {
		return new ParsedPortfolio(
			List.of(new ParsedHolding("005930", "삼성전자", "KOSPI", new BigDecimal("50"), new BigDecimal("68000"), new BigDecimal("72000"), "KRW")),
			new BigDecimal("0.970"),
			List.of("샘플 파싱 결과입니다. 실제 MTS 캡처로 확인해 주세요.")
		);
	}
}
```

- [ ] **Step 2: Implement fake parser**

`FakeScreenshotParser` returns `ParsedPortfolio.sample()` for any stored image. Mark it with `@Component` so Week 5 works without Vision credentials.

- [ ] **Step 3: Implement local storage**

Store files under `${golgo.screenshot.storage-dir}/{userId}/{uuid}.{ext}`. Default property:

```yaml
golgo:
  screenshot:
    storage-dir: ${GOLGO_SCREENSHOT_STORAGE_DIR:./data/screenshots}
```

- [ ] **Step 4: Write storage test**

```java
@Test
void storeWritesFileUnderUserDirectory() {
	LocalScreenshotStorage storage = new LocalScreenshotStorage(tempDir.toString());
	MockMultipartFile file = new MockMultipartFile("image", "mts.png", "image/png", new byte[] {1, 2, 3});

	StoredScreenshot stored = storage.store(USER_ID, file);

	assertThat(stored.path()).contains(USER_ID.toString());
	assertThat(Files.exists(stored.absolutePath())).isTrue();
}
```

- [ ] **Step 5: Run storage tests**

Run:

```powershell
.\gradlew.bat test --tests com.app.golgo.portfolio.storage.LocalScreenshotStorageTest
```

Expected: test passes.

---

## Task 5: Frontend API Hooks and Routing

**Agent:** Agent C - Frontend Flow

**Files:**
- Create: `frontend/src/features/portfolio/types.ts`
- Create: `frontend/src/features/portfolio/api/screenshot-api.ts`
- Create: `frontend/src/features/portfolio/hooks/use-screenshot-upload.ts`
- Modify: `frontend/src/app/router.tsx`

**Interfaces:**
- Consumes: `POST /brokers/connect/screenshot`
- Consumes: `GET /brokers/accounts`
- Consumes: `POST /portfolio/screenshot`
- Consumes: `GET /portfolio/screenshot/{jobId}`
- Consumes: `PATCH /portfolio/screenshot/{jobId}/holdings`
- Consumes: `POST /portfolio/screenshot/{jobId}/confirm`
- Produces: route `/portfolio/screenshot`
- Produces: route `/portfolio/screenshot/:jobId`

- [ ] **Step 1: Add frontend types**

Define `BrokerAccount`, `ScreenshotUploadResponse`, `ScreenshotJob`, `ParsedHolding`, `HoldingEditPayload`, and `HoldingConfirmPayload` using API response field names exactly.

- [ ] **Step 2: Add API functions**

Use existing `api` from `frontend/src/lib/api/client.ts`. Upload function must send `FormData` and set no explicit JSON content type:

```ts
export async function uploadScreenshot(accountId: string, image: File) {
  const formData = new FormData()
  formData.append('accountId', accountId)
  formData.append('image', image)

  const response = await api.post<ApiResponse<ScreenshotUploadResponse>>(
    '/portfolio/screenshot',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )

  return response.data.data
}
```

- [ ] **Step 3: Add TanStack Query hooks**

Create:
- `useBrokerAccounts()`
- `useCreateScreenshotAccount()`
- `useUploadScreenshot()`
- `useScreenshotJob(jobId)`
- `useEditScreenshotHoldings(jobId)`
- `useConfirmScreenshot(jobId)`

Polling rule: `useScreenshotJob` refetches every 1500ms while status is `PROCESSING`.

- [ ] **Step 4: Wire routes**

Add authenticated routes:

```tsx
{
  path: '/portfolio/screenshot',
  element: <ScreenshotUploadPage />,
},
{
  path: '/portfolio/screenshot/:jobId',
  element: <ScreenshotReviewPage />,
},
```

- [ ] **Step 5: Run frontend typecheck**

Run:

```powershell
npm run typecheck
```

Expected: typecheck passes after placeholder pages are added in Task 6.

---

## Task 6: Frontend Upload and Parsing Progress UI

**Agent:** Agent C - Frontend Flow

**Files:**
- Create: `frontend/src/features/portfolio/pages/ScreenshotUploadPage.tsx`
- Create: `frontend/src/features/portfolio/components/ParsingProgress.tsx`
- Modify: `frontend/src/features/auth/pages/HomePage.tsx`
- Modify: `frontend/src/features/onboarding/pages/OnboardingPage.tsx`

**Interfaces:**
- Consumes: hooks from Task 5.
- Produces: user can select/create screenshot account and upload PNG/JPG.

- [ ] **Step 1: Build upload page layout**

Use `MobilePage`, quiet dashboard styling, and icon buttons. Include:
- account selector with existing screenshot accounts
- quick create account form with broker choices `MIRAE`, `KIS`, `OTHER`
- drag/tap file input zone
- selected filename and size
- upload button disabled until account and file exist
- client validation for PNG/JPG and 10MB

- [ ] **Step 2: Add upload flow**

On upload success, navigate:

```ts
navigate(`/portfolio/screenshot/${response.jobId}`)
```

- [ ] **Step 3: Add progress component**

`ParsingProgress` shows skeleton rows and current status text while polling returns `PROCESSING`.

- [ ] **Step 4: Link from existing screens**

`HomePage` dashboard placeholder gets CTA “MTS 캡처 업로드”. `OnboardingPage` final CTA can still go to `/`, but the dashboard CTA must make the next action obvious.

- [ ] **Step 5: Run frontend lint**

Run:

```powershell
npm run lint
```

Expected: lint passes.

---

## Task 7: Frontend Review, Edit Sheet, and Confirm Flow

**Agent:** Agent C - Frontend Flow

**Files:**
- Create: `frontend/src/features/portfolio/pages/ScreenshotReviewPage.tsx`
- Create: `frontend/src/features/portfolio/components/HoldingEditSheet.tsx`

**Interfaces:**
- Consumes: `ScreenshotJob` from Task 5.
- Produces: user can edit parsed holdings and confirm final holdings.

- [ ] **Step 1: Build review page states**

Handle:
- `PROCESSING`: render `ParsingProgress`
- `FAILED`: show retry CTA back to upload page
- `COMPLETED` or `PENDING_CONFIRM`: show parsed holdings list
- `CONFIRMED`: show saved state and dashboard CTA

- [ ] **Step 2: Build holdings list**

Each row shows:
- ticker and name
- market
- quantity
- average price
- current price
- current value
- edit button

Compute current value on frontend for display as `quantity * currentPrice`.

- [ ] **Step 3: Build edit sheet**

Use a fixed bottom sheet style. Fields:
- ticker
- name
- market
- quantity
- avgPrice
- currentPrice
- currency

Actions:
- save updates local state
- delete removes row from local state
- add holding opens empty form

- [ ] **Step 4: Persist edits**

When user taps “수정 내용 저장”, call `PATCH /portfolio/screenshot/{jobId}/holdings` with all current holdings as the new list.

- [ ] **Step 5: Confirm**

When user taps “최종 저장”, call `POST /portfolio/screenshot/{jobId}/confirm` with current holdings and computed `totalAssetKrw`.

- [ ] **Step 6: Run frontend build**

Run:

```powershell
npm run build
```

Expected: build passes.

---

## Task 8: Integration QA, Contract Cleanup, and Commit

**Agent:** Agent D - Integration QA

**Files:**
- Modify: `api-spec.md` only if implemented response differs from current spec.
- Modify: `roadmap.md` only if Week 5 status is explicitly tracked.
- Review all files changed by Tasks 1-7.

**Interfaces:**
- Consumes: completed backend and frontend implementation.
- Produces: verified, staged, committed Week 5 implementation.

- [ ] **Step 1: Run backend full tests**

Run:

```powershell
.\gradlew.bat test
```

Expected: `BUILD SUCCESSFUL`.

- [ ] **Step 2: Run frontend lint**

Run:

```powershell
npm run lint
```

Expected: no ESLint errors.

- [ ] **Step 3: Run frontend build**

Run:

```powershell
npm run build
```

Expected: TypeScript and Vite build succeed.

- [ ] **Step 4: Check diff hygiene**

Run:

```powershell
git diff --check
git status --short
git diff --stat
```

Expected:
- no whitespace errors
- only Week 5 files changed
- no generated build output staged

- [ ] **Step 5: Manual smoke test**

Run backend and frontend locally, then verify:
- register or login
- navigate to `/portfolio/screenshot`
- create screenshot account
- upload PNG/JPG under 10MB
- review fake parsed Samsung Electronics holding
- edit quantity
- confirm holdings
- refresh review page and see confirmed state

- [ ] **Step 6: Report before commit**

Before committing, report:
- changed file list
- core diff summary
- backend test result
- frontend lint/build result
- smoke test result or reason it was not run

- [ ] **Step 7: Commit**

Commit message:

```bash
git commit -m "feat(portfolio): MTS 캡처 업로드 구현"
```

Do not push unless explicitly instructed.

---

## Risks and Tradeoffs

- Real Vision parsing is intentionally deferred behind `ScreenshotParser`; Week 5 can ship a working flow with deterministic parsing while prompt quality is reviewed separately.
- Local filesystem storage is enough for local and Railway smoke tests, but production should move to Supabase Storage before broad beta usage.
- The API spec currently says upload returns `202 PROCESSING`; this plan allows synchronous fake parsing to return `COMPLETED` in the response data while still using the same job status model. Agent D must align the final implementation and docs.
- Because Week 4 is skipped, only screenshot broker accounts are implemented. API Key account upgrade remains out of scope.

## Self-Review

- Spec coverage: Week 5 upload, parsing state, review/edit, confirm, and tests are mapped to Tasks 1-8.
- Scope check: Week 4 KIS/API Key work is explicitly excluded.
- Type consistency: backend response names are mirrored in frontend `portfolio/types.ts`.
- Placeholder scan: no implementation task depends on undefined future work; fake parser is the explicit Week 5 parser implementation.
