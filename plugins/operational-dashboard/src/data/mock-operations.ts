import type { Device, OperationalAlert, TimeSeriesPoint } from "../types";

export const mockDevices: readonly Device[] = [
  { id: "RB-041", type: "Service Robot", location: "North Lobby", status: "online", lastSeen: "Just now", health: 98, utilization: 82 },
  { id: "GW-018", type: "Gateway", location: "Floor 2", status: "online", lastSeen: "2 min ago", health: 96, utilization: 71 },
  { id: "SN-102", type: "Sensor", location: "Room 204", status: "offline", lastSeen: "18 min ago", health: 0, utilization: 0 },
  { id: "CM-007", type: "Camera", location: "Service Area", status: "online", lastSeen: "Just now", health: 88, utilization: 64 },
  { id: "CS-003", type: "Charging Station", location: "West Hall", status: "maintenance", lastSeen: "6 min ago", health: 72, utilization: 34 },
  { id: "ED-220", type: "Edge Device", location: "Control Room", status: "online", lastSeen: "1 min ago", health: 93, utilization: 77 },
  { id: "RB-012", type: "Service Robot", location: "South Lobby", status: "online", lastSeen: "Just now", health: 64, utilization: 91 },
  { id: "SN-117", type: "Sensor", location: "Elevator Bank", status: "online", lastSeen: "3 min ago", health: 90, utilization: 58 },
  { id: "GW-022", type: "Gateway", location: "Floor 4", status: "offline", lastSeen: "31 min ago", health: 0, utilization: 0 },
  { id: "CM-014", type: "Camera", location: "Loading Bay", status: "online", lastSeen: "1 min ago", health: 86, utilization: 69 },
  { id: "ED-228", type: "Edge Device", location: "Roof Plant", status: "online", lastSeen: "4 min ago", health: 79, utilization: 74 },
  { id: "CS-008", type: "Charging Station", location: "East Hall", status: "online", lastSeen: "2 min ago", health: 95, utilization: 47 },
];

export const mockAlerts: readonly OperationalAlert[] = [
  { id: "ALT-1048", deviceId: "SN-102", severity: "critical", message: "Telemetry sensor is offline", occurredAt: "11:42", acknowledged: false },
  { id: "ALT-1047", deviceId: "RB-012", severity: "warning", message: "Battery dropped below 20%", occurredAt: "11:36", acknowledged: false },
  { id: "ALT-1046", deviceId: "CS-003", severity: "warning", message: "Charging efficiency below threshold", occurredAt: "11:21", acknowledged: false },
  { id: "ALT-1045", deviceId: "GW-018", severity: "info", message: "Maintenance window begins at 02:00", occurredAt: "10:58", acknowledged: false },
  { id: "ALT-1044", deviceId: "GW-022", severity: "critical", message: "Gateway heartbeat missed", occurredAt: "10:47", acknowledged: true },
];

export const mockHistory: readonly TimeSeriesPoint[] = [
  { label: "Mon", activity: 71, alerts: 8, robotUtilization: 63, systemHealth: 91 },
  { label: "Tue", activity: 83, alerts: 5, robotUtilization: 76, systemHealth: 94 },
  { label: "Wed", activity: 75, alerts: 7, robotUtilization: 69, systemHealth: 92 },
  { label: "Thu", activity: 91, alerts: 3, robotUtilization: 84, systemHealth: 96 },
  { label: "Fri", activity: 86, alerts: 4, robotUtilization: 79, systemHealth: 94 },
  { label: "Sat", activity: 68, alerts: 2, robotUtilization: 58, systemHealth: 97 },
  { label: "Sun", activity: 73, alerts: 4, robotUtilization: 66, systemHealth: 95 },
];
