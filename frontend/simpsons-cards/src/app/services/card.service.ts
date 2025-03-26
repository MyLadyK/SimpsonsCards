import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { Card } from '../models/card';

const API_URL = 'http://localhost:3000';

export interface CardClaimResponse {
  message: string;
  remainingTime: number;
  cards: Card[];
}

@Injectable({
  providedIn: 'root'
})
export class CardService {
  constructor(private http: HttpClient) {}

  async getUserCards(): Promise<Card[]> {
    try {
      const response = await firstValueFrom(this.http.get<Card[]>(`${API_URL}/cards/user`));
      return response || [];
    } catch (error) {
      console.error('Error getting user cards:', error);
      return [];
    }
  }

  async claimCards(): Promise<CardClaimResponse> {
    try {
      const response = await firstValueFrom(this.http.post<CardClaimResponse>(`${API_URL}/cards/claim`, {}));
      return response;
    } catch (error) {
      console.error('Error claiming cards:', error);
      throw error;
    }
  }

  // Add more card-related methods as needed
  // getCardById(id: number): Observable<Card>
  // addCard(card: Card): Observable<Card>
  // updateCard(card: Card): Observable<Card>
  // deleteCard(id: number): Observable<void>
}
