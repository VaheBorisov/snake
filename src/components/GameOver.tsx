type GameOverProps = {
  handleReset: VoidFunction;
}

export default function GameOver({ handleReset }: GameOverProps) {
  return (
    <div className="game-over-message">
      Game Over
      <br />
      <button onClick={handleReset} className="restart-btn">
        Reset
      </button>
    </div>
  );
}