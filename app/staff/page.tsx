'use client';

import { useRouter } from 'next/navigation';

export default function StaffPage() {
  const router = useRouter();

  return (
    <div className="p-6">
      <button
        onClick={() => router.push('/')}
        className="text-sm text-blue-600 hover:underline mb-4"
      >
        ← 메인으로
      </button>

      <h1 className="text-2xl font-bold mb-4">UA 컴퍼니 근무자 페이지</h1>

      <ul className="list-disc pl-6 text-gray-700 space-y-2">
        <li>📋 주간 업무 정리</li>
        <li>📅 일정 확인</li>
        <li>🕒 근태 현황</li>
        <li>🌴 연차 관리</li>
      </ul>
    </div>
  );
}
