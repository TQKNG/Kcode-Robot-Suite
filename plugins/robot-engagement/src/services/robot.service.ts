import { mockRobots } from "../data/mock-data";
import type { EngagementRobot } from "../types";

export interface RobotService {
  list(): Promise<readonly EngagementRobot[]>;
  update(robot: EngagementRobot): Promise<EngagementRobot>;
}

export class MockRobotService implements RobotService {
  private robots = mockRobots.map(robot => ({...robot}));
  async list(): Promise<readonly EngagementRobot[]> { await delay(180); return this.robots; }
  async update(input: EngagementRobot): Promise<EngagementRobot> {
    await delay(240);
    const index = this.robots.findIndex(robot => robot.id === input.id);
    if (index < 0) throw new Error("Robot configuration could not be saved.");
    this.robots[index] = {...input}; return {...input};
  }
}

const delay = (milliseconds: number) => new Promise<void>(resolve => setTimeout(resolve, milliseconds));
