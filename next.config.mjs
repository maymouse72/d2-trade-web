// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 💡 빌드 로봇(Turbopack)이 globals.css에 주입된 테일윈드 v4 명령어를 완벽하게 해독하도록 다리를 놓아줍니다!
  experimental: {
    turbo: {
      rules: {
        "*.css": ["@tailwindcss/postcss"],
      },
    },
  },
};

export default nextConfig;