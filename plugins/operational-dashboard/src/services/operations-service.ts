import { mockAlerts, mockDevices, mockHistory } from "../data/mock-operations";
import type { Device, DeviceAction, OperationalAlert, OperationalSnapshot } from "../types";

export interface OperationsService {
  getSnapshot(): Promise<OperationalSnapshot>;
  performDeviceAction(deviceId: string, action: DeviceAction): Promise<Device>;
  acknowledgeAlert(alertId: string): Promise<OperationalAlert>;
}

const delay = (milliseconds: number) => new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

export class MockOperationsService implements OperationsService {
  private devices: Device[] = mockDevices.map((device) => ({ ...device }));
  private alerts: OperationalAlert[] = mockAlerts.map((alert) => ({ ...alert }));
  private failNextRequest = false;

  async getSnapshot(): Promise<OperationalSnapshot> {
    await delay(280);
    if (this.failNextRequest) {
      this.failNextRequest = false;
      throw new Error("The telemetry service did not respond.");
    }
    return {
      devices: this.devices.map((device) => ({ ...device })),
      alerts: this.alerts.map((alert) => ({ ...alert })),
      history: mockHistory,
      capturedAt: new Date().toISOString(),
    };
  }

  async performDeviceAction(deviceId: string, action: DeviceAction): Promise<Device> {
    await delay(350);
    const index = this.devices.findIndex((device) => device.id === deviceId);
    if (index < 0) throw new Error(`Device ${deviceId} was not found.`);
    const current = this.devices[index];
    if (!current) throw new Error(`Device ${deviceId} was not found.`);
    const updated = action === "restart"
      ? { ...current, status: "online" as const, health: Math.max(current.health, 76), lastSeen: "Just now" }
      : current;
    this.devices[index] = updated;
    return { ...updated };
  }

  async acknowledgeAlert(alertId: string): Promise<OperationalAlert> {
    await delay(180);
    const index = this.alerts.findIndex((alert) => alert.id === alertId);
    if (index < 0) throw new Error(`Alert ${alertId} was not found.`);
    const current = this.alerts[index];
    if (!current) throw new Error(`Alert ${alertId} was not found.`);
    const updated = { ...current, acknowledged: true };
    this.alerts[index] = updated;
    return { ...updated };
  }

  simulateNextFailure(): void {
    this.failNextRequest = true;
  }
}

export const operationsService = new MockOperationsService();
