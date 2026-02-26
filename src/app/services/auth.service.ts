import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

interface LoginResp { token: string; usuario?: any }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'token';
  private userKey = 'user';

  constructor(private http: HttpClient, private router: Router) {}

  register(data: any) {
    return this.http.post(`${environment.apiUrl}/auth/register`, data);
  }

  login(credentials: any) {
    return this.http.post<LoginResp>(`${environment.apiUrl}/auth/login`, credentials);
  }

  setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  setSession(token: string, user?: any) {
    this.setToken(token);
    if (user) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getStoredUser(): any | null {
    try {
      const raw = localStorage.getItem(this.userKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private decodeToken(token: string): any | null {
    try {
      const payload = token.split('.')[1];
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  private isTokenValid(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload) {
      return false;
    }

    if (!payload.exp) {
      return true;
    }

    const nowInSeconds = Math.floor(Date.now() / 1000);
    return payload.exp > nowInSeconds;
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.router.navigate(['/']);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    const valid = this.isTokenValid(token);
    if (!valid) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }

    return valid;
  }

  getUserFromToken() {
    const t = this.getToken();
    if (!t) return null;
    if (!this.isTokenValid(t)) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
      return null;
    }

    return this.decodeToken(t);
  }

  getDisplayName(): string {
    const stored = this.getStoredUser();
    if (stored?.nombre && stored?.apellido) {
      return `${stored.nombre} ${stored.apellido}`;
    }
    if (stored?.nombre) {
      return stored.nombre;
    }
    if (stored?.email) {
      return stored.email;
    }

    const tokenUser = this.getUserFromToken();
    if (tokenUser?.email) {
      return tokenUser.email;
    }
    if (tokenUser?.rol === 'admin') {
      return 'Administrador';
    }

    return 'Usuario';
  }

  isAdmin(): boolean {
    const u = this.getUserFromToken();
    return !!(u && u.rol && u.rol === 'admin');
  }
}
