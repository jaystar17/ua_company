
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function fetchPitcherFuturesGameLog({ name, kboId }) {
  const url = `https://www.koreabaseball.com/Record/Player/PitcherDetail/FuturesBasic.aspx?playerId=${kboId}`;
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log(`📅 [2군 투수] ${name} 페이지 접속...`);
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  const gameLogs = await page.evaluate(() => {
    const h6 = [...document.querySelectorAll('.player_records h6')]
      .find(el => el.textContent.includes('2925 최근 10경기'));
    if (!h6) return [];

    const tableWrapper = h6.nextElementSibling;
    if (!tableWrapper || !tableWrapper.matches('.tbl-type02.mb35')) return [];

    const rows = tableWrapper.querySelectorAll('tbody tr');
    if (!rows || rows.length === 0) return [];

    return [...rows].slice(0, 7).map(row => {
      const cells = [...row.querySelectorAll('td')].map(td => td.textContent.trim());
      if (cells.length < 16) return null;

      return {
        date: cells[0],
        opponent: cells[1],
        avg: cells[2],
        pa: cells[3],
        ab: cells[4],
        h: cells[5],
        '2b': cells[6],
        '3b': cells[7],
        hr: cells[8],
        rbi: cells[9],
        sb: cells[10],
        cs: cells[11],
        bb: cells[12],
        hbp: cells[13],
        so: cells[14],
        gdp: cells[15]
      };
    }).filter(g => g !== null);
  });

  await browser.close();

  if (!gameLogs || gameLogs.length === 0) {
    console.log(`⚠️ [2군 투수] ${name} → 최근 경기 없음`);
    return;
  }

  const savePath = `./public/gameLogs/pitcher_${kboId}_futures.json`;
  fs.mkdirSync(path.dirname(savePath), { recursive: true });
  fs.writeFileSync(savePath, JSON.stringify(gameLogs, null, 2), 'utf-8');

  console.log(`✅ [2군 투수] ${name} - ${gameLogs.length}경기 기록 저장 완료`);
}

module.exports = { fetchPitcherFuturesGameLog };
