import MarketHome from "./MarketHome"; // 💡 [깨짐 해결 핵심] 통신 엔진을 하위 부속품으로 호출!

export const metadata = {
  title: "Diablo II Realtime Market",
  description: "Created by GoldStarPapa",
};

export default function Home() {
  // 💡 최상단에서 use client 차단기를 완벽하게 제거하여, Tailwind 디자인 옷이 무조건 입혀지게 만듭니다!
  return <MarketHome />;
}