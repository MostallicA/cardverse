// Authentication Types
// Based on PRODUCT_BIBLE.md - Account Types (Section 3.1)

export type AccountType = 'guest' | 'google';

export type AuthProvider = 'guest' | 'google';

export interface GuestAuthRequest {
  deviceId: string;
}

export interface GoogleAuthRequest {
  idToken: string;
}

export interface UpgradeRequest {
  deviceId: string;
  idToken: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface UserPayload {
  id: string;
  accountType: AccountType;
  provider: AuthProvider;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: UserPayload;
  tokens: AuthTokens;
}
