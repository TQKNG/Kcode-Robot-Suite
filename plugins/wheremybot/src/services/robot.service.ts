import type { Robot } from "../domain/robot";
import type { RobotRoute } from "../domain/route";

export type RobotListener = (robot: Robot) => void;

export interface RobotService {
  getRobots(): Promise<readonly Robot[]>;
  getRobot(id: string): Promise<Robot>;
  subscribe(id: string, listener: RobotListener): () => void;
  stopRobot(id: string): Promise<void>;
  executeRoute(id: string, route: RobotRoute, speed?: number): Promise<void>;
  sendMessage(id: string, message: string): Promise<void>;
}
