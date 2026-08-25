import type { RobotRoute } from "../domain/route";

export interface RouteService {
  getPresetRoutes(): Promise<readonly RobotRoute[]>;
  getSavedRoutes(): Promise<readonly RobotRoute[]>;
  saveRoute(route: RobotRoute): Promise<RobotRoute>;
}
