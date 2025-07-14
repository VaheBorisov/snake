import { BOARD_SIZE } from './constants';

import type { Position } from '@/types';

export const getRandomPosition = (snake: Position[]) => {
  let pos: { x: number, y: number };
  do {
    pos = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    };
  } while (snake.some(seg => seg.x === pos.x && seg.y === pos.y));
  return pos;
};

export const moveSnake = (snake: Position[], nextDir: Position): Position[] => {
  const newSnake = [...snake];
  const newHead = {
    x: snake[0].x + nextDir.x,
    y: snake[0].y + nextDir.y,
  };

  return [newHead, ...newSnake];
};

export const checkCollision = (snake: Position[]): boolean => {
  const head = snake[0];

  // Check wall collision
  if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
    return true;
  }

  // Check self collision
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      return true;
    }
  }

  return false;
};

export const checkFoodCollision = (snake: Position[], food: Position): boolean => {
  const head = snake[0];
  return head.x === food.x && head.y === food.y;
};