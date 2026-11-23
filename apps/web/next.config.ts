import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  basePath,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cs210032002b3e09a5d.blob.core.windows.net",
        pathname: "/portfolio-assets/brand/Logo_v3.png",
      },
    ],
  },
  transpilePackages: [
    "@kcode/design-system",
    "@kcode/kernel",
    "@kcode/plugin-sdk",
    "@kcode/services",
    "@kcode/operational-dashboard",
    "@kcode/wheremybot",
    "@kcode/robot-engagement",
    "@kcode/telepresence",
  ],
};
export default nextConfig;
