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

import React, { useState } from 'react';

import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const { login, guestLogin, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
    } catch (error) {
      setError('Invalid email or password');
    }
  };

  const handleGuestLogin = async () => {
    setError(null);
    try {
      await guestLogin();
    } catch (error) {
      setError('Failed to login as guest');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>CardVerse</h1>
        <h2>Welcome Back</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={isLoading}
            />
          </div>
          
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Login'}
          </button>
        </form>
        
        <div className="divider">or</div>
        
        <button 
          className="guest-button" 
          onClick={handleGuestLogin}
          disabled={isLoading}
        >
          Continue as Guest
        </button>
        
        <p className="register-link">
          Don't have an account? <a href="/register">Register</a>
        </p>
      </div>
    </div>
  );
};

export default Login;