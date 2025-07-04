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

export default function AdminPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/players.json')
      .then((res) => res.json())
      .then(setPlayers);
  }, []);

  const handleStatusChange = (kboId: string, newStatus: string) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.kboId === kboId ? { ...p, status: newStatus } : p
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/savePlayers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(players),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert('저장 실패');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="p-4 max-w-5xl mx-auto text-black">
      <Link href="/" className="text-blue-600 text-sm block mb-4 hover:underline">
        ← 선수 명단으로 돌아가기
      </Link>

      <h1 className="text-2xl font-bold mb-4 text-black">관리자 페이지</h1>

      <table className="table-auto w-full border text-sm mb-6">
        <thead className="bg-gray-100 text-gray-800">
          <tr>
            <th className="p-2 border">이름</th>
            <th className="p-2 border">팀</th>
            <th className="p-2 border">등번호</th>
            <th className="p-2 border">포지션</th>
            <th className="p-2 border">상태</th>
          </tr>
        </thead>
        <tbody className="text-gray-100">
          {players.map((p) => (
            <tr key={p.kboId}>
              <td className="p-2 border">{p.name}</td>
              <td className="p-2 border">{p.team}</td>
              <td className="p-2 border">{p.number}</td>
              <td className="p-2 border">{p.position}</td>
              <td className="p-2 border">
                <select
                  value={p.status}
                  onChange={(e) => handleStatusChange(p.kboId, e.target.value)}
                  className="border px-1 py-0.5 text-black"
                >
                  <option>1군</option>
                  <option>2군</option>
                  <option>상무</option>
                  <option>부상</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={handleSave}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        disabled={saving}
      >
        {saving ? '저장 중...' : saved ? '✅ 저장됨' : '변경 사항 저장'}
      </button>
    </main>
  );
}
