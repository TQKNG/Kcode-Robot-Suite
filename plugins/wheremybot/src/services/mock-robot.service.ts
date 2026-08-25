import type { Robot, RobotDirection } from "../domain/robot";
import type { Point, RobotRoute } from "../domain/route";
import type { RobotListener, RobotService } from "./robot.service";

const initialRobot: Robot = {
  id: "WB-001",
  battery: 82,
  currentLocation: "Lobby",
  status: "Idle",
  direction: "North",
  position: { x: 112, y: 376 },
};

const directionBetween = (from: Point, to: Point): RobotDirection => {
  const angle = Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI;
  if (angle >= -22.5 && angle < 22.5) return "East";
  if (angle >= 22.5 && angle < 67.5) return "South East";
  if (angle >= 67.5 && angle < 112.5) return "South";
  if (angle >= 112.5 && angle < 157.5) return "South West";
  if (angle >= 157.5 || angle < -157.5) return "West";
  if (angle >= -157.5 && angle < -112.5) return "North West";
  if (angle >= -112.5 && angle < -67.5) return "North";
  return "North East";
};

const locationFor = (point: Point) => {
  if (point.y < 165 && point.x < 265) return "Room 101";
  if (point.y < 165 && point.x < 390) return "Room 102";
  if (point.y < 165) return "Room 103";
  if (point.y > 330 && point.x < 230) return "Lobby";
  if (point.y > 330 && point.x > 500) return "Charging Station";
  if (point.y > 290 && point.x > 385) return "Service Area";
  if (point.x > 500 && point.y < 310) return "Elevator";
  return "Main Hallway";
};

export class MockRobotService implements RobotService {
  private robot: Robot = initialRobot;
  private readonly listeners = new Set<RobotListener>();
  private animationFrame: number | undefined;
  private finishSegment: (() => void) | undefined;
  private runToken = 0;

  async getRobots() { return [this.robot]; }
  async getRobot(id: string) {
    if (id !== this.robot.id) throw new Error(`Robot ${id} was not found.`);
    return this.robot;
  }
  subscribe(id: string, listener: RobotListener) {
    if (id !== this.robot.id) throw new Error(`Robot ${id} was not found.`);
    this.listeners.add(listener);
    listener(this.robot);
    return () => this.listeners.delete(listener);
  }
  async stopRobot(id: string) {
    await this.getRobot(id);
    this.runToken += 1;
    if (this.animationFrame !== undefined) cancelAnimationFrame(this.animationFrame);
    this.animationFrame = undefined;
    this.finishSegment?.();
    this.finishSegment = undefined;
    this.update({ status: "Paused" });
  }
  async executeRoute(id: string, route: RobotRoute, speed = 115) {
    await this.getRobot(id);
    if (route.points.length < 2) throw new Error("A route requires at least two points.");
    await this.stopSilently();
    const token = ++this.runToken;
    this.update({ position: route.points[0], currentLocation: locationFor(route.points[0]), status: "Moving" });
    for (let index = 1; index < route.points.length; index += 1) {
      if (token !== this.runToken) return;
      await this.animateSegment(route.points[index - 1], route.points[index], Math.max(30, speed), token);
    }
    if (token === this.runToken) this.update({ status: "Idle", currentLocation: locationFor(route.points.at(-1)!) });
  }
  async sendMessage(id: string, message: string) {
    await this.getRobot(id);
    if (!message.trim()) throw new Error("Enter a message before sending.");
  }

  private async stopSilently() {
    this.runToken += 1;
    if (this.animationFrame !== undefined) cancelAnimationFrame(this.animationFrame);
    this.animationFrame = undefined;
    this.finishSegment?.();
    this.finishSegment = undefined;
  }
  private update(changes: Partial<Robot>) {
    this.robot = { ...this.robot, ...changes };
    this.listeners.forEach((listener) => listener(this.robot));
  }
  private animateSegment(from: Point, to: Point, speed: number, token: number) {
    const distance = Math.hypot(to.x - from.x, to.y - from.y);
    if (distance === 0) return Promise.resolve();
    const duration = distance / speed * 1000;
    const direction = directionBetween(from, to);
    return new Promise<void>((resolve) => {
      const finish = () => {
        if (this.finishSegment === finish) this.finishSegment = undefined;
        resolve();
      };
      this.finishSegment = finish;
      const started = performance.now();
      const frame = (now: number) => {
        if (token !== this.runToken) { finish(); return; }
        const progress = Math.min(1, (now - started) / duration);
        const position = { x: from.x + (to.x - from.x) * progress, y: from.y + (to.y - from.y) * progress };
        this.update({ position, direction, currentLocation: locationFor(position), battery: Math.max(1, this.robot.battery - (progress === 1 ? 1 : 0)) });
        if (progress < 1) this.animationFrame = requestAnimationFrame(frame);
        else { this.animationFrame = undefined; finish(); }
      };
      this.animationFrame = requestAnimationFrame(frame);
    });
  }
}
