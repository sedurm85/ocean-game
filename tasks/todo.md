# v3.0 피벗 — 작업 계획 (2026-08-21)

## 확정 사항
- [x] 기존 리스팅(Ocean Treasure Hunt, id6759148710)을 v3.0으로 교체 (사용자 결정)
- [x] 장르: 액션 → 잠수부 키우기 (push-your-luck 잠수 + 장비 성장 + 환생 + 방치 수익)
- [x] 드래그 액션 파트 삭제
- [x] 수익화: v3.0은 무료·광고 없음·IAP 없음 (근거 GDD_V3.md §7)
- [x] 엔진 데이터 드리븐 (js/data.js 교체로 재스킨 → 마라토너 키우기 재사용)
- [x] 제목: 스토어명 유지, KR 현지화명 "바다 속 보물찾기: 잠수부 키우기"
- [x] 작업 브랜치 v3-pivot (worktree ~/ocean-game-v3), main은 라이브 배포라 미접촉

## 구현
- [x] GDD_V3.md (1장 + 수치표 + 시뮬레이션 결과)
- [x] js/data.js — 존 8개·보물 24·장비 6·이벤트 카드 8·환생 수치
- [x] js/core.js — 순수 로직 (다이빙 틱, 산소, 이벤트, 정산, 업그레이드, 환생, 오프라인 수익, 저장/로드)
- [x] sim/sim.mjs — 봇 시뮬레이션 (존 8 ≈ 4시간 능동 / 7일 캐주얼, 환생 3~4회)
- [x] test/core.test.mjs — 11개 통과
- [x] js/i18n.js (ko/en), js/audio.js (신스 이식), js/firebase.js (SDK 로컬 번들·guard·비속어 필터·수심 리더보드)
- [x] index.html + css/style.css + js/main.js + js/bg.js
- [x] database.rules.json
- [x] DEVLOG.md v3 섹션, index.html.v1.bak 삭제
- [x] 헤드리스 브라우저 E2E 통과 (닉네임→잠수→이벤트→생환→장비→새로고침 복원)

## 남은 것 (사용자 개입 필요)
- [ ] 실기기에서 손맛 확인 (`npm run serve` 후 폰에서 접속) — 안전선 여유·이벤트 빈도·첫 5분 골드 체감
- [ ] Firebase Console에 database.rules.json 적용
- [ ] v3-pivot → main 머지 (= GitHub Pages 배포)
- [ ] Capacitor www 교체 → Xcode Archive → App Store Connect 3.0 제출

## 검토 메모
- 시뮬레이션 표: GDD_V3.md §6
- v3.1 후보: 스킨, 업적, 공유 카드, Cloud Function 점수 검증, 사운드 에셋
