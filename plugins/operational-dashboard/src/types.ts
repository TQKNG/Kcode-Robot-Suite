export type DeviceStatus = "online" | "offline" | "maintenance";
export type DeviceType =
  | "Service Robot"
  | "Gateway"
  | "Sensor"
  | "Camera"
  | "Charging Station"
  | "Edge Device";
export type AlertSeverity = "critical" | "warning" | "info";

export interface Device {
  readonly id: string;
  readonly type: DeviceType;
  readonly location: string;
  readonly status: DeviceStatus;
  readonly lastSeen: string;
  readonly health: number;
  readonly utilization: number;
}

export interface OperationalAlert {
  readonly id: string;
  readonly deviceId: string;
  readonly severity: AlertSeverity;
  readonly message: string;
  readonly occurredAt: string;
  readonly acknowledged: boolean;
}

export interface TimeSeriesPoint {
  readonly label: string;
  readonly activity: number;
  readonly alerts: number;
  readonly robotUtilization: number;
  readonly systemHealth: number;
}

export interface OperationalSnapshot {
  readonly devices: readonly Device[];
  readonly alerts: readonly OperationalAlert[];
  readonly history: readonly TimeSeriesPoint[];
  readonly capturedAt: string;
}

export interface DeviceFilters {
  readonly query: string;
  readonly status: DeviceStatus | "all";
  readonly type: DeviceType | "all";
}

export type DeviceAction = "inspect" | "restart";
