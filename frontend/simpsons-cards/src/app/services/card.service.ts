import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom, catchError, of } from 'rxjs';
import { Card } from '../models/card';
import { environment } from '../../environments/environment';

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
      const response = await firstValueFrom(this.http.get<Card[]>(`${environment.apiUrl}/cards/user`));
      return response || [];
    } catch (error) {
      console.error('Error getting user cards:', error);
      return [];
    }
  }

  async claimCards(): Promise<CardClaimResponse> {
    try {
      const response = await firstValueFrom(
        this.http.post<CardClaimResponse>(`${environment.apiUrl}/cards/claim-cards`, {})
      );
      return response;
    } catch (error: any) {
      console.error('Error claiming cards:', error);
      
      if (error.status === 429) {
        return {
          message: error.error.message,
          remainingTime: error.error.remainingTime,
          cards: []
        };
      }

      throw error;
    }
  }

  // Add more card-related methods as needed
  async getCardById(id: number): Promise<Card | null> {
    try {
      const response = await firstValueFrom(this.http.get<Card>(`${environment.apiUrl}/cards/${id}`));
      return response || null;
    } catch (error) {
      console.error('Error getting card:', error);
      return null;
    }
  }

  async addCard(card: Card): Promise<Card> {
    try {
      const response = await firstValueFrom(this.http.post<Card>(`${environment.apiUrl}/cards`, card));
      return response;
    } catch (error) {
      console.error('Error adding card:', error);
      throw error;
    }
  }

  async updateCard(card: Card): Promise<Card> {
    try {
      const response = await firstValueFrom(this.http.put<Card>(`${environment.apiUrl}/cards/${card.id}`, card));
      return response;
    } catch (error) {
      console.error('Error updating card:', error);
      throw error;
    }
  }

  async deleteCard(id: number): Promise<void> {
    try {
      await firstValueFrom(this.http.delete(`${environment.apiUrl}/cards/${id}`));
    } catch (error) {
      console.error('Error deleting card:', error);
      throw error;
    }
  }
}
