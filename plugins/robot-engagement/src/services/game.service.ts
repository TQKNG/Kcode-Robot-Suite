import { mockGames } from "../data/mock-data";
import type { Game, GameConfiguration } from "../types";

export interface GameService {
  list(): Promise<readonly Game[]>;
  updateConfiguration(gameId: string, configuration: GameConfiguration): Promise<Game>;
}

export class MockGameService implements GameService {
  private games = mockGames.map(game => ({...game, configuration:{...game.configuration}}));
  async list(): Promise<readonly Game[]> { await delay(220); return this.games; }
  async updateConfiguration(gameId: string, configuration: GameConfiguration): Promise<Game> {
    await delay(260);
    const game = this.games.find(item => item.id === gameId);
    if (!game) throw new Error("Game configuration could not be saved.");
    game.configuration = {...configuration};
    return {...game, configuration:{...game.configuration}};
  }
}

const delay = (milliseconds: number) => new Promise<void>(resolve => setTimeout(resolve, milliseconds));
