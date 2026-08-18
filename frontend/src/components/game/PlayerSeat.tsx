/**
 * CardVerse Frontend - Player Seat Component
 * 
 * Displays a player's seat at the table with their information
 */

import React from 'react';

import { PlayerSeatProps } from '../../types/game.types';

export const PlayerSeat: React.FC<PlayerSeatProps> = ({
  player,
  seatIndex,
  isCurrentTurn = false,
  isHakem = false,
  cardCount = 0,
  isReady = false,
  onReadyToggle,
}) => {
  // Position based on seat index (0 = bottom, 1 = right, 2 = top, 3 = left)
  const positionClasses = [
    'col-start-2 row-start-4',  // Bottom
    'col-start-4 row-start-2',  // Right
    'col-start-2 row-start-1',  // Top
    'col-start-1 row-start-2',  // Left
  ];

  const isBottom = seatIndex === 0;

  // Render empty seat
  if (!player) {
    return (
      <div className={`${positionClasses[seatIndex]} flex justify-center items-center`}>
        <div className="w-20 h-24 rounded-lg border-2 border-dashed border-gray-400 bg-gray-100 flex flex-col items-center justify-center">
          <span className="text-gray-400 text-sm">Empty</span>
          <span className="text-gray-400 text-xs">Seat {seatIndex + 1}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${positionClasses[seatIndex]} flex flex-col items-center`}>
      {/* Player info */}
      <div className="flex flex-col items-center">
        <div className={`
          relative w-12 h-12 rounded-full border-2 
          ${isCurrentTurn ? 'border-yellow-400 ring-4 ring-yellow-200' : 'border-gray-300'}
          ${player.isActive ? 'bg-green-100' : 'bg-red-100'}
          flex items-center justify-center
        `}>
          <span className="text-lg font-bold">{player.username.charAt(0).toUpperCase()}</span>
          {isHakem && (
            <div className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold">
              H
            </div>
          )}
          {player.isBot && (
            <div className="absolute -bottom-1 -right-1 text-xs">🤖</div>
          )}
        </div>
        
        <div className="mt-1 text-center">
          <span className={`text-sm font-medium ${player.isActive ? 'text-white' : 'text-gray-400'}`}>
            {player.username}
            {player.isBot && ' (Bot)'}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-300">
          <span>{cardCount} cards</span>
          {isCurrentTurn && (
            <span className="text-yellow-400 font-bold">◄ Turn</span>
          )}
        </div>

        {/* Ready button for bottom player */}
        {isBottom && onReadyToggle && (
          <button
            onClick={() => onReadyToggle(!isReady)}
            className={`
              mt-2 px-3 py-1 text-xs rounded-full
              ${isReady ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}
              hover:opacity-80 transition-opacity
            `}
          >
            {isReady ? '✅ Ready' : 'Ready?'}
          </button>
        )}
      </div>
    </div>
  );
};

export default PlayerSeat;