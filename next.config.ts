import type { NextConfig } from "next";

const b2PublicUrl = new URL(process.env.B2_PUBLIC_URL!);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: b2PublicUrl.hostname,
      },
    ],
  },
};

export default nextConfig;
