import type { NextConfig } from "next";

import { withMicrofrontends } from "@vercel/microfrontends/next/config";

const nextConfig: NextConfig = {
  basePath: "/app/kcode-robot-suite",
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
