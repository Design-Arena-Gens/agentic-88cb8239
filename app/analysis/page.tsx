"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";

interface Stats {
  gamesPlayed: number;
  puzzlesSolved: number;
  rating: number;
  winRate: number;
  wins: number;
  losses: number;
  draws: number;
}

interface GameRecord {
  date: string;
  result: "win" | "loss" | "draw";
  opponent: string;
  moves: number;
  rating: number;
}

export default function Analysis() {
  const [stats, setStats] = useState<Stats>({
    gamesPlayed: 0,
    puzzlesSolved: 0,
    rating: 1200,
    winRate: 0,
    wins: 0,
    losses: 0,
    draws: 0,
  });

  const [gameHistory, setGameHistory] = useState<GameRecord[]>([]);
  const [ratingHistory, setRatingHistory] = useState<{ date: string; rating: number }[]>([]);

  useEffect(() => {
    const savedStats = localStorage.getItem("chessStats");
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }

    const savedHistory = localStorage.getItem("gameHistory");
    if (savedHistory) {
      setGameHistory(JSON.parse(savedHistory));
    }

    const savedRatingHistory = localStorage.getItem("ratingHistory");
    if (savedRatingHistory) {
      setRatingHistory(JSON.parse(savedRatingHistory));
    }
  }, []);

  const resetStats = () => {
    if (confirm("Are you sure you want to reset all statistics? This cannot be undone.")) {
      const defaultStats = {
        gamesPlayed: 0,
        puzzlesSolved: 0,
        rating: 1200,
        winRate: 0,
        wins: 0,
        losses: 0,
        draws: 0,
      };
      localStorage.setItem("chessStats", JSON.stringify(defaultStats));
      localStorage.removeItem("gameHistory");
      localStorage.removeItem("ratingHistory");
      localStorage.removeItem("dailyGames");
      setStats(defaultStats);
      setGameHistory([]);
      setRatingHistory([]);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 2000) return "text-purple-400";
    if (rating >= 1600) return "text-blue-400";
    if (rating >= 1200) return "text-green-400";
    if (rating >= 800) return "text-yellow-400";
    return "text-gray-400";
  };

  const getRatingTier = (rating: number) => {
    if (rating >= 2400) return "Grandmaster";
    if (rating >= 2200) return "International Master";
    if (rating >= 2000) return "FIDE Master";
    if (rating >= 1800) return "Expert";
    if (rating >= 1600) return "Class A";
    if (rating >= 1400) return "Class B";
    if (rating >= 1200) return "Class C";
    if (rating >= 1000) return "Class D";
    return "Beginner";
  };

  const openingRepertoire = [
    { name: "Italian Game", played: Math.floor(Math.random() * 20), winRate: Math.floor(Math.random() * 100) },
    { name: "Queen's Gambit", played: Math.floor(Math.random() * 20), winRate: Math.floor(Math.random() * 100) },
    { name: "Sicilian Defense", played: Math.floor(Math.random() * 20), winRate: Math.floor(Math.random() * 100) },
    { name: "French Defense", played: Math.floor(Math.random() * 20), winRate: Math.floor(Math.random() * 100) },
  ];

  const strengthsWeaknesses = [
    {
      category: "Tactical Vision",
      score: Math.min(100, (stats.puzzlesSolved / 10) * 100),
      description: "Pattern recognition and calculation",
    },
    {
      category: "Endgame Technique",
      score: Math.min(100, ((stats.wins || 0) / (stats.gamesPlayed || 1)) * 100),
      description: "Converting advantages and holding draws",
    },
    {
      category: "Opening Knowledge",
      score: Math.min(100, (stats.gamesPlayed / 20) * 100),
      description: "Understanding of opening principles",
    },
    {
      category: "Time Management",
      score: Math.random() * 100,
      description: "Efficient use of time in games",
    },
  ];

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
              <Link href="/puzzles" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Puzzles
              </Link>
              <Link href="/analysis" className="text-white bg-orange-600 px-3 py-2 rounded-md text-sm font-medium">
                Analysis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">Performance Analysis</h1>
          <button
            onClick={resetStats}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Reset Stats
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-6 shadow-lg">
            <div className={`text-4xl font-bold mb-2 ${getRatingColor(stats.rating)}`}>{stats.rating}</div>
            <div className="text-sm text-blue-100 mb-1">Current Rating</div>
            <div className="text-xs text-blue-200">{getRatingTier(stats.rating)}</div>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-lg p-6 shadow-lg">
            <div className="text-4xl font-bold text-green-100 mb-2">{stats.gamesPlayed}</div>
            <div className="text-sm text-green-100 mb-1">Games Played</div>
            <div className="text-xs text-green-200">
              {stats.wins}W / {stats.losses}L / {stats.draws}D
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-6 shadow-lg">
            <div className="text-4xl font-bold text-purple-100 mb-2">{stats.puzzlesSolved}</div>
            <div className="text-sm text-purple-100 mb-1">Puzzles Solved</div>
            <div className="text-xs text-purple-200">Tactical training completed</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-lg p-6 shadow-lg">
            <div className="text-4xl font-bold text-yellow-100 mb-2">{stats.winRate}%</div>
            <div className="text-sm text-yellow-100 mb-1">Win Rate</div>
            <div className="text-xs text-yellow-200">
              {stats.gamesPlayed > 0 ? "Based on completed games" : "Play games to calculate"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-bold mb-6">Rating Progress</h2>
            {ratingHistory.length > 0 ? (
              <div className="space-y-2">
                {ratingHistory.slice(-10).map((record, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-900 rounded">
                    <span className="text-sm text-gray-400">{format(new Date(record.date), "MMM d, yyyy")}</span>
                    <span className={`font-semibold ${getRatingColor(record.rating)}`}>{record.rating}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📈</div>
                <p className="text-gray-400">Play games to track your rating progress</p>
              </div>
            )}
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-bold mb-6">Strengths & Areas to Improve</h2>
            <div className="space-y-4">
              {strengthsWeaknesses.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{item.category}</span>
                    <span className="text-sm text-gray-400">{Math.round(item.score)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        item.score >= 70 ? "bg-green-500" : item.score >= 40 ? "bg-yellow-500" : "bg-red-500"
                      }`}
                      style={{ width: `${item.score}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-bold mb-6">Opening Repertoire</h2>
            <div className="space-y-3">
              {openingRepertoire.map((opening, index) => (
                <div key={index} className="p-4 bg-gray-900 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{opening.name}</span>
                    <span className="text-sm text-gray-400">{opening.played} games</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${opening.winRate}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold">{opening.winRate}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-bold mb-6">Recent Games</h2>
            {gameHistory.length > 0 ? (
              <div className="space-y-2">
                {gameHistory.slice(-10).reverse().map((game, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      game.result === "win"
                        ? "bg-green-900 border border-green-700"
                        : game.result === "loss"
                        ? "bg-red-900 border border-red-700"
                        : "bg-gray-900 border border-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold capitalize">{game.result}</span>
                        <span className="text-sm text-gray-400 ml-2">vs {game.opponent}</span>
                      </div>
                      <span className="text-sm text-gray-400">{format(new Date(game.date), "MMM d")}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🎮</div>
                <p className="text-gray-400">No games played yet</p>
                <Link href="/live" className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block">
                  Play your first game →
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-lg p-8 border border-purple-700">
          <h2 className="text-2xl font-bold mb-4">Training Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="font-semibold mb-2">Practice Tactics</h3>
              <p className="text-sm text-gray-300 mb-3">Solve puzzles daily to improve pattern recognition</p>
              <Link href="/puzzles" className="text-blue-400 hover:text-blue-300 text-sm">
                Go to Puzzles →
              </Link>
            </div>
            <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-semibold mb-2">Play Rapid Games</h3>
              <p className="text-sm text-gray-300 mb-3">Quick games help build intuition and speed</p>
              <Link href="/live" className="text-blue-400 hover:text-blue-300 text-sm">
                Play Live →
              </Link>
            </div>
            <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
              <div className="text-3xl mb-2">📚</div>
              <h3 className="font-semibold mb-2">Study Openings</h3>
              <p className="text-sm text-gray-300 mb-3">Build a solid opening repertoire for both colors</p>
              <Link href="/daily" className="text-blue-400 hover:text-blue-300 text-sm">
                Daily Games →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
