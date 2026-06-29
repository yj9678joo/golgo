# Week 7 AI Analysis Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Phase 2 Week 7 범위인 Gemini 기반 7단계 AI 분석 리포트 생성, 비동기 상태 조회 API, 분석 목록 진입 화면을 구현한다.

**Architecture:** 백엔드는 `analysis` 도메인을 새로 만들고 `AnalysisReport`와 `ReportSection`을 DB 영속화 단위로 둔다. LLM 호출은 `AnalysisLlmClient` 인터페이스 뒤에 감추고, Week 7에서는 기존 Gemini Vision 설정 패턴을 재사용한 Gemini 구현을 우선 연결한다. 프론트엔드는 `/analysis` 목록 화면과 분석 생성/상태 폴링의 최소 흐름만 구현하고, 상세 리포트 UI는 Week 8 작업으로 분리한다.

**Tech Stack:** Java 21, Spring Boot 3.5, Spring Data JPA, Flyway, Jackson, Spring `@Async`, Gemini REST API, JUnit 5, Mockito, React 19, TypeScript 5, TanStack Query 5, Axios, shadcn/ui, Lucide React

## Global Constraints

- API 기준 문서: `api-spec.md`의 `/analysis/**` 엔드포인트와 표준 응답 형식을 따른다.
- DB 기준 문서: `erd-spec.md`의 `analysis_reports`, `report_sections` 테이블을 따른다.
- AI 분석 기준: `AGENTS.md`의 7단계 분석 프레임워크를 사용한다.
- Gemini API 키는 `GEMINI_API_KEY` 환경변수에서만 읽고 로그와 Git에 기록하지 않는다.
- LLM 응답은 자유 텍스트가 아니라 구조화된 JSON으로 제한한다.
- 민감 정보와 토큰은 로그에 남기지 않는다.
- Week 7의 완료 기준은 "종목 선택 -> AI 분석 요청 -> 진행 상태 폴링 -> 완료된 7단계 리포트 데이터 저장/조회"이다.
- GPT/Claude fallback은 인터페이스와 실패 전환 지점까지만 만들고, 실제 provider별 키/SDK 연결은 별도 보안 검토 후 확장한다.

## Assumptions

- Phase 1의 인증 필터와 `JwtPrincipal`이 이미 동작하므로 `/api/v1/analysis/**`는 인증 API로 추가한다.
- 기존 응답 래퍼는 `com.app.golgo.common.api.ApiResponse`를 유지한다.
- 기존 코드 구조는 `com.app.golgo.<domain>.controller|service|dto|entity|repository` 패턴을 우선 따른다.
- Redis 상태 캐싱은 Roadmap에 있으나 현재 저장소에는 Redis 추상화가 아직 없으므로, Week 7 구현은 DB 상태를 기준으로 폴링 가능하게 만들고 Redis 최적화는 Redis 래퍼가 생긴 뒤 별도 작업으로 둔다.

## File Map

### Backend

- Create: `backend/src/main/resources/db/migration/V7__analysis_reports.sql`
  - `analysis_reports`, `report_sections` 테이블과 인덱스를 생성한다.
- Create: `backend/src/main/java/com/app/golgo/analysis/entity/AnalysisReport.java`
  - 리포트 헤더, 진행률, 추천, 실패 사유를 저장한다.
- Create: `backend/src/main/java/com/app/golgo/analysis/entity/ReportSection.java`
  - 7단계 섹션 JSON과 섹션 점수를 저장한다.
- Create: `backend/src/main/java/com/app/golgo/analysis/entity/AnalysisType.java`
  - `QUICK`, `DEEP_INFERENCE`.
- Create: `backend/src/main/java/com/app/golgo/analysis/entity/LlmProvider.java`
  - `GEMINI`, `GPT`, `CLAUDE`.
- Create: `backend/src/main/java/com/app/golgo/analysis/entity/AnalysisStatus.java`
  - `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`.
- Create: `backend/src/main/java/com/app/golgo/analysis/entity/Recommendation.java`
  - `BUY`, `HOLD`, `SELL`.
- Create: `backend/src/main/java/com/app/golgo/analysis/repository/AnalysisReportRepository.java`
  - 사용자별 리포트 목록/단건 조회를 제공한다.
- Create: `backend/src/main/java/com/app/golgo/analysis/repository/ReportSectionRepository.java`
  - 리포트 섹션 저장과 조회를 제공한다.
- Create: `backend/src/main/java/com/app/golgo/analysis/dto/AnalysisReportCreateRequest.java`
  - `ticker`, `analysisType`, `llmProvider` 요청 DTO.
- Create: `backend/src/main/java/com/app/golgo/analysis/dto/AnalysisReportCreateResponse.java`
  - `reportId`, `status`, `estimatedSeconds`.
- Create: `backend/src/main/java/com/app/golgo/analysis/dto/AnalysisReportStatusResponse.java`
  - `reportId`, `status`, `progressPct`, `currentStep`.
- Create: `backend/src/main/java/com/app/golgo/analysis/dto/AnalysisReportResponse.java`
  - API 명세의 상세 리포트 응답 DTO.
- Create: `backend/src/main/java/com/app/golgo/analysis/dto/AnalysisReportSummaryResponse.java`
  - 목록 화면용 요약 DTO.
- Create: `backend/src/main/java/com/app/golgo/analysis/service/AnalysisService.java`
  - 리포트 생성, 비동기 실행 트리거, 조회 권한 검증을 담당한다.
- Create: `backend/src/main/java/com/app/golgo/analysis/service/AnalysisWorker.java`
  - `@Async`로 LLM 호출과 DB 상태 전이를 실행한다.
- Create: `backend/src/main/java/com/app/golgo/analysis/service/AnalysisException.java`
  - 분석 도메인 예외를 표현한다.
- Create: `backend/src/main/java/com/app/golgo/analysis/llm/AnalysisLlmClient.java`
  - `analyze(AnalysisPromptRequest request): AnalysisStructuredResult` 인터페이스.
- Create: `backend/src/main/java/com/app/golgo/analysis/llm/AnalysisPromptRequest.java`
  - ticker, analysis type, strategy/portfolio context를 담는다.
- Create: `backend/src/main/java/com/app/golgo/analysis/llm/AnalysisStructuredResult.java`
  - 7단계 structured output record.
- Create: `backend/src/main/java/com/app/golgo/analysis/llm/AnalysisPromptFactory.java`
  - 7단계 System Prompt와 사용자 프롬프트를 생성한다.
- Create: `backend/src/main/java/com/app/golgo/analysis/llm/GeminiAnalysisClient.java`
  - Gemini REST API 호출과 JSON 변환을 담당한다.
- Create: `backend/src/main/java/com/app/golgo/analysis/llm/GeminiAnalysisProperties.java`
  - model, api key, timeout 설정.
- Create: `backend/src/main/java/com/app/golgo/analysis/llm/FallbackAnalysisClient.java`
  - Gemini 실패 시 provider fallback 전환 정책을 캡슐화한다.
- Create: `backend/src/main/java/com/app/golgo/analysis/llm/DisabledAnalysisClient.java`
  - GPT/Claude 키가 없을 때 명확한 실패를 반환하는 테스트용 구현.
- Create: `backend/src/main/java/com/app/golgo/analysis/config/AnalysisAsyncConfig.java`
  - 분석용 executor를 작게 제한한다.
- Create: `backend/src/main/java/com/app/golgo/analysis/config/AnalysisLlmConfiguration.java`
  - Gemini client와 fallback chain bean을 구성한다.
- Create: `backend/src/main/java/com/app/golgo/analysis/controller/AnalysisController.java`
  - `/api/v1/analysis/reports` API를 제공한다.
- Modify: `backend/src/main/resources/application.yml`
  - `golgo.analysis.gemini.*`, async executor 설정을 추가한다.
- Modify: `backend/src/main/java/com/app/golgo/common/api/GlobalExceptionHandler.java`
  - `AnalysisException`을 `LLM_001`, `LLM_002`, `LLM_003` 코드로 매핑한다.

### Frontend

- Create: `frontend/src/features/analysis/types.ts`
  - 분석 요청/상태/요약/상세 타입을 정의한다.
- Create: `frontend/src/features/analysis/api/analysis-api.ts`
  - `/analysis/reports` API client를 구현한다.
- Create: `frontend/src/features/analysis/hooks/use-analysis-reports.ts`
  - 목록 조회 Query와 생성 Mutation을 제공한다.
- Create: `frontend/src/features/analysis/hooks/use-analysis-status.ts`
  - 진행 중 리포트 상태를 폴링한다.
- Create: `frontend/src/features/analysis/pages/AnalysisListPage.tsx`
  - 분석 목록, ticker 입력, 생성 버튼, 진행 상태를 표시한다.
- Create: `frontend/src/features/analysis/components/AnalysisProgressCard.tsx`
  - `currentStep`, `progressPct`를 skeleton/progress로 표시한다.
- Create: `frontend/src/features/analysis/api/analysis-contract.test.mjs`
  - API DTO 변환과 status label mapping을 검증한다.
- Modify: `frontend/src/app/router.tsx`
  - `/analysis` route를 추가한다.

---

### Task 1: Analysis DB Schema and Entities

**Files:**
- Create: `backend/src/main/resources/db/migration/V7__analysis_reports.sql`
- Create: `backend/src/main/java/com/app/golgo/analysis/entity/AnalysisReport.java`
- Create: `backend/src/main/java/com/app/golgo/analysis/entity/ReportSection.java`
- Create: `backend/src/main/java/com/app/golgo/analysis/entity/AnalysisType.java`
- Create: `backend/src/main/java/com/app/golgo/analysis/entity/LlmProvider.java`
- Create: `backend/src/main/java/com/app/golgo/analysis/entity/AnalysisStatus.java`
- Create: `backend/src/main/java/com/app/golgo/analysis/entity/Recommendation.java`
- Create: `backend/src/main/java/com/app/golgo/analysis/repository/AnalysisReportRepository.java`
- Create: `backend/src/main/java/com/app/golgo/analysis/repository/ReportSectionRepository.java`
- Test: `backend/src/test/java/com/app/golgo/analysis/entity/AnalysisEntityTest.java`

**Interfaces:**
- Produces: `AnalysisReport.createPending(User user, String ticker, AnalysisType analysisType, LlmProvider provider)`
- Produces: `AnalysisReport.markProcessing(String currentStep, int progressPct)`
- Produces: `AnalysisReport.markCompleted(AnalysisStructuredResult result)`
- Produces: `AnalysisReport.markFailed(String errorMessage)`
- Produces: `ReportSection.from(AnalysisReport report, SectionCode code, int order, JsonNode contentJson, Integer score)`

- [ ] **Step 1: Write failing entity tests**

Create `AnalysisEntityTest` with assertions for initial `PENDING` state, valid status transitions, 7 section uniqueness by `sectionCode`, and ownership through `User`.

Run: `.\gradlew.bat test --tests "*AnalysisEntityTest"`

Expected: compile failure because analysis entities do not exist.

- [ ] **Step 2: Add migration**

Create `V7__analysis_reports.sql` with:

```sql
CREATE TABLE analysis_reports (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ticker VARCHAR(20) NOT NULL,
    analysis_type VARCHAR(20) NOT NULL,
    llm_provider VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    progress_pct SMALLINT DEFAULT 0,
    current_step VARCHAR(30),
    investment_thesis TEXT,
    overall_score DECIMAL(4,2),
    recommendation VARCHAR(20),
    error_message TEXT,
    requested_at TIMESTAMPTZ NOT NULL,
    generated_at TIMESTAMPTZ
);

CREATE INDEX idx_analysis_reports_user_ticker
    ON analysis_reports(user_id, ticker, requested_at DESC);

CREATE INDEX idx_analysis_reports_status
    ON analysis_reports(status);

CREATE TABLE report_sections (
    id UUID PRIMARY KEY,
    report_id UUID NOT NULL REFERENCES analysis_reports(id) ON DELETE CASCADE,
    section_code VARCHAR(30) NOT NULL,
    section_order SMALLINT NOT NULL,
    content_json JSONB NOT NULL,
    score SMALLINT,
    created_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT uk_report_sections_report_code UNIQUE (report_id, section_code)
);
```

- [ ] **Step 3: Implement entities and repositories**

Use enum string persistence, UUID ids, and existing JPA style from `auth` and `portfolio` entities. Keep JSON storage as Jackson `JsonNode` only if the existing project already has JSONB mapping support; otherwise store `contentJson` as `String` containing serialized JSON and keep JSON parsing in the service layer.

- [ ] **Step 4: Verify schema/entity tests**

Run: `.\gradlew.bat test --tests "*AnalysisEntityTest"`

Expected: all tests pass.

- [ ] **Step 5: Commit**

Commit message: `feat(analysis): 분석 리포트 영속화 모델 추가`

### Task 2: Structured LLM Contract and Prompt

**Files:**
- Create: `backend/src/main/java/com/app/golgo/analysis/llm/AnalysisLlmClient.java`
- Create: `backend/src/main/java/com/app/golgo/analysis/llm/AnalysisPromptRequest.java`
- Create: `backend/src/main/java/com/app/golgo/analysis/llm/AnalysisStructuredResult.java`
- Create: `backend/src/main/java/com/app/golgo/analysis/llm/AnalysisPromptFactory.java`
- Test: `backend/src/test/java/com/app/golgo/analysis/llm/AnalysisPromptFactoryTest.java`
- Test: `backend/src/test/java/com/app/golgo/analysis/llm/AnalysisStructuredResultTest.java`

**Interfaces:**
- Produces: `AnalysisPromptFactory.createSystemPrompt()`
- Produces: `AnalysisPromptFactory.createUserPrompt(AnalysisPromptRequest request)`
- Produces: `AnalysisStructuredResult` with sections `businessModel`, `industryStructure`, `financials`, `valuation`, `earningsCall`, `macroPolicy`, `catalystsAndRisks`

- [ ] **Step 1: Write failing prompt tests**

Assert that the system prompt includes the 7 sections from `AGENTS.md`, requires JSON only, requires PER/PEG/PBR/PSR cross-check in valuation, and forbids investment certainty language.

Run: `.\gradlew.bat test --tests "*AnalysisPromptFactoryTest" --tests "*AnalysisStructuredResultTest"`

Expected: compile failure because LLM contract files do not exist.

- [ ] **Step 2: Implement structured records**

Create Java records that match `api-spec.md` section names and response fields. Keep score fields as integers from 0 to 10 and recommendation as enum-compatible text.

- [ ] **Step 3: Implement prompt factory**

The system prompt must explicitly require:

```text
Return only valid JSON matching the provided schema.
Analyze as a 50-year veteran investment analyst.
Use these seven sections: businessModel, industryStructure, financials, valuation, earningsCall, macroPolicy, catalystsAndRisks.
In valuation, cross-check PER, PEG, PBR, and PSR. If metrics conflict, connect the warning to macro conditions and mention possible position reduction.
Do not guarantee profit. Do not invent unavailable facts. If data is unavailable, write null or an explicit limitation.
```

- [ ] **Step 4: Verify prompt tests**

Run: `.\gradlew.bat test --tests "*AnalysisPromptFactoryTest" --tests "*AnalysisStructuredResultTest"`

Expected: all prompt tests pass.

- [ ] **Step 5: Commit**

Commit message: `feat(analysis): 7단계 분석 프롬프트 정의`

### Task 3: Gemini Analysis Client and Fallback Boundary

**Files:**
- Create: `backend/src/main/java/com/app/golgo/analysis/llm/GeminiAnalysisProperties.java`
- Create: `backend/src/main/java/com/app/golgo/analysis/llm/GeminiAnalysisClient.java`
- Create: `backend/src/main/java/com/app/golgo/analysis/llm/FallbackAnalysisClient.java`
- Create: `backend/src/main/java/com/app/golgo/analysis/llm/DisabledAnalysisClient.java`
- Create: `backend/src/main/java/com/app/golgo/analysis/config/AnalysisLlmConfiguration.java`
- Modify: `backend/src/main/resources/application.yml`
- Test: `backend/src/test/java/com/app/golgo/analysis/llm/GeminiAnalysisClientTest.java`
- Test: `backend/src/test/java/com/app/golgo/analysis/llm/FallbackAnalysisClientTest.java`

**Interfaces:**
- Consumes: `GEMINI_API_KEY`, `golgo.analysis.gemini.model`, prompt strings
- Produces: `AnalysisLlmClient.analyze(AnalysisPromptRequest request)`

- [ ] **Step 1: Write failing client tests**

Use a mock HTTP server or mocked `RestClient` boundary to verify model URL, `x-goog-api-key`, JSON-only prompt content, response text extraction, and parse failure mapping.

Run: `.\gradlew.bat test --tests "*GeminiAnalysisClientTest" --tests "*FallbackAnalysisClientTest"`

Expected: compile failure because client files do not exist.

- [ ] **Step 2: Implement Gemini properties**

Add properties under:

```yaml
golgo:
  analysis:
    gemini:
      api-key: ${GEMINI_API_KEY:}
      model: ${GEMINI_ANALYSIS_MODEL:gemini-3.5-flash}
      timeout-seconds: 45
```

- [ ] **Step 3: Implement Gemini client**

Reuse the REST style from `portfolio/parser/gemini/GoogleGeminiVisionClient`. Parse the Gemini text response into `AnalysisStructuredResult` with Jackson. If the response is not valid JSON, throw an analysis exception mapped to `LLM_002`.

- [ ] **Step 4: Implement fallback boundary**

Order providers by request preference first, then Gemini, GPT, Claude. For Week 7, GPT and Claude use `DisabledAnalysisClient`, which returns a provider-disabled exception. Fallback only moves to the next provider for retryable LLM errors, not for parse schema errors.

- [ ] **Step 5: Verify client tests**

Run: `.\gradlew.bat test --tests "*GeminiAnalysisClientTest" --tests "*FallbackAnalysisClientTest"`

Expected: all client tests pass without network access.

- [ ] **Step 6: Commit**

Commit message: `feat(analysis): Gemini 분석 클라이언트 추가`

### Task 4: Analysis Service, Async Worker, and API

**Files:**
- Create: `backend/src/main/java/com/app/golgo/analysis/dto/AnalysisReportCreateRequest.java`
- Create: `backend/src/main/java/com/app/golgo/analysis/dto/AnalysisReportCreateResponse.java`
- Create: `backend/src/main/java/com/app/golgo/analysis/dto/AnalysisReportStatusResponse.java`
- Create: `backend/src/main/java/com/app/golgo/analysis/dto/AnalysisReportResponse.java`
- Create: `backend/src/main/java/com/app/golgo/analysis/dto/AnalysisReportSummaryResponse.java`
- Create: `backend/src/main/java/com/app/golgo/analysis/service/AnalysisService.java`
- Create: `backend/src/main/java/com/app/golgo/analysis/service/AnalysisWorker.java`
- Create: `backend/src/main/java/com/app/golgo/analysis/service/AnalysisException.java`
- Create: `backend/src/main/java/com/app/golgo/analysis/config/AnalysisAsyncConfig.java`
- Create: `backend/src/main/java/com/app/golgo/analysis/controller/AnalysisController.java`
- Modify: `backend/src/main/java/com/app/golgo/common/api/GlobalExceptionHandler.java`
- Test: `backend/src/test/java/com/app/golgo/analysis/service/AnalysisServiceTest.java`
- Test: `backend/src/test/java/com/app/golgo/analysis/controller/AnalysisControllerTest.java`

**Interfaces:**
- Produces: `POST /api/v1/analysis/reports`
- Produces: `GET /api/v1/analysis/reports`
- Produces: `GET /api/v1/analysis/reports/{reportId}`
- Produces: `GET /api/v1/analysis/reports/{reportId}/status`

- [ ] **Step 1: Write failing service/controller tests**

Test cases:

- creating a report persists `PENDING` then triggers worker and returns 202 with `PROCESSING` payload shape;
- status endpoint returns `progressPct` and `currentStep`;
- users cannot read reports owned by another user;
- completed reports return all seven sections;
- LLM failure marks report as `FAILED` and does not expose provider secrets.

Run: `.\gradlew.bat test --tests "*AnalysisServiceTest" --tests "*AnalysisControllerTest"`

Expected: compile failure because service/controller files do not exist.

- [ ] **Step 2: Implement service creation flow**

Validate `ticker` is 1-20 chars and uppercase it. Default `analysisType` to `DEEP_INFERENCE` only if the request omits it; otherwise reject invalid enum values through bean validation. Persist the report before async work starts.

- [ ] **Step 3: Implement async worker**

Use a small executor:

```java
@Bean(name = "analysisTaskExecutor")
public Executor analysisTaskExecutor() {
    ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
    executor.setCorePoolSize(1);
    executor.setMaxPoolSize(2);
    executor.setQueueCapacity(20);
    executor.setThreadNamePrefix("analysis-");
    executor.initialize();
    return executor;
}
```

The worker updates `PROCESSING` at start, sets `currentStep` through the seven section names, stores sections, then marks `COMPLETED`.

- [ ] **Step 4: Implement controller**

Map endpoints exactly as `api-spec.md`:

```text
POST /api/v1/analysis/reports
GET /api/v1/analysis/reports/{reportId}
GET /api/v1/analysis/reports
GET /api/v1/analysis/reports/{reportId}/status
```

Return `ApiResponse.ok(...)`; use `ResponseEntity.accepted()` for creation.

- [ ] **Step 5: Verify API tests**

Run: `.\gradlew.bat test --tests "*AnalysisServiceTest" --tests "*AnalysisControllerTest"`

Expected: all service/controller tests pass.

- [ ] **Step 6: Commit**

Commit message: `feat(analysis): 비동기 분석 API 구현`

### Task 5: Frontend Analysis List and Polling

**Files:**
- Create: `frontend/src/features/analysis/types.ts`
- Create: `frontend/src/features/analysis/api/analysis-api.ts`
- Create: `frontend/src/features/analysis/hooks/use-analysis-reports.ts`
- Create: `frontend/src/features/analysis/hooks/use-analysis-status.ts`
- Create: `frontend/src/features/analysis/components/AnalysisProgressCard.tsx`
- Create: `frontend/src/features/analysis/pages/AnalysisListPage.tsx`
- Create: `frontend/src/features/analysis/api/analysis-contract.test.mjs`
- Modify: `frontend/src/app/router.tsx`

**Interfaces:**
- Consumes: `POST /analysis/reports`
- Consumes: `GET /analysis/reports`
- Consumes: `GET /analysis/reports/{reportId}/status`
- Produces: `/analysis` authenticated route

- [ ] **Step 1: Write failing frontend contract tests**

Verify request body uses `ticker`, `analysisType`, `llmProvider`; verify status labels for `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`; verify polling stops when status is terminal.

Run: `npm run test:analysis-contract`

Expected: script missing or compile failure because analysis files do not exist. Add `"test:analysis-contract": "node --disable-warning=ExperimentalWarning --experimental-strip-types --test src/features/analysis/api/analysis-contract.test.mjs"` to `frontend/package.json` in this task.

- [ ] **Step 2: Implement API client and hooks**

Use existing `frontend/src/lib/api/client.ts`. Keep hooks under `features/analysis/hooks` and set polling interval to 3000 ms only while a report is `PENDING` or `PROCESSING`.

- [ ] **Step 3: Implement AnalysisListPage**

Build a mobile-first operational screen:

- ticker input;
- `DEEP_INFERENCE` fixed default;
- provider select with Gemini enabled and GPT/Claude visually disabled until keys are configured;
- recent report list;
- progress card for in-flight report;
- empty and error states using existing common components.

- [ ] **Step 4: Register route**

Add `/analysis` under the authenticated route tree in `router.tsx`. The existing bottom nav already points to `/analysis`, so no bottom nav change is needed.

- [ ] **Step 5: Verify frontend tests**

Run:

```powershell
npm run test:analysis-contract
npm run typecheck
npm run lint
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 6: Commit**

Commit message: `feat(analysis): AI 분석 목록 화면 추가`

### Task 6: Integrated Verification and Handoff

**Files:**
- No production file additions.

**Interfaces:**
- Consumes: backend API and frontend `/analysis` route.
- Produces: verified Week 7 implementation branch.

- [ ] **Step 1: Run backend verification**

Run: `.\gradlew.bat test`

Expected: `BUILD SUCCESSFUL`.

- [ ] **Step 2: Run frontend verification**

Run:

```powershell
npm run test:analysis-contract
npm run typecheck
npm run lint
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 3: Optional live Gemini smoke test**

Only run this with a local `GEMINI_API_KEY`. Use one public ticker such as `NVDA` or `005930`, verify the report reaches `COMPLETED`, and confirm all seven sections are present. Do not print the API key or raw prompt containing user-sensitive portfolio data.

- [ ] **Step 4: Manual browser check**

Start backend and frontend locally, log in, open `/analysis`, request one Gemini analysis, and verify the progress card reaches terminal state. If browser validation is required, invoke `browser-test` explicitly.

- [ ] **Step 5: Commit final adjustments**

If Task 6 required only verification, do not create an empty commit. If fixes were made, commit with the smallest relevant scope.

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Redis 상태 캐싱이 아직 추상화되어 있지 않음 | Roadmap 문구와 구현 차이 발생 | DB 상태 폴링으로 Week 7 완료 기준을 만족하고 Redis 최적화는 후속 작업으로 분리 |
| GPT/Claude fallback을 실제 호출까지 구현하면 키/비용/SDK 범위가 커짐 | Week 7 일정 초과와 보안 검토 누락 | 인터페이스와 disabled adapter까지 구현하고 실제 연결은 별도 보안 검토 후 진행 |
| LLM JSON 파싱 실패 | 리포트 생성 실패 | Week 7은 실패 상태 저장과 `LLM_002` 반환, Week 8에서 최대 3회 재시도 구현 |
| 투자 분석의 사실성 부족 | 사용자 오판 가능 | prompt에 "모르는 내용은 limitation으로 표시"를 강제하고 수익 보장 표현 금지 |
| 상세 리포트 UI까지 포함하면 범위 과대 | Week 8 작업과 중복 | Week 7은 목록/진행/데이터 조회까지만, 상세 시각화는 Week 8 |

## Success Criteria

- `POST /api/v1/analysis/reports`가 202와 `reportId`, `PROCESSING`, `estimatedSeconds`를 반환한다.
- `GET /api/v1/analysis/reports/{reportId}/status`가 진행률과 현재 단계를 반환한다.
- LLM 완료 후 `GET /api/v1/analysis/reports/{reportId}`가 7단계 structured sections를 반환한다.
- 다른 사용자의 reportId 조회는 실패한다.
- `/analysis` 화면에서 분석 요청과 진행 상태 확인이 가능하다.
- Backend test, frontend typecheck/lint/build가 통과한다.

## Self-Review

- Spec coverage: `roadmap.md` Week 7의 Spring AI/Gemini 설정, 7단계 prompt, structured output, async API, analysis API, fallback boundary, 목록 화면, 진행 skeleton/polling을 모두 작업으로 매핑했다.
- Intentional deferrals: 실제 GPT/Claude provider 연결은 보안 키와 비용 검토가 필요하므로 disabled adapter와 fallback boundary까지만 Week 7에 포함했다. 상세 리포트 UI와 파싱 실패 3회 재시도는 Week 8 범위로 유지했다.
- Placeholder scan: `TBD`, `TODO`, `implement later` 없음.
- Type consistency: backend enum/status/DTO 명칭은 `api-spec.md`와 `erd-spec.md` 명칭에 맞췄다.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | not run | Week 7은 기존 roadmap 범위 실행이라 product scope 재검토는 생략 |
| Codex Review | `codex review` | Independent 2nd opinion | 0 | not run | 구현 diff가 없고 계획 문서만 작성 |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | clear | 4 issues found, 0 critical gaps; Redis 캐싱/실제 GPT-Claude fallback/상세 UI/LLM 재시도 범위를 분리해 Week 7 실행 가능성 확보 |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | not run | 상세 화면 디자인은 Week 8 범위이며 Week 7은 목록/진행 상태만 포함 |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | not run | 새 개발자 도구나 온보딩 흐름 변경 없음 |

- **VERDICT:** ENG CLEARED - ready to implement Week 7 with noted deferrals.
NO UNRESOLVED DECISIONS
