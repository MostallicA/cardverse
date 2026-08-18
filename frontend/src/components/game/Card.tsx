/**
 * CardVerse Frontend - Card Component
 * 
 * Displays a single playing card with suit and rank
 */

import React from 'react';

import { CardProps } from '../../types/game.types';

const suitSymbols: Record<string, string> = {
  khesht: '♦',
  pik: '♠',
  del: '♥',
  khaj: '♣',
};

const suitColors: Record<string, string> = {
  khesht: 'text-red-600',
  pik: 'text-black',
  del: 'text-red-600',
  khaj: 'text-black',
};

const rankDisplay: Record<string, string> = {
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
  '10': '10',
  jack: 'J',
  queen: 'Q',
  king: 'K',
  ace: 'A',
};

export const Card: React.FC<CardProps> = ({
  card,
  onClick,
  isPlayable = false,
  isSelected = false,
  size = 'medium',
}) => {
  const sizeClasses = {
    small: 'w-12 h-16 text-xs',
    medium: 'w-16 h-24 text-sm',
    large: 'w-20 h-28 text-base',
  };

  const suitSymbol = suitSymbols[card.suit] || '?';
  const suitColor = suitColors[card.suit] || 'text-gray-500';
  const rankText = rankDisplay[card.rank] || card.rank;

  const handleClick = () => {
    if (isPlayable && onClick) {
      onClick(card);
    }
  };

  return (
    <div
      className={`
        relative rounded-lg border-2 bg-white shadow-md
        flex flex-col items-center justify-center
        transition-all duration-200
        ${sizeClasses[size]}
        ${isPlayable ? 'cursor-pointer hover:-translate-y-2 hover:shadow-lg' : 'cursor-default'}
        ${isSelected ? 'border-blue-500 -translate-y-4 shadow-lg' : 'border-gray-300'}
        ${isPlayable ? 'hover:border-blue-400' : ''}
      `}
      onClick={handleClick}
    >
      {/* Rank and Suit */}
      <div className="flex flex-col items-center">
        <span className={`font-bold ${suitColor}`}>{rankText}</span>
        <span className={`text-xl ${suitColor}`}>{suitSymbol}</span>
      </div>
      
      {/* Corner indicators */}
      <div className="absolute top-1 left-2 flex flex-col items-center">
        <span className={`text-[10px] font-bold leading-none ${suitColor}`}>{rankText}</span>
        <span className={`text-[10px] leading-none ${suitColor}`}>{suitSymbol}</span>
      </div>
      <div className="absolute bottom-1 right-2 flex flex-col items-center rotate-180">
        <span className={`text-[10px] font-bold leading-none ${suitColor}`}>{rankText}</span>
        <span className={`text-[10px] leading-none ${suitColor}`}>{suitSymbol}</span>
      </div>
    </div>
  );
};

export default Card;