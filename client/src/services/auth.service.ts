import axios from 'axios';
import { User } from '../types/user';

const API_URL = import.meta.env.VITE_API_URL + '/api/auth';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'STAFF' | 'USER';
  };
}

class AuthService {
  async login(email: string, password: string): Promise<User> {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    const { user, token } = response.data;
    localStorage.setItem('token', token);
    return user;
  }

  async register(name: string, email: string, password: string): Promise<User> {
    const response = await axios.post(`${API_URL}/register`, {
      name,
      email,
      password,
    });
    const { user, token } = response.data;
    localStorage.setItem('token', token);
    return user;
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  async getCurrentUser(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await axios.get(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get current user:', error);
      this.logout();
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  async isAdmin(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.role === 'ADMIN';
  }

  async isStaff(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.role === 'STAFF';
  }
}

export default new AuthService(); 