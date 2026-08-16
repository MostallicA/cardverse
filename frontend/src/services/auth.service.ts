/**
 * CardVerse Frontend - Authentication Service
 *
 * Document ID: CV-FE-005
 * Version: 0.1.0
 * Status: Development
 * Classification: Technical
 * Owner: Mostafa & ChatGPT
 * Created: 2026-07-07
 * Last Updated: 2026-07-07
 */

import axios, { AxiosInstance } from 'axios';

export interface AuthResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      username: string;
      email?: string;
      isGuest: boolean;
    };
    token: string;
  };
}

export interface LoginCredentials {
  email?: string;
  password?: string;
  isGuest?: boolean;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

class AuthService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async guestLogin(): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/guest');
    return response.data;
  }

  async googleLogin(token: string): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/google', { token });
    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/register', data);
    return response.data;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  }

  setAuthToken(token: string): void {
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('auth_token', token);
  }

  getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  clearAuthToken(): void {
    delete this.api.defaults.headers.common['Authorization'];
    localStorage.removeItem('auth_token');
  }
}

export default new AuthService();
