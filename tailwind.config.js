/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // 💡 [초정밀 개조] app 폴더 직속 및 하위 모든 방의 ts, tsx 파일을 1픽셀도 놓치지 않고 샅샅이 추적 감시합니다!
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};