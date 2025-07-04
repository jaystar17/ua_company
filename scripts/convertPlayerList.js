// scripts/convertPlayerList.js

import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';

// 경로 설정
const xlsxPath = path.join('scripts', 'PlayerList.xlsx');
const jsonPath = path.join('scripts', 'PlayerList.json');

// 엑셀 파일 불러오기
const workbook = xlsx.readFile(xlsxPath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

// 헤더 추출
const headerIndex = data.findIndex(row => row.includes('이름'));
if (headerIndex === -1) {
  console.error("❌ 헤더 행을 찾을 수 없습니다.");
  process.exit(1);
}

const headers = data[headerIndex];
const body = data.slice(headerIndex + 1);

// 필요한 컬럼 인덱스
const getIndex = (label) => headers.indexOf(label);
const idx = {
  name: getIndex("이름"),
  team: getIndex("소속팀"),
  number: getIndex("등번호"),
  position: getIndex("포지션"),
  status: getIndex("상태"),
  kboId: getIndex("KBO ID")
};

// JSON 변환
const players = body
  .filter(row => row[idx.name] && row[idx.kboId])
  .map(row => ({
    name: row[idx.name],
    team: row[idx.team],
    number: Number(row[idx.number] || 0),
    position: row[idx.position],
    status: row[idx.status],
    kboId: String(row[idx.kboId])
  }));

// 저장
fs.writeFileSync(jsonPath, JSON.stringify(players, null, 2), 'utf-8');
console.log(`✅ 변환 완료: ${players.length}명 → PlayerList.json`);
