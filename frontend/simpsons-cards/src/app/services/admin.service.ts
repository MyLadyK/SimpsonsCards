import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Card } from '../models/card';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  constructor(private http: HttpClient) {}

  // Operaciones de usuarios
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/admin/users`);
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/admin/users/${userId}`);
  }

  // Operaciones de tarjetas
  getCards(): Observable<Card[]> {
    return this.http.get<Card[]>(`${environment.apiUrl}/admin/cards`);
  }

  addCard(card: Card): Observable<Card> {
    return this.http.post<Card>(`${environment.apiUrl}/admin/cards`, card);
  }

  updateCard(card: Card): Observable<Card> {
    return this.http.put<Card>(`${environment.apiUrl}/admin/cards/${card.id}`, card);
  }

  deleteCard(cardId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/admin/cards/${cardId}`);
  }
}
