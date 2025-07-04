import fs from 'fs';
import { fetchHitterStats } from './fetchHitter.js';
import { fetchPitcherStats } from './fetchPitcher.js';

const playersFile = './public/players.json';

async function main() {
  const players = JSON.parse(fs.readFileSync(playersFile, 'utf-8'));

  for (const player of players) {
    const { name, kboId, position } = player;

    if (!name || !kboId || !position) {
      console.log(`⚠️ 누락된 정보 → ${JSON.stringify(player)}`);
      continue;
    }

    try {
      if (position.includes('투수')) {
        await fetchPitcherStats({ name, kboId });
      } else {
        await fetchHitterStats({ name, kboId });
      }
    } catch (err) {
      console.error(`❌ ${name}(${kboId}) 처리 실패:`, err.message);
    }
  }

  console.log('✅ 전체 선수 처리 완료');
}

main();
