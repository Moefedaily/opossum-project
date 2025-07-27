import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';

export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  isVerified: boolean;
}

export interface LoginRequest {
  login: string; // username or email
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();

  constructor(private apiService: ApiService) {
    // Check for existing token on service initialization
    this.loadStoredAuth();
  }

  // Login admin user
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.apiService
      .post<AuthResponse>('/api/auth/login', credentials)
      .pipe(
        tap((response) => {
          // Check if user has ADMIN role
          if (response.user.role !== 'ADMIN') {
            throw new Error('Access denied. Admin privileges required.');
          }

          // Store authentication data
          this.storeAuthData(response);
        })
      );
  }

  // Logout
  logout(): Observable<{ message: string }> {
    return this.apiService.post<{ message: string }>('/api/auth/logout').pipe(
      tap(() => {
        this.clearAuthData();
      })
    );
  }

  // Get current user info
  getCurrentUser(): Observable<User> {
    return this.apiService.get<User>('/api/auth/me');
  }

  // Validate token using backend endpoint
  validateToken(): Observable<{ valid: boolean; user?: User }> {
    return this.apiService.get<{ valid: boolean; user?: User }>(
      '/api/auth/validate'
    );
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUserValue();
    return !!(token && user && user.role === 'ADMIN');
  }

  // Check if user has admin role
  isAdmin(): boolean {
    const user = this.getCurrentUserValue();
    return user?.role === 'ADMIN' || false;
  }

  // Get current user value (synchronous)
  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Get token
  getToken(): string | null {
    return localStorage.getItem('adminToken');
  }

  // Store authentication data
  private storeAuthData(authResponse: AuthResponse): void {
    localStorage.setItem('adminToken', authResponse.accessToken);
    localStorage.setItem('adminRefreshToken', authResponse.refreshToken);
    localStorage.setItem('adminUser', JSON.stringify(authResponse.user));

    this.currentUserSubject.next(authResponse.user);
    this.tokenSubject.next(authResponse.accessToken);
  }

  // Load stored authentication data
  private loadStoredAuth(): void {
    const token = localStorage.getItem('adminToken');
    const userStr = localStorage.getItem('adminUser');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === 'ADMIN') {
          this.currentUserSubject.next(user);
          this.tokenSubject.next(token);
        } else {
          this.clearAuthData();
        }
      } catch (error) {
        this.clearAuthData();
      }
    }
  }

  // Clear authentication data
  private clearAuthData(): void {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRefreshToken');
    localStorage.removeItem('adminUser');

    this.currentUserSubject.next(null);
    this.tokenSubject.next(null);
  }
}
