import { Rect, TileType } from './types';

export const TILE_SIZE = 40;
export const MAP_COLS = 50; // Total world width in tiles
export const MAP_ROWS = 40; // Total world height in tiles
export const PLAYER_RADIUS = 12;
export const MOVEMENT_SPEED = 5; // Pixels per frame (approx 60fps)

// Colors mimicking Deltarune Dark World palette
export const COLOR_BG = '#0f0f1b';
export const COLOR_TILE_1 = '#1a1a2e';
export const COLOR_TILE_2 = '#16213e';
export const COLOR_WALL = '#000000';
export const COLOR_WALL_BORDER = '#e94560';
export const COLOR_PLAYER = '#00ffff'; // The "Blue Ball"
export const COLOR_PLAYER_SHADOW = 'rgba(0, 255, 255, 0.3)';

// Generate a static map with some walls
export const INITIAL_MAP: TileType[][] = [];

for (let y = 0; y < MAP_ROWS; y++) {
  const row: TileType[] = [];
  for (let x = 0; x < MAP_COLS; x++) {
    // Borders
    if (x === 0 || x === MAP_COLS - 1 || y === 0 || y === MAP_ROWS - 1) {
      row.push(TileType.WALL);
    } 
    // Random blocks
    else if (Math.random() < 0.08) {
      row.push(TileType.WALL);
    }
    // A specific structure in the middle
    else if (x > 20 && x < 30 && y > 15 && y < 25 && (x === 20 || x === 29 || y === 15 || y === 24)) {
       row.push(TileType.WALL);
    }
    else {
      row.push(TileType.FLOOR);
    }
  }
  INITIAL_MAP.push(row);
}
