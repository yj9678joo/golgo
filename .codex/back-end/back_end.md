# Golgo 백엔드 작업 규약

## 기준 문서

- `tech-stack.md`
- `프로젝트_개요.md`
- `AGENT.md`

백엔드 작업 전 위 문서와 이 파일을 함께 확인한다. 문서 간 충돌이 있으면 사용자 요청, `AGENT.md`, 이 파일, 기준 문서 순으로 우선한다.

## 기술 스택

- Spring Boot 3.5.x와 Java 21을 사용한다.
- 대기 I/O가 많은 LLM, 증권사 API 호출에는 Java Virtual Thread 설정을 유지한다.
- ORM은 Spring Data JPA와 QueryDSL을 사용한다.
- 운영 DB는 Supabase PostgreSQL 15.x를 기준으로 한다.
- 마이그레이션은 Flyway로 관리한다.
- 캐시와 rate limit 카운터는 Upstash Redis를 기준으로 한다.
- 배치 처리는 Spring Batch 5를 사용한다.
- LLM 연동은 Spring AI 1.x 기반 Structured Output을 목표로 한다.
- 보안은 Spring Security, JWT, Jasypt AES-256 암호화를 기준으로 한다.
- API 문서는 SpringDoc OpenAPI 3으로 `/api/swagger-ui.html`에서 확인 가능하게 유지한다.

## 디렉터리 구조

- 백엔드 루트는 `backend/`이다.
- Java 패키지는 `com.app.golgo` 하위에 둔다.
- REST Controller는 `api` 패키지에 둔다.
- JPA Entity와 도메인 모델은 `domain` 패키지에 둔다.
- 비즈니스 로직은 `service` 패키지에 둔다.
- 증권사 API 클라이언트는 `infra.broker` 패키지에 둔다.
- LLM 연동은 `infra.llm` 패키지에 둔다.
- Flyway SQL은 `backend/src/main/resources/db/migration/`에 둔다.
- 환경별 설정은 `application-local.yml`, `application-prod.yml`, `application-test.yml`을 기준으로 분리한다.

## 구현 원칙

- MVP 범위는 증권사 API 잔고 조회, 사용자 전략 저장, 7단계 분석 리포트 생성, 리밸런싱 수량 계산, 대시보드 응답 제공이다.
- 자동 주문 API 연결은 후속 확장으로 분리하고, 사용자가 명시적으로 요청하기 전까지 구현하지 않는다.
- API는 엔드포인트, 요청 JSON, 응답 JSON 예시를 함께 고려한다.
- LLM 응답은 자유 텍스트가 아니라 구조화된 DTO 또는 Java Record로 제한한다.
- 분석 프롬프트는 7단계 페르소나 로직을 유지한다.
- PER, PEG, PBR, PSR은 교차 검증하고, 지표가 모순되면 거시경제 환경과 연결한 경고와 비중 축소 가능성을 포함한다.
- 증권사 Access Token, Refresh Token, 계좌번호, API Key, LLM Key는 암호화하고 로그에 남기지 않는다.
- 외부 API 호출은 rate limit, 재시도, 타임아웃, 장애 시 사용자 메시지를 고려한다.
- 증권사 토큰 캐싱과 rate limit 카운터는 Redis 사용을 우선 검토한다.
- 리밸런싱 계산은 입력 포트폴리오, 목표 비중, 현재가를 분리해 테스트 가능하게 작성한다.

## API 규약

- 모든 API 경로는 `/api` context path 아래에 둔다.
- Controller는 요청 검증과 응답 매핑을 담당하고, 핵심 로직은 Service에 둔다.
- 요청 DTO에는 Bean Validation을 적용한다.
- 응답 DTO는 화면 요구사항에 맞는 구조로 명시하고 Entity를 직접 반환하지 않는다.
- 오류 응답은 인증 실패, 검증 실패, 외부 API 실패, LLM 분석 실패를 구분한다.
- Swagger 문서에 주요 요청/응답 예시를 남긴다.

## 데이터 및 보안 규약

- 스키마 변경은 Flyway migration으로 작성한다.
- 운영 설정에는 `spring.jpa.hibernate.ddl-auto=validate` 원칙을 유지한다.
- 민감 정보는 `.env` 또는 배포 환경변수로 주입하고 저장소에 커밋하지 않는다.
- Jasypt 비밀번호, JWT secret, 증권사/LLM API Key는 기본값 없이 배포 환경에서 주입한다.
- 로그에는 SQL bind parameter, 토큰, 계좌번호, 원본 외부 API 인증 헤더가 남지 않도록 주의한다.
- 테스트용 H2와 운영 PostgreSQL의 차이가 동작에 영향을 주는 경우 PostgreSQL 기준으로 검증한다.

## 검증 기준

백엔드 변경 후 가능한 범위에서 아래 명령을 실행한다.

```sh
cd backend
./gradlew test
./gradlew build
```

- API 계약을 바꾼 경우 Swagger 또는 테스트로 요청/응답 구조를 확인한다.
- DB 스키마를 바꾼 경우 Flyway migration 적용 여부를 확인한다.
- 보안, 인증, 외부 API, 리밸런싱 계산 로직을 바꾼 경우 관련 단위 테스트를 추가하거나 갱신한다.
- 문서만 변경한 경우 변경 파일을 다시 읽고 diff를 확인한다.
- 검증을 실행하지 못한 경우 최종 보고에 이유를 명시한다.
