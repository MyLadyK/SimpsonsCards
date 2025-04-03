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

  logout(): void {
    this.removeToken();
    this.isAuthenticatedSubject.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  removeToken(): void {
    localStorage.removeItem('token');
  }

  getUser(): any {
    const token = this.getToken();
    if (!token) return null;

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      return payload;
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  }

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
