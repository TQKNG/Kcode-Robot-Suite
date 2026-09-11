import type { KcodePlugin } from "@kcode/plugin-sdk";
import { RobotEngagementEntry } from "./entry";

export const robotEngagementPlugin: KcodePlugin = {
  id: "robot-engagement",
  name: "Engage Enjoy",
  version: "1.0.0",
  sdkVersion: "1.0.0",
  metadata: {
    id: "robot-engagement",
    name: "Engage Enjoy",
    description:
      "Robot game library, deployment, configuration, and engagement analytics.",
    category: "Engagement",
    version: "1.0.0",
    status: "available",
    technologies: ["Typed mock services", "Recharts", "Event bus"],
  },
  entry: RobotEngagementEntry,
  routes: [
    {
      path: "/demo/robot-engagement",
      title: "Kcode Engage",
      requiresAuthentication: true,
      requiredPermissions: ["game.read"],
    },
  ],
  navigation: [
    {
      id: "robot-engagement.home",
      label: "Kcode Engage",
      href: "/demo/robot-engagement",
      order: 30,
    },
  ],
  permissions: [
    {
      id: "game.read",
      name: "View engagement",
      description: "View the game library and analytics.",
      category: "Engagement",
    },
    {
      id: "game.manage",
      name: "Manage engagement",
      description: "Edit game and robot configuration.",
      category: "Engagement",
    },
    {
      id: "game.deploy",
      name: "Deploy games",
      description: "Deploy game content to compatible robots.",
      category: "Engagement",
    },
  ],
  settings: [
    {
      key: "defaultLanguage",
      label: "Default language",
      type: "select",
      defaultValue: "English",
      options: [
        { label: "English", value: "English" },
        { label: "French", value: "French" },
        { label: "Spanish", value: "Spanish" },
        { label: "German", value: "German" },
      ],
    },
    {
      key: "defaultPlayLength",
      label: "Default play length",
      description: "Default session duration in minutes.",
      type: "number",
      defaultValue: 8,
    },
    {
      key: "soundEffects",
      label: "Sound effects",
      type: "boolean",
      defaultValue: true,
    },
  ],
  async initialize(context) {
    context.logger.info("Kcode Engage initialized");
  },
  async activate(context) {
    context.logger.info("Kcode Engage activated");
  },
};

export * from "./types";
