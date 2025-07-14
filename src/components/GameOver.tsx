type GameOverProps = {
  handleStart: VoidFunction;
}

export default function GameOver({ handleStart }: GameOverProps) {
  return (
    <div className="game-over-message">
      Game Over
      <br />
      <button onClick={handleStart} className="restart-btn">
        Restart
      </button>
    </div>
  );
}