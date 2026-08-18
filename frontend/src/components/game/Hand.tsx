/**
 * CardVerse Frontend - Hand Component
 * 
 * Displays a player's hand of cards in a row
 */

import React from 'react';

import { HandProps } from '../../types/game.types';

import Card from './Card';

export const Hand: React.FC<HandProps> = ({
  cards,
  playerId,
  isCurrentPlayer,
  onCardClick,
}) => {
  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-gray-400 text-sm">
        No cards
      </div>
    );
  }

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-1 p-2 min-h-[100px]"
      data-player-id={playerId}
    >
      {cards.map((card, index) => {
        // Slightly fan the cards for better visibility
        const offset = isCurrentPlayer ? index * 8 : 0;
        const isPlayable = isCurrentPlayer;

        return (
          <div
            key={card.id}
            className="transition-all duration-200"
            style={{
              transform: `translateX(${offset}px)`,
              zIndex: index,
            }}
          >
            <Card
              card={card}
              onClick={() => onCardClick(card)}
              isPlayable={isPlayable}
              size="medium"
            />
          </div>
        );
      })}
    </div>
  );
};

export default Hand;