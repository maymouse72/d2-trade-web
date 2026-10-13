// app/layout.tsx
import "./globals.css"; // 💡 [가장 중요] 테일윈드 미사일을 발사하는 핵심 파이프라인!

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
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#C76C2E" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
      </head>
      
      <body style={{ margin: 0, padding: 0, backgroundColor: "#0A0A0A", color: "#DCDCDC", minHeight: "100vh" }}>
        {children}
      </body>
    </html>
  );
}