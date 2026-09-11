import type { NextConfig } from "next";

import { withMicrofrontends } from "@vercel/microfrontends/next/config";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  basePath,
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
export default withMicrofrontends(nextConfig);
