# 백엔드 개발 규약

## 기술 스택
- Framework: Spring Boot 3.x
- Language: Java 21 (Virtual Thread 적용 가능)
- ORM: Spring Data JPA + QueryDSL
- DB: Supabase PostgreSQL 15.x
- Cache / Queue: Upstash Redis
- Batch: Spring Batch 5.x
- LLM 연동: Spring AI 1.x
- 보안: Spring Security + AES-256 (Jasypt)
- 인증: JWT (jjwt)
- API 문서: SpringDoc OpenAPI 3
- 호스팅: Railway

## 코드 스타일
- 들여쓰기는 4 스페이스를 사용한다.
- 클래스명은 파스칼 케이스를 사용한다.
- 메서드명 및 변수명은 카멜 케이스를 사용한다.
- 상수명은 대문자 스네이크 케이스를 사용한다.
- 패키지명은 소문자를 사용한다.
- 기존 파일을 수정할 때는 주변 코드 스타일을 따른다.

## 레이어 구조
- `api` - REST Controller 및 요청/응답 처리
- `domain` - JPA Entity 및 도메인 모델
- `service` - 비즈니스 로직
- `infra/broker` - 증권사 Open API 클라이언트
- `infra/llm` - Spring AI 및 LLM Structured Output 연동
- `config` - Security, JWT, JPA, Redis, Batch 설정
- `dto` - 요청/응답 DTO
- `exception` - 커스텀 예외 및 전역 예외 처리

## API 규약
- RESTful 설계 원칙을 따른다.
- 기본 경로는 `/api/v1/`를 사용한다.
- 프론트엔드는 `/api` 경로로 백엔드 API를 호출한다.
- HTTP 메서드 사용 기준:
  - `GET` - 조회
  - `POST` - 생성
  - `PUT` - 전체 수정
  - `PATCH` - 부분 수정
  - `DELETE` - 삭제

## 응답 형식
- 모든 API 응답은 공통 응답 객체로 감싸서 반환한다.
```json
{
  "success": true,
  "code": "200",
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": {}
}
```
- 오류 응답은 `success: false`, 적절한 HTTP 상태 코드, 오류 메시지를 포함한다.

## 인증 및 보안 규약
- Access Token 만료 시간은 15분을 기본으로 한다.
- Refresh Token 만료 시간은 7일을 기본으로 한다.
- Access Token은 요청 헤더 `Authorization: Bearer {token}` 방식으로 전달한다.
- 증권사 Access Token은 AES-256 (Jasypt)으로 암호화해 저장한다.
- 인증이 필요한 API는 Spring Security 필터 체인에서 JWT를 검증한다.
- 토큰 만료 시 401 Unauthorized 응답을 반환한다.
- 입력값 검증을 통해 XSS 및 잘못된 요청을 방지한다.

## JPA / QueryDSL 규약
- 엔티티는 `domain` 패키지에 둔다.
- 복잡한 포트폴리오 조회는 QueryDSL을 사용한다.
- 단순 CRUD는 Spring Data JPA Repository를 우선 사용한다.
- N+1 문제가 발생할 수 있는 조회는 fetch join 또는 명시적 조회 전략을 사용한다.
- 테이블명과 컬럼명은 스네이크 케이스를 사용한다.
- 기본키는 `id`를 사용한다.
- 생성/수정 시각 컬럼은 `created_at`, `updated_at`을 기본으로 포함한다.

## 외부 연동 규약
- 한국투자증권 Open API와 미래에셋증권 Open API는 `infra/broker`에서 캡슐화한다.
- 증권사 OAuth 토큰은 Redis 캐싱과 DB 암호화 저장 정책을 구분해 관리한다.
- Rate Limit 카운터는 Upstash Redis를 사용한다.
- Rate Limit 대응이 필요한 반복 작업은 Spring Batch 잡으로 분리한다.
- Gemini API를 7단계 심층 분석의 기본 LLM으로 사용한다.
- OpenAI GPT API와 Anthropic Claude API는 fallback LLM으로 사용한다.
- LLM 응답은 Spring AI Structured Output을 사용해 Java Record로 매핑한다.

## 예외 처리
- `@ControllerAdvice`를 활용한 전역 예외 처리를 사용한다.
- 커스텀 예외 클래스로 비즈니스 오류를 구분한다.
- 외부 API 오류는 원인 서비스와 재시도 가능 여부를 남긴다.
- 예외 발생 시 SLF4J + Logback으로 로그를 기록한다.
- 민감 정보(API Key, JWT, 증권사 토큰)는 로그에 남기지 않는다.

## 운영 제약 대응
- Railway 무료 환경을 고려해 JVM 힙 제한과 불필요한 AutoConfig 제거를 검토한다.
- Supabase 동시 연결 제한을 고려해 JPA Connection Pool 최대값은 10 이하로 둔다.
- Upstash Redis 무료 호출량을 고려해 LLM 분석 결과 캐싱과 Rate Limit 카운터 용도로 제한한다.

## API 문서
- SpringDoc OpenAPI 3을 사용한다.
- Swagger UI 경로는 `/swagger-ui.html`을 기준으로 한다.
- 인증이 필요한 API는 OpenAPI 문서에 보안 스키마를 명시한다.

## 디렉토리 구조
```
backend/
└── src/main/java/
    ├── api/              # REST Controller
    ├── domain/           # JPA Entity
    ├── service/          # 비즈니스 로직
    ├── infra/broker/     # 증권사 API 클라이언트
    └── infra/llm/        # Spring AI 연동
```
