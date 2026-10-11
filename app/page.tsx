import MarketHome from "./MarketHome";

export const metadata = {
  title: "Diablo II Realtime Market",
  description: "Created by GoldStarPapa",
};

export default function Home() {
  // 💡 구형 팝업 유령 코드를 메인에서 완전히 증발시키고, 순수 기지국 본체만 호출합니다!
  return <MarketHome />;
}