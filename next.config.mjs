// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 💡 [타입 스크립트 필터 우회] 빌드 로봇이 globals.css를 해독하도록 강제 연동선 주입!
  experimental: {
    turbo: {
      rules: {
        "*.css": ["@tailwindcss/postcss"],
      },
    },
  },
};

export default nextConfig;