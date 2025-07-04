import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const players = await request.json();
    const filePath = path.join(process.cwd(), 'public', 'players.json');

    await fs.writeFile(filePath, JSON.stringify(players, null, 2), 'utf-8');
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('❌ 저장 실패:', err);
    return NextResponse.json({ success: false, error: '파일 저장 중 에러' }, { status: 500 });
  }
}