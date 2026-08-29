/**
 * CardVerse Frontend - Lobby Page
 *
 * Displays the match lobby where players gather before the game starts
 */

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { useGameSocket } from '../hooks/useGameSocket';

interface LobbyPlayer {
  id: string;
  username: string;
  isReady: boolean;
  seatIndex: number;
}

export const Lobby: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [players, setPlayers] = useState<LobbyPlayer[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [matchId, setMatchId] = useState<string | null>(null);
  // Latest matchId available to the singleton socket callbacks (which are
  // registered once and therefore capture stale closures).
  const matchIdRef = useRef<string | null>(null);
  const updateMatchId = (id: string | null) => {
    matchIdRef.current = id;
    setMatchId(id);
  };

  const { isConnected, socket } = useGameSocket({
    onMatchUpdate: state => {
      if (state?.players) {
        const lobbyPlayers = state.players.map((p: any) => ({
          id: p.id,
          username: p.username || `Player ${(p.seatIndex || 0) + 1}`,
          isReady: p.isReady || false,
          seatIndex: p.seatIndex || 0,
        }));
        setPlayers(lobbyPlayers);
      }
    },
    // The SERVER is authoritative for matchId. When it creates the match it
    // returns the real matchId via `match_created`; we MUST use that value for
    // join/set_ready/start_match — otherwise the client generates a DIFFERENT
    // `match_${Date.now()}` and every subsequent emit targets a non-existent room.
    onMatchCreated: data => {
      if (data?.matchId && user?.id) {
        updateMatchId(data.matchId);
        socket?.emit('join_match', {
          matchId: data.matchId,
          playerId: user.id,
        });
      }
    },
    // The SERVER starts the match (in LobbyManager.setPlayerReady when everyone
    // is ready & the lobby is full) and broadcasts `match_started`. THIS is the
    // reliable signal to navigate to the Game page — NOT client-side re-deriving
    // `allReady`, because Engine match-state players do NOT carry `isReady`.
    onMatchStarted: data => {
      const id = data?.matchId || matchIdRef.current;
      if (id) {
        console.log(`[Lobby] Match started — navigating to /game/${id}`);
        navigate(`/game/${id}`);
      }
    },
  });

  // Create a new match
  const createMatch = () => {
    if (!user || !socket) return;

    // Do NOT guess the matchId here. The server assigns it and returns it in
    // `match_created` (handled by onMatchCreated above).
    socket.emit('create_match', {
      players: [
        {
          id: user.id,
          userId: user.id,
          username: user.username,
          seatIndex: 0,
        },
      ],
      config: {
        mode: 'hokm',
        totalSetsToWin: 7,
        turnTimeoutMs: 8000,
        declarationTimeoutMs: 20000,
      },
    });
  };

  // Join an existing match (by match ID from URL or input)
  const joinMatch = (id: string) => {
    if (!user || !socket) return;
    updateMatchId(id);
    socket.emit('join_match', { matchId: id, playerId: user.id });
  };

  // Toggle ready status
  const toggleReady = () => {
    if (!matchId || !user || !socket) return;
    const newReady = !isReady;
    setIsReady(newReady);
    socket.emit('set_ready', { matchId, playerId: user.id, isReady: newReady });
  };

  // NOTE: We intentionally do NOT navigate here based on client-side
  // `players.every(p => p.isReady)`. Engine match-state players carry no
  // `isReady`, so that check stays false forever (that's why the old code never
  // navigated). The SERVER decides when everyone is ready (all humans ready +
  // lobby full) and broadcasts `match_started`; the hook's onMatchStarted handler
  // above performs navigate(`/game/${matchId}`). Keep this effect out to avoid a
  // duplicate/racy `start_match` emit.

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600">Connecting...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center text-white mb-8">
          <h1 className="text-4xl font-bold">🃏 Lobby</h1>
          <p className="text-blue-200 mt-2">Get ready to play!</p>
        </div>

        {/* Create/Join section */}
        {!matchId ? (
          <div className="bg-white/10 backdrop-blur rounded-2xl p-8 text-center">
            <button
              onClick={createMatch}
              className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white text-xl font-bold rounded-lg transition-colors"
            >
              🚀 Create New Match
            </button>
            <p className="text-blue-200 mt-4">or</p>
            <div className="flex justify-center gap-2 mt-4">
              <input
                type="text"
                placeholder="Enter Match ID"
                className="px-4 py-2 rounded-lg bg-white/20 text-white placeholder-blue-300 border border-blue-400"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    joinMatch((e.target as HTMLInputElement).value);
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.querySelector('input') as HTMLInputElement;
                  if (input.value) joinMatch(input.value);
                }}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Join
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur rounded-2xl p-8">
            {/* Match ID */}
            <div className="text-center text-white mb-6">
              <p className="text-sm text-blue-200">Match ID</p>
              <p className="text-2xl font-mono font-bold">{matchId}</p>
            </div>

            {/* Players grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {Array.from({ length: 4 }).map((_, index) => {
                const player = players.find(p => p.seatIndex === index);
                const isCurrentPlayer = player?.id === user?.id;

                return (
                  <div
                    key={index}
                    className={`bg-white/5 rounded-xl p-4 text-center border-2 transition-all
                      ${player ? 'border-green-400' : 'border-dashed border-white/20'}
                      ${isCurrentPlayer ? 'ring-2 ring-yellow-400' : ''}
                    `}
                  >
                    {player ? (
                      <>
                        <div className="text-4xl mb-2">
                          {player.username?.charAt(0)?.toUpperCase() ?? '?'}
                        </div>
                        <div className="text-white font-medium">{player.username || 'Player'}</div>
                        <div className="text-sm mt-1">
                          {player.isReady ? (
                            <span className="text-green-400">✅ Ready</span>
                          ) : (
                            <span className="text-yellow-400">⏳ Waiting...</span>
                          )}
                        </div>
                        {isCurrentPlayer && (
                          <div className="text-xs text-yellow-400 mt-1">(You)</div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="text-4xl mb-2 text-white/30">?</div>
                        <div className="text-white/30 text-sm">Empty Seat</div>
                        <div className="text-white/20 text-xs">Seat {index + 1}</div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
              {user && (
                <button
                  onClick={toggleReady}
                  className={`px-8 py-3 rounded-lg font-bold text-white transition-colors
                    ${isReady ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                  `}
                >
                  {isReady ? '❌ Cancel Ready' : '✅ Ready to Play'}
                </button>
              )}
              <button
                onClick={() => {
                  if (matchId && socket && user) {
                    socket.emit('leave_match', { matchId, playerId: user.id });
                    updateMatchId(null);
                    setPlayers([]);
                    setIsReady(false);
                  }
                }}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Leave
              </button>
            </div>

            {/* Status message */}
            <div className="text-center text-blue-200 text-sm mt-4">
              {players.length < 2
                ? `Waiting for ${2 - players.length} more player(s)...`
                : !players.every(p => p.isReady)
                  ? 'Waiting for all players to be ready...'
                  : '🎯 All ready! Starting match...'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Lobby;
