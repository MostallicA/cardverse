/**
 * CardVerse Frontend - Login Page
 *
 * Document ID: CV-FE-007
 * Version: 0.1.0
 * Status: Development
 * Classification: Technical
 * Owner: Mostafa & ChatGPT
 * Created: 2026-07-07
 * Last Updated: 2026-07-07
 */

import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';

import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { guestLogin, googleLogin, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleGuestLogin = async () => {
    setError(null);
    try {
      await guestLogin();
      navigate('/lobby');
    } catch (err) {
      console.error('Guest login failed:', err);
      setError('Failed to login as guest. Please try again.');
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      // TODO: Integrate Google Identity Services (GIS) token acquisition.
      // For now, this calls the backend /auth/google endpoint with a placeholder token.
      const placeholderToken = `placeholder-google-id-token-${Date.now()}`;
      await googleLogin(placeholderToken);
      navigate('/lobby');
    } catch (err) {
      console.error('Google login failed:', err);
      setError('Google sign-in is not configured yet. Please try Guest mode.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>CardVerse</h1>
        <h2>Welcome</h2>

        {error && <div className="error-message">{error}</div>}

        <button className="guest-button" onClick={handleGuestLogin} disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Continue as Guest'}
        </button>

        <div className="divider">or</div>

        <button className="google-button" onClick={handleGoogleLogin} disabled={isLoading}>
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
