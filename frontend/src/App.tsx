/**
 * CardVerse Frontend - App Component
 *
 * Document ID: CV-FE-003
 * Version: 0.2.0
 * Status: Development
 * Classification: Technical
 * Owner: Mostafa & ChatGPT
 * Created: 2026-07-07
 * Last Updated: 2026-08-19
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Game from './pages/Game';
import Lobby from './pages/Lobby';
import './index.css';

const Home: React.FC = () => {
  return (
    <div className="app">
      <h1>CardVerse</h1>
      <p>Welcome to CardVerse Platform</p>
      <p>You are logged in!</p>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lobby"
            element={
              <ProtectedRoute>
                <Lobby />
              </ProtectedRoute>
            }
          />
          <Route
            path="/game/:matchId"
            element={
              <ProtectedRoute>
                <Game />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
