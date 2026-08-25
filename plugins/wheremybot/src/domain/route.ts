export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface RobotRoute {
  readonly id: string;
  readonly name: string;
  readonly points: readonly Point[];
  readonly preset: boolean;
}
