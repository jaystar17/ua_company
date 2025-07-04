const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function fetchPitcherGameLog({ name, kboId }) {
  const url = `https://www.koreabaseball.com/Record/Player/PitcherDetail/Basic.aspx?playerId=${kboId}`;
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log(`📅 [최근경기] (투수) ${name} 페이지 접속...`);
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  const latestGame = await page.evaluate(() => {
    const h6 = [...document.querySelectorAll('.player_records h6')]
      .find(el => el.textContent.includes('최근 10경기'));
    if (!h6) return null;

    const tableWrapper = h6.nextElementSibling;
    if (!tableWrapper || !tableWrapper.matches('.tbl-type02.mb35')) return null;

    const row = tableWrapper.querySelector('tbody tr');
    if (!row) return null;

    const cells = [...row.querySelectorAll('td')].map(td => td.textContent.trim());
    if (cells.length < 16) return null;

    return {
      date: cells[0],
      opponent: cells[1],
      era: cells[2],
      result: cells[3],
      g: cells[4],
      w: cells[5],
      l: cells[6],
      sv: cells[7],
      hold: cells[8],
      ip: cells[9],
      h: cells[10],
      hr: cells[11],
      bb: cells[12],
      so: cells[13],
      r: cells[14],
      er: cells[15]
    };
  });

  await browser.close();

  if (!latestGame) {
    console.log(`⚠️ [최근경기] (투수) ${name} → 최근 경기 데이터 없음`);
    return;
  }

  const savePath = `./public/gameLogs/pitcher_${kboId}_latest.json`;
  fs.mkdirSync(path.dirname(savePath), { recursive: true });
  fs.writeFileSync(savePath, JSON.stringify(latestGame, null, 2), 'utf-8');

  console.log(`✅ [최근경기] (투수) ${name} 기록 저장 완료`);
}

module.exports = { fetchPitcherGameLog };
