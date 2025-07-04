const fs = require('fs');
const path = require('path');

const playerPath = path.join(__dirname, 'PlayerList.json');
const statsPath = path.join(__dirname, '..', 'public', 'stats', 'latest.json');
const outputPath = path.join(__dirname, '..', 'public', 'players.json');

const playerList = JSON.parse(fs.readFileSync(playerPath, 'utf-8'));
const statsListRaw = JSON.parse(fs.readFileSync(statsPath, 'utf-8'));

// ❗ null 값 제거 및 kboId 없는 항목 제외
const statsList = statsListRaw.filter(s => s && s.kboId);

const merged = playerList
  .filter(player => player.kboId)
  .map(player => {
    const stat = statsList.find(s => s.kboId === player.kboId);
    return {
      ...player,
      ...(stat ? { season: stat.season, today: stat.today, type: stat.type } : {})
    };
  });

fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2), 'utf-8');
console.log(`✅ 병합 완료: ${merged.length}명 → players.json`);
