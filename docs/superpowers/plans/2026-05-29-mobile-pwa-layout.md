# 모바일 PWA 레이아웃 정비 계획

## 목표

프론트엔드 화면을 모바일 PWA 환경 기준으로 재정렬한다. iOS/Android 홈 화면 설치 환경에서 safe-area, 작은 화면 높이, 모바일 폭, 터치 대상 크기를 고려해 로그인/닉네임/홈 화면이 깨지지 않도록 한다.

## 현재 문제 가정

- 전역 스타일에 `safe-area-inset-*` 대응이 없다.
- 각 페이지가 `min-h-screen`, 고정 padding, 개별 max-width를 직접 사용해 PWA 주소창/홈 인디케이터 환경에서 세로 비율이 흔들린다.
- `LoginPage`는 별도 앱 프레임을 갖고 있고, `NicknamePage`와 `HomePage`는 일반 웹 레이아웃이라 모바일 PWA 화면 간 밀도가 맞지 않는다.
- 작은 모바일 화면(예: 360x640, 375x667)에서 로그인 문구/체크포인트/버튼 영역이 한 화면 안에서 안정적으로 배치되지 않을 수 있다.
- 현재 작업트리에 `frontend/src/assets/NAVER_login.png`, `frontend/src/assets/google_login.png` 사용자 변경이 남아 있으므로 이번 작업에서는 수정하지 않는다. => 함께 수정한다

## 수정 범위

- 수정: `frontend/src/index.css`
- 생성: `frontend/src/components/layout/MobilePage.tsx`
- 수정: `frontend/src/features/auth/pages/LoginPage.tsx`
- 수정: `frontend/src/features/auth/pages/NicknamePage.tsx`
- 수정: `frontend/src/features/auth/pages/HomePage.tsx`
- 필요 시 수정: `frontend/src/features/auth/components/SocialLoginButton.tsx`

## 설계 원칙

1. 모바일 PWA 기준을 기본값으로 둔다.
  - 기본 레이아웃은 `min-h-[100svh]` 또는 CSS 변수 기반 앱 높이를 사용한다.
  - safe-area top/bottom padding을 전역에서 지원한다.
2. 페이지별 중복 shell을 줄인다.
  - `MobilePage` 공통 레이아웃을 만든다.
  - 각 페이지는 `MobilePage` 내부에서 콘텐츠만 배치한다.
3. 모바일 폭 기준을 명확히 한다.
  - 기본 콘텐츠 폭은 `max-w-[430px]`.
  - 데스크톱에서도 모바일 앱 미리보기처럼 중앙 정렬한다.
  - 필요한 경우 로그인 화면만 데스크톱 보조 문구를 유지한다.
4. 작은 화면에서는 정보량을 줄이고 여백을 줄인다.
  - 375x667 기준에서 로그인 핵심 영역과 버튼이 과하게 밀리지 않도록 한다.
  - 체크포인트 카드와 헤드라인은 모바일에서 더 작은 밀도로 표시한다.
5. 버튼 이미지는 잘리지 않게 유지한다.
  - `object-contain` 유지.
  - 버튼 높이는 모바일 터치 기준 52px 이상 유지.

## 작업 1: 전역 PWA 모바일 스타일 추가

### 파일

- `frontend/src/index.css`

### 변경

- `html`, `body`, `#root`에 최소 높이와 모바일 overscroll 기준을 추가한다.
- safe-area CSS 변수를 추가한다.
- 모바일 텍스트 렌더링과 box sizing을 안정화한다.

예상 방향:

```css
html {
  min-width: 320px;
  min-height: 100%;
  background: hsl(210 40% 98%);
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100%;
  background: hsl(210 40% 98%);
  -webkit-font-smoothing: antialiased;
  overscroll-behavior-y: none;
}

#root {
  min-height: 100svh;
}
```

## 작업 2: 공통 모바일 페이지 컴포넌트 생성

### 파일

- `frontend/src/components/layout/MobilePage.tsx`

### 역할

- 모바일 PWA safe-area padding 제공
- 페이지 배경 제공
- 중앙 정렬된 모바일 콘텐츠 폭 제공
- 페이지별 `className`, `contentClassName` 확장 허용

예상 API:

```tsx
type MobilePageProps = {
  children: ReactNode
  className?: string
  contentClassName?: string
}
```

## 작업 3: 로그인 화면 모바일 PWA 비율 재정리

### 파일

- `frontend/src/features/auth/pages/LoginPage.tsx`

### 변경

- `MobilePage`를 사용한다.
- 모바일에서는 데스크톱용 좌측 히어로를 숨긴다.
- 앱 프레임은 모바일에서 화면 전체 카드처럼 보이지 않게 하고, PWA 화면 자체로 자연스럽게 보이도록 그림자/테두리 밀도를 낮춘다.
- 375x667에서도 버튼 영역이 보이도록 헤드라인, 체크포인트, 상하 padding을 줄인다.

## 작업 4: 닉네임 화면 모바일 PWA 정리

### 파일

- `frontend/src/features/auth/pages/NicknamePage.tsx`

### 변경

- `MobilePage`를 사용한다.
- 카드 폭과 padding을 모바일 기준으로 조정한다.
- 로그아웃 버튼은 44px 이상 터치 영역을 유지한다.
- 입력창과 제출 버튼은 48px 이상 높이를 유지한다.

## 작업 5: 홈 화면 모바일 PWA 정리

### 파일

- `frontend/src/features/auth/pages/HomePage.tsx`

### 변경

- `MobilePage`를 사용한다.
- 헤더는 모바일에서 줄바꿈/버튼 겹침이 없도록 정리한다.
- 사용자 카드와 정보 카드의 padding을 모바일 기준으로 조정한다.
- 데스크톱에서도 최대 폭을 넓히지 않고 모바일 우선 프레임을 유지한다.

## 작업 6: 검증

### 정적 검증

```powershell
npm run lint
npm run build
```

### 로컬 확인

```powershell
npm run dev -- --host 0.0.0.0
```

확인 URL:

```text
http://localhost:3000/login
http://localhost:3000/nickname
http://localhost:3000/
```

### 모바일 확인 기준

- 360x640: 주요 텍스트와 버튼이 겹치지 않는다.
- 375x667: 로그인 버튼 영역이 화면 하단에서 잘리지 않는다.
- 390x844: 여백이 과하게 비지 않는다.
- PWA safe-area: 상단/하단이 노치 또는 홈 인디케이터와 붙지 않는다.
- 네이버/구글 버튼 이미지가 잘리지 않는다.

## 커밋 계획

검증 통과 후 아래 메시지로 커밋한다.

```text
fix(frontend): 모바일 PWA 레이아웃 정비
```

