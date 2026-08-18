/**
 * CardVerse Frontend - Table Cards Component
 * 
 * Displays the current trick cards on the table
 */

import React from 'react';

import { Card as CardType } from '../../types/game.types';

import Card from './Card';

interface TableCardsProps {
  cards: CardType[];
  playedBy: string[];
  playerNames: Record<string, string>;
  trickNumber: number;
}

export const TableCards: React.FC<TableCardsProps> = ({
  cards,
  playedBy,
  playerNames,
  trickNumber,
}) => {
  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
        Waiting for cards...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Trick info */}
      <div className="text-xs text-gray-500 mb-2">
        Trick {trickNumber + 1}
      </div>

      {/* Cards on table */}
      <div className="flex items-center justify-center gap-4 min-h-[120px]">
        {cards.map((card, index) => {
          const playerName = playedBy[index] 
            ? playerNames[playedBy[index]] || `Player ${playedBy[index].slice(0, 4)}`
            : `Player ${index + 1}`;

          return (
            <div key={card.id} className="flex flex-col items-center gap-1">
              <Card card={card} size="medium" />
              <span className="text-xs text-gray-500">{playerName}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TableCards;