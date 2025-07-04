const fs = require('fs');
const path = require('path');
const { fetchHitterStats } = require('./fetchHitter.js');
const { fetchPitcherStats } = require('./fetchPitcher.js');
const { fetchHitterGameLog } = require('./fetchHitterGameLog.cjs');
const { fetchPitcherGameLog } = require('./fetchPitcherGameLog.cjs');
const playerList = require('./PlayerList.json');

(async () => {
  const results = [];

  for (const player of playerList) {
    const { name, kboId, position } = player;

    try {
      let stat;
      if (position.includes('투수')) {
        stat = await fetchPitcherStats({ name, kboId });
        await fetchPitcherGameLog({ name, kboId });
      } else {
        stat = await fetchHitterStats({ name, kboId });
        await fetchHitterGameLog({ name, kboId });
      }

      if (stat) results.push(stat);
    } catch (err) {
      console.error(`❌ ${name} 처리 중 오류:`, err.message);
    }
  }

// ✅ 오늘 → 어제로 설정
const today = new Date();
today.setDate(today.getDate() - 1);  // << 여기 추가
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');
const dateStr = `${yyyy}-${mm}-${dd}`;

  const statsDir = path.join(__dirname, '..', 'public', 'stats');
  if (!fs.existsSync(statsDir)) fs.mkdirSync(statsDir, { recursive: true });

  fs.writeFileSync(path.join(statsDir, `${dateStr}.json`), JSON.stringify(results, null, 2));
  fs.writeFileSync(path.join(statsDir, `latest.json`), JSON.stringify(results, null, 2));

  console.log(`📦 전체 기록 저장 완료 (${results.length}명)`);
})();
