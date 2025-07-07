# UA Company Web App

**KBO 선수 성적 수집 & 관리 웹 앱**

유에이컴퍼니 소속 선수들의 경기 기록을 자동으로 수집하고,
웹 앱을 통해 확인, 관리할 수 있는 내부용 시스템입니다.

## 🛠 주요 기능

- KBO 선수 목록 자동 수집 (`fetchAllPlayers.js`)
- 타자 / 투수 성적 크롤링 및 저장 (`fetchHitter.js`, `fetchPitcher.js`)
- 매일 자동 실행 가능 (GitHub Actions 또는 Cron)
- 웹 앱을 통한 선수별 기록 시각화 (Next.js 기반)

## 📁 디렉토리 구조 (일부)
scripts/
├─ fetchAllPlayers.js
├─ fetchHitter.js
├─ fetchPitcher.js
public/
├─ data/
├─ gameLogs/
app/
├─ players/[id]/page.tsx
├─ staff/page.tsx
├─ admin/page.tsx

