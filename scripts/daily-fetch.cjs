// scripts/daily-fetch.js

console.log("📦 KBO 선수 데이터 수집 시작");

require('./fetchAllPlayers');
require('./fetchHitter');
require('./fetchPitcher');

console.log("✅ 모든 선수 데이터 수집 완료");