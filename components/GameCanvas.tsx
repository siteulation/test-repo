import React, { useRef, useEffect, useState } from 'react';
import { Vector2, Rect, TileType } from '../types';
import { 
  TILE_SIZE, 
  MAP_COLS, 
  MAP_ROWS, 
  PLAYER_RADIUS, 
  MOVEMENT_SPEED,
  COLOR_BG,
  COLOR_TILE_1,
  COLOR_TILE_2,
  COLOR_WALL,
  COLOR_WALL_BORDER,
  COLOR_PLAYER,
  COLOR_PLAYER_SHADOW,
  INITIAL_MAP
} from '../constants';

const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  // Game State Refs (Mutable for performance/loop)
  const playerPos = useRef<Vector2>({ x: TILE_SIZE * 5, y: TILE_SIZE * 5 });
  const cameraPos = useRef<Vector2>({ x: 0, y: 0 });
  const keysPressed = useRef<Set<string>>(new Set());
  
  // Input Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.code);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Collision Detection Logic
  const checkCollision = (newX: number, newY: number): boolean => {
    // We treat the player as a square bounding box for wall collision to be precise 
    // or we can check the 4 corners relative to the circle. 
    // A simple AABB check against tile map is robust enough for this style.
    
    const margin = 2; // small buffer from edge
    const left = newX - PLAYER_RADIUS + margin;
    const right = newX + PLAYER_RADIUS - margin;
    const top = newY - PLAYER_RADIUS + margin;
    const bottom = newY + PLAYER_RADIUS - margin;

    // Get tiles potentially overlapping
    const minTileX = Math.floor(left / TILE_SIZE);
    const maxTileX = Math.floor(right / TILE_SIZE);
    const minTileY = Math.floor(top / TILE_SIZE);
    const maxTileY = Math.floor(bottom / TILE_SIZE);

    for (let y = minTileY; y <= maxTileY; y++) {
      for (let x = minTileX; x <= maxTileX; x++) {
        // Check bounds
        if (y < 0 || y >= MAP_ROWS || x < 0 || x >= MAP_COLS) return true;
        
        // Check solid
        if (INITIAL_MAP[y][x] === TileType.WALL) {
          return true;
        }
      }
    }
    return false;
  };

  const update = () => {
    const keys = keysPressed.current;
    let dx = 0;
    let dy = 0;

    // Input processing
    if (keys.has('ArrowUp') || keys.has('KeyW')) dy -= 1;
    if (keys.has('ArrowDown') || keys.has('KeyS')) dy += 1;
    if (keys.has('ArrowLeft') || keys.has('KeyA')) dx -= 1;
    if (keys.has('ArrowRight') || keys.has('KeyD')) dx += 1;

    // Normalization for diagonal movement (Deltarune usually feels consistent speed)
    if (dx !== 0 || dy !== 0) {
      const length = Math.sqrt(dx * dx + dy * dy);
      dx = (dx / length) * MOVEMENT_SPEED;
      dy = (dy / length) * MOVEMENT_SPEED;
    }

    // Apply movement with separate axis collision for sliding against walls
    // Move X
    if (dx !== 0) {
      if (!checkCollision(playerPos.current.x + dx, playerPos.current.y)) {
        playerPos.current.x += dx;
      }
    }
    // Move Y
    if (dy !== 0) {
      if (!checkCollision(playerPos.current.x, playerPos.current.y + dy)) {
        playerPos.current.y += dy;
      }
    }

    // Update Camera
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const screenW = canvas.width;
      const screenH = canvas.height;
      const mapW = MAP_COLS * TILE_SIZE;
      const mapH = MAP_ROWS * TILE_SIZE;

      // Target camera to center player
      let targetCamX = playerPos.current.x - screenW / 2;
      let targetCamY = playerPos.current.y - screenH / 2;

      // Clamp camera to map bounds
      // Don't show black void outside map if possible
      targetCamX = Math.max(0, Math.min(targetCamX, mapW - screenW));
      targetCamY = Math.max(0, Math.min(targetCamY, mapH - screenH));

      // Direct assignment for "snappy" Deltarune feel, or lerp for "smooth" feel. 
      // Deltarune is usually pretty snappy (direct locked) but slight smoothing can look nice.
      // Let's go with direct lock as per request for "Deltarune's movement system" which is precise.
      cameraPos.current.x = targetCamX;
      cameraPos.current.y = targetCamY;
    }
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    const canvas = ctx.canvas;
    const cam = cameraPos.current;
    
    // Clear Screen
    ctx.fillStyle = COLOR_BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // Apply Camera Translation
    ctx.translate(-Math.floor(cam.x), -Math.floor(cam.y));

    // Optimization: Only draw visible tiles
    const startCol = Math.floor(cam.x / TILE_SIZE);
    const endCol = startCol + (Math.ceil(canvas.width / TILE_SIZE)) + 1;
    const startRow = Math.floor(cam.y / TILE_SIZE);
    const endRow = startRow + (Math.ceil(canvas.height / TILE_SIZE)) + 1;

    for (let y = startRow; y <= endRow; y++) {
      for (let x = startCol; x <= endCol; x++) {
        if (y >= 0 && y < MAP_ROWS && x >= 0 && x < MAP_COLS) {
          const tileX = x * TILE_SIZE;
          const tileY = y * TILE_SIZE;
          const tileType = INITIAL_MAP[y][x];

          if (tileType === TileType.WALL) {
            // Draw Wall (Pseudo-3D look? Or just solid block)
            // Let's do a solid block with a border
            ctx.fillStyle = COLOR_WALL;
            ctx.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE);
            
            // Inner border for style
            ctx.strokeStyle = COLOR_WALL_BORDER;
            ctx.lineWidth = 2;
            ctx.strokeRect(tileX + 2, tileY + 2, TILE_SIZE - 4, TILE_SIZE - 4);
          } else {
            // Floor pattern - Checkerboard
            const isAlt = (x + y) % 2 === 0;
            ctx.fillStyle = isAlt ? COLOR_TILE_1 : COLOR_TILE_2;
            ctx.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE);
          }
        }
      }
    }

    // Draw Player
    const px = playerPos.current.x;
    const py = playerPos.current.y;

    // Shadow (simple ellipse)
    ctx.fillStyle = COLOR_PLAYER_SHADOW;
    ctx.beginPath();
    ctx.ellipse(px, py + PLAYER_RADIUS * 0.8, PLAYER_RADIUS, PLAYER_RADIUS * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = COLOR_PLAYER;
    ctx.beginPath();
    ctx.arc(px, py, PLAYER_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // Shine (to make it look like a sphere)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(px - PLAYER_RADIUS * 0.3, py - PLAYER_RADIUS * 0.3, PLAYER_RADIUS * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();

    // Optional: Draw UI Overlay (Coordinate debugger)
    /* 
    ctx.fillStyle = "white";
    ctx.font = "12px monospace";
    ctx.fillText(`Pos: ${Math.round(px)}, ${Math.round(py)}`, 10, 20);
    */
  };

  const loop = () => {
    update();
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        draw(ctx);
      }
    }
    requestRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Init
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="block w-full h-full"
    />
  );
};

export default GameCanvas;
