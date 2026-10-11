import "./globals.css";

export const metadata = {
  title: "Diablo II Realtime Market",
  description: "Created by GoldStarPapa",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" style={{ margin: 0, padding: 0, backgroundColor: "#0A0A0A" }}>
      {/* 💡 [대완공 치트키] body 태그에 걸려있던 불필요한 기본 여백 필터를 완전히 제거하여 스타일 충돌을 원천 차단합니다! */}
      <body style={{ margin: 0, padding: 0, backgroundColor: "#0A0A0A", color: "#DCDCDC", minHeight: "100vh" }}>
        {children}
      </body>
    </html>
  );
}