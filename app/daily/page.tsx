"use client";

import { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import Link from "next/link";
import { format } from "date-fns";

interface DailyGame {
  id: string;
  opponent: string;
  playerColor: "white" | "black";
  fen: string;
  moveHistory: string[];
  lastMoveTime: string;
  status: "active" | "completed";
  result?: string;
}

export default function DailyGames() {
  const [games, setGames] = useState<DailyGame[]>([]);
  const [selectedGame, setSelectedGame] = useState<DailyGame | null>(null);
  const [game, setGame] = useState(new Chess());
  const [position, setPosition] = useState(game.fen());

  useEffect(() => {
    const savedGames = localStorage.getItem("dailyGames");
    if (savedGames) {
      setGames(JSON.parse(savedGames));
    }
  }, []);

  useEffect(() => {
    if (selectedGame) {
      const newGame = new Chess(selectedGame.fen);
      setGame(newGame);
      setPosition(selectedGame.fen);
    }
  }, [selectedGame]);

  const createNewGame = () => {
    const newGame: DailyGame = {
      id: Date.now().toString(),
      opponent: `Player ${Math.floor(Math.random() * 1000)}`,
      playerColor: Math.random() > 0.5 ? "white" : "black",
      fen: new Chess().fen(),
      moveHistory: [],
      lastMoveTime: new Date().toISOString(),
      status: "active",
    };

    const updatedGames = [...games, newGame];
    setGames(updatedGames);
    localStorage.setItem("dailyGames", JSON.stringify(updatedGames));
    setSelectedGame(newGame);

    if (newGame.playerColor === "black") {
      setTimeout(() => makeOpponentMove(newGame), 1000);
    }
  };

  const makeOpponentMove = (currentGame: DailyGame) => {
    const chess = new Chess(currentGame.fen);
    const possibleMoves = chess.moves({ verbose: true });

    if (possibleMoves.length > 0) {
      const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      const move = chess.move(randomMove);

      const updatedGame = {
        ...currentGame,
        fen: chess.fen(),
        moveHistory: [...currentGame.moveHistory, move.san],
        lastMoveTime: new Date().toISOString(),
      };

      if (chess.isGameOver()) {
        updatedGame.status = "completed";
        if (chess.isCheckmate()) {
          updatedGame.result = chess.turn() === "w" ? "Black wins" : "White wins";
        } else {
          updatedGame.result = "Draw";
        }
      }

      const updatedGames = games.map((g) => (g.id === currentGame.id ? updatedGame : g));
      setGames(updatedGames);
      localStorage.setItem("dailyGames", JSON.stringify(updatedGames));
      setSelectedGame(updatedGame);
      setGame(chess);
      setPosition(chess.fen());
    }
  };

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    if (!selectedGame || selectedGame.status === "completed") return false;
    if (game.isGameOver()) return false;
    if (
      (selectedGame.playerColor === "white" && game.turn() !== "w") ||
      (selectedGame.playerColor === "black" && game.turn() !== "b")
    ) {
      return false;
    }

    const newGame = new Chess(game.fen());
    try {
      const move = newGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });

      const updatedGame = {
        ...selectedGame,
        fen: newGame.fen(),
        moveHistory: [...selectedGame.moveHistory, move.san],
        lastMoveTime: new Date().toISOString(),
      };

      if (newGame.isGameOver()) {
        updatedGame.status = "completed";
        if (newGame.isCheckmate()) {
          updatedGame.result = newGame.turn() === "w" ? "Black wins" : "White wins";
          updateStats(updatedGame.result.includes(selectedGame.playerColor === "white" ? "White" : "Black"));
        } else {
          updatedGame.result = "Draw";
          updateStats(false, true);
        }
      }

      const updatedGames = games.map((g) => (g.id === selectedGame.id ? updatedGame : g));
      setGames(updatedGames);
      localStorage.setItem("dailyGames", JSON.stringify(updatedGames));
      setSelectedGame(updatedGame);
      setGame(newGame);
      setPosition(newGame.fen());

      if (!newGame.isGameOver()) {
        setTimeout(() => makeOpponentMove(updatedGame), 2000);
      }

      return true;
    } catch (error) {
      return false;
    }
  };

  const updateStats = (won: boolean, draw: boolean = false) => {
    const stats = JSON.parse(
      localStorage.getItem("chessStats") ||
        '{"gamesPlayed":0,"puzzlesSolved":0,"rating":1200,"winRate":0,"wins":0,"losses":0,"draws":0}'
    );
    stats.gamesPlayed += 1;

    if (draw) {
      stats.draws = (stats.draws || 0) + 1;
    } else if (won) {
      stats.wins = (stats.wins || 0) + 1;
      stats.rating += 15;
    } else {
      stats.losses = (stats.losses || 0) + 1;
      stats.rating = Math.max(800, stats.rating - 15);
    }

    stats.winRate = Math.round((stats.wins / stats.gamesPlayed) * 100);
    localStorage.setItem("chessStats", JSON.stringify(stats));
  };

  const deleteGame = (gameId: string) => {
    const updatedGames = games.filter((g) => g.id !== gameId);
    setGames(updatedGames);
    localStorage.setItem("dailyGames", JSON.stringify(updatedGames));
    if (selectedGame?.id === gameId) {
      setSelectedGame(null);
    }
  };

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
              <Link href="/daily" className="text-white bg-green-600 px-3 py-2 rounded-md text-sm font-medium">
                Daily Games
              </Link>
              <Link href="/puzzles" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
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
        <h1 className="text-4xl font-bold mb-8 text-center text-white">Daily Chess Games</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Your Games</h2>
                <button
                  onClick={createNewGame}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  + New
                </button>
              </div>

              <div className="space-y-3">
                {games.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-8">
                    No active games. Start a new one!
                  </p>
                ) : (
                  games.map((g) => (
                    <div
                      key={g.id}
                      onClick={() => setSelectedGame(g)}
                      className={`p-4 rounded-lg cursor-pointer transition-all ${
                        selectedGame?.id === g.id
                          ? "bg-green-600 text-white"
                          : "bg-gray-700 hover:bg-gray-600"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">vs {g.opponent}</span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            g.status === "active" ? "bg-green-500" : "bg-gray-500"
                          }`}
                        >
                          {g.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-300">
                        <div>Playing as: {g.playerColor}</div>
                        <div>Last move: {format(new Date(g.lastMoveTime), "MMM d, h:mm a")}</div>
                        {g.result && <div className="font-semibold mt-1">{g.result}</div>}
                      </div>
                      {g.status === "completed" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteGame(g.id);
                          }}
                          className="mt-2 text-xs text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {selectedGame && (
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mt-4">
                <h3 className="text-xl font-bold mb-4">Move History</h3>
                <div className="bg-gray-900 rounded p-4 max-h-64 overflow-y-auto">
                  {selectedGame.moveHistory.length === 0 ? (
                    <p className="text-gray-500 text-sm">No moves yet</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {selectedGame.moveHistory.map((move, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-gray-500 w-8">{Math.floor(index / 2) + 1}.</span>
                          <span className={index % 2 === 0 ? "text-white" : "text-gray-300"}>{move}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            {selectedGame ? (
              <div>
                <div className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">vs {selectedGame.opponent}</h3>
                      <p className="text-gray-400">
                        You are playing as <span className="font-semibold">{selectedGame.playerColor}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-sm px-3 py-1 rounded ${
                          selectedGame.status === "active" ? "bg-green-600" : "bg-gray-600"
                        }`}
                      >
                        {selectedGame.status === "active" ? "Your turn" : "Game Over"}
                      </div>
                      {selectedGame.result && (
                        <div className="mt-2 font-bold text-lg">{selectedGame.result}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="max-w-2xl mx-auto">
                  <Chessboard
                    position={position}
                    onPieceDrop={onDrop}
                    boardOrientation={selectedGame.playerColor}
                    customBoardStyle={{
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.3)",
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-12 border border-gray-700 text-center">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-2xl font-bold mb-2">No Game Selected</h3>
                <p className="text-gray-400 mb-6">
                  Select a game from the list or create a new daily game to get started.
                </p>
                <button
                  onClick={createNewGame}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Start New Game
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
