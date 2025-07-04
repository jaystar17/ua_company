'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Player {
  name: string;
  number: number;
  position: string;
  kboId: string | number;
}

interface Article {
  title: string;
  url: string;
  date: string;
}

export default function PlayerPage({ params }: { params: { id: string } }) {
  const [player, setPlayer] = useState<Player | null>(null);
  const router = useRouter();
  const [stats, setStats] = useState<Record<string, any> | null>(null);
  const [latestGame, setLatestGame] = useState<Record<string, any> | null>(null);
  const [articles, setArticles] = useState<Article[]>([]); // ✅ 뉴스 상태 추가

  const id = decodeURIComponent(params.id);

  useEffect(() => {
    fetch('/players.json')
      .then(res => res.json())
      .then((list: Player[]) => {
        const p = list.find(player => String(player.kboId) === id);
        if (p) {
          setPlayer(p);
          const type = p.position.includes('투수') ? 'pitcher' : 'hitter';
          const kboId = p.kboId;

          fetch(`/data/${type}_${kboId}.json`)
            .then(res => res.ok ? res.json() : null)
            .then(setStats);

          fetch(`/gameLogs/${type}_${kboId}_latest.json`)
            .then(res => res.ok ? res.json() : null)
            .then(setLatestGame)
            .catch(() => setLatestGame(null));

          // ✅ 뉴스 JSON 불러오기
          fetch(`/news/${p.name}.json`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
              if (data?.articles) {
                setArticles(data.articles);
              }
            });
        }
      });
  }, [id]);

  if (!player) return <div className="p-4">선수 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="p-4">
      <button
        onClick={() => router.back()}
        className="text-sm text-blue-600 hover:underline mb-4"
      >
        ← 선수 목록
      </button>

      <h1 className="text-2xl font-bold mb-1">{player.name}</h1>
      <p className="text-sm text-gray-600 mb-4">#{player.number} / {player.position}</p>

      {/* 최근 경기 */}
      {latestGame && (
        <div className="mb-6 p-4 border border-gray-200 bg-white rounded-xl shadow-sm">
          <h2 className="text-base font-semibold text-gray-800 mb-3">
            📅 최근 경기 기록 ({latestGame.date} vs {latestGame.opponent})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  {Object.keys(latestGame)
                    .filter(k => k !== 'date' && k !== 'opponent')
                    .map(key => (
                      <th key={key} className="px-2 py-1 border text-xs text-gray-600 font-medium">
                        {key.toUpperCase()}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white">
                  {Object.entries(latestGame)
                    .filter(([k]) => k !== 'date' && k !== 'opponent')
                    .map(([k, v]) => (
                      <td key={k} className="px-2 py-1 text-center border text-black">
                        {v ?? '-'}
                      </td>
                    ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 시즌 누적 성적 */}
      {stats && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                {Object.keys(stats)
                  .filter(k => !['player', 'playerId', 'year'].includes(k))
                  .map(key => (
                    <th key={key} className="px-2 py-1 border text-xs text-gray-600 font-medium">
                      {key.toUpperCase()}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white">
                {Object.entries(stats)
                  .filter(([k]) => !['player', 'playerId', 'year'].includes(k))
                  .map(([k, v]) => (
                    <td key={k} className="px-2 py-1 text-center border text-black">
                      {v ?? '-'}
                    </td>
                  ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* 📰 뉴스 섹션 */}
      {articles.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3">📰 최근 뉴스</h2>
          <ul className="space-y-3">
            {articles.map((article, idx) => (
              <li
                key={idx}
                className="border p-3 rounded-xl bg-white shadow-sm hover:bg-gray-50 transition"
              >
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 font-medium hover:underline"
                >
                  {article.title}
                </a>
                <p className="text-xs text-gray-500 mt-1">{article.date}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
