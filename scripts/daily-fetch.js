
import fs from 'fs';
import path from 'path';

import { fetchHitterStats } from './fetchHitter.js';
import { fetchPitcherStats } from './fetchPitcher.js';
import { fetchHitterGameLog } from './fetchHitterGameLog.cjs';
import { fetchPitcherGameLog } from './fetchPitcherGameLog.cjs';

import { fetchHitterFuturesStats } from './fetchHitterFutures.js';
import { fetchPitcherFuturesStats } from './fetchPitcherFutures.js';
import { fetchHitterFuturesGameLog } from './fetchHitterFuturesGameLog.cjs';
import { fetchPitcherFuturesGameLog } from './fetchPitcherFuturesGameLog.cjs';

const players = JSON.parse(fs.readFileSync('./public/players.json', 'utf-8'));

(async () => {
  const results = [];

  for (const player of players) {
    const { name, kboId, position } = player;
    if (!name || !kboId || !position) continue;

    try {
      if (position.includes('투수')) {
        await fetchPitcherStats({ name, kboId });
        await fetchPitcherGameLog({ name, kboId });
        await fetchPitcherFuturesStats({ name, kboId });
        await fetchPitcherFuturesGameLog({ name, kboId });
      } else {
        await fetchHitterStats({ name, kboId });
        await fetchHitterGameLog({ name, kboId });
        await fetchHitterFuturesStats({ name, kboId });
        await fetchHitterFuturesGameLog({ name, kboId });
      }

      results.push({ name, kboId, position });
    } catch (err) {
      console.error(`❌ ${name}(${kboId}) 처리 실패:`, err.message);
    }
  }

  // ✅ 오늘 → 어제로 설정
  const today = new Date();
  today.setDate(today.getDate() - 1);
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}-${mm}-${dd}`;

  const statsDir = path.join(__dirname, 'public', 'stats');
  if (!fs.existsSync(statsDir)) fs.mkdirSync(statsDir, { recursive: true });

  fs.writeFileSync(path.join(statsDir, `${dateStr}.json`), JSON.stringify(results, null, 2));
  fs.writeFileSync(path.join(statsDir, `latest.json`), JSON.stringify(results, null, 2));

  console.log(`📦 전체 기록 저장 완료 (${results.length}명)`);
})();
