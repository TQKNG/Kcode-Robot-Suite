import type { KcodePlugin } from "@kcode/plugin-sdk";
import { operationalDashboardPlugin } from "@kcode/operational-dashboard";
import { whereMyBotPlugin } from "@kcode/wheremybot";
import { robotEngagementPlugin } from "@kcode/robot-engagement";
import { telepresencePlugin } from "@kcode/telepresence";

/** The application composition root. The kernel never imports concrete plugins. */
export const plugins: readonly KcodePlugin[] = Object.freeze([
  operationalDashboardPlugin,
  whereMyBotPlugin,
  robotEngagementPlugin,
  telepresencePlugin
]);
