'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Player = {
  name: string;
  team: string;
  number: number;
  position: string;
  status: string;
  kboId: string;
};

type GameLog = {
  date: string;
  pa?: string;
  ab?: string;
  h?: string;
  hr?: string;
  rbi?: string;
  ip?: string;
  er?: string;
  so?: string;
};

function getYesterdayMMDD(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export default function HomePage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [highlights, setHighlights] = useState<string[]>([]);

  useEffect(() => {
    fetch('/players.json')
      .then((res) => res.json())
      .then(async (data: Player[]) => {
        setPlayers(data);

        const yesterday = getYesterdayMMDD();
        const summary: string[] = [];

        for (const player of data) {
          const isPitcher = player.position.includes('투수');
          const path = `/gameLogs/${isPitcher ? 'pitcher' : 'hitter'}_${player.kboId}.json`;

          try {
            const res = await fetch(path);
            if (!res.ok) continue;

            const game: GameLog = await res.json();
            if (game.date !== yesterday) continue;

            if (isPitcher && Number(game.ip ?? 0) > 0) {
              summary.push(
                `${player.name} · ${game.ip}이닝 ${game.er ?? 0}자책 ${game.so ?? 0}K`
              );
            } else if (!isPitcher && Number(game.pa ?? 0) > 0) {
              summary.push(
                `${player.name} · ${game.ab ?? 0}타수 ${game.h ?? 0}안타 ${
                  Number(game.hr) > 0 ? `${game.hr}홈런 ` : ''
                }${game.rbi ?? 0}타점`
              );
            }
          } catch {
            // pass
          }
        }

        setHighlights(summary);
      });
  }, []);

  const counts = {
    '1군': players.filter((p) => p.status === '1군').length,
    '2군': players.filter((p) => p.status === '2군').length,
    '상무': players.filter((p) => p.status === '상무').length,
    '부상': players.filter((p) => p.status === '부상').length,
  };

  return (
    <main className="p-4 max-w-6xl mx-auto text-white-900">
      {/* ✅ 어제 경기 요약 - 최상단 */}
      {highlights.length > 0 && (
        <div className="mb-6 text-gray-800">
          <h2 className="text-xl font-bold mb-2">📰 어제 경기 요약</h2>
          <ul className="list-disc list-inside text-sm space-y-1">
            {highlights.map((line, idx) => (
              <li key={idx}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ✅ 메인으로 가기 버튼 */}
      <div className="mb-4">
        <Link
          href="/"
          className="text-sm text-blue-600 hover:underline font-medium"
        >
          ← 메인으로
        </Link>
      </div>

      {/* ✅ 선수 수 요약 + 관리자 링크 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">📋 선수 명단</h1>
        <p className="text-gray-700 font-medium text-lg">
          🟢 1군: <span className="font-semibold text-green-700">{counts['1군']}</span>명 | 
          🔵 2군: <span className="font-semibold text-blue-700">{counts['2군']}</span>명 | 
          🟣 상무: <span className="font-semibold text-purple-700">{counts['상무']}</span>명 | 
          🔴 부상: <span className="font-semibold text-red-700">{counts['부상']}</span>명
        </p>
        <div className="mt-2">
          <Link
            href="/admin"
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            🔧 관리자 페이지 →
          </Link>
        </div>
      </div>

      {/* ✅ 선수 목록 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {players.map((p) => (
          <Link
            key={p.kboId}
            href={`/players/${p.kboId}`}
            className="border bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition text-gray-900"
          >
            <h2 className="text-lg font-semibold mb-1">{p.name}</h2>
            <p className="text-sm text-gray-700">팀: {p.team}</p>
            <p className="text-sm text-gray-700">포지션: {p.position}</p>
            <p className="text-sm text-gray-700">등번호: {p.number}</p>
            <p className="text-sm font-medium mt-15">
              상태:{" "}
              <span
                className={
                  p.status === '1군' ? 'text-sm font-black text-green-700' :
                  p.status === '2군' ? 'text-sm font-black text-blue-700' :
                  p.status === '상무' ? 'text-sm font-black text-purple-700' :
                  'text-sm font-black text-red-700'
                }
              >
                {p.status}
              </span>
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}