"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Home() {
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    puzzlesSolved: 0,
    rating: 1200,
    winRate: 0,
  });

  useEffect(() => {
    const savedStats = localStorage.getItem("chessStats");
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);

  return (
    <div className="min-h-screen">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-400">♚ ChessPlatform</span>
            </div>
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
              <Link href="/analysis" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Analysis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-white">Welcome to ChessPlatform</h1>
          <p className="text-xl text-gray-400">Play, Learn, and Master Chess</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="text-3xl font-bold text-blue-400 mb-2">{stats.rating}</div>
            <div className="text-sm text-gray-400">Current Rating</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="text-3xl font-bold text-green-400 mb-2">{stats.gamesPlayed}</div>
            <div className="text-sm text-gray-400">Games Played</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="text-3xl font-bold text-purple-400 mb-2">{stats.puzzlesSolved}</div>
            <div className="text-sm text-gray-400">Puzzles Solved</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="text-3xl font-bold text-yellow-400 mb-2">{stats.winRate}%</div>
            <div className="text-sm text-gray-400">Win Rate</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/live" className="group">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-8 hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="text-4xl mb-4">⚡</div>
              <h2 className="text-2xl font-bold mb-2">Play Live</h2>
              <p className="text-blue-100">Real-time chess games with instant matchmaking</p>
            </div>
          </Link>

          <Link href="/daily" className="group">
            <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-lg p-8 hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="text-4xl mb-4">📅</div>
              <h2 className="text-2xl font-bold mb-2">Daily Games</h2>
              <p className="text-green-100">Play at your own pace with daily moves</p>
            </div>
          </Link>

          <Link href="/puzzles" className="group">
            <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-8 hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="text-4xl mb-4">🧩</div>
              <h2 className="text-2xl font-bold mb-2">Tactical Puzzles</h2>
              <p className="text-purple-100">Improve your skills with chess puzzles</p>
            </div>
          </Link>

          <Link href="/analysis" className="group">
            <div className="bg-gradient-to-br from-orange-600 to-orange-800 rounded-lg p-8 hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="text-4xl mb-4">📊</div>
              <h2 className="text-2xl font-bold mb-2">Analysis</h2>
              <p className="text-orange-100">Analyze your games and track progress</p>
            </div>
          </Link>
        </div>

        <div className="mt-12 bg-gray-800 rounded-lg p-8 border border-gray-700">
          <h2 className="text-2xl font-bold mb-4">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-2">🎮 Multiple Game Modes</h3>
              <p className="text-gray-400">Choose between live games for quick matches or daily games for thoughtful play</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-2">🧠 Smart AI Opponent</h3>
              <p className="text-gray-400">Practice against an AI opponent that adapts to your skill level</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-2">🎯 Tactical Training</h3>
              <p className="text-gray-400">Solve puzzles to improve pattern recognition and tactical awareness</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-2">📈 Performance Tracking</h3>
              <p className="text-gray-400">Track your rating, win rate, and improvement over time</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 border-t border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-400">© 2025 ChessPlatform. Built with Next.js and Chess.js</p>
        </div>
      </footer>
    </div>
  );
}
