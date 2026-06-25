# Gemini M-STOCK Parser Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 미래에셋증권 M-STOCK 보유 종목 캡처를 Gemini Vision으로 구조화하고 국내·해외주식의 원화 평가금액을 보존한다.

**Architecture:** 기존 `ScreenshotParser` 경계를 유지하고 property로 fake/Gemini 구현을 선택한다. Gemini REST API는 이미지를 base64 inline data로 전송하고 JSON schema 응답을 받아 `ParsedPortfolio`로 변환한다. 화면에 없는 ticker는 추측하지 않고 빈 값과 warning으로 반환한다.

**Tech Stack:** Java 21, Spring Boot 3.5, Spring RestClient, Jackson, Gemini REST API `gemini-3.5-flash`, JUnit 5, Mockito

## Global Constraints

- API 키는 `GEMINI_API_KEY` 환경변수에서만 읽고 로그·Git에 기록하지 않는다.
- 지원 화면은 미래에셋증권 M-STOCK 보유 종목 화면이다.
- 국내주식과 미국주식 가격은 원 통화를 유지한다.
- 평가금액은 M-STOCK 화면의 원화 환산 금액을 그대로 저장한다.
- 화면에 표시되지 않은 ticker를 모델이 추측하지 못하게 한다.
- 실제 금융 캡처 원본은 Git에 커밋하지 않는다.

---

### Task 1: 원화 평가금액 모델 확장

**Files:**
- Modify: `backend/src/main/java/com/app/golgo/portfolio/parser/ParsedHolding.java`
- Modify: `backend/src/main/java/com/app/golgo/portfolio/dto/HoldingPayload.java`
- Modify: `backend/src/main/java/com/app/golgo/portfolio/dto/ParsedHoldingResponse.java`
- Modify: `backend/src/main/java/com/app/golgo/portfolio/entity/Holding.java`
- Modify: `backend/src/main/java/com/app/golgo/portfolio/service/PortfolioScreenshotService.java`
- Create: `backend/src/main/resources/db/migration/V5__holding_current_value_krw.sql`
- Test: `backend/src/test/java/com/app/golgo/portfolio/service/PortfolioScreenshotServiceTest.java`

**Interfaces:**
- Consumes: M-STOCK에 표시된 `currentValueKrw`
- Produces: `HoldingPayload.currentValueKrw()`와 DB `holdings.current_value_krw`

- [ ] **Step 1: Write failing tests**

파싱 결과의 원화 평가금액이 screenshot JSON과 confirm된 holding에 유지되고, 총자산이 `quantity * currentPrice`가 아니라 `currentValueKrw` 합계로 계산되는 테스트를 작성한다.

- [ ] **Step 2: Verify RED**

Run: `.\gradlew.bat test --tests "*PortfolioScreenshotServiceTest"`
Expected: compile failure because `currentValueKrw` does not exist.

- [ ] **Step 3: Implement minimal schema propagation**

`ParsedHolding`, `HoldingPayload`, `ParsedHoldingResponse`, `Holding`에 `BigDecimal currentValueKrw`를 추가하고 service 합계 계산이 해당 값을 사용하게 한다. Flyway migration으로 nullable이 아닌 decimal 컬럼을 추가한다.

- [ ] **Step 4: Verify GREEN**

Run: `.\gradlew.bat test --tests "*PortfolioScreenshotServiceTest"`
Expected: all service tests pass.

### Task 2: Gemini 응답 변환 파서

**Files:**
- Create: `backend/src/main/java/com/app/golgo/portfolio/parser/gemini/GeminiVisionResult.java`
- Create: `backend/src/main/java/com/app/golgo/portfolio/parser/gemini/GeminiVisionClient.java`
- Create: `backend/src/main/java/com/app/golgo/portfolio/parser/gemini/GeminiScreenshotParser.java`
- Test: `backend/src/test/java/com/app/golgo/portfolio/parser/gemini/GeminiScreenshotParserTest.java`

**Interfaces:**
- Consumes: `GeminiVisionClient.parse(Path): GeminiVisionResult`
- Produces: `ScreenshotParser.parse(Path): ParsedPortfolio`

- [ ] **Step 1: Write failing parser tests**

국내주식 5개 응답이 숫자와 원화 평가금액을 유지하는지, ticker 누락 시 warning이 추가되는지, 빈 holdings가 거부되는지 테스트한다.

- [ ] **Step 2: Verify RED**

Run: `.\gradlew.bat test --tests "*GeminiScreenshotParserTest"`
Expected: compile failure because Gemini parser classes do not exist.

- [ ] **Step 3: Implement mapping and validation**

Gemini DTO를 `ParsedPortfolio`로 변환한다. ticker는 응답에 없으면 빈 문자열로 유지하고 warning을 추가한다. holdings가 비어 있으면 parser exception을 발생시킨다.

- [ ] **Step 4: Verify GREEN**

Run: `.\gradlew.bat test --tests "*GeminiScreenshotParserTest"`
Expected: all parser tests pass.

### Task 3: Gemini REST 클라이언트와 선택 설정

**Files:**
- Create: `backend/src/main/java/com/app/golgo/portfolio/parser/gemini/GeminiVisionProperties.java`
- Create: `backend/src/main/java/com/app/golgo/portfolio/parser/gemini/GoogleGeminiVisionClient.java`
- Modify: `backend/src/main/java/com/app/golgo/portfolio/parser/FakeScreenshotParser.java`
- Modify: `backend/src/main/java/com/app/golgo/portfolio/parser/gemini/GeminiScreenshotParser.java`
- Modify: `backend/src/main/resources/application.yml`
- Test: `backend/src/test/java/com/app/golgo/portfolio/parser/gemini/GoogleGeminiVisionClientTest.java`

**Interfaces:**
- Consumes: `GEMINI_API_KEY`, `GEMINI_MODEL`, image bytes
- Produces: typed `GeminiVisionResult`

- [ ] **Step 1: Write failing client tests**

Mock REST server로 `x-goog-api-key`, model URL, inline image MIME/base64, JSON response schema, M-STOCK prompt를 검증하고 Gemini 응답 text를 DTO로 변환하는지 테스트한다.

- [ ] **Step 2: Verify RED**

Run: `.\gradlew.bat test --tests "*GoogleGeminiVisionClientTest"`
Expected: compile failure because REST client does not exist.

- [ ] **Step 3: Implement REST request**

Spring `RestClient`와 Jackson을 사용해 `/v1beta/models/{model}:generateContent`를 호출한다. 기본 모델은 `gemini-3.5-flash`, timeout은 30초, parser 선택 기본값은 `fake`로 둔다.

- [ ] **Step 4: Verify GREEN**

Run: `.\gradlew.bat test --tests "*GoogleGeminiVisionClientTest"`
Expected: all client tests pass without network access.

### Task 4: 전체 검증과 실제 이미지 smoke test

**Files:**
- No production file additions

**Interfaces:**
- Consumes: 마스킹된 사용자 제공 이미지와 로컬 `GEMINI_API_KEY`
- Produces: 실제 5개 보유 종목 파싱 결과와 warning

- [ ] **Step 1: Run backend test suite**

Run: `.\gradlew.bat test`
Expected: BUILD SUCCESSFUL.

- [ ] **Step 2: Run frontend contract checks**

Run: `npm run test:portfolio-contract`, `npm run test:screenshot-job-contract`, `npm run lint`, `npm run build`
Expected: all commands exit 0.

- [ ] **Step 3: Run live Gemini smoke test**

마스킹된 이미지 파일을 Gemini parser에 전달한다. API 키와 원본 이미지는 출력하거나 저장소에 복사하지 않는다. 5개 종목, 수량, 평균단가, 현재가, 원화 평가금액을 기준값과 비교한다.

- [ ] **Step 4: Commit**

변경 파일과 검증 결과를 보고한 뒤 `feat(portfolio): Gemini M-STOCK 캡처 파싱 구현`으로 커밋한다. push는 수행하지 않는다.
