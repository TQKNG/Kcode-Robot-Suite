export type GameStatus = "active" | "draft" | "archived";
export type RobotStatus = "online" | "busy" | "offline";

export interface GameConfiguration {
  difficulty: "easy" | "medium" | "hard";
  durationMinutes: number;
  soundEnabled: boolean;
  instructions: string;
}

export interface Game {
  id: string;
  name: string;
  description: string;
  version: string;
  status: GameStatus;
  supportedRobots: readonly string[];
  lastUpdated: string;
  usage: number;
  configuration: GameConfiguration;
}

export interface EngagementRobot {
  id: string;
  name: string;
  model: string;
  location: string;
  status: RobotStatus;
  volume: number;
  screenBrightness: number;
  language: string;
}

export interface DeploymentRequest {
  gameId: string;
  robotId: string;
  scheduledFor: string;
  configuration: GameConfiguration;
}

export interface DeploymentProgress {
  deploymentId: string;
  progress: number;
  stage: "queued" | "validating" | "uploading" | "installing" | "complete";
}

export interface DailyEngagement {
  day: string;
  plays: number;
  users: number;
  duration: number;
  completion: number;
}

export interface GamePopularity {
  name: string;
  plays: number;
}

export interface RobotEngagement {
  robot: string;
  sessions: number;
}

export interface EngagementAnalytics {
  totals: {
    gamePlays: number;
    dailyActiveUsers: number;
    sessionDuration: number;
    completionRate: number;
  };
  daily: readonly DailyEngagement[];
  popularGames: readonly GamePopularity[];
  byRobot: readonly RobotEngagement[];
}
