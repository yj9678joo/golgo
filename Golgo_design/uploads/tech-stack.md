# Golgo (고르고) 개발 스택 정의서

## 1. Frontend (Web + PWA)

|영역|기술|버전|비고|
|---|---|---|---|
|Framework|React|19.x|-|
|Language|TypeScript|5.x|-|
|Styling|Tailwind CSS|4.x|-|
|UI 컴포넌트|**shadcn/ui**|latest|Radix UI 기반, 필요한 컴포넌트만 복사하여 사용|
|PWA|vite-plugin-pwa|latest|Service Worker, Web Push, 홈화면 설치 지원|
|상태관리|Zustand|5.x|LLM 스트리밍 상태, 포트폴리오 전역 상태|
|서버 상태|TanStack Query|5.x|증권 데이터 캐싱·폴링, 자동 갱신|
|API 통신|Axios|latest|JWT Interceptor로 토큰 자동 갱신|
|차트|Recharts|2.x|포트폴리오 비중 파이차트, 수익률 라인차트|
|아이콘|**Lucide React**|latest|shadcn/ui 공식 기본 아이콘, React 컴포넌트 방식|
|폼 관리|React Hook Form + Zod|latest|투자 전략 설정 폼 유효성 검사|
|빌드 도구|Vite|6.x|-|
|호스팅|**Vercel**|-|무료티어, CI/CD 자동 연동|

### shadcn/ui 주요 사용 컴포넌트

|컴포넌트|용도|
|---|---|
|`Card`|종목 카드, 포트폴리오 요약|
|`Table`|보유 종목 목록, 리밸런싱 수량 테이블|
|`Chart` (Recharts 래핑)|자산 비중 시각화|
|`Dialog`|종목 상세 분석 리포트 모달|
|`Sheet`|모바일 하단 슬라이드 패널|
|`Badge`|매수/매도/유지 상태 표시|
|`Progress`|목표 비중 달성률 바|
|`Tabs`|7단계 분석 섹션 전환|
|`Skeleton`|LLM 분석 로딩 상태|
|`Toast` (Sonner)|API 에러, 분석 완료 알림|
|`Select`|투자 전략 선택 드롭다운|
|`Switch`|자동 리밸런싱 활성화 토글|

---

## 2. Backend

|영역|기술|버전|비고|
|---|---|---|---|
|Framework|**Spring Boot**|3.x|-|
|Language|Java|21|Virtual Thread (Loom) 적용 — LLM 대기 I/O 처리|
|ORM|Spring Data JPA + QueryDSL|latest|복잡한 포트폴리오 쿼리 처리|
|DB|**Supabase (PostgreSQL)**|15.x|무료 500MB, 포트폴리오 이력·분석 리포트 저장|
|Cache / Queue|**Upstash Redis**|-|무료 월 10,000 req, 증권사 토큰 캐싱·Rate Limit 카운터|
|Batch|Spring Batch|5.x|증권사 API Rate Limit 대응 배치 잡|
|LLM 연동|**Spring AI**|1.x|Gemini/GPT/Claude Structured Output → Java Record 자동 매핑|
|보안|Spring Security + **AES-256 (Jasypt)**|-|증권사 Access Token 암호화 저장|
|인증|JWT (jjwt)|latest|Access Token 15분 / Refresh Token 7일|
|API 문서|SpringDoc OpenAPI 3|latest|`/swagger-ui.html` 자동 생성|
|호스팅|**Railway**|-|무료 월 500시간, 512MB RAM|

---

## 3. 외부 연동

|서비스|용도|비고|
|---|---|---|
|한국투자증권 Open API|잔고 조회, 시세, 주문|OAuth 2.0, Rate Limit 처리 필수|
|미래에셋증권 Open API|잔고 조회, 시세|동일|
|Google Gemini API|7단계 심층 분석 LLM|Structured Output 모드 사용|
|OpenAI GPT API|보조 LLM (Fallback)|-|
|Anthropic Claude API|보조 LLM (Fallback)|-|
|Firebase Cloud Messaging|PWA 푸시 알림|iOS 16.4+ 홈화면 설치 후 지원|

---

## 4. 인프라 / DevOps

|영역|기술|비고|
|---|---|---|
|컨테이너|Docker Compose|로컬 개발 환경|
|CI/CD|GitHub Actions|Vercel 자동 배포 + Railway 자동 배포|
|환경변수|Railway 환경변수|증권사 API Key, LLM Key 관리|
|모니터링|Railway 기본 로그|무료 범위 내 운영|

---

## 5. 무료 운영 제약 및 대응

|플랫폼|제약|대응 전략|
|---|---|---|
|Railway|월 500시간, 512MB RAM, Cold Start 10~30초|Spring Boot 경량화 (불필요 AutoConfig 제거), JVM 힙 제한 설정|
|Supabase|DB 500MB, 동시 연결 50개|JPA Connection Pool 최대 10으로 제한|
|Upstash Redis|월 10,000 req|LLM 분석 결과 캐싱으로 호출 절약, Rate Limit 카운터 전용 사용|
|Vercel|사실상 무제한|제약 없음|

---

## 6. 프로젝트 구조 (모노레포 권장)

```
alpha-rebalancer/
├── frontend/          # React + Vite + PWA
│   ├── src/
│   │   ├── components/ui/    # shadcn/ui 복사 컴포넌트
│   │   ├── features/         # 도메인별 기능 모듈
│   │   ├── hooks/            # TanStack Query 훅
│   │   └── stores/           # Zustand 스토어
├── backend/           # Spring Boot
│   ├── src/main/java/
│   │   ├── api/              # REST Controller
│   │   ├── domain/           # JPA Entity
│   │   ├── service/          # 비즈니스 로직
│   │   ├── infra/broker/     # 증권사 API 클라이언트
│   │   └── infra/llm/        # Spring AI 연동
└── docker-compose.yml # 로컬 PostgreSQL + Redis
```