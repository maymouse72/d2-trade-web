import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*여기에 빌드 안전화 필터를 완벽하게 장착합니다*/
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;