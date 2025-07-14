import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

import GameOver from '@/components/GameOver';

import { BOARD_SIZE, INITIAL_DIRECTION, INITIAL_SNAKE } from '@/utils/constants';
import { getRandomPosition } from '@/utils/helpers';


export default function SnakeBoard() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState(() => getRandomPosition(INITIAL_SNAKE));
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    const stored = localStorage.getItem('snake-highscore');
    return stored ? parseInt(stored, 10) : 0;
  });
  const moveRef = useRef(direction);
  const snakeRef = useRef(snake);
  const directionQueue = useRef<{ x: number; y: number }[]>([]);

  useEffect(() => {
    snakeRef.current = snake;
  }, [snake]);

  // Update high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('snake-highscore', String(score));
    }
  }, [score, highScore]);

  // Start or restart game
  const handleStart = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(getRandomPosition(INITIAL_SNAKE));
    setGameOver(false);
    setScore(0);
    setStarted(true);
    directionQueue.current = [];
  };

  // Handle keyboard input with direction queue
  useEffect(() => {
    if (!started || gameOver) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      let newDir: { x: number; y: number } | null = null;
      switch (e.key) {
        case 'ArrowUp':
          newDir = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
          newDir = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
          newDir = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
          newDir = { x: 1, y: 0 };
          break;
      }
      if (newDir) {
        const lastDir = directionQueue.current.length > 0 ? directionQueue.current[directionQueue.current.length - 1] : moveRef.current;
        // Prevent direct reversal
        if (lastDir.x + newDir.x !== 0 || lastDir.y + newDir.y !== 0) {
          directionQueue.current.push(newDir);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [started, gameOver]);

  // Move the snake
  useEffect(() => {
    if (!started || gameOver) return;
    moveRef.current = direction;
    const interval = setInterval(() => {
      // Use next direction in queue if available
      let nextDir = direction;
      if (directionQueue.current.length > 0) {
        nextDir = directionQueue.current.shift()!;
        setDirection(nextDir);
      }
      setSnake(prev => {
        const newHead = {
          x: prev[0].x + nextDir.x,
          y: prev[0].y + nextDir.y,
        };
        // Wall collision
        if (
          newHead.x < 0 ||
          newHead.x >= BOARD_SIZE ||
          newHead.y < 0 ||
          newHead.y >= BOARD_SIZE
        ) {
          setGameOver(true);
          setStarted(false);
          return prev;
        }
        // Self collision
        if (prev.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
          setGameOver(true);
          setStarted(false);
          return prev;
        }
        let newSnake;
        // Check if food is eaten
        if (newHead.x === food.x && newHead.y === food.y) {
          newSnake = [newHead, ...prev];
          setFood(getRandomPosition(newSnake));
          setScore(s => s + 1);
        } else {
          newSnake = [newHead, ...prev.slice(0, -1)];
        }
        return newSnake;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [direction, food, gameOver, started]);

  // Render board
  const cells = Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, idx) => {
    const x = idx % BOARD_SIZE;
    const y = Math.floor(idx / BOARD_SIZE);
    const isSnake = snake.some(seg => seg.x === x && seg.y === y);
    const isHead = snake[0].x === x && snake[0].y === y;
    const isFood = food.x === x && food.y === y;
    return (
      <div
        key={idx}
        className={clsx(
          'snake-cell w-5 h-5',
          {
            'food': isFood,
            'snake-head': isHead,
            'snake-segment': !isHead && isSnake,
          },
        )}
      />
    );
  });

  return (
    <>
      <div className="flex flex-col items-center mb-3">
        <div className="text-lg font-bold text-gray-100 tracking-wide">Score: {score}</div>
        <div className="text-md text-gray-400">High Score: {highScore}</div>
      </div>
      <div
        className={clsx(
          'snake-board mx-auto',
          { 'opacity-50': gameOver || !started },
        )}
        style={{
          display: 'grid',
          gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
          gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
          width: 402,
          height: 402,
        }}
      >
        {cells}
      </div>
      {!started && !gameOver && (
        <div className="flex justify-center mt-6">
          <button onClick={handleStart} className="restart-btn">Start Game</button>
        </div>
      )}
      {gameOver && (
        <GameOver handleStart={handleStart} />
      )}
    </>
  );
}