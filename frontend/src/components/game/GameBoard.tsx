/**
 * CardVerse Frontend - Game Board Component
 * 
 * Main game board that displays the table, players, cards, and game state
 */

import React, { useState, useEffect } from 'react';

import { MatchState, Card as CardType, GameMode, Suit } from '../../types/game.types';
import { useGameSocket } from '../../hooks/useGameSocket';

import PlayerSeat from './PlayerSeat';
import Hand from './Hand';
import TableCards from './TableCards';
import DeclareHokm from './DeclareHokm';

interface GameBoardProps {
  matchId: string;
  playerId: string;
}

export const GameBoard: React.FC<GameBoardProps> = ({ matchId, playerId }) => {
  const [matchState, setMatchState] = useState<MatchState | null>(null);
  const [isReady, setIsReady] = useState(false);

  const {
    isConnected,
    matchState: socketMatchState,
    playCard,
    declareHokm,
    setReady,
  } = useGameSocket({
    matchId,
    playerId,
    onMatchUpdate: (state) => {
      setMatchState(state);
    },
    onError: (error) => {
      console.error('[GameBoard] Error:', error);
      alert(`Error: ${error.message}`);
    },
  });

  // Update local state when socket match state changes
  useEffect(() => {
    if (socketMatchState) {
      setMatchState(socketMatchState);
    }
  }, [socketMatchState]);

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600">Connecting...</div>
          <div className="text-sm text-gray-400">Establishing connection to server</div>
        </div>
      </div>
    );
  }

  if (!matchState) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600">Waiting for match...</div>
          <div className="text-sm text-gray-400">Loading match state...</div>
        </div>
      </div>
    );
  }

  const currentPlayer = matchState.players.find((p) => p.id === playerId);
  const isCurrentTurn = matchState.currentPlayerId === playerId;
  const isHakem = matchState.hakemId === playerId;

  // Get player names map for table cards
  const playerNames = matchState.players.reduce((acc, p) => {
    acc[p.id] = p.username;
    return acc;
  }, {} as Record<string, string>);

  const handleCardClick = (card: CardType) => {
    if (isCurrentTurn && matchState) {
      playCard(matchState.matchId, playerId, card.id);
    }
  };

  const handleDeclareHokm = (mode: GameMode, suit?: Suit) => {
    if (isHakem && matchState) {
      declareHokm(matchState.matchId, playerId, mode, suit);
    }
  };

  const handleReadyToggle = (ready: boolean) => {
    setIsReady(ready);
    setReady(matchState.matchId, playerId, ready);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-800 to-green-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center text-white mb-4">
          <div>
            <span className="font-bold">Match ID:</span> {matchState.matchId}
          </div>
          <div>
            <span className="font-bold">Set:</span> {matchState.currentSet + 1}
          </div>
          <div className="flex items-center gap-4">
            <span className={`px-2 py-1 rounded text-sm ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}>
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </span>
          </div>
        </div>

        {/* Scoreboard */}
        <div className="flex justify-center gap-8 mb-4 text-white">
          {matchState.teams.map((team) => (
            <div key={team.id} className="bg-black/30 rounded-lg px-4 py-2">
              <span className="font-bold">Team {team.id + 1}:</span>
              <span className="ml-2">
                Sets: {team.setsWon} | Tricks: {team.tricksWon}
              </span>
            </div>
          ))}
        </div>

        {/* Game Table */}
        <div className="relative bg-green-700 rounded-2xl p-8 shadow-2xl border-4 border-green-600">
          {/* Grid layout for seats */}
          <div className="grid grid-cols-4 grid-rows-4 gap-4 min-h-[500px]">
            {/* Player seats positioned in a circle */}
            {matchState.players.map((player, index) => (
              <PlayerSeat
                key={player.id}
                player={player}
                seatIndex={index}
                isCurrentTurn={matchState.currentPlayerId === player.id}
                isHakem={matchState.hakemId === player.id}
                cardCount={matchState.handCards[player.id]?.length || 0}
                isReady={isReady}
                onReadyToggle={index === 0 ? handleReadyToggle : undefined}
              />
            ))}

            {/* Center area - Table cards */}
            <div className="col-start-2 col-span-2 row-start-2 row-span-2 flex flex-col items-center justify-center">
              {/* Declare Hokm UI */}
              {matchState.status === 'playing' && isHakem && (
                <DeclareHokm
                  isHakem={isHakem}
                  onDeclare={handleDeclareHokm}
                />
              )}

              {/* Table cards */}
              <TableCards
                cards={matchState.currentTrick?.cards || []}
                playedBy={matchState.currentTrick?.playedBy || []}
                playerNames={playerNames}
                trickNumber={matchState.currentTrickIndex}
              />

              {/* Game status */}
              <div className="mt-2 text-white text-sm bg-black/30 px-3 py-1 rounded">
                {matchState.status === 'playing' && (
                  <span>
                    {isCurrentTurn ? '🎯 Your turn!' : '⏳ Waiting for opponent...'}
                  </span>
                )}
                {matchState.status === 'completed' && (
                  <span className="text-yellow-300 font-bold">🏆 Match Complete!</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Player's hand */}
        {currentPlayer && (
          <div className="mt-4 bg-black/40 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2 text-white">
              <span className="font-bold">Your Hand</span>
              <span className="text-sm text-gray-300">
                {matchState.handCards[playerId]?.length || 0} cards
              </span>
            </div>
            <Hand
              cards={matchState.handCards[playerId] || []}
              playerId={playerId}
              isCurrentPlayer={isCurrentTurn}
              onCardClick={handleCardClick}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GameBoard;