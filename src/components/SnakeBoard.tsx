import { useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

import GameOver from '@/components/GameOver';

import { BOARD_SIZE, INITIAL_DIRECTION, INITIAL_SNAKE } from '@/utils/constants';
import { checkCollision, checkFoodCollision, getRandomPosition, moveSnake } from '@/utils/helpers';

import type { GameState } from '@/types';


export default function SnakeBoard() {
  const [gameState, setGameState] = useState<GameState>({
    snake: INITIAL_SNAKE,
    food: getRandomPosition(INITIAL_SNAKE),
    direction: INITIAL_DIRECTION,
    score: 0,
    gameOver: false,
    started: false,
  });

  const [highScore, setHighScore] = useState(() => {
    const stored = localStorage.getItem('snake-highscore');
    return stored ? parseInt(stored, 10) : 0;
  });
  const moveRef = useRef(gameState.direction);
  const snakeRef = useRef(gameState.snake);
  const directionQueue = useRef<{ x: number; y: number }[]>([]);

  useEffect(() => {
    snakeRef.current = gameState.snake;
  }, [gameState.snake]);

  // Update high score
  useEffect(() => {
    if (gameState.score > highScore) {
      setHighScore(gameState.score);
      localStorage.setItem('snake-highscore', String(gameState.score));
    }
  }, [gameState.score, highScore]);

  // Reset game
  const handleReset = useCallback(() => {
    setGameState({
      snake: INITIAL_SNAKE,
      food: getRandomPosition(INITIAL_SNAKE),
      direction: INITIAL_DIRECTION,
      score: 0,
      gameOver: false,
      started: false,
    });
  }, []);

  // Start game
  const handleStart = () => {
    setGameState(prevState => ({ ...prevState, started: true }));
    directionQueue.current = [];
  };

  // Handle keyboard input with direction queue
  useEffect(() => {
    if (!gameState.started || gameState.gameOver) return;
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
  }, [gameState.started, gameState.gameOver]);

  // Move the snake
  useEffect(() => {
    if (!gameState.started || gameState.gameOver) return;
    moveRef.current = gameState.direction;
    const interval = setInterval(() => {
      let nextDir = gameState.direction;
      if (directionQueue.current.length > 0) {
        nextDir = directionQueue.current.shift()!;
        setGameState(prev => ({ ...prev, direction: nextDir }));
      }

      setGameState(prev => {
        const newSnake = moveSnake(prev.snake, nextDir);
        if (checkCollision(newSnake)) {
          return {
            ...prev,
            direction: nextDir,
            gameOver: true,
          };
        }
        if (checkFoodCollision(newSnake, prev.food)) {
          const newFood = getRandomPosition(newSnake);
          const newScore = prev.score + 1;

          return {
            ...prev,
            snake: newSnake,
            food: newFood,
            score: newScore,
            direction: nextDir,
          };
        } else {
          newSnake.pop();
          return {
            ...prev,
            direction: nextDir,
            snake: newSnake,
          };
        }
      });
    }, 120);
    return () => clearInterval(interval);
  }, [gameState.direction, gameState.food, gameState.gameOver, gameState.started]);

  // Render board
  const cells = Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, idx) => {
    const x = idx % BOARD_SIZE;
    const y = Math.floor(idx / BOARD_SIZE);
    const isSnake = gameState.snake.some(seg => seg.x === x && seg.y === y);
    const isHead = gameState.snake[0].x === x && gameState.snake[0].y === y;
    const isFood = gameState.food.x === x && gameState.food.y === y;
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
        <div className="text-lg font-bold text-gray-100 tracking-wide">Score: {gameState.score}</div>
        <div className="text-md text-gray-400">High Score: {highScore}</div>
      </div>
      <div
        className={clsx(
          'snake-board mx-auto',
          { 'opacity-50': gameState.gameOver || !gameState.started },
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
      {!gameState.started && !gameState.gameOver && (
        <div className="flex justify-center mt-6">
          <button onClick={handleStart} className="restart-btn">Start Game</button>
        </div>
      )}
      {gameState.gameOver && (
        <GameOver handleReset={handleReset} />
      )}
    </>
  );
}