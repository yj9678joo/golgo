# 프론트엔드 개발 규약

## 기술 스택

- Framework: React 19.x
- Language: TypeScript 5.x
- Build Tool: Vite 6.x
- Styling: Tailwind CSS 4.x
- UI 컴포넌트: shadcn/ui (Radix UI 기반, 필요한 컴포넌트만 복사)
- Icons: Lucide React
- PWA: vite-plugin-pwa
- 상태 관리: Zustand 5.x
- 서버 상태: TanStack Query 5.x
- API 통신: Axios (JWT Interceptor로 토큰 자동 갱신)
- 차트: Recharts 2.x
- 폼 관리: React Hook Form + Zod
- 호스팅: Vercel

## TypeScript 설정

- `strict: true`를 기본으로 사용한다.
- 앱 소스는 `src/` 아래에 둔다.
- 경로 별칭이 필요하면 `@/*` -> `./src/*`를 사용한다.
- 타입 체크와 빌드는 분리해서 검증 가능해야 한다.

## 코드 스타일

- 들여쓰기는 2 스페이스를 사용한다.
- 문자열은 단일 따옴표를 선호한다.
- 컴포넌트 props는 구조 분해 할당을 사용한다.
- `any` 타입은 사용하지 않는다.
- 기존 파일을 수정할 때는 주변 코드 스타일을 따른다.

## 컴포넌트 규약

- 컴포넌트 파일은 `.tsx` 확장자를 사용한다.
- 컴포넌트 이름은 파스칼 케이스를 사용한다.
- 공통 UI는 shadcn/ui 컴포넌트를 우선 사용한다.
- 아이콘은 Lucide React 컴포넌트를 우선 사용한다.
- 컴포넌트 props 타입을 명시한다.

## shadcn/ui 사용 기준

| 컴포넌트   | 용도                                     |
| ---------- | ---------------------------------------- |
| `Card`     | 종목 카드, 포트폴리오 요약               |
| `Table`    | 보유 종목 목록, 리밸런싱 수량 테이블     |
| `Chart`    | Recharts 기반 자산 비중 및 수익률 시각화 |
| `Dialog`   | 종목 상세 분석 리포트 모달               |
| `Sheet`    | 모바일 하단 슬라이드 패널                |
| `Badge`    | 매수/매도/유지 상태 표시                 |
| `Progress` | 목표 비중 달성률 바                      |
| `Tabs`     | 7단계 분석 섹션 전환                     |
| `Skeleton` | LLM 분석 로딩 상태                       |
| `Toast`    | API 에러, 분석 완료 알림                 |
| `Select`   | 투자 전략 선택 드롭다운                  |
| `Switch`   | 자동 리밸런싱 활성화 토글                |

## 스타일 규약

- 모든 기본 스타일은 Tailwind CSS 클래스로 작성한다.
- Tailwind CSS 4.x 기준으로 구성한다.
- 반응형 디자인은 모바일 퍼스트로 작성한다.
- 테마 색상에는 CSS 변수를 사용한다.
- Tailwind에 없는 값은 필요한 경우에만 arbitrary value를 사용한다.
- 동적 클래스는 조건이 명확한 형태로 구성한다.
- `style` 속성은 Tailwind로 표현하기 어려운 CSS 변수나 계산값에만 제한적으로 사용한다.

## 상태 및 API 규약

- 전역 UI/LLM 스트리밍/포트폴리오 상태는 Zustand를 사용한다.
- 서버 데이터 캐싱, 폴링, 자동 갱신은 TanStack Query를 사용한다.
- REST API 통신은 Axios를 사용한다.
- JWT 갱신은 Axios Interceptor에서 처리한다.
- 폼 유효성 검사는 React Hook Form + Zod를 사용한다.

## 테스트 요구사항

- 컴포넌트 단위 테스트는 React Testing Library를 사용한다.
- 서버 상태 로직은 TanStack Query 캐시 동작을 고려해 테스트한다.
- 사용자 흐름에 영향이 있는 변경은 테스트 또는 명시적 수동 검증을 남긴다.

## 디렉토리 구조

```
frontend/
└── src/
    ├── components/ui/    # shadcn/ui 복사 컴포넌트
    ├── features/         # 도메인별 기능 모듈
    ├── hooks/            # TanStack Query 훅
    └── stores/           # Zustand 스토어
```

## design 참고

- `D:\04.YJ\project\golgo\Golgo_design`
- 해당 경로 파일 참고하여 UI 생성

## Main Theme Color

- `#03ba8c` 포인트 색상, 버튼 색상 등에 적용용
