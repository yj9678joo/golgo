# Golgo (고르고) ERD 설계서

> 데이터베이스: PostgreSQL 15 (Supabase) ORM: Spring Data JPA + QueryDSL 명명 규칙: snake_case (DB) / camelCase (JPA Entity)

---

## 0. 설계 원칙

### 키 전략

- **PK**: `UUID v7` (시간 정렬 가능, 분산 환경 친화적)
- **FK**: 모두 `ON DELETE CASCADE` 또는 `ON DELETE SET NULL` 명시
- **Natural Key**: `email`, `nickname`, `(provider, provider_id)` 는 UNIQUE 제약

### 공통 컬럼

- `created_at` / `updated_at`: 모든 테이블 필수 (`TIMESTAMPTZ DEFAULT NOW()`)
- `deleted_at`: 소프트 삭제 대상 테이블 (User, BrokerAccount)

### JSON 활용

- 7단계 분석 섹션 내용 → `JSONB`
- 일별 포트폴리오 스냅샷 보유 종목 → `JSONB`
- 선호 섹터 목록 → `JSONB`

### 인덱싱 전략

- 외래키 컬럼 전체 인덱스
- 시계열 조회 컬럼 (`snapshot_date`, `sent_at`) B-Tree 인덱스
- 자주 조회되는 복합 조건 → 복합 인덱스

---

## 1. 사용자 도메인

### 1.1 USERS (사용자)

|컬럼|타입|제약|설명|
|---|---|---|---|
|id|UUID|PK|사용자 ID|
|email|VARCHAR(255)|UNIQUE, NOT NULL|이메일 (계정 병합 기준)|
|nickname|VARCHAR(12)|UNIQUE, NOT NULL|닉네임 (2~12자)|
|profile_image|TEXT|NULL|프로필 이미지 URL|
|created_at|TIMESTAMPTZ|NOT NULL|가입일시|
|updated_at|TIMESTAMPTZ|NOT NULL|수정일시|
|deleted_at|TIMESTAMPTZ|NULL|탈퇴일시 (소프트 삭제)|

**인덱스**

- `idx_users_email` (email) — 로그인 시 조회
- `idx_users_nickname` (nickname) — 중복 체크

---

### 1.2 AUTH_PROVIDERS (소셜 로그인 연결)

|컬럼|타입|제약|설명|
|---|---|---|---|
|id|UUID|PK|-|
|user_id|UUID|FK→users.id, CASCADE|사용자 ID|
|provider|VARCHAR(20)|NOT NULL|`KAKAO`, `NAVER`, `GOOGLE`|
|provider_id|VARCHAR(255)|NOT NULL|Provider 측 고유 ID|
|connected_at|TIMESTAMPTZ|NOT NULL|연결일시|

**제약**

- UNIQUE (`provider`, `provider_id`) — 같은 소셜 계정 중복 연결 방지
- UNIQUE (`user_id`, `provider`) — 한 사용자가 같은 Provider 중복 연결 방지

**인덱스**

- `idx_auth_providers_user` (user_id)

---

### 1.3 REFRESH_TOKENS (JWT 갱신 토큰)

|컬럼|타입|제약|설명|
|---|---|---|---|
|id|UUID|PK|-|
|user_id|UUID|FK→users.id, CASCADE|사용자 ID|
|token_hash|VARCHAR(255)|UNIQUE, NOT NULL|토큰 SHA-256 해시|
|expires_at|TIMESTAMPTZ|NOT NULL|만료일시 (7일)|
|created_at|TIMESTAMPTZ|NOT NULL|발급일시|

**인덱스**

- `idx_refresh_tokens_user` (user_id)
- `idx_refresh_tokens_expires` (expires_at) — 만료 토큰 청소용

> 💡 평문 저장 금지. 해시값만 저장하고 검증 시 해시 비교

---

## 2. 증권사 도메인

### 2.1 BROKER_ACCOUNTS (증권사 계좌)

|컬럼|타입|제약|설명|
|---|---|---|---|
|id|UUID|PK|-|
|user_id|UUID|FK→users.id, CASCADE|사용자 ID|
|broker_code|VARCHAR(20)|NOT NULL|`KIS`, `MIRAE` 등|
|connection_type|VARCHAR(20)|NOT NULL|`API_KEY`, `SCREENSHOT`|
|account_number|VARCHAR(50)|NULL|계좌번호 (API_KEY 방식만 입력)|
|account_nickname|VARCHAR(50)|NULL|사용자 지정 계좌 별칭|
|app_key_enc|TEXT|NULL|AES-256 암호화 (API_KEY 방식만)|
|app_secret_enc|TEXT|NULL|AES-256 암호화 (API_KEY 방식만)|
|access_token_enc|TEXT|NULL|증권사 발급 토큰 (API_KEY 방식만)|
|token_expires_at|TIMESTAMPTZ|NULL|증권사 토큰 만료시각|
|last_synced_at|TIMESTAMPTZ|NULL|마지막 동기화 시각|
|created_at|TIMESTAMPTZ|NOT NULL|-|
|updated_at|TIMESTAMPTZ|NOT NULL|-|
|deleted_at|TIMESTAMPTZ|NULL|연결 해제일시|

**제약**

- CHECK (`connection_type` IN ('API_KEY', 'SCREENSHOT'))
- CHECK (`connection_type` = 'SCREENSHOT' OR `account_number` IS NOT NULL) — API_KEY 방식이면 계좌번호 필수
- CHECK (`connection_type` = 'SCREENSHOT' OR `app_key_enc` IS NOT NULL) — API_KEY 방식이면 App Key 필수

**인덱스**

- `idx_broker_accounts_user` (user_id)
- `idx_broker_accounts_user_broker` (user_id, broker_code)

> 💡 KIS는 `connection_type`을 `SCREENSHOT` → `API_KEY`로 업그레이드 가능 (`PATCH /brokers/accounts/{accountId}`) 💡 미래에셋은 `SCREENSHOT` 고정

---

### 2.2 PORTFOLIO_SCREENSHOTS (캡처 이미지 파싱 이력)

미래에셋 등 캡처 방식 증권사의 이미지 업로드 및 파싱 결과 저장.

|컬럼|타입|제약|설명|
|---|---|---|---|
|id|UUID|PK|job ID|
|user_id|UUID|FK→users.id, CASCADE|사용자 ID|
|broker_account_id|UUID|FK→broker_accounts.id, CASCADE|연결 계좌|
|broker_code|VARCHAR(20)|NOT NULL|`MIRAE` 등|
|image_path|TEXT|NOT NULL|스토리지 저장 경로|
|status|VARCHAR(20)|NOT NULL|`PROCESSING`, `COMPLETED`, `PENDING_CONFIRM`, `CONFIRMED`, `FAILED`|
|confidence|DECIMAL(4,3)|NULL|파싱 신뢰도 (0.000~1.000)|
|parsed_holdings_json|JSONB|NULL|Vision API 원본 파싱 결과|
|edited_holdings_json|JSONB|NULL|사용자 수정 후 최종 내용|
|is_manually_edited|BOOLEAN|DEFAULT FALSE|사용자 수정 여부|
|total_asset_krw|DECIMAL(18,2)|NULL|최종 확정 총 자산|
|warnings_json|JSONB|NULL|낮은 신뢰도 경고 메시지|
|error_reason|VARCHAR(50)|NULL|`PARSE_ERROR`, `LOW_QUALITY` 등|
|requested_at|TIMESTAMPTZ|NOT NULL|업로드 시각|
|completed_at|TIMESTAMPTZ|NULL|파싱 완료 시각|
|confirmed_at|TIMESTAMPTZ|NULL|사용자 최종 저장 시각|

**인덱스**

- `idx_portfolio_screenshots_user` (user_id, requested_at DESC)
- `idx_portfolio_screenshots_status` (status) WHERE status = 'PROCESSING'

> 💡 파싱 완료 후 `parsed_holdings_json`의 데이터는 사용자 확인(confirm) 후 `HOLDINGS` 테이블에 UPSERT 💡 사용자가 수정한 경우 `edited_holdings_json`이 최종 반영 대상 💡 `status` 흐름: `PROCESSING` → `COMPLETED` → `PENDING_CONFIRM` → `CONFIRMED` 💡 이미지 원본은 30일 후 자동 삭제 (개인정보 최소화)

---

### 2.2 HOLDINGS (보유 종목 - 현재 상태)

|컬럼|타입|제약|설명|
|---|---|---|---|
|id|UUID|PK|-|
|broker_account_id|UUID|FK→broker_accounts.id, CASCADE|계좌 ID|
|ticker|VARCHAR(20)|NOT NULL|종목코드|
|name|VARCHAR(100)|NOT NULL|종목명|
|market|VARCHAR(20)|NOT NULL|`KOSPI`, `NASDAQ` 등|
|quantity|DECIMAL(18,4)|NOT NULL|보유 수량|
|avg_price|DECIMAL(18,4)|NOT NULL|평균 매입가|
|current_price|DECIMAL(18,4)|NULL|현재가 (캐시)|
|currency|VARCHAR(3)|NOT NULL|`KRW`, `USD`|
|updated_at|TIMESTAMPTZ|NOT NULL|-|

**제약**

- UNIQUE (`broker_account_id`, `ticker`) — 종목당 1행 (UPSERT)

> 💡 이력은 PORTFOLIO_SNAPSHOTS 테이블에서 별도 관리. 이 테이블은 항상 현재 상태만 유지

---

### 2.3 PORTFOLIO_SNAPSHOTS (자산 변동 이력)

|컬럼|타입|제약|설명|
|---|---|---|---|
|id|UUID|PK|-|
|user_id|UUID|FK→users.id, CASCADE|사용자 ID|
|snapshot_date|DATE|NOT NULL|기준일|
|total_asset_krw|DECIMAL(18,2)|NOT NULL|총 자산 (원화 환산)|
|total_profit_krw|DECIMAL(18,2)|NOT NULL|누적 수익금|
|profit_rate|DECIMAL(7,4)|NOT NULL|수익률 (%)|
|holdings_json|JSONB|NOT NULL|해당 시점 보유 종목 스냅샷|
|created_at|TIMESTAMPTZ|NOT NULL|-|

**제약**

- UNIQUE (`user_id`, `snapshot_date`) — 일별 1행

**인덱스**

- `idx_portfolio_snapshots_user_date` (user_id, snapshot_date DESC)

> 💡 매일 자정 배치로 INSERT. 차트 조회 시 빠른 응답 보장

---

## 3. 전략 도메인

### 3.1 STRATEGIES (투자 전략)

|컬럼|타입|제약|설명|
|---|---|---|---|
|id|UUID|PK|-|
|user_id|UUID|FK→users.id, CASCADE, UNIQUE|사용자당 1개|
|strategy_code|VARCHAR(50)|NOT NULL|`PASSIVE_INDEX`, `AGGRESSIVE_SECTOR` 등|
|risk_tolerance|VARCHAR(20)|NOT NULL|`LOW`, `MEDIUM`, `HIGH`|
|investment_horizon|VARCHAR(20)|NOT NULL|`SHORT_TERM`, `MID_TERM`, `LONG_TERM`|
|monthly_deposit_krw|INTEGER|NULL|월 적립 금액|
|preferred_sectors|JSONB|NULL|`["AI", "SEMICONDUCTOR"]`|
|activated_at|TIMESTAMPTZ|NOT NULL|활성화 시각|
|updated_at|TIMESTAMPTZ|NOT NULL|-|

---

### 3.2 TARGET_WEIGHTS (목표 비중)

|컬럼|타입|제약|설명|
|---|---|---|---|
|id|UUID|PK|-|
|strategy_id|UUID|FK→strategies.id, CASCADE|전략 ID|
|ticker|VARCHAR(20)|NOT NULL|종목코드|
|target_weight|DECIMAL(5,2)|NOT NULL|목표 비중 (%)|
|updated_at|TIMESTAMPTZ|NOT NULL|-|

**제약**

- UNIQUE (`strategy_id`, `ticker`)
- CHECK (`target_weight` BETWEEN 0 AND 100)

> ⚠️ 전략별 합계 = 100% 검증은 애플리케이션 레벨에서 처리

---

## 4. AI 분석 도메인

### 4.1 ANALYSIS_REPORTS (분석 리포트)

|컬럼|타입|제약|설명|
|---|---|---|---|
|id|UUID|PK|-|
|user_id|UUID|FK→users.id, CASCADE|사용자 ID|
|ticker|VARCHAR(20)|NOT NULL|분석 대상 종목|
|analysis_type|VARCHAR(20)|NOT NULL|`QUICK`, `DEEP_INFERENCE`|
|llm_provider|VARCHAR(20)|NOT NULL|`GEMINI`, `GPT`, `CLAUDE`|
|status|VARCHAR(20)|NOT NULL|`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`|
|progress_pct|SMALLINT|DEFAULT 0|진행률|
|current_step|VARCHAR(30)|NULL|현재 분석 중인 단계|
|investment_thesis|TEXT|NULL|핵심 투자 논리|
|overall_score|DECIMAL(4,2)|NULL|종합 점수 (0~10)|
|recommendation|VARCHAR(20)|NULL|`BUY`, `HOLD`, `SELL`|
|error_message|TEXT|NULL|실패 사유|
|requested_at|TIMESTAMPTZ|NOT NULL|요청 시각|
|generated_at|TIMESTAMPTZ|NULL|완료 시각|

**인덱스**

- `idx_analysis_reports_user_ticker` (user_id, ticker, requested_at DESC)
- `idx_analysis_reports_status` (status) — 비동기 처리 큐 조회용

---

### 4.2 REPORT_SECTIONS (분석 섹션 - 7단계)

|컬럼|타입|제약|설명|
|---|---|---|---|
|id|UUID|PK|-|
|report_id|UUID|FK→analysis_reports.id, CASCADE|리포트 ID|
|section_code|VARCHAR(30)|NOT NULL|`BUSINESS_MODEL`, `VALUATION` 등|
|section_order|SMALLINT|NOT NULL|1~7|
|content_json|JSONB|NOT NULL|섹션별 상세 내용 (구조 가변)|
|score|SMALLINT|NULL|섹션 점수 (0~10)|
|created_at|TIMESTAMPTZ|NOT NULL|-|

**제약**

- UNIQUE (`report_id`, `section_code`)

> 💡 `content_json` 예시: `{"summary": "...", "moat": "STRONG", "competitors": [...]}`

---

## 5. 리밸런싱 도메인

### 5.1 REBALANCE_EXECUTIONS (리밸런싱 실행)

|컬럼|타입|제약|설명|
|---|---|---|---|
|id|UUID|PK|-|
|user_id|UUID|FK→users.id, CASCADE|사용자 ID|
|broker_account_id|UUID|FK→broker_accounts.id|대상 계좌|
|status|VARCHAR(20)|NOT NULL|`PREVIEW`, `SUBMITTED`, `COMPLETED`, `FAILED`, `CANCELLED`|
|total_buy_amount|DECIMAL(18,2)|NOT NULL|총 매수 금액|
|total_sell_amount|DECIMAL(18,2)|NOT NULL|총 매도 금액|
|estimated_fee_krw|DECIMAL(18,2)|NOT NULL|예상 수수료|
|executed_at|TIMESTAMPTZ|NULL|실행 시각|
|completed_at|TIMESTAMPTZ|NULL|완료 시각|
|created_at|TIMESTAMPTZ|NOT NULL|-|

---

### 5.2 ORDERS (주문)

|컬럼|타입|제약|설명|
|---|---|---|---|
|id|UUID|PK|-|
|execution_id|UUID|FK→rebalance_executions.id, CASCADE|실행 ID|
|ticker|VARCHAR(20)|NOT NULL|종목코드|
|action|VARCHAR(10)|NOT NULL|`BUY`, `SELL`|
|order_type|VARCHAR(10)|NOT NULL|`MARKET`, `LIMIT`|
|quantity|DECIMAL(18,4)|NOT NULL|주문 수량|
|limit_price|DECIMAL(18,4)|NULL|지정가 (LIMIT 일 때)|
|executed_price|DECIMAL(18,4)|NULL|체결가|
|broker_order_id|VARCHAR(100)|NULL|증권사 주문 ID|
|status|VARCHAR(20)|NOT NULL|`PENDING`, `FILLED`, `PARTIAL`, `CANCELLED`|
|submitted_at|TIMESTAMPTZ|NULL|주문 전송 시각|
|filled_at|TIMESTAMPTZ|NULL|체결 시각|

**인덱스**

- `idx_orders_execution` (execution_id)
- `idx_orders_broker_order_id` (broker_order_id) — 증권사 콜백 매칭용

---

## 6. 알림 도메인

### 6.1 NOTIFICATION_SUBSCRIPTIONS (PWA 푸시 구독)

|컬럼|타입|제약|설명|
|---|---|---|---|
|id|UUID|PK|-|
|user_id|UUID|FK→users.id, CASCADE|사용자 ID|
|endpoint|TEXT|NOT NULL|Web Push 엔드포인트|
|p256dh_key|VARCHAR(255)|NOT NULL|공개키|
|auth_key|VARCHAR(255)|NOT NULL|인증키|
|device_type|VARCHAR(20)|NOT NULL|`IOS_PWA`, `ANDROID_PWA`, `DESKTOP`|
|user_agent|TEXT|NULL|디바이스 정보|
|created_at|TIMESTAMPTZ|NOT NULL|-|
|last_used_at|TIMESTAMPTZ|NULL|마지막 알림 발송|

**제약**

- UNIQUE (`endpoint`)

---

### 6.2 NOTIFICATION_SETTINGS (알림 설정)

|컬럼|타입|제약|설명|
|---|---|---|---|
|user_id|UUID|PK, FK→users.id, CASCADE|사용자당 1행|
|rebalance_alert|BOOLEAN|DEFAULT TRUE|리밸런싱 알림|
|deviation_threshold|DECIMAL(5,2)|DEFAULT 5.00|괴리율 임계치 (%)|
|price_alert|BOOLEAN|DEFAULT FALSE|가격 알림|
|weekly_report|BOOLEAN|DEFAULT TRUE|주간 리포트|
|quiet_hours_start|TIME|DEFAULT '22:00'|방해금지 시작|
|quiet_hours_end|TIME|DEFAULT '08:00'|방해금지 종료|
|updated_at|TIMESTAMPTZ|NOT NULL|-|

---

### 6.3 NOTIFICATION_LOGS (알림 발송 이력)

|컬럼|타입|제약|설명|
|---|---|---|---|
|id|UUID|PK|-|
|user_id|UUID|FK→users.id, CASCADE|사용자 ID|
|notification_type|VARCHAR(30)|NOT NULL|`REBALANCE`, `PRICE_ALERT`, `WEEKLY_REPORT`|
|title|VARCHAR(100)|NOT NULL|-|
|body|TEXT|NOT NULL|-|
|deep_link|TEXT|NULL|클릭 시 이동 URL|
|is_read|BOOLEAN|DEFAULT FALSE|읽음 여부|
|sent_at|TIMESTAMPTZ|NOT NULL|발송 시각|
|read_at|TIMESTAMPTZ|NULL|읽음 시각|

**인덱스**

- `idx_notification_logs_user_sent` (user_id, sent_at DESC)
- `idx_notification_logs_user_unread` (user_id, is_read) WHERE is_read = FALSE — 부분 인덱스

---

## 7. 관계 요약

```
USERS ─┬─ AUTH_PROVIDERS (1:N)
       ├─ REFRESH_TOKENS (1:N)
       ├─ BROKER_ACCOUNTS (1:N)
       │   ├─ connection_type: REST_API → HOLDINGS (실시간 동기화)
       │   ├─ connection_type: SCREENSHOT → PORTFOLIO_SCREENSHOTS → HOLDINGS (파싱 후 UPSERT)
       │   └─ REBALANCE_EXECUTIONS (1:N) → ORDERS (1:N)
       ├─ PORTFOLIO_SCREENSHOTS (1:N)
       ├─ STRATEGIES (1:1) → TARGET_WEIGHTS (1:N)
       ├─ PORTFOLIO_SNAPSHOTS (1:N)
       ├─ ANALYSIS_REPORTS (1:N) → REPORT_SECTIONS (1:N)
       ├─ NOTIFICATION_SUBSCRIPTIONS (1:N)
       ├─ NOTIFICATION_SETTINGS (1:1)
       └─ NOTIFICATION_LOGS (1:N)
```

---

## 8. 무료 운영 환경 최적화

### Supabase 500MB 제약 대응

|테이블|예상 데이터 양 (사용자 1,000명 기준)|대응 전략|
|---|---|---|
|`PORTFOLIO_SNAPSHOTS`|가장 큰 비중 (일 1행 × 1,000명)|1년 이상 데이터는 월간 집계로 압축|
|`NOTIFICATION_LOGS`|빠르게 누적|90일 이상 데이터 자동 삭제 (cron)|
|`ANALYSIS_REPORTS`|LLM 비용으로 자연 제한됨|사용자당 최근 30개만 유지|
|`HOLDINGS`|실시간 갱신 (이력 X)|영향 없음|

### 인덱스 비용 절감

- `JSONB` 필드에 인덱스는 GIN 대신 **꼭 필요한 JSON 경로만** 표현식 인덱스
- 거의 안 쓰이는 컬럼 인덱스 제거

---

## 9. 마이그레이션 전략

### Phase 별 테이블 활성화

| Phase             | 활성화 테이블                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------- |
| **Phase 1 (준비)**  | users, auth_providers, refresh_tokens, broker_accounts, holdings, **portfolio_screenshots** |
| **Phase 2 (지능화)** | + strategies, target_weights, analysis_reports, report_sections                             |
| **Phase 3 (최적화)** | + portfolio_snapshots, rebalance_executions, orders                                         |
| **Phase 4 (고도화)** | + notification_subscriptions, notification_settings, notification_logs                      |

> 💡 Spring Boot Flyway 사용 권장. 마이그레이션 파일은 `V1__init.sql`, `V2__strategies.sql` 식으로 단계별 분리