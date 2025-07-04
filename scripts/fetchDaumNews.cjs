const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

// 📰 Daum 뉴스 검색 결과에서 기사 추출
async function fetchDaumNews(playerName) {
  const query = encodeURIComponent(playerName);
  const url = `https://search.daum.net/search?w=news&q=${query}`;

  const { data: html } = await axios.get(url, {
    headers: {
      // ✅ PC 브라우저 User-Agent 명시
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/114.0.0.0 Safari/537.36',
    },
  });

  const $ = cheerio.load(html);
  const articles = [];

  // ✅ 뉴스 기사 블록 기준 순회
  $('div.c-tit-doc').each((i, el) => {
    if (i >= 5) return false;

    const title = $(el).find('a.item-tit').text().trim();
    const url = $(el).find('a.item-tit').attr('href');
    const press = $(el).find('.item-media').text().trim() || null;
    const reporter = $(el).find('.item-writer').text().trim() || null;
    const date = $(el).find('.item-date').text().trim() || null;

    if (title && url) {
      articles.push({ title, url, press, reporter, date });
    }
  });

  return articles;
}

// 📁 선수 목록 전체에 대해 반복 처리
async function main() {
  const players = require('../public/players.json'); // 예: [{ name: '노시환' }, ...]
  const newsDir = path.join(__dirname, '..', 'public', 'news');
  if (!fs.existsSync(newsDir)) fs.mkdirSync(newsDir, { recursive: true });

  for (const player of players) {
    try {
      const articles = await fetchDaumNews(player.name);
      const safeName = player.name.replace(/[\\/:"*?<>|]+/g, '_');
      const savePath = path.join(newsDir, `${safeName}.json`);
      fs.writeFileSync(savePath, JSON.stringify(articles, null, 2), 'utf-8');
      console.log(`✅ ${player.name}: ${articles.length}개 기사 저장 완료`);
    } catch (err) {
      console.error(`❌ ${player.name} 기사 저장 실패: ${err.message}`);
    }
  }
}

main();
