export type Position = { x: number, y: number }

export interface GameState {
  snake: Position[];
  food: Position;
  direction: Position;
  score: number;
  gameOver: boolean;
  started: boolean;
}