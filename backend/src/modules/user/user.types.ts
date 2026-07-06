// User Management Types
// Based on PRODUCT_BIBLE.md Section 3.2 - Player Profile

export type UserStatus = 'online' | 'offline' | 'away' | 'in_lobby' | 'matchmaking' | 'in_match';

export interface UserProfile {
  id: string;
  username: string;
  avatar: string;
  avatarFrame: string;
  countryFlag: string;
  level: number;
  rank: string;
  status: UserStatus;
  joinDate: Date;
  lastOnline: Date;
}

export interface UpdateProfileRequest {
  username?: string;
  avatar?: string;
  avatarFrame?: string;
  countryFlag?: string;
}

export interface UserSearchQuery {
  username?: string;
  page?: number;
  limit?: number;
}

export interface UserSearchResult {
  users: UserProfile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
