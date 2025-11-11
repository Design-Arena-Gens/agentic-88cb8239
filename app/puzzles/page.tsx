"use client";

import { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import Link from "next/link";

interface Puzzle {
  id: number;
  fen: string;
  solution: string[];
  playerColor: "white" | "black";
  difficulty: "beginner" | "intermediate" | "advanced";
  theme: string;
}

const PUZZLES: Puzzle[] = [
  {
    id: 1,
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1",
    solution: ["Qxf7"],
    playerColor: "white",
    difficulty: "beginner",
    theme: "Back Rank Mate",
  },
  {
    id: 2,
    fen: "r1bqk2r/ppp2ppp/2n5/2bpp3/2B1P3/2NP1Q2/PPP2PPP/R1B1K2R w KQkq - 0 1",
    solution: ["Qxf7"],
    playerColor: "white",
    difficulty: "beginner",
    theme: "Scholar's Mate Pattern",
  },
  {
    id: 3,
    fen: "r2qkb1r/ppp2ppp/2n5/3pP3/3Pn1b1/2N2N2/PPP2PPP/R1BQKB1R w KQkq - 0 1",
    solution: ["Nxe5"],
    playerColor: "white",
    difficulty: "intermediate",
    theme: "Removing Defender",
  },
  {
    id: 4,
    fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 1",
    solution: ["Bxf7", "Kxf7", "Ng5"],
    playerColor: "white",
    difficulty: "intermediate",
    theme: "Fork",
  },
  {
    id: 5,
    fen: "r2qkb1r/ppp2ppp/2n2n2/3pp1N1/2B1P3/8/PPPP1PPP/RNBQK2R w KQkq - 0 1",
    solution: ["Nxf7"],
    playerColor: "white",
    difficulty: "beginner",
    theme: "Knight Fork",
  },
  {
    id: 6,
    fen: "r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 1",
    solution: [],
    playerColor: "black",
    difficulty: "beginner",
    theme: "Checkmate Recognition",
  },
  {
    id: 7,
    fen: "r1b1k2r/ppppqppp/2n2n2/2b5/2B1P3/2N2N2/PPPP1PPP/R1BQ1RK1 w kq - 0 1",
    solution: ["Bxf7", "Kf8", "Bb3"],
    playerColor: "white",
    difficulty: "intermediate",
    theme: "Discovered Attack",
  },
  {
    id: 8,
    fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/1PB1P3/5N2/P1PP1PPP/RNBQK2R w KQkq - 0 1",
    solution: ["Bxf7"],
    playerColor: "white",
    difficulty: "beginner",
    theme: "Exposed King",
  },
  {
    id: 9,
    fen: "rnbqkb1r/pppp1ppp/5n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1",
    solution: ["Ng5"],
    playerColor: "white",
    difficulty: "intermediate",
    theme: "Attacking f7",
  },
  {
    id: 10,
    fen: "r1bqkb1r/pppp1ppp/2n5/4p3/2BnP3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1",
    solution: ["Nxe5"],
    playerColor: "white",
    difficulty: "intermediate",
    theme: "Tactical Vision",
  },
];

export default function Puzzles() {
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [game, setGame] = useState<Chess | null>(null);
  const [position, setPosition] = useState("");
  const [solutionIndex, setSolutionIndex] = useState(0);
  const [status, setStatus] = useState("");
  const [movesMade, setMovesMade] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced" | "all">("all");
  const [filteredPuzzles, setFilteredPuzzles] = useState(PUZZLES);
  const [hintsUsed, setHintsUsed] = useState(0);

  useEffect(() => {
    if (difficulty === "all") {
      setFilteredPuzzles(PUZZLES);
    } else {
      setFilteredPuzzles(PUZZLES.filter((p) => p.difficulty === difficulty));
    }
    setCurrentPuzzleIndex(0);
  }, [difficulty]);

  useEffect(() => {
    if (filteredPuzzles.length > 0) {
      loadPuzzle(filteredPuzzles[currentPuzzleIndex]);
    }
  }, [currentPuzzleIndex, filteredPuzzles]);

  const loadPuzzle = (puzzle: Puzzle) => {
    const newGame = new Chess(puzzle.fen);
    setGame(newGame);
    setPosition(puzzle.fen);
    setSolutionIndex(0);
    setStatus("");
    setMovesMade([]);
    setHintsUsed(0);
  };

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    if (!game) return false;
    if (filteredPuzzles[currentPuzzleIndex].solution.length === 0) {
      setStatus("This is a checkmate position - puzzle complete!");
      updatePuzzleStats(true);
      return false;
    }

    const newGame = new Chess(game.fen());
    try {
      const move = newGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });

      const puzzle = filteredPuzzles[currentPuzzleIndex];
      const expectedMove = puzzle.solution[solutionIndex];

      if (move.san === expectedMove || move.lan === expectedMove) {
        setMovesMade([...movesMade, move.san]);

        if (solutionIndex + 1 >= puzzle.solution.length) {
          setStatus("🎉 Puzzle solved! Great job!");
          updatePuzzleStats(true);
          setGame(newGame);
          setPosition(newGame.fen());
        } else {
          setGame(newGame);
          setPosition(newGame.fen());
          setSolutionIndex(solutionIndex + 1);

          setTimeout(() => {
            const nextMove = puzzle.solution[solutionIndex + 1];
            if (nextMove) {
              const autoGame = new Chess(newGame.fen());
              try {
                const autoMove = autoGame.move(nextMove);
                setMovesMade([...movesMade, move.san, autoMove.san]);
                setGame(autoGame);
                setPosition(autoGame.fen());
                setSolutionIndex(solutionIndex + 2);

                if (solutionIndex + 2 >= puzzle.solution.length) {
                  setStatus("🎉 Puzzle solved! Great job!");
                  updatePuzzleStats(true);
                }
              } catch (e) {
                console.error("Auto-move error:", e);
              }
            }
          }, 500);
        }

        return true;
      } else {
        setStatus("❌ Not the best move. Try again!");
        return false;
      }
    } catch (error) {
      setStatus("❌ Illegal move. Try again!");
      return false;
    }
  };

  const updatePuzzleStats = (solved: boolean) => {
    if (!solved) return;

    const stats = JSON.parse(
      localStorage.getItem("chessStats") ||
        '{"gamesPlayed":0,"puzzlesSolved":0,"rating":1200,"winRate":0,"wins":0,"losses":0,"draws":0}'
    );
    stats.puzzlesSolved += 1;
    stats.rating += 5;
    localStorage.setItem("chessStats", JSON.stringify(stats));
  };

  const nextPuzzle = () => {
    if (currentPuzzleIndex < filteredPuzzles.length - 1) {
      setCurrentPuzzleIndex(currentPuzzleIndex + 1);
    } else {
      setCurrentPuzzleIndex(0);
    }
  };

  const previousPuzzle = () => {
    if (currentPuzzleIndex > 0) {
      setCurrentPuzzleIndex(currentPuzzleIndex - 1);
    } else {
      setCurrentPuzzleIndex(filteredPuzzles.length - 1);
    }
  };

  const resetPuzzle = () => {
    if (filteredPuzzles.length > 0) {
      loadPuzzle(filteredPuzzles[currentPuzzleIndex]);
    }
  };

  const showHint = () => {
    if (filteredPuzzles[currentPuzzleIndex].solution.length > 0) {
      const nextMove = filteredPuzzles[currentPuzzleIndex].solution[solutionIndex];
      setStatus(`💡 Hint: Try moving with ${nextMove}`);
      setHintsUsed(hintsUsed + 1);
    }
  };

  if (filteredPuzzles.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900">
        <nav className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="text-2xl font-bold text-blue-400">
                ♚ ChessPlatform
              </Link>
              <div className="flex space-x-4">
                <Link href="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Home
                </Link>
                <Link href="/live" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Play Live
                </Link>
                <Link href="/daily" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Daily Games
                </Link>
                <Link href="/puzzles" className="text-white bg-purple-600 px-3 py-2 rounded-md text-sm font-medium">
                  Puzzles
                </Link>
                <Link href="/analysis" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Analysis
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-gray-400">No puzzles available for this difficulty.</p>
        </div>
      </div>
    );
  }

  const currentPuzzle = filteredPuzzles[currentPuzzleIndex];

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold text-blue-400">
              ♚ ChessPlatform
            </Link>
            <div className="flex space-x-4">
              <Link href="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Home
              </Link>
              <Link href="/live" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Play Live
              </Link>
              <Link href="/daily" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Daily Games
              </Link>
              <Link href="/puzzles" className="text-white bg-purple-600 px-3 py-2 rounded-md text-sm font-medium">
                Puzzles
              </Link>
              <Link href="/analysis" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Analysis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center text-white">Tactical Puzzles</h1>

        <div className="max-w-md mx-auto mb-8">
          <label className="block text-sm font-medium mb-2">Difficulty:</label>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => setDifficulty("all")}
              className={`py-2 rounded-lg font-medium transition-all ${
                difficulty === "all" ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setDifficulty("beginner")}
              className={`py-2 rounded-lg font-medium transition-all ${
                difficulty === "beginner" ? "bg-green-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Beginner
            </button>
            <button
              onClick={() => setDifficulty("intermediate")}
              className={`py-2 rounded-lg font-medium transition-all ${
                difficulty === "intermediate"
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Medium
            </button>
            <button
              onClick={() => setDifficulty("advanced")}
              className={`py-2 rounded-lg font-medium transition-all ${
                difficulty === "advanced" ? "bg-red-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Hard
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="max-w-2xl mx-auto">
              <Chessboard
                position={position}
                onPieceDrop={onDrop}
                boardOrientation={currentPuzzle.playerColor}
                customBoardStyle={{
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.3)",
                }}
              />

              {status && (
                <div
                  className={`mt-4 p-4 rounded-lg text-center font-bold text-lg ${
                    status.includes("solved") || status.includes("🎉")
                      ? "bg-green-600"
                      : status.includes("❌")
                      ? "bg-red-600"
                      : "bg-blue-600"
                  }`}
                >
                  {status}
                </div>
              )}

              <div className="mt-4 grid grid-cols-4 gap-2">
                <button
                  onClick={previousPuzzle}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors"
                >
                  ← Previous
                </button>
                <button
                  onClick={resetPuzzle}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={showHint}
                  className="bg-blue-700 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-colors"
                >
                  Hint
                </button>
                <button
                  onClick={nextPuzzle}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 sticky top-4">
              <h3 className="text-xl font-bold mb-4">Puzzle Info</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-400">Puzzle:</span>
                  <span className="font-semibold">
                    {currentPuzzleIndex + 1} / {filteredPuzzles.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Difficulty:</span>
                  <span
                    className={`font-semibold capitalize ${
                      currentPuzzle.difficulty === "beginner"
                        ? "text-green-400"
                        : currentPuzzle.difficulty === "intermediate"
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >
                    {currentPuzzle.difficulty}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Theme:</span>
                  <span className="font-semibold">{currentPuzzle.theme}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Play as:</span>
                  <span className="font-semibold capitalize">{currentPuzzle.playerColor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Hints used:</span>
                  <span className="font-semibold">{hintsUsed}</span>
                </div>
              </div>

              <div className="bg-gray-900 rounded p-4 mb-4">
                <h4 className="font-semibold mb-2">Objective:</h4>
                <p className="text-sm text-gray-300">
                  Find the best move for {currentPuzzle.playerColor}. {currentPuzzle.solution.length === 0
                    ? "This is a checkmate position!"
                    : `Solution requires ${currentPuzzle.solution.length} move${
                        currentPuzzle.solution.length > 1 ? "s" : ""
                      }.`}
                </p>
              </div>

              <h3 className="text-xl font-bold mb-4">Your Moves</h3>
              <div className="bg-gray-900 rounded p-4">
                {movesMade.length === 0 ? (
                  <p className="text-gray-500 text-sm">No moves yet</p>
                ) : (
                  <div className="space-y-1 text-sm">
                    {movesMade.map((move, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-gray-500">{Math.floor(index / 2) + 1}.</span>
                        <span className={index % 2 === 0 ? "text-white" : "text-gray-300"}>{move}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
