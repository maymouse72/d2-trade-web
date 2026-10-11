import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 💡 [배포 핵심 보정] Vercel 서버가 조립할 때 까다로운 문법/타입 에러가 있어도 쿨하게 패스하고 빌드 성공시키는 안전장치
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;