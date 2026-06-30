# Analysis Asset Type and ETF Response Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 분석 요청 조건에 종목 유형 선택을 추가하고, ETF 선택 시 Gemini 분석 응답에 ETF 전용 구조를 포함한다.

**Architecture:** 종목 유형은 종목코드에서 추정하지 않고 사용자가 `STOCK` 또는 `ETF`로 명시한다. 백엔드는 `analysis_reports.asset_type`에 요청 유형을 저장하고, `AnalysisPromptRequest`와 Gemini URL Context 프롬프트/JSON schema에 전달한다. 기존 7단계 섹션 저장 방식은 유지하되, ETF 전용 구조는 `sections.etfAnalysis`로 조건부 노출한다.

**Tech Stack:** Java 21, Spring Boot 3.5, Spring Data JPA, Flyway, Jackson, Gemini REST API with URL Context, JUnit 5, Mockito, React 19, TypeScript 5, TanStack Query 5, Axios, shadcn/ui, Lucide React

## Global Constraints

- 사용자가 선택한 종목 유형을 신뢰하되, URL Context 근거와 충돌하면 분석 본문에 `경고`를 포함한다.
- 종목코드는 국내/해외 URL 선택 힌트로만 사용하고 ETF 여부 판별 기준으로 쓰지 않는다.
- 기존 7단계 분석 응답은 깨지지 않아야 한다.
- ETF 전용 응답은 ETF 선택 시 필수, 주식 선택 시 `null` 또는 미노출 중 하나로 일관되게 처리한다.
- LLM 응답은 구조화된 JSON으로 제한한다.
- 이번 범위에 상세 리포트 화면 전체 구현은 포함하지 않는다.
- 이번 범위에 운용사 공식 ETF 페이지 추가 크롤링은 포함하지 않는다. URL Context는 기존 Naver/Finviz URL을 우선 사용한다.

---

## What Already Exists

- `AnalysisReportCreateRequest`는 `ticker`, `analysisType`, `llmProvider`를 받는다.
- `AnalysisReport`는 분석 헤더와 상태를 `analysis_reports`에 저장한다.
- `AnalysisPromptRequest`는 LLM에 `ticker`, `analysisType`, `llmProvider`를 전달한다.
- `GeminiAnalysisClient`는 URL Context evidence 수집 후 구조화 JSON을 요청한다.
- `AnalysisStructuredResult`는 7단계 섹션과 `investmentThesis`, `overallScore`, `recommendation`을 표현한다.
- `AnalysisService.detail()`은 `ReportSection.contentJson`을 `sections` map으로 반환한다.
- `AnalysisListPage`는 종목코드 입력과 분석 생성 버튼을 제공한다.

## NOT In Scope

- ETF 운용사 공식 사이트, 거래소, 별도 ETF 데이터 제공 사이트를 추가 호출하는 로직.
- 종목코드만으로 ETF 여부를 자동 판별하는 로직.
- Week 8 상세 리포트 시각화 화면 전체 구현.
- GPT/Claude 실제 provider 연결.
- Redis 상태 캐싱.

## Target Data Flow

```text
User
  |
  | select assetType + enter ticker
  v
AnalysisListPage
  |
  | POST /analysis/reports
  | { assetType: STOCK|ETF, ticker, analysisType, llmProvider }
  v
AnalysisService
  |
  | persist asset_type on analysis_reports
  v
AnalysisWorker
  |
  | AnalysisPromptRequest(assetType, ticker, analysisType, llmProvider)
  v
GeminiAnalysisClient
  |
  | 1. URL Context evidence prompt includes declared asset type
  | 2. JSON response schema includes dataVerification + etfAnalysis
  v
AnalysisStructuredResult
  |
  | report_sections:
  | - existing 7 sections
  | - ETF_ANALYSIS only when assetType == ETF
  v
GET /analysis/reports/{reportId}
  |
  v
sections.etfAnalysis
```

## Task 1: Backend Asset Type Contract

**Files:**
- Create: `backend/src/main/java/com/app/golgo/analysis/entity/AssetType.java`
- Modify: `backend/src/main/java/com/app/golgo/analysis/dto/AnalysisReportCreateRequest.java`
- Modify: `backend/src/main/java/com/app/golgo/analysis/dto/AnalysisReportResponse.java`
- Modify: `backend/src/main/java/com/app/golgo/analysis/dto/AnalysisReportSummaryResponse.java`
- Modify: `backend/src/main/java/com/app/golgo/analysis/entity/AnalysisReport.java`
- Create: `backend/src/main/resources/db/migration/V8__analysis_asset_type.sql`
- Test: `backend/src/test/java/com/app/golgo/analysis/entity/AnalysisEntityTest.java`
- Test: `backend/src/test/java/com/app/golgo/analysis/service/AnalysisServiceTest.java`

**Interfaces:**
- Produces: `AssetType` enum with `STOCK`, `ETF`.
- Produces: `AnalysisReportCreateRequest.assetType`.
- Produces: `AnalysisReport.assetType`.
- Produces: response field `assetType` in detail and summary responses.

- [ ] **Step 1: Write failing backend contract tests**

Add tests that create an ETF analysis request and assert:

```java
AnalysisReportCreateRequest request = new AnalysisReportCreateRequest(
    "SPY",
    AssetType.ETF,
    AnalysisType.DEEP_INFERENCE,
    LlmProvider.GEMINI
);
```

Expected assertions:
- `AnalysisService.createReport()` persists `AssetType.ETF`.
- `AnalysisService.list()` returns `"ETF"`.
- `AnalysisService.detail()` returns `"ETF"`.

Run:

```powershell
.\gradlew.bat test --tests "*AnalysisServiceTest" --tests "*AnalysisEntityTest"
```

Expected: compile failure because `AssetType` does not exist.

- [ ] **Step 2: Add migration**

Create:

```sql
ALTER TABLE analysis_reports
    ADD COLUMN asset_type VARCHAR(20) NOT NULL DEFAULT 'STOCK';

ALTER TABLE analysis_reports
    ALTER COLUMN asset_type DROP DEFAULT;

ALTER TABLE analysis_reports
    ADD CONSTRAINT chk_analysis_reports_asset_type
        CHECK (asset_type IN ('STOCK', 'ETF'));
```

This keeps existing reports valid as stock reports without backfilling from ticker patterns.

- [ ] **Step 3: Implement enum and entity field**

Add:

```java
public enum AssetType {
    STOCK,
    ETF
}
```

Add `@Enumerated(EnumType.STRING)` field `assetType` to `AnalysisReport`.

Update `AnalysisReport.createPending(User, String, AssetType, AnalysisType, LlmProvider, Clock)`.

- [ ] **Step 4: Update DTOs and service mapping**

Update request record order to:

```java
public record AnalysisReportCreateRequest(
    @NotBlank @Size(max = 20) String ticker,
    @NotNull AssetType assetType,
    AnalysisType analysisType,
    LlmProvider llmProvider
) {}
```

Use `@NotNull` because this is now an explicit search condition.

- [ ] **Step 5: Verify backend contract tests**

Run:

```powershell
.\gradlew.bat test --tests "*AnalysisServiceTest" --tests "*AnalysisEntityTest"
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

Commit message:

```text
feat(analysis): 분석 종목 유형 계약 추가
```

## Task 2: Structured ETF LLM Response

**Files:**
- Modify: `backend/src/main/java/com/app/golgo/analysis/llm/AnalysisPromptRequest.java`
- Modify: `backend/src/main/java/com/app/golgo/analysis/llm/AnalysisStructuredResult.java`
- Modify: `backend/src/main/java/com/app/golgo/analysis/llm/AnalysisPromptFactory.java`
- Modify: `backend/src/main/java/com/app/golgo/analysis/llm/GeminiAnalysisClient.java`
- Modify: `backend/src/main/java/com/app/golgo/analysis/entity/SectionCode.java`
- Modify: `backend/src/main/java/com/app/golgo/analysis/service/AnalysisWorker.java`
- Modify: `backend/src/main/java/com/app/golgo/analysis/service/AnalysisService.java`
- Test: `backend/src/test/java/com/app/golgo/analysis/llm/AnalysisPromptFactoryTest.java`
- Test: `backend/src/test/java/com/app/golgo/analysis/llm/GeminiAnalysisClientTest.java`
- Test: `backend/src/test/java/com/app/golgo/analysis/llm/AnalysisStructuredResultTest.java`
- Test: `backend/src/test/java/com/app/golgo/analysis/service/AnalysisServiceTest.java`

**Interfaces:**
- Consumes: `AnalysisPromptRequest.assetType`.
- Produces: `AnalysisStructuredResult.dataVerification`.
- Produces: `AnalysisStructuredResult.etfAnalysis`.
- Produces: `sections.dataVerification` and `sections.etfAnalysis` in detail response.

- [ ] **Step 1: Write failing LLM structure tests**

Add tests asserting:
- user prompt contains `Declared asset type: ETF`;
- URL Context prompt asks to verify whether source evidence conflicts with declared asset type;
- Gemini schema contains `dataVerification`;
- Gemini schema contains `etfAnalysis`;
- mock ETF response parses into `AnalysisStructuredResult.etfAnalysis()`.

Run:

```powershell
.\gradlew.bat test --tests "*AnalysisPromptFactoryTest" --tests "*GeminiAnalysisClientTest" --tests "*AnalysisStructuredResultTest"
```

Expected: failures until schema and records are extended.

- [ ] **Step 2: Extend structured records**

Add top-level records:

```java
public record DataVerification(
    String declaredAssetType,
    String verifiedAssetType,
    String dataSource,
    String dataAsOf,
    List<String> unavailableFields,
    List<String> warnings,
    int score
) {}

public record EtfAnalysis(
    String indexName,
    String issuer,
    String replicationMethod,
    BigDecimal nav,
    BigDecimal marketPrice,
    BigDecimal premiumDiscountPct,
    BigDecimal expenseRatioPct,
    BigDecimal aum,
    BigDecimal trackingErrorPct,
    BigDecimal averageDailyTradingValue,
    String bidAskSpread,
    List<String> topHoldings,
    List<String> exposures,
    String leverageInverseSynthetic,
    String currencyHedge,
    String liquidityRisk,
    int score
) {}
```

`etfAnalysis` is required by Gemini schema but may contain `"미확인"`/`null` values when evidence is unavailable. For `STOCK`, schema should allow `etfAnalysis` to be `null`.

- [ ] **Step 3: Update prompts**

Prompt rules:
- Tell Gemini the user-declared asset type.
- If declared type is `ETF`, prioritize ETF analysis and fill `etfAnalysis`.
- If declared type is `STOCK`, do not fill ETF fields except `null`.
- If URL Context evidence conflicts with declared type, include `"경고"` in `dataVerification.warnings`.

- [ ] **Step 4: Update Gemini response schema**

Change `responseSchema()` to include:
- `dataVerification` object in required fields.
- `etfAnalysis` with nullable object semantics if Gemini schema supports it; otherwise require an object and instruct stock reports to use `"미해당"` strings and `null` numerics.

Preferred schema if supported:

```json
{
  "etfAnalysis": {
    "type": "object",
    "nullable": true
  }
}
```

Fallback schema:

```json
{
  "etfAnalysis": {
    "type": "object",
    "properties": {
      "indexName": { "type": "string" },
      "issuer": { "type": "string" },
      "score": { "type": "integer" }
    }
  }
}
```

- [ ] **Step 5: Persist extra sections**

Add `SectionCode.DATA_VERIFICATION` and `SectionCode.ETF_ANALYSIS`.

Update worker order:

```text
0 DATA_VERIFICATION
1 BUSINESS_MODEL
2 INDUSTRY_STRUCTURE
3 FINANCIALS
4 VALUATION
5 EARNINGS_CALL
6 MACRO_POLICY
7 CATALYSTS_AND_RISKS
8 ETF_ANALYSIS, only when assetType == ETF or etfAnalysis != null
```

- [ ] **Step 6: Verify LLM and service tests**

Run:

```powershell
.\gradlew.bat test --tests "*AnalysisPromptFactoryTest" --tests "*GeminiAnalysisClientTest" --tests "*AnalysisStructuredResultTest" --tests "*AnalysisServiceTest"
```

Expected: all tests pass.

- [ ] **Step 7: Commit**

Commit message:

```text
feat(analysis): ETF 전용 분석 응답 구조 확장
```

## Task 3: Frontend Asset Type Select

**Files:**
- Modify: `frontend/src/features/analysis/types.ts`
- Modify: `frontend/src/features/analysis/api/analysis-api.ts`
- Modify: `frontend/src/features/analysis/api/analysis-contract.test.mjs`
- Modify: `frontend/src/features/analysis/pages/AnalysisListPage.tsx`

**Interfaces:**
- Consumes: `AssetType = 'STOCK' | 'ETF'`.
- Produces: request body `{ ticker, assetType, analysisType, llmProvider }`.

- [ ] **Step 1: Write failing frontend contract tests**

Add assertions:

```ts
assert.deepEqual(createAnalysisReportPayload(' spy ', 'ETF', 'GEMINI'), {
  ticker: 'SPY',
  assetType: 'ETF',
  analysisType: 'DEEP_INFERENCE',
  llmProvider: 'GEMINI',
})
```

Run:

```powershell
npm run test:analysis-contract
```

Expected: failure until `assetType` is added.

- [ ] **Step 2: Update types and payload factory**

Add:

```ts
export type AssetType = 'STOCK' | 'ETF'
```

Update `AnalysisReportCreateRequest` and `AnalysisReportSummary`.

- [ ] **Step 3: Add select UI**

Add a compact select or segmented control above 종목코드:
- label: `종목 유형`
- options: `주식`, `ETF`
- default: `STOCK`

Keep provider and analysis type hidden.

- [ ] **Step 4: Verify frontend**

Run:

```powershell
npm run test:analysis-contract
npm run typecheck
npm run lint
npm run build
```

Expected: all commands exit 0. Existing Vite chunk size warning is acceptable unless a new warning appears.

- [ ] **Step 5: Commit**

Commit message:

```text
feat(analysis): 분석 종목 유형 선택 UI 추가
```

## Task 4: API Spec, Roadmap, and Live Verification

**Files:**
- Modify: `api-spec.md`
- Modify: `roadmap.md`
- Optional Modify: `docs/superpowers/plans/2026-06-29-week7-ai-analysis.md` only if it is used as the live Week 7 tracking document.

**Interfaces:**
- Documents: `POST /analysis/reports` now requires `assetType`.
- Documents: detail response may include `sections.dataVerification` and `sections.etfAnalysis`.

- [ ] **Step 1: Update API spec request example**

Change analysis create request to:

```json
{
  "ticker": "SPY",
  "assetType": "ETF",
  "analysisType": "DEEP_INFERENCE",
  "llmProvider": "GEMINI"
}
```

- [ ] **Step 2: Update API spec response example**

Add:

```json
{
  "assetType": "ETF",
  "sections": {
    "dataVerification": {
      "declaredAssetType": "ETF",
      "verifiedAssetType": "ETF",
      "dataSource": "finviz.com",
      "dataAsOf": "미확인",
      "unavailableFields": ["NAV", "trackingErrorPct"],
      "warnings": [],
      "score": 7
    },
    "etfAnalysis": {
      "indexName": "S&P 500",
      "issuer": "SPDR",
      "premiumDiscountPct": null,
      "expenseRatioPct": 0.09,
      "topHoldings": ["미확인"],
      "score": 7
    }
  }
}
```

- [ ] **Step 3: Run full verification**

Backend:

```powershell
.\gradlew.bat test
```

Frontend:

```powershell
npm run test:analysis-contract
npm run typecheck
npm run lint
npm run build
```

- [ ] **Step 4: Optional live Gemini ETF smoke test**

Only run when `GEMINI_API_KEY` is locally configured. Use `SPY` or `QQQ` with `assetType: ETF`.

Expected:
- report reaches `COMPLETED`;
- detail response contains `sections.etfAnalysis`;
- `dataVerification.declaredAssetType` is `ETF`;
- unavailable ETF fields are marked `"미확인"` or `null`, not invented.

- [ ] **Step 5: Commit final docs or fixes**

If only docs changed:

```text
docs(analysis): ETF 분석 계약 문서화
```

If fixes were needed:

```text
fix(analysis): ETF 분석 계약 검증 보강
```

## Test Coverage Diagram

```text
CODE PATHS                                                   USER FLOWS
[+] POST /analysis/reports                                   [+] Analysis request
  ├── [GAP] assetType missing -> 400                            ├── [GAP] user selects 주식 + AAPL
  ├── [GAP] assetType ETF -> persisted                          ├── [GAP] user selects ETF + SPY
  └── [GAP] defaulting removed, explicit required               └── [GAP] submit disabled while pending

[+] AnalysisWorker -> Gemini                                  [+] LLM result
  ├── [GAP] prompt carries assetType                            ├── [GAP] ETF result exposes etfAnalysis
  ├── [GAP] URL evidence conflicts -> warning                   └── [GAP] stock result does not fake ETF data
  └── [GAP] ETF schema parses and persists

[+] GET /analysis/reports/{id}
  ├── [GAP] detail includes assetType
  ├── [GAP] detail includes dataVerification
  └── [GAP] ETF detail includes etfAnalysis

COVERAGE TARGET: 0 current / 12 planned paths covered by new or updated tests.
QUALITY TARGET: backend unit/integration ★★★, frontend contract ★★, optional live Gemini smoke ★★.
```

## Failure Modes

| Failure | Expected Handling | Test |
|---------|-------------------|------|
| Client omits `assetType` | 400 validation error | `AnalysisControllerTest` |
| User selects ETF for a stock ticker | Analysis completes with `dataVerification.warnings` containing `경고` | `GeminiAnalysisClientTest` mock response |
| Gemini omits `etfAnalysis` for ETF | parse failure or validation failure marks report `FAILED` | `GeminiAnalysisClientTest` |
| Finviz lacks NAV/tracking error | ETF fields become `"미확인"` or `null` | prompt/client test |
| Existing old reports have no asset type | migration defaults existing rows to `STOCK` | migration/entity test |

## Parallelization

Sequential implementation, no parallelization opportunity. The backend request contract, entity, prompt schema, worker persistence, and frontend payload all depend on the same `assetType` contract and should land in order to avoid incompatible intermediate states.

## Implementation Tasks

Synthesized from this review's findings. Each task derives from a specific finding above. Run with Codex; checkbox as you ship.

- [ ] **T1 (P1, human: ~1h / CC: ~15min)** — backend contract — Add explicit `assetType` to analysis create/list/detail contracts.
  - Surfaced by: Architecture — ETF 여부를 ticker로 추정하면 주식/ETF가 같은 문자열 체계를 공유해 오분류된다.
  - Files: `backend/src/main/java/com/app/golgo/analysis/**`, `backend/src/main/resources/db/migration/V8__analysis_asset_type.sql`
  - Verify: `.\gradlew.bat test --tests "*AnalysisServiceTest" --tests "*AnalysisEntityTest"`
- [ ] **T2 (P1, human: ~2h / CC: ~30min)** — LLM schema — Add `dataVerification` and conditional `etfAnalysis` to structured Gemini output.
  - Surfaced by: Architecture — ETF 분석은 기존 PER/PBR 중심 스키마만으로 NAV/비용/유동성 리스크를 담기 어렵다.
  - Files: `backend/src/main/java/com/app/golgo/analysis/llm/**`, `backend/src/main/java/com/app/golgo/analysis/service/AnalysisWorker.java`
  - Verify: `.\gradlew.bat test --tests "*GeminiAnalysisClientTest" --tests "*AnalysisPromptFactoryTest" --tests "*AnalysisStructuredResultTest"`
- [ ] **T3 (P2, human: ~45min / CC: ~10min)** — frontend form — Add 종목 유형 select and include `assetType` in the analysis request.
  - Surfaced by: Code Quality — 사용자 의도를 명시적으로 받으면 백엔드 추정 로직과 UI 설명 복잡도가 줄어든다.
  - Files: `frontend/src/features/analysis/**`
  - Verify: `npm run test:analysis-contract && npm run typecheck && npm run lint && npm run build`
- [ ] **T4 (P2, human: ~30min / CC: ~10min)** — documentation — Update API spec and roadmap to match the explicit asset type contract.
  - Surfaced by: Test/Docs — API 예시가 request body 계약과 다르면 프론트/백엔드가 다시 어긋난다.
  - Files: `api-spec.md`, `roadmap.md`
  - Verify: read changed docs and run full test commands above.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | not run | Product scope is a direct continuation of Week 7 analysis, no scope expansion review requested |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | not run | No implementation diff exists yet |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | clear | `gstack-review-log` executed; 4 issues folded into plan: explicit asset type, ETF schema, frontend contract, docs sync |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | not run | UI change is a small form select; browser/design review can run after implementation |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | not run | No developer onboarding or tooling change |

- **VERDICT:** ENG CLEARED — ready to implement sequentially. `gstack-review-read` was executed after logging and returned exit code 0 with no printable dashboard output.
NO UNRESOLVED DECISIONS
