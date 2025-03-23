import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

const API_URL = 'http://localhost:3000/api';

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
    const token = localStorage.getItem('token');
    this.isAuthenticatedSubject.next(!!token);
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${API_URL}/auth/login`, { username, password }).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          this.isAuthenticatedSubject.next(true);
        }
      })
    );
  }

  register(username: string, password: string): Observable<any> {
    return this.http.post(`${API_URL}/auth/register`, { username, password });
  }

  logout() {
    localStorage.removeItem('token');
    this.isAuthenticatedSubject.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
