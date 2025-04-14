import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Service for handling user authentication and authorization
 * Manages login, registration, token storage, and user state
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /** @private */
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  /** @public Observable to track authentication state */
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  /**
   * Constructor initializes the service and checks for existing token
   * @param http HttpClient instance for making HTTP requests
   */
  constructor(private http: HttpClient) {
    this.checkToken();
  }

  /**
   * Checks if a valid token exists in storage
   * Updates authentication state accordingly
   * @private
   */
  private checkToken() {
    const token = this.getToken();
    this.isAuthenticatedSubject.next(!!token);
  }

  /**
   * Registers a new user account
   * @param username User's username
   * @param password User's password
   * @returns Observable containing the registration response
   * @throws Error if registration fails
   * @see /auth/register
   */
  register(username: string, password: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/register`, { username, password }).pipe(
      tap((response: any) => {
        if (response.token) {
          this.setToken(response.token);
          this.isAuthenticatedSubject.next(true);
        }
      }),
      catchError((error) => {
        console.error('Registration error:', error);
        return throwError(() => ({ error: true, message: 'Registration failed' }));
      })
    );
  }

  /**
   * Authenticates a user and retrieves a JWT token
   * @param username User's username
   * @param password User's password
   * @returns Observable containing the login response
   * @throws Error if login fails
   * @see /auth/login
   */
  login(username: string, password: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/login`, { username, password }).pipe(
      tap((response: any) => {
        if (response.token) {
          this.setToken(response.token);
          this.isAuthenticatedSubject.next(true);
        }
      }),
      catchError((error) => {
        console.error('Login error:', error);
        this.isAuthenticatedSubject.next(false);
        return throwError(() => ({ error: true, message: 'Login failed' }));
      })
    );
  }

  /**
   * Stores a JWT token in localStorage
   * @param token JWT token to store
   * @private
   */
  private setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  /**
   * Retrieves the stored JWT token from localStorage
   * @returns The stored token or null if none exists
   * @private
   */
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Removes the stored JWT token from localStorage
   * @private
   */
  private removeToken(): void {
    localStorage.removeItem('token');
  }

  /**
   * Logs out the user by removing token and updating authentication state
   * @public
   */
  logout(): void {
    this.removeToken();
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Parses and returns the user data from the JWT token
   * @returns Parsed user data or null if no token exists
   * @throws Error if token parsing fails
   * @private
   */
  getUser(): any {
    const token = this.getToken();
    if (!token) return null;

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(base64));
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  }

  /**
   * Validates the stored JWT token
   * @returns true if token is valid, false otherwise
   * @private
   */
  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const decodedToken = this.getUser();
      const expirationTime = decodedToken.exp * 1000;
      return Date.now() < expirationTime;
    } catch (error) {
      console.error('Error checking token validity:', error);
      return false;
    }
  }

  /**
   * Retrieves user information from the server
   * @returns Observable containing user information
   * @throws Error if user info retrieval fails
   * @see /auth/user
   */
  getUserInfo(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No token found'));
    }

    return this.http.get(`${environment.apiUrl}/auth/user`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).pipe(
      catchError((error) => {
        console.error('Error getting user info:', error);
        return throwError(() => error);
      })
    );
  }
}
