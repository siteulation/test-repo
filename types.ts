export interface Vector2 {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface GameState {
  playerPos: Vector2;
  cameraPos: Vector2;
  debug: boolean;
}

export enum TileType {
  FLOOR = 0,
  WALL = 1,
  DECORATION = 2,
}

export interface Tile {
  type: TileType;
  color?: string;
}
