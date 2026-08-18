/**
 * CardVerse Frontend - Game Page
 * 
 * Main game page that renders the GameBoard component
 */

import React from 'react';
import { useParams, Navigate } from 'react-router-dom';

import { GameBoard } from '../components/game/GameBoard';
import { useAuth } from '../context/AuthContext';

export const Game: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!matchId) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <GameBoard matchId={matchId} playerId={user.id} />
    </div>
  );
};

export default Game;