import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkToken();
  }

  private checkToken() {
    const token = this.getToken();
    this.isAuthenticatedSubject.next(!!token);
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/login`, { username, password }).pipe(
      tap((response: any) => {
        if (response.token) {
          console.log('Login successful, storing token:', response.token);
          this.setToken(response.token);
          this.isAuthenticatedSubject.next(true);
        } else {
          console.error('Login response missing token:', response);
          throw new Error('Invalid login response');
        }
      }),
      catchError((error) => {
        console.error('Login error:', error);
        this.isAuthenticatedSubject.next(false);
        return throwError(() => ({ error: true, message: 'Login failed' }));
      })
    );
  }

  register(username: string, password: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/register`, { username, password }).pipe(
      tap((response: any) => {
        if (response.token) {
          console.log('Registration successful, storing token:', response.token);
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

  private getTokenFromStorage(): string | null {
    return localStorage.getItem('token');
  }

  private setToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return this.getTokenFromStorage();
  }

  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const decodedToken = this.decodeToken();
      const expirationTime = decodedToken.exp * 1000;
      return Date.now() < expirationTime;
    } catch (error) {
      return false;
    }
  }

  decodeToken(): any {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(base64));
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  logout() {
    localStorage.removeItem('token');
    this.isAuthenticatedSubject.next(false);
  }

  getUserInfo(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      return of(null);
    }

    return this.http.get(`${environment.apiUrl}/auth/user`).pipe(
      catchError((error) => {
        console.error('Error getting user info:', error);
        return of(null);
      })
    );
  }
}
