import type { RobotRoute } from "../domain/route";
import type { RouteService } from "./route.service";

const presets: readonly RobotRoute[] = [
  { id: "lobby-room-101", name: "Lobby → Room 101", preset: true, points: [{ x: 112, y: 376 }, { x: 112, y: 248 }, { x: 205, y: 248 }, { x: 205, y: 104 }] },
  { id: "lobby-room-102", name: "Lobby → Room 102", preset: true, points: [{ x: 112, y: 376 }, { x: 112, y: 248 }, { x: 330, y: 248 }, { x: 330, y: 104 }] },
  { id: "lobby-room-103", name: "Lobby → Room 103", preset: true, points: [{ x: 112, y: 376 }, { x: 112, y: 248 }, { x: 455, y: 248 }, { x: 455, y: 104 }] },
  { id: "lobby-service", name: "Lobby → Service Area", preset: true, points: [{ x: 112, y: 376 }, { x: 330, y: 376 }, { x: 330, y: 318 }, { x: 465, y: 318 }] },
  { id: "room-101-charge", name: "Room 101 → Charging Station", preset: true, points: [{ x: 205, y: 104 }, { x: 205, y: 248 }, { x: 548, y: 248 }, { x: 548, y: 388 }] },
];

export class MockRouteService implements RouteService {
  private saved: RobotRoute[] = [];

  async getPresetRoutes() { return presets; }
  async getSavedRoutes() { return [...this.saved]; }
  async saveRoute(route: RobotRoute) {
    if (route.points.length < 2) throw new Error("A route requires at least two points.");
    const saved = { ...route, points: [...route.points], preset: false };
    this.saved = [...this.saved.filter((item) => item.id !== saved.id), saved];
    return saved;
  }
}
