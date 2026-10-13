// app/layout.tsx
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
      {/* 💡 [PWA 앱 구동 핵심 이식] 스마트폰 홈 화면 추가 및 테마 연동 설정 주입 */}
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#C76C2E" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
      </head>
      
      {/* 💡 [대완공 치트키 보존] body 태그에 걸려있던 불필요한 기본 여백 필터를 완전히 제거하여 스타일 충돌을 원천 차단합니다! */}
      <body style={{ margin: 0, padding: 0, backgroundColor: "#0A0A0A", color: "#DCDCDC", minHeight: "100vh" }}>
        {children}
      </body>
    </html>
  );
}