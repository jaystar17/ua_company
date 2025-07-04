const fs = require("fs");
const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");

// 날짜 정규화 함수 → YYYY.MM.DD 형식
function normalizeDate(dateStr) {
  const now = new Date();

  if (/(\d+)\s*분\s*전/.test(dateStr)) {
    const mins = parseInt(dateStr.match(/(\d+)\s*분\s*전/)[1], 10);
    now.setMinutes(now.getMinutes() - mins);
  } else if (/(\d+)\s*시간\s*전/.test(dateStr)) {
    const hours = parseInt(dateStr.match(/(\d+)\s*시간\s*전/)[1], 10);
    now.setHours(now.getHours() - hours);
  } else if (/(\d+)\s*일\s*전/.test(dateStr)) {
    const days = parseInt(dateStr.match(/(\d+)\s*일\s*전/)[1], 10);
    now.setDate(now.getDate() - days);
  } else if (/^\d{4}\.\d{2}\.\d{2}$/.test(dateStr)) {
    return dateStr;
  } else {
    return null;
  }

  return `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`;
}

// 날짜가 최근 7일 이내인지 확인
function isWithin7Days(dateStr) {
  if (!dateStr) return false;
  const now = new Date();
  const [year, month, day] = dateStr.split(".").map(Number);
  const articleDate = new Date(year, month - 1, day);
  const diffTime = now - articleDate;
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays <= 7;
}

async function fetchDaumNews(playerName) {
  const query = encodeURIComponent(playerName);
  const url = `https://search.daum.net/search?w=news&q=${query}`;

  const { data: html } = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/114.0.0.0 Safari/537.36",
    },
  });

  const $ = cheerio.load(html);
  const articles = [];

  $("div.item-bundle-mid").each((i, el) => {
    if (i >= 10) return false; // 여유롭게 더 수집 후 필터링

    const title = $(el).find("strong.tit-g a").text().trim();
    const url = $(el).find("strong.tit-g a").attr("href")?.trim() || null;

    let date = null;
    const infoSpans = $(el).find("span.txt_info");
    infoSpans.each((_, span) => {
      const text = $(span).text().trim();
      if (/(\d+\s*분\s*전|\d+\s*시간\s*전|\d+\s*일\s*전|\d{4}\.\d{2}\.\d{2})/.test(text)) {
        date = normalizeDate(text);
      }
    });

    if (title && url && date && isWithin7Days(date)) {
      articles.push({ title, url, date });
    }
  });

  return articles;
}

async function main() {
  const players = require("../public/players.json");
  const newsDir = path.join(__dirname, "..", "public", "news");
  if (!fs.existsSync(newsDir)) fs.mkdirSync(newsDir, { recursive: true });

  for (const player of players) {
    try {
      const articles = await fetchDaumNews(player.name);
      const safeName = player.name.replace(/[\\/:"*?<>|]+/g, "_");
      const savePath = path.join(newsDir, `${safeName}.json`);
      const enriched = {
        name: player.name,
        team: player.team || null,
        articles,
      };
      fs.writeFileSync(savePath, JSON.stringify(enriched, null, 2), "utf-8");
      console.log(`✅ Saved news for ${player.name}`);
    } catch (err) {
      console.error(`❌ Failed to fetch news for ${player.name}:`, err.message);
    }
  }
}

main();
