import type { KcodePlugin } from "@kcode/plugin-sdk";
import { OperationalDashboardEntry } from "./components/operational-dashboard-entry";

export const operationalDashboardPlugin: KcodePlugin = {
  id: "operational-dashboard",
  name: "Operational Dashboard",
  version: "1.1.0",
  sdkVersion: "1.0.0",
  metadata: {
    id: "operational-dashboard",
    name: "Operational Dashboard",
    description: "Monitor fleet health, device telemetry, utilization, and operational alerts from one command surface.",
    category: "Operations",
    icon: "OD",
    version: "1.1.0",
    status: "available",
    technologies: ["Recharts", "Service interfaces", "Mock telemetry"],
  },
  entry: OperationalDashboardEntry,
  routes: [{ path: "/demo/operational-dashboard", title: "Operational Dashboard", description: "Fleet monitoring and alert operations", requiresAuthentication: true, requiredPermissions: ["operations.dashboard.read"] }],
  navigation: [{ id: "operations-dashboard", label: "Operational Dashboard", href: "/demo/operational-dashboard", icon: "OD", order: 10, visible: true }],
  permissions: [
    { id: "operations.dashboard.read", name: "View operations dashboard", description: "View fleet health, telemetry, charts, and alerts", category: "Operations" },
    { id: "operations.device.control", name: "Control devices", description: "Restart managed fleet devices", category: "Operations" },
    { id: "operations.alert.manage", name: "Manage alerts", description: "Acknowledge operational alerts", category: "Operations" },
  ],
  settings: [
    { key: "refreshInterval", label: "Refresh interval", description: "Telemetry refresh interval in seconds", type: "number", defaultValue: 30, required: true },
    { key: "defaultAlertSeverity", label: "Default alert severity", type: "select", defaultValue: "all", options: [{ label: "All", value: "all" }, { label: "Critical", value: "critical" }, { label: "Warning", value: "warning" }, { label: "Info", value: "info" }] },
    { key: "showAcknowledgedAlerts", label: "Show acknowledged alerts", type: "boolean", defaultValue: true },
  ],
  commands: [{ id: "operations.refresh", title: "Refresh operational data", description: "Request a fresh telemetry snapshot", requiredPermissions: ["operations.dashboard.read"], async execute(context) { await context.events.emit("operations.refresh.requested", { requestedAt: new Date().toISOString() }); context.notifications.notify({ level: "info", title: "Operational refresh requested" }); } }],
  register(context) { context.logger.info("Operational Dashboard registered"); },
  async initialize(context) { await context.events.emit("operations.dashboard.initialized", { pluginId: context.pluginId }); },
  async activate(context) { context.logger.info("Operational Dashboard activated"); },
  async deactivate(context) { context.logger.info("Operational Dashboard deactivated"); },
  async dispose(context) { context.logger.info("Operational Dashboard disposed"); },
};

export type { OperationsService } from "./services/operations-service";
export type { Device, OperationalAlert, OperationalSnapshot } from "./types";
