"use client";

import { useState } from "react";

const players = [
  {
    id: 1,
    name: "정현수",
    team: "롯데 자이언츠",
    position: "투수",
    number: 57,
    stats: { ip: "31.1", era: "2.87", so: 31 },
  },
  {
    id: 2,
    name: "노시환",
    team: "한화 이글스",
    position: "내야수",
    number: 3,
    stats: { pa: 230, hr: 12, avg: ".287" },
  },
];

export default function PlayerList() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">선수 리스트</h2>
      <div className="grid grid-cols-2 gap-4">
        {players.map((p) => (
          <div
            key={p.id}
            onClick={() => setSelected(p)}
            className="cursor-pointer border rounded-xl p-4 hover:shadow-md"
          >
            <p className="font-bold">{p.name}</p>
            <p className="text-sm text-gray-500">{p.team}</p>
            <p className="text-sm">{p.position} · #{p.number}</p>
          </div>
        ))}
      </div>

      {selected && (
        <div className="mt-6 p-4 border rounded-xl bg-white shadow-md">
          <h2 className="text-lg font-semibold">{selected.name}</h2>
          <p className="text-gray-600">{selected.team}</p>
          <p className="mb-2">{selected.position} · #{selected.number}</p>

          {selected.position === "투수" ? (
            <ul className="list-disc pl-5">
              <li>이닝(IP): {selected.stats.ip}</li>
              <li>ERA: {selected.stats.era}</li>
              <li>탈삼진: {selected.stats.so}</li>
            </ul>
          ) : (
            <ul className="list-disc pl-5">
              <li>타석: {selected.stats.pa}</li>
              <li>홈런: {selected.stats.hr}</li>
              <li>타율: {selected.stats.avg}</li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}