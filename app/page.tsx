import PlayerList from "@/components/PlayerList";

export default function Home() {
  return (
    <main className="p-4 max-w-xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-4">유에이컴퍼니 웹 앱</h1>
      <p className="mb-6">스포츠 선수 관리 시스템입니다.</p>

      <div className="space-y-3">
        <a href="/players" className="block text-blue-600 underline">
          👉 선수 리스트 보기
        </a>
        <a href="/staff" className="block text-green-600 underline">
          👉 근무자 페이지 보기
        </a>
      </div>
    </main>
  );
}