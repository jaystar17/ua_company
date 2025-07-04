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

export default function HomePage() {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    fetch('/players.json')
      .then((res) => res.json())
      .then(setPlayers);
  }, []);

  const counts = {
    '1군': players.filter((p) => p.status === '1군').length,
    '2군': players.filter((p) => p.status === '2군').length,
    '상무': players.filter((p) => p.status === '상무').length,
    '부상': players.filter((p) => p.status === '부상').length,
  };

  return (
    <main className="p-4 max-w-6xl mx-auto text-gray-900">
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
            <p className="text-sm font-medium mt-2">
              상태:{" "}
              <span
                className={
                  p.status === '1군' ? 'text-green-700' :
                  p.status === '2군' ? 'text-blue-700' :
                  p.status === '상무' ? 'text-purple-700' :
                  'text-red-700'
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
