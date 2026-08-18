/**
 * CardVerse Frontend - Declare Hokm Component
 * 
 * Allows the Hakem to declare the game mode and trump suit
 */

import React, { useState } from 'react';

import { GameMode, Suit } from '../../types/game.types';

interface DeclareHokmProps {
  isHakem: boolean;
  onDeclare: (mode: GameMode, suit?: Suit) => void;
  timeoutMs?: number;
}

const modeOptions: Array<{ value: GameMode; label: string }> = [
  { value: GameMode.HOKM, label: 'Hokm (Trump)' },
  { value: GameMode.SARAS, label: 'Saras' },
  { value: GameMode.NARAS, label: 'Naras' },
  { value: GameMode.TAK_NARAS, label: 'Tak Naras' },
];

const suitOptions = [
  { value: Suit.KHESHT, label: '♦ Khesht', color: 'text-red-600' },
  { value: Suit.PIK, label: '♠ Pik', color: 'text-black' },
  { value: Suit.DEL, label: '♥ Del', color: 'text-red-600' },
  { value: Suit.KHAJ, label: '♣ Khaj', color: 'text-black' },
];

export const DeclareHokm: React.FC<DeclareHokmProps> = ({
  isHakem,
  onDeclare,
  timeoutMs = 20000,
}) => {
  const [selectedMode, setSelectedMode] = useState<GameMode>(GameMode.HOKM);
  const [selectedSuit, setSelectedSuit] = useState<Suit | undefined>(undefined);
  const [isDeclaring, setIsDeclaring] = useState(false);

  const handleDeclare = () => {
    if (!isHakem) return;
    
    setIsDeclaring(true);
    
    // If mode is HOKM, we need a suit, otherwise no suit needed
    const suit = selectedMode === GameMode.HOKM ? selectedSuit : undefined;
    
    if (selectedMode === GameMode.HOKM && !suit) {
      alert('Please select a trump suit for Hokm mode');
      setIsDeclaring(false);
      return;
    }
    
    onDeclare(selectedMode, suit);
    setIsDeclaring(false);
  };

  // If not Hakem, show waiting state
  if (!isHakem) {
    return (
      <div className="text-center text-gray-500 p-4">
        <p className="text-sm">Waiting for Hakem to declare...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <h3 className="text-lg font-bold text-center mb-4">
        🃏 Declare Hokm
      </h3>
      
      <p className="text-sm text-gray-600 text-center mb-4">
        You are the Hakem! Choose the game mode.
      </p>

      {/* Mode selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Game Mode
        </label>
        <div className="grid grid-cols-2 gap-2">
          {modeOptions.map((mode) => (
            <button
              key={mode.value}
              onClick={() => setSelectedMode(mode.value)}
              className={`
                px-3 py-2 text-sm rounded-lg border-2 transition-all
                ${selectedMode === mode.value 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-300 hover:border-gray-400'}
              `}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Suit selection (only for HOKM mode) */}
      {selectedMode === GameMode.HOKM && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trump Suit
          </label>
          <div className="grid grid-cols-2 gap-2">
            {suitOptions.map((suit) => (
              <button
                key={suit.value}
                onClick={() => setSelectedSuit(suit.value)}
                className={`
                  px-3 py-2 text-sm rounded-lg border-2 transition-all font-bold
                  ${selectedSuit === suit.value 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'}
                  ${suit.color}
                `}
              >
                {suit.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Declare button */}
      <button
        onClick={handleDeclare}
        disabled={isDeclaring || (selectedMode === GameMode.HOKM && !selectedSuit)}
        className={`
          w-full py-2 rounded-lg font-bold text-white transition-all
          ${isDeclaring || (selectedMode === GameMode.HOKM && !selectedSuit)
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'}
        `}
      >
        {isDeclaring ? 'Declaring...' : 'Declare Hokm'}
      </button>

      <p className="text-xs text-gray-400 text-center mt-3">
        You have {Math.floor(timeoutMs / 1000)} seconds to declare
      </p>
    </div>
  );
};

export default DeclareHokm;