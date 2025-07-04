import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

export async function fetchHitterFuturesStats({ name, kboId, year = 2025 }) {
  const url = `https://www.koreabaseball.com/Futures/Player/HitterDetail.aspx?playerId=${kboId}`;
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log(`🚀 [2군 타자] ${name} 페이지 접속...`);
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  try {
    await page.waitForFunction(() => {
      const headings = [...document.querySelectorAll('.player_records h6')];
      return headings.some(h => h.textContent.includes('2025 시즌 퓨처스 성적'));
    }, { timeout: 10000 });

    const [basicData, detailData] = await page.evaluate(() => {
      const heading = [...document.querySelectorAll('.player_records h6')]
        .find(h => h.textContent.includes('2025 시즌 퓨처스 성적'));
      if (!heading) return [[], []];

      const container = heading.closest('.player_records');
      const tables = container.querySelectorAll('.tbl-type02');

      const getTds = (table) => {
        if (!table) return [];

        const rows = [...table.querySelectorAll('tr')];
        if (rows.length === 0) return [];

        const bestRow = rows.reduce((a, b) =>
          a.querySelectorAll('td').length > b.querySelectorAll('td').length ? a : b
        );

        return [...bestRow.querySelectorAll('td')].map(td => td.textContent.trim());
      };

      return [
        getTds(tables[0]),
        getTds(tables[1])
      ];
    });

    if (!basicData || basicData.length === 0 || basicData[0] === '기록이 없습니다.') {
      console.log(`⛔ [2군 타자] ${name} → 성적 없음 (스킵됨)`);
      return;
    }

    const basicFields = [
      'team', 'avg', 'g', 'ab', 'r', 'h', '2b', '3b', 'hr', 'rbi',
      'sb', 'bb', 'hbp', 'so', 'slg', 'obp'
    ];
    const detailFields = []; // 2군은 세부 테이블이 비어있을 수 있음

    const basicRecord = Object.fromEntries(basicFields.map((key, i) => [key, basicData[i] ?? null]));
    const detailRecord = Object.fromEntries(detailFields.map((key, i) => [key, detailData[i] ?? null]));

    const playerStats = {
      player: name,
      playerId: kboId,
      year,
      ...basicRecord,
      ...detailRecord,
    };

    const savePath = `./public/data/hitter_${kboId}_futures.json`;
    fs.mkdirSync(path.dirname(savePath), { recursive: true });
    fs.writeFileSync(savePath, JSON.stringify(playerStats, null, 2), 'utf-8');

    console.log(`✅ [2군 타자] ${name} 저장 완료`);
  } catch (err) {
    console.error(`❌ [2군 타자] ${name} 실패:`, err.message);
  } finally {
    await browser.close();
  }
}
