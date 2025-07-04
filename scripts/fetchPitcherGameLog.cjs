const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function fetchPitcherGameLog({ name, kboId }) {
  const url = `https://www.koreabaseball.com/Record/Player/PitcherDetail/Basic.aspx?playerId=${kboId}`;
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log(`📅 [최근경기] ${name} 페이지 접속...`);
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  const gameLogs = await page.evaluate(() => {
    const h6 = [...document.querySelectorAll('.player_records h6')]
      .find(el => el.textContent.includes('최근 10경기'));
    if (!h6) return [];

    const tableWrapper = h6.nextElementSibling;
    if (!tableWrapper || !tableWrapper.matches('.tbl-type02.mb35')) return [];

    const rows = tableWrapper.querySelectorAll('tbody tr');
    if (!rows || rows.length === 0) return [];

    return [...rows].slice(0, 7).map(row => {
      const cells = [...row.querySelectorAll('td')].map(td => td.textContent.trim());
      if (cells.length < 12) return null;

      return {
        date: cells[0],
        opponent: cells[1],
        result: cells[2],
        era: cells[3],
        ip: cells[4],
        h: cells[5],
        r: cells[6],
        er: cells[7],
        bb: cells[8],
        so: cells[9],
        hr: cells[10],
        np: cells[11]
      };
    }).filter(g => g !== null);
  });

  await browser.close();

  if (!gameLogs || gameLogs.length === 0) {
    console.log(`⚠️ [최근경기] ${name} → 최근 경기 데이터 없음`);
    return;
  }

  const savePath = `./public/gameLogs/pitcher_${kboId}.json`;
  fs.mkdirSync(path.dirname(savePath), { recursive: true });
  fs.writeFileSync(savePath, JSON.stringify(gameLogs, null, 2), 'utf-8');

  console.log(`✅ [최근경기] ${name} - ${gameLogs.length}경기 기록 저장 완료`);
}

module.exports = { fetchPitcherGameLog };
