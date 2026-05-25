# Golgo 프론트엔드 작업 규약

## 기준 문서

- `tech-stack.md`
- `프로젝트_개요.md`
- `AGENT.md`

프론트엔드 작업 전 위 문서와 이 파일을 함께 확인한다. 문서 간 충돌이 있으면 사용자 요청, `AGENT.md`, 이 파일, 기준 문서 순으로 우선한다.

## 기술 스택

- React 19, TypeScript 5, Vite 6을 사용한다.
- Tailwind CSS 4와 shadcn/ui `new-york` 스타일을 기준으로 UI를 구성한다.
- shadcn/ui 컴포넌트는 필요한 컴포넌트만 `frontend/src/components/ui`에 복사해 사용한다.
- 아이콘은 `lucide-react`를 우선 사용한다.
- 전역 클라이언트 상태는 Zustand, 서버 상태와 캐싱/폴링은 TanStack Query 5를 사용한다.
- API 통신은 Axios를 사용하고, JWT 갱신 로직은 인터셉터로 분리한다.
- 차트는 Recharts를 사용한다.
- 폼은 React Hook Form과 Zod로 관리한다.
- PWA 기능은 `vite-plugin-pwa`를 사용한다.

## 디렉터리 구조

- 프론트엔드 루트는 `frontend/`이다.
- 앱 진입점은 `frontend/src/main.tsx`, 최상위 앱은 `frontend/src/App.tsx`를 기준으로 한다.
- 공통 UI는 `frontend/src/components/ui/`에 둔다.
- 도메인 기능은 `frontend/src/features/` 아래에 기능별로 둔다.
- TanStack Query 훅은 `frontend/src/hooks/` 또는 기능 내부의 가까운 위치에 둔다.
- Zustand 스토어는 `frontend/src/stores/`에 둔다.
- 공통 유틸은 `frontend/src/lib/`에 둔다.
- 경로 alias는 `frontend/components.json`의 `@/components`, `@/lib`, `@/hooks` 기준을 따른다.

## 구현 원칙

- MVP 범위는 보유 종목/비중 조회, 투자 전략 설정, 7단계 분석 리포트 표시, 리밸런싱 수량 안내, 대시보드 요약이다.
- 자동 주문 UI는 사용자가 명시적으로 요청하기 전까지 구현하지 않는다.
- LLM 분석 결과는 자유 텍스트가 아니라 백엔드의 구조화된 JSON 응답을 렌더링하는 방식으로 다룬다.
- 종목, 포트폴리오, 분석 리포트, 리밸런싱 계산은 기능 단위로 분리한다.
- 증권사 계좌번호, 토큰, API Key, 민감 식별자는 화면, 콘솔, 에러 메시지에 노출하지 않는다.
- 서버 상태는 TanStack Query로 캐싱하고, 불필요한 직접 `useEffect` fetch를 만들지 않는다.
- LLM 스트리밍 또는 분석 진행 상태처럼 여러 화면에서 공유되는 UI 상태만 Zustand에 둔다.
- 컴포넌트는 먼저 단순하게 작성하고, 실제 중복이 생긴 뒤에만 추상화한다.

## UI 규약

- 주식 초보자도 이해할 수 있도록 숫자, 비중, 매수/매도 판단을 명확하게 표시한다.
- `Card`는 종목 카드와 포트폴리오 요약처럼 반복되는 정보 단위에 사용한다.
- `Table`은 보유 종목 목록과 리밸런싱 수량에 사용한다.
- `Tabs`는 7단계 분석 섹션 전환에 사용한다.
- `Badge`는 매수, 매도, 유지 상태처럼 짧은 상태 표시에 사용한다.
- `Progress`는 목표 비중 달성률에 사용한다.
- `Dialog` 또는 `Sheet`는 종목 상세 분석과 모바일 상세 패널에 사용한다.
- `Skeleton`은 분석 로딩 상태에 사용한다.
- `Toast`는 API 오류와 분석 완료 알림에 사용한다.
- 차트는 포트폴리오 비중, 수익률 추이, 목표 대비 현재 비중 차이를 이해시키는 목적일 때만 사용한다.

## API 연동 규약

- API base path는 백엔드의 `server.servlet.context-path: /api`를 기준으로 한다.
- API 타입은 요청/응답 DTO를 TypeScript 타입 또는 Zod schema로 명시한다.
- API 호출부는 컴포넌트에 직접 두지 말고 기능 모듈 또는 훅으로 분리한다.
- 인증 실패, 토큰 만료, rate limit, LLM 분석 실패는 사용자가 이해할 수 있는 메시지로 변환한다.
- 증권사 API의 원본 오류나 민감한 원문 응답을 그대로 노출하지 않는다.

## 검증 기준

프론트엔드 변경 후 가능한 범위에서 아래 명령을 실행한다.

```sh
cd frontend
npm run typecheck
npm run lint
npm run build
```

- UI나 사용자 흐름을 바꾼 경우 로컬 화면에서 주요 상태를 확인한다.
- 문서만 변경한 경우 변경 파일을 다시 읽고 diff를 확인한다.
- 검증을 실행하지 못한 경우 최종 보고에 이유를 명시한다.
