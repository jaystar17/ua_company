'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

type Player = {
  name: string;
  kboId: string;
  position: string;
};

export default function PlayerDetailPage() {
  const { kboId } = useParams<{ kboId: string }>();
  const [player, setPlayer] = useState<Player | null>(null);
  const [stats, setStats] = useState<Record<string, any> | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!kboId) return;

    fetch('/players.json')
      .then(res => {
        if (!res.ok) throw new Error('❌ players.json 불러오기 실패');
        return res.json();
      })
      .then((players: Player[]) => {
        const found = players.find(p => String(p.kboId) === String(kboId));
        if (!found) {
          setNotFound(true);
          return;
        }

        setPlayer(found);
        const type = found.position.includes('투수') ? 'pitcher' : 'hitter';

        fetch(`/data/${type}_${kboId}.json`)
          .then(res => {
            if (!res.ok) throw new Error('❌ 개별 선수 기록 불러오기 실패');
            return res.json();
          })
          .then(setStats)
          .catch((err) => {
            console.error(err.message);
            setStats(null);
            setErrorMsg('📭 2025 시즌 1군 기록이 없습니다.');
          });
      })
      .catch((err) => {
        console.error(err.message);
        setNotFound(true);
        setErrorMsg(err.message);
      });
  }, [kboId]);

  if (notFound) return <div className="p-4 text-red-500">선수 정보를 찾을 수 없습니다.</div>;
  if (!player) return <div className="p-4">불러오는 중...</div>;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Link href="/players" className="text-blue-600 text-sm hover:underline">← 선수 목록으로</Link>

      <h1 className="text-2xl font-bold mt-2 mb-2">{player.name} 선수</h1>
      <p className="text-sm text-gray-500 mb-4">
        포지션: {player.position} | KBO ID: {player.kboId}
      </p>

      {!stats ? (
        <p className="text-gray-400">{errorMsg || '📭 기록이 없습니다.'}</p>
      ) : (
        <table className="table-auto w-full border text-sm border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              {Object.keys(stats)
                .filter(k => !['player', 'playerId', 'year'].includes(k))
                .map(key => (
                  <th key={key} className="p-2 border border-gray-300 text-xs text-gray-600 font-semibold">
                    {key.toUpperCase()}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            <tr className="even:bg-gray-50">
              {Object.entries(stats)
                .filter(([k]) => !['player', 'playerId', 'year'].includes(k))
                .map(([k, v]) => (
                  <td key={k} className="p-2 border border-gray-200 text-center">
                    {v ?? '-'}
                  </td>
                ))}
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}
