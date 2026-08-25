import type { Point } from "./route";

export type RobotState = "Idle" | "Moving" | "Delivering" | "Charging" | "Paused" | "Offline";
export type RobotDirection = "North" | "North East" | "East" | "South East" | "South" | "South West" | "West" | "North West";

export interface Robot {
  readonly id: string;
  readonly battery: number;
  readonly currentLocation: string;
  readonly status: RobotState;
  readonly direction: RobotDirection;
  readonly position: Point;
}
