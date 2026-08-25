import type { KcodePlugin, PluginContext } from "@kcode/plugin-sdk";
import { WhereMyBotEntry } from "./ui/where-my-bot-entry";

const emitLifecycle = (context: PluginContext, state: string) => {
  context.logger.info(`WhereMyBot ${state}`, { pluginId: context.pluginId });
  void context.events.emit("wheremybot.lifecycle.changed", {
    pluginId: context.pluginId,
    state,
  });
};

export const whereMyBotPlugin: KcodePlugin = {
  id: "wheremybot",
  name: "WhereMyBot",
  version: "1.1.0",
  sdkVersion: "1.0.0",
  metadata: {
    id: "wheremybot",
    name: "WhereMyBot",
    description: "Plan hotel delivery routes and operate a service robot in real time.",
    category: "Robotics",
    version: "1.1.0",
    status: "available",
    technologies: ["SVG floor plan", "Route simulation", "Event bus"],
  },
  entry: WhereMyBotEntry,
  routes: [
    {
      path: "/demo/wheremybot",
      title: "WhereMyBot operations",
      description: "Interactive hotel robot routing and controls.",
      requiresAuthentication: true,
      requiredPermissions: ["robot.view"],
    },
  ],
  navigation: [
    { id: "wheremybot.operations", label: "Robot operations", href: "/demo/wheremybot", order: 20 },
  ],
  permissions: [
    { id: "robot.view", name: "View robots", description: "View robot status and location.", category: "Robotics" },
    { id: "robot.control", name: "Control robots", description: "Execute and stop robot routes.", category: "Robotics" },
    { id: "robot.message", name: "Message guests", description: "Send a welcome message through the robot.", category: "Messaging" },
    { id: "route.manage", name: "Manage routes", description: "Draw and save robot routes.", category: "Robotics" },
  ],
  settings: [
    { key: "robot.defaultSpeed", label: "Default speed", description: "Simulation speed in floor-plan units per second.", type: "number", defaultValue: 115, required: true },
    { key: "robot.defaultWelcomeMessage", label: "Default welcome message", type: "string", defaultValue: "Welcome to Kcode Hotel" },
    { key: "robot.showLocationLabels", label: "Show location labels", type: "boolean", defaultValue: true },
  ],
  register(context) { emitLifecycle(context, "registered"); },
  async initialize(context) { emitLifecycle(context, "initialized"); },
  async activate(context) { emitLifecycle(context, "active"); },
  async deactivate(context) { emitLifecycle(context, "inactive"); },
  async dispose(context) { emitLifecycle(context, "disposed"); },
};

export type { Robot, RobotDirection, RobotState } from "./domain/robot";
export type { Point, RobotRoute } from "./domain/route";
export type { RobotService } from "./services/robot.service";
export type { RouteService } from "./services/route.service";
