// JWT Service
// Generates and verifies JWT tokens for authentication.

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cardverse-dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generates a JWT token for the given user ID.
 */
export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

/**
 * Verifies a JWT token and returns the userId if valid.
 * Returns null if the token is invalid or expired.
 */
export function verifyToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded) {
      return { userId: String(decoded.userId) };
    }
    return null;
  } catch {
    return null;
  }
}
