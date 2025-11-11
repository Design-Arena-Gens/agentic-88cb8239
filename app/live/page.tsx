"use client";

import { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import Link from "next/link";

export default function LiveGame() {
  const [game, setGame] = useState(new Chess());
  const [position, setPosition] = useState(game.fen());
  const [gameStatus, setGameStatus] = useState<string>("");
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [playerColor, setPlayerColor] = useState<"white" | "black">("white");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [gameStarted, setGameStarted] = useState(false);

  const evaluatePosition = (chess: Chess): number => {
    const pieceValues: { [key: string]: number } = {
      p: 1,
      n: 3,
      b: 3,
      r: 5,
      q: 9,
      k: 0,
    };

    let score = 0;
    const board = chess.board();

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j];
        if (piece) {
          const value = pieceValues[piece.type];
          score += piece.color === "w" ? value : -value;
        }
      }
    }

    return score;
  };

  const makeAIMove = () => {
    const possibleMoves = game.moves({ verbose: true });
    if (possibleMoves.length === 0) return;

    let selectedMove;

    if (difficulty === "easy") {
      selectedMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    } else if (difficulty === "medium") {
      const scoredMoves = possibleMoves.map((move) => {
        const tempGame = new Chess(game.fen());
        tempGame.move(move);
        return { move, score: evaluatePosition(tempGame) };
      });

      scoredMoves.sort((a, b) => {
        return game.turn() === "w" ? b.score - a.score : a.score - b.score;
      });

      const topMoves = scoredMoves.slice(0, Math.max(3, Math.floor(scoredMoves.length * 0.3)));
      selectedMove = topMoves[Math.floor(Math.random() * topMoves.length)].move;
    } else {
      const scoredMoves = possibleMoves.map((move) => {
        const tempGame = new Chess(game.fen());
        tempGame.move(move);
        let score = evaluatePosition(tempGame);

        const responses = tempGame.moves({ verbose: true });
        if (responses.length > 0) {
          const bestResponseScore = Math.max(
            ...responses.map((responseMove) => {
              const tempGame2 = new Chess(tempGame.fen());
              tempGame2.move(responseMove);
              return evaluatePosition(tempGame2);
            })
          );
          score = tempGame.turn() === "w" ? score - bestResponseScore : score + bestResponseScore;
        }

        return { move, score };
      });

      scoredMoves.sort((a, b) => {
        return game.turn() === "w" ? b.score - a.score : a.score - b.score;
      });

      selectedMove = scoredMoves[0].move;
    }

    const newGame = new Chess(game.fen());
    const move = newGame.move(selectedMove);
    setGame(newGame);
    setPosition(newGame.fen());
    setMoveHistory((prev) => [...prev, move.san]);
    checkGameStatus(newGame);
  };

  const checkGameStatus = (chess: Chess) => {
    if (chess.isCheckmate()) {
      const winner = chess.turn() === "w" ? "Black" : "White";
      setGameStatus(`Checkmate! ${winner} wins!`);
      updateStats(winner.toLowerCase() === playerColor);
    } else if (chess.isDraw()) {
      setGameStatus("Game drawn!");
      updateStats(false, true);
    } else if (chess.isStalemate()) {
      setGameStatus("Stalemate!");
      updateStats(false, true);
    } else if (chess.isThreefoldRepetition()) {
      setGameStatus("Draw by threefold repetition!");
      updateStats(false, true);
    } else if (chess.isInsufficientMaterial()) {
      setGameStatus("Draw by insufficient material!");
      updateStats(false, true);
    } else if (chess.isCheck()) {
      setGameStatus("Check!");
    } else {
      setGameStatus("");
    }
  };

  const updateStats = (won: boolean, draw: boolean = false) => {
    const stats = JSON.parse(localStorage.getItem("chessStats") || '{"gamesPlayed":0,"puzzlesSolved":0,"rating":1200,"winRate":0,"wins":0,"losses":0,"draws":0}');
    stats.gamesPlayed += 1;

    if (draw) {
      stats.draws = (stats.draws || 0) + 1;
    } else if (won) {
      stats.wins = (stats.wins || 0) + 1;
      stats.rating += 10;
    } else {
      stats.losses = (stats.losses || 0) + 1;
      stats.rating = Math.max(800, stats.rating - 10);
    }

    stats.winRate = Math.round((stats.wins / stats.gamesPlayed) * 100);
    localStorage.setItem("chessStats", JSON.stringify(stats));
  };

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    if (game.isGameOver()) return false;
    if ((playerColor === "white" && game.turn() !== "w") || (playerColor === "black" && game.turn() !== "b")) {
      return false;
    }

    const newGame = new Chess(game.fen());
    try {
      const move = newGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });

      setGame(newGame);
      setPosition(newGame.fen());
      setMoveHistory((prev) => [...prev, move.san]);
      checkGameStatus(newGame);

      if (!newGame.isGameOver()) {
        setTimeout(() => makeAIMove(), 500);
      }

      return true;
    } catch (error) {
      return false;
    }
  };

  const startNewGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setPosition(newGame.fen());
    setMoveHistory([]);
    setGameStatus("");
    setGameStarted(true);

    if (playerColor === "black") {
      setTimeout(() => makeAIMove(), 500);
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    const newGame = new Chess();
    setGame(newGame);
    setPosition(newGame.fen());
    setMoveHistory([]);
    setGameStatus("");
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold text-blue-400">♚ ChessPlatform</Link>
            <div className="flex space-x-4">
              <Link href="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Home</Link>
              <Link href="/live" className="text-white bg-blue-600 px-3 py-2 rounded-md text-sm font-medium">Play Live</Link>
              <Link href="/daily" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Daily Games</Link>
              <Link href="/puzzles" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Puzzles</Link>
              <Link href="/analysis" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Analysis</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center text-white">Live Chess Game</h1>

        {!gameStarted ? (
          <div className="max-w-md mx-auto bg-gray-800 rounded-lg p-8 border border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-center">Game Setup</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Play as:</label>
              <div className="flex gap-4">
                <button
                  onClick={() => setPlayerColor("white")}
                  className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                    playerColor === "white"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  White
                </button>
                <button
                  onClick={() => setPlayerColor("black")}
                  className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                    playerColor === "black"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Black
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Difficulty:</label>
              <div className="flex gap-4">
                <button
                  onClick={() => setDifficulty("easy")}
                  className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                    difficulty === "easy"
                      ? "bg-green-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Easy
                </button>
                <button
                  onClick={() => setDifficulty("medium")}
                  className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                    difficulty === "medium"
                      ? "bg-yellow-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Medium
                </button>
                <button
                  onClick={() => setDifficulty("hard")}
                  className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                    difficulty === "hard"
                      ? "bg-red-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Hard
                </button>
              </div>
            </div>

            <button
              onClick={startNewGame}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
            >
              Start Game
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="max-w-2xl mx-auto">
                <Chessboard
                  position={position}
                  onPieceDrop={onDrop}
                  boardOrientation={playerColor}
                  customBoardStyle={{
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.3)",
                  }}
                />
                {gameStatus && (
                  <div className={`mt-4 p-4 rounded-lg text-center font-bold text-lg ${
                    gameStatus.includes("wins") || gameStatus.includes("Checkmate")
                      ? gameStatus.includes(playerColor === "white" ? "White" : "Black")
                        ? "bg-green-600"
                        : "bg-red-600"
                      : gameStatus.includes("Check")
                      ? "bg-yellow-600"
                      : "bg-gray-600"
                  }`}>
                    {gameStatus}
                  </div>
                )}
                <div className="mt-4 flex gap-4">
                  <button
                    onClick={resetGame}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors"
                  >
                    New Game
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 sticky top-4">
                <h3 className="text-xl font-bold mb-4">Game Info</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-400">You play:</span>
                    <span className="font-semibold capitalize">{playerColor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Difficulty:</span>
                    <span className="font-semibold capitalize">{difficulty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Turn:</span>
                    <span className="font-semibold">{game.turn() === "w" ? "White" : "Black"}</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-4">Move History</h3>
                <div className="bg-gray-900 rounded p-4 max-h-96 overflow-y-auto">
                  {moveHistory.length === 0 ? (
                    <p className="text-gray-500 text-sm">No moves yet</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {moveHistory.map((move, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-gray-500 w-8">{Math.floor(index / 2) + 1}.</span>
                          <span className={index % 2 === 0 ? "text-white" : "text-gray-300"}>
                            {move}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
