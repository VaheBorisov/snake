import { BOARD_SIZE } from './constants';

export const getRandomPosition = (snake: { x: number, y: number }[]) => {
  let pos: { x: number, y: number };
  do {
    pos = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    };
  } while (snake.some(seg => seg.x === pos.x && seg.y === pos.y));
  return pos;
};