# 바다 속 보물찾기 🌊 — 개발 기록

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **게임명** | 바다 속 보물찾기 (Ocean Treasure Hunt) |
| **타겟** | 초등학생 (7~12세) |
| **플랫폼** | 모바일 웹 (반응형, 스마트폰 브라우저) |
| **기술 스택** | 단일 HTML 파일 (Canvas 2D + CSS + Vanilla JS) |
| **배포** | GitHub Pages |
| **백엔드** | Firebase (Anonymous Auth + Realtime Database) |
| **URL** | https://sedurm85.github.io/ocean-game/ |
| **저장소** | https://github.com/sedurm85/ocean-game |

---

## 구현 기능 목록

### 1. 코어 게임플레이

- Canvas 2D 기반 60fps 게임 루프
- 터치 드래그 / 마우스 드래그로 잠수부(🤿) 조작
- devicePixelRatio 대응 (Retina 디스플레이 선명)
- 아이템 시스템:

| 종류 | 아이템 | 점수/효과 |
|------|--------|-----------|
| 보물 | 🐚 조개 | 10점 |
| 보물 | 🦪 굴 | 15점 |
| 보물 | 💎 보석 | 25점 |
| 보물 | ⭐ 별가사리 | 30점 |
| 보물 | 👑 왕관 (희귀) | 50점 |
| 보물 | 🌈 무지개 진주 (초희귀) | 100점 + 피버타임 |
| 장애물 | 🪼 해파리 | 생명 -1 |
| 장애물 | 🦈 상어 (좌우 이동) | 생명 -1 |
| 장애물 | 🌊 소용돌이 | 생명 -1 |
| 파워업 | 🧲 자석 | 5초간 보물 자동 흡수 |
| 파워업 | ⏱️ 슬로우 | 5초간 시간 감속 |
| 파워업 | 🛡️ 방어막 | 10초간 1회 피격 방어 |

- 콤보 시스템 (연속 수집 시 x2~x5 배율)
  - 5콤보: "굿! ✨" / 10콤보: "최고! ⚡" / 15콤보: "대박! 🔥" / 20콤보: "전설! 🌟"
- 피버타임: 🌈 수집 시 무지개 배경 + 장애물도 보물로 변환
- 점진적 난이도 상승 (아이템 속도, 장애물 비율)
- 3 생명 시스템 (❤️❤️❤️)

### 2. 비주얼 이펙트

- 4단계 바다 그라데이션 배경 (하늘색 → 진한 남색)
- 수면 파도 애니메이션 (2레이어)
- 수중 햇빛 광선 효과
- 떠오르는 물방울 파티클
- 바닥 모래밭 + 흔들리는 해초
- 보물 수집 시 파티클 폭발 + 점수 팝업
- 장애물 충돌 시 화면 흔들림(screen shake)
- 방어막 활성화 시 보호 버블 시각화
- 피버타임 무지개 배경 효과

### 3. 닉네임 / 로그인 시스템

- Firebase Anonymous Authentication
- 첫 방문: 닉네임 입력 화면 (2~8자, 한글/영문/숫자)
- 닉네임 중복 체크 (Firebase `/nicknames/` 경로)
- localStorage에 세션 저장 → 재방문 시 자동 로그인 (입력 화면 안 뜸)
- "안녕, {닉네임}! 🤿" 인사 표시
- `onAuthStateChanged` 기반 인증 + 5초 타임아웃 오프라인 폴백
- Firebase 연결 실패 시에도 게임 플레이 가능 (오프라인 모드)

### 4. 랭킹 / 리더보드

- Firebase Realtime Database에 최고 점수 저장
- 시작 화면: "🏆 랭킹" 버튼 → 전체 Top 20 리더보드
- 게임오버 화면: Top 5 미니 리더보드 자동 표시
- 내 순위 파란색 하이라이트
- 1/2/3위 🥇🥈🥉 메달 표시
- 점수 쉼표 포맷 (1,500점)
- 새로운 최고 기록 시 "🏆 새로운 최고 기록! 🏆" 표시

### 5. 배경 음악 & 효과음

- Web Audio API 프로시저럴 BGM (외부 파일 없음)
- 펜타토닉 스케일 (C4-D4-E4-G4-A4) 랜덤 멜로디
- 저음 드론 + 로우패스 필터 (수중 느낌)
- 효과음:
  - 보물 수집: 상승 톤 (띵!)
  - 장애물 충돌: 하강 톤 (퉁)
  - 게임오버: 하강 3음 시퀀스
- 🔊/🔇 토글 버튼 (항상 화면 최상단, `position: fixed`, `z-index: 999`)
- 음악 설정 localStorage 저장
- 브라우저 자동재생 정책 대응 (첫 터치/클릭 시 AudioContext 시작)

### 6. 게임 방법 가이드

- 시작 화면에 4줄 간이 가이드:
  - 🤿 드래그로 잠수부를 움직여요
  - 🐚⭐💎 보물을 모으면 점수 UP!
  - 🪼🦈 장애물을 피하세요!
  - 🧲⏱️🛡️ 파워업을 놓치지 마세요!

---

## 기술 구조

```
index.html (단일 파일, ~1500줄)
├── <head>
│   ├── Firebase Compat SDK (CDN: app, auth, database)
│   ├── Google Fonts (Jua)
│   └── <style> 전체 CSS
├── <body>
│   └── #game-container
│       ├── <canvas> — 게임 렌더링
│       ├── #music-btn — 음악 토글 (fixed, z-999)
│       ├── #hud — 점수, 콤보, 파워업, 생명
│       ├── #nickname-screen — 닉네임 등록
│       ├── #start-screen — 시작 + 게임방법 + 랭킹 버튼
│       ├── #game-over-screen — 점수 + 미니 리더보드
│       └── #leaderboard-screen — 전체 랭킹 (Top 20)
└── <script>
    ├── Firebase 초기화 & Auth
    ├── Web Audio API (BGM + SFX)
    ├── 게임 변수 & 상수
    ├── 세션 관리 (checkUserSession, registerNickname)
    ├── 게임 루프 (init, update, draw, gameLoop)
    ├── 입력 처리 (touch, mouse)
    ├── 게임 로직 (spawn, collect, powerup, gameOver)
    └── UI 업데이트 (HUD, screens, leaderboard)
```

## Firebase 데이터 구조

```
ocean-game-370ac-default-rtdb
├── /players/{uid}
│   ├── nickname: "바다탐험가"
│   ├── highScore: 1500
│   └── updatedAt: (server timestamp)
└── /nicknames/{nickname_lowercase}
    └── uid: "abc123..."
```

## 배포 방식

- **GitHub Pages** (정적 호스팅)
- 저장소: `sedurm85/ocean-game` → `main` 브랜치
- 배포 URL: `https://sedurm85.github.io/ocean-game/`
- 업데이트: `index.html` 수정 → `git push` → 자동 배포 (1~2분)

---

## 커밋 히스토리

| 커밋 | 내용 |
|------|------|
| `59a360b` | 최초 게임 구현 (캔버스 게임 + 터치 조작 + 비주얼 이펙트) |
| `91a139d` | 닉네임 로그인 + 전체 랭킹 시스템 추가 (Firebase) |
| `1324bc6` | Firebase auth 수정 + 배경음악(Web Audio) + 게임방법 추가 |
| `6c7633d` | 음악 토글 버튼 항상 최상단 표시 (fixed position) |

---

## 주의사항 / TODO

### Firebase 보안 규칙
현재 Realtime Database가 **테스트 모드** (30일 한정)입니다.
만료 후 아래 규칙으로 교체 필요:

```json
{
  "rules": {
    "players": {
      "$uid": {
        ".read": true,
        ".write": "auth != null && auth.uid == $uid"
      }
    },
    "nicknames": {
      "$nickname": {
        ".read": true,
        ".write": "auth != null && (!data.exists() || data.val().uid == auth.uid)"
      }
    }
  }
}
```

### Firebase Authentication
- **익명(Anonymous) 로그인**이 반드시 활성화되어 있어야 함
- Firebase Console → Authentication → Sign-in method → 익명 → 사용 설정

---

## 스토어 배포 가이드 (App Store / Google Play)

현재 웹 게임을 네이티브 앱으로 감싸서 스토어에 올릴 수 있음.

### 방법 비교

| 방법 | 플랫폼 | 비용 | 난이도 | 특징 |
|------|--------|------|--------|------|
| **Capacitor** | iOS + Android | Apple $99/년 + Google $25 | 중 | 가장 추천. 네이티브 기능 확장 가능 |
| **TWA** | Android만 | Google $25 | 하 | 가장 간단. 웹 URL을 그대로 감쌈 |
| **PWA Builder** | iOS + Android | 동일 | 하 | pwabuilder.com에서 패키지 자동 생성 |

### Option A: Capacitor (iOS + Android 둘 다)

```bash
# 1. 프로젝트 초기화
npm init -y
npm install @capacitor/core @capacitor/cli
npx cap init ocean-game com.example.oceangame --web-dir=.

# 2. 플랫폼 추가
npm install @capacitor/android @capacitor/ios
npx cap add android
npx cap add ios

# 3. 웹 소스 복사 & 빌드
npx cap copy

# 4. Android 열기 (Android Studio 필요)
npx cap open android

# 5. iOS 열기 (Xcode 필요, Mac만 가능)
npx cap open ios
```

- Android Studio에서 서명 후 AAB 생성 → Google Play Console 업로드
- Xcode에서 서명 후 Archive → App Store Connect 업로드

### Option B: TWA (Android만, 가장 간단)

```bash
# 1. Bubblewrap CLI 설치
npm install -g @nicedoc/nicedocnpm install -g @nicedoc/nicedoc@nicedoc/bubblewrap-cli
npm install -g @nicedoc/nicedoc@nicedoc/bubblewrap-cli

# 실제 명령:
npm install -g @nicedoc/nicedoc
npm install -g @nicedoc/nicedoc@nicedoc/bubblewrap-cli@nicedoc/bubblewrap-cli
```

더 간단한 방법:
1. https://pwabuilder.com 접속
2. `https://sedurm85.github.io/ocean-game/` 입력
3. "Package for stores" 클릭
4. Android → TWA 선택 → APK/AAB 다운로드
5. Google Play Console에 업로드

### Option C: PWA Builder (가장 간편)

1. 먼저 `manifest.json`과 Service Worker를 추가해야 함
2. https://pwabuilder.com 에서 URL 입력
3. 부족한 요소 안내받고 수정
4. Android / iOS 패키지 자동 생성
5. 각 스토어에 업로드

### 스토어 등록에 필요한 에셋

| 항목 | 규격 |
|------|------|
| 앱 아이콘 | 1024x1024 PNG (투명 배경 가능) |
| 스크린샷 | 최소 2장 (폰 사이즈 1290x2796 등) |
| 앱 이름 | "바다 속 보물찾기" |
| 짧은 설명 | 80자 이내 |
| 긴 설명 | 4000자 이내 |
| 카테고리 | 게임 > 캐주얼 |
| 연령 등급 | 전체 이용가 |

### Apple 심사 주의사항

- 단순 WebView 래퍼는 리젝될 수 있음 (Guideline 4.2)
- 게임성이 충분하고 네이티브 수준의 UX를 제공하면 통과 가능
- Capacitor로 빌드하면 WKWebView 사용 → 성능 OK
- 오프라인 플레이 지원 시 심사 통과율 ↑
- 최소 iOS 15+ 타겟 권장

---

## iOS 앱 빌드 & App Store 제출 기록 (2026-02-11 ~ 02-13)

### Phase 1: Capacitor로 iOS 앱 빌드

웹 게임(`index.html`)을 Capacitor로 감싸 네이티브 iOS 앱으로 변환.

```bash
# 프로젝트 구조
ocean-game-app/
├── capacitor.config.json     # appId: com.oceangame.app
├── package.json              # @capacitor/core, @capacitor/ios 등
├── www/                      # 웹 소스 (index.html, privacy.html)
│   ├── index.html
│   └── privacy.html
└── ios/
    └── App/
        └── App.xcodeproj     # Xcode 프로젝트
```

**capacitor.config.json 주요 설정:**
```json
{
  "appId": "com.oceangame.app",
  "appName": "Ocean Treasure Hunt",
  "webDir": "www",
  "ios": {
    "contentInset": "always",
    "allowsLinkPreview": false,
    "scrollEnabled": false
  }
}
```

**빌드 과정:**
1. `www/` 디렉토리에 `index.html`, `privacy.html` 복사
2. `npx cap copy ios` → 웹 소스를 Xcode 프로젝트에 복사
3. `npx cap open ios` → Xcode에서 프로젝트 열기
4. Xcode에서 Signing & Capabilities 설정 (Apple Developer 계정)
5. Product → Archive → App Store Connect에 업로드

### Phase 2: App Store Connect 설정

#### 기본 정보

| 항목 | 값 |
|------|-----|
| **앱 이름** | Ocean Treasure Hunt |
| **번들 ID** | com.oceangame.app |
| **SKU** | oceantreasurehunt001 |
| **Apple ID** | 6759148710 |
| **기본 언어** | 영어(미국) |
| **카테고리** | 게임 → 캐주얼 |
| **가격** | 무료 ($0) |
| **연령 등급** | 4+ (173개국), 전체 (대한민국) |
| **저작권** | 2026 hyunjong lee |
| **버전** | 1.0 |

#### 앱 설명 (영어)

```
Dive into the ocean and collect treasures! Avoid obstacles, gather stars,
diamonds, shells and crowns to achieve the highest score. Compete with
players worldwide on the leaderboard.

Features:
- Simple one-touch controls
- Beautiful underwater theme with relaxing BGM
```

#### 키워드

```
ocean,treasure,hunt,casual,game,diving,underwater,kids,fun,arcade
```

#### URL 정보

| 항목 | URL |
|------|-----|
| **지원 URL** | https://sedurm85.github.io/ocean-game/privacy.html |
| **개인정보처리방침 URL** | https://sedurm85.github.io/ocean-game/privacy.html |
| **마케팅 URL** | (미설정) |

#### 앱 개인정보 보호

- **데이터 수집**: 아니요 (데이터를 수집하지 않음)
  - Firebase 익명 인증은 사용하지만 Apple 기준 "데이터 수집"에 해당하지 않음
- **개인정보처리방침 URL**: `앱이 수집하는 개인정보` → `개인정보 처리방침` → `편집`에서 설정

#### 콘텐츠 권한

- 타사 콘텐츠 포함 여부: **아니요** (직접 개발한 게임)

#### 스크린샷

| 디스플레이 | 해상도 | 비고 |
|------------|--------|------|
| iPhone | 1206x2622 (원본) | 게임 플레이 화면 캡처 |
| 13" iPad | 2048x2732 | iPhone 스크린샷을 `sips -z 2732 2048`로 리사이즈 |

### Phase 3: 심사 제출

- **제출일**: 2026-02-13
- **예상 심사 기간**: 24~48시간
- **심사 결과**: 이메일로 통지 예정

### 트러블슈팅 기록

| 문제 | 원인 | 해결 |
|------|------|------|
| 개인정보처리방침 URL 입력란을 찾지 못함 | App Store Connect UI 변경. 앱 정보 페이지가 아닌 별도 경로에 위치 | `앱이 수집하는 개인정보` → `개인정보 처리방침` 옆 `편집` 버튼 클릭 |
| iPad 스크린샷 미등록으로 심사 제출 불가 | 13" iPad 디스플레이용 스크린샷 필수 | iPhone 스크린샷을 `sips`로 2048x2732 리사이즈 |
| 콘텐츠 권한 미설정으로 심사 제출 불가 | 앱 정보에서 콘텐츠 권한 정보 필수 설정 | 앱 정보 → 콘텐츠 권한 정보 설정 → "아니요" 선택 |

---

## 리젝 시 대응 가이드

Apple 심사에서 리젝될 경우 대비:

| 사유 (예상) | 대응 방법 |
|-------------|-----------|
| **Guideline 4.2** (Minimum Functionality) | 게임성이 충분하므로 이의 제기 가능. 오프라인 모드, 리더보드, 파워업 시스템 등 기능 어필 |
| **개인정보 관련** | privacy.html이 이미 준비되어 있으므로 URL 재확인 |
| **크래시/성능** | Capacitor WKWebView 기반이라 대부분 안정적. 특정 기기 이슈 시 해당 기기에서 테스트 |
| **메타데이터** | 스크린샷, 설명 등 수정 후 재제출 |

---

## 전체 타임라인 요약

| 날짜 | 작업 내용 |
|------|-----------|
| 2026-02-11 | 웹 게임 개발 (Canvas 2D, Firebase, Web Audio) |
| 2026-02-11 | GitHub Pages 배포 (`sedurm85.github.io/ocean-game`) |
| 2026-02-11 | 개인정보 처리방침 페이지 작성 |
| 2026-02-12 | Capacitor로 iOS 앱 빌드 & Xcode Archive |
| 2026-02-12 | App Store Connect 앱 등록 & 메타데이터 입력 |
| 2026-02-13 | 개인정보처리방침 URL 설정, iPad 스크린샷 리사이즈 |
| 2026-02-13 | 콘텐츠 권한 설정 & **App Store 심사 제출 완료** |
