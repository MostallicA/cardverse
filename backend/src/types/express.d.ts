/**
 * Express Type Definitions
 * Single source of truth for Request.user
 * Based on PROJECT_RULES.md - Consistent Naming
 */

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: {
        id: string;
        accountType: string;
      };
    }
  }
}

export {};
