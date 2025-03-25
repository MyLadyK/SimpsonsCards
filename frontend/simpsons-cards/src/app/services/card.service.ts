import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Card } from '../models/card';

const API_URL = 'http://localhost:3000/api';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  constructor(private http: HttpClient) {}

  getUserCards(): Observable<Card[]> {
    return this.http.get<Card[]>(`${API_URL}/cards/user`);
  }

  // Add more card-related methods as needed
  // getCardById(id: number): Observable<Card>
  // addCard(card: Card): Observable<Card>
  // updateCard(card: Card): Observable<Card>
  // deleteCard(id: number): Observable<void>
}
