import "./globals.css"; // 💡 [깨짐 버그 해결의 핵심] 최신 디자인 보따리를 1순위로 강제 주입!

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
    <html lang="ko">
      <body className="antialiased bg-[#0A0A0A] text-[#DCDCDC]">
        {children}
      </body>
    </html>
  );
}