import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

interface LoginResp { token: string; usuario?: any }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'token';

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

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUserFromToken() {
    const t = this.getToken();
    if (!t) return null;
    try {
      const payload = t.split('.')[1];
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  }

  isAdmin(): boolean {
    const u = this.getUserFromToken();
    return !!(u && u.rol && u.rol === 'admin');
  }
}
