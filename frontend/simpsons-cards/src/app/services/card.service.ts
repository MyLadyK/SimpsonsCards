import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Card } from '../models/card';
import { AuthService } from './auth.service';

export interface CardClaimResponse {
  message: string;
  remainingTime: number;
  cards: Card[];
}

@Injectable({
  providedIn: 'root'
})
export class CardService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  async getUserCards(): Promise<Card[]> {
    try {
      const token = this.authService.getToken();
      console.log('CardService - Token para getUserCards:', token);
      
      const response = await firstValueFrom(
        this.http.get<Card[]>(`${environment.apiUrl}/cards/user`, {
          headers: { Authorization: `Bearer ${token}` }
        }).pipe(
          catchError((error) => {
            console.error('CardService - Error getting user cards:', error);
            return of([]);
          })
        )
      );
      return response || [];
    } catch (error) {
      console.error('CardService - Error in getUserCards:', error);
      return [];
    }
  }

  async claimCards(): Promise<CardClaimResponse> {
    try {
      const token = this.authService.getToken();
      console.log('CardService - Token para claimCards:', token);
      
      const response = await firstValueFrom(
        this.http.post<CardClaimResponse>(
          `${environment.apiUrl}/cards/claim-cards`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        ).pipe(
          catchError((error: any) => {
            console.error('CardService - Error claiming cards:', error);
            
            if (error.status === 429) {
              return of({
                message: 'Too many requests. Please wait and try again.',
                remainingTime: error.error.remainingTime || 0,
                cards: []
              });
            }
            
            return of({
              message: error.error?.message || 'Error claiming cards',
              remainingTime: 0,
              cards: []
            });
          })
        )
      );
      
      console.log('CardService - Response from claimCards:', response);
      return response;
    } catch (error) {
      console.error('CardService - Error in claimCards:', error);
      throw error;
    }
  }

  // Add more card-related methods as needed
  async getCardById(id: number): Promise<Card | null> {
    try {
      const token = this.authService.getToken();
      console.log('CardService - Token para getCardById:', token);
      
      const response = await firstValueFrom(
        this.http.get<Card>(`${environment.apiUrl}/cards/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).pipe(
          catchError((error) => {
            console.error('CardService - Error getting card:', error);
            return of(null);
          })
        )
      );
      return response || null;
    } catch (error) {
      console.error('CardService - Error in getCardById:', error);
      return null;
    }
  }

  async addCard(card: Card): Promise<Card> {
    try {
      const token = this.authService.getToken();
      console.log('CardService - Token para addCard:', token);
      
      const response = await firstValueFrom(
        this.http.post<Card>(`${environment.apiUrl}/cards`, card, {
          headers: { Authorization: `Bearer ${token}` }
        }).pipe(
          catchError((error) => {
            console.error('CardService - Error adding card:', error);
            throw error;
          })
        )
      );
      return response;
    } catch (error) {
      console.error('CardService - Error in addCard:', error);
      throw error;
    }
  }

  async updateCard(card: Card): Promise<Card> {
    try {
      const token = this.authService.getToken();
      console.log('CardService - Token para updateCard:', token);
      
      const response = await firstValueFrom(
        this.http.put<Card>(`${environment.apiUrl}/cards/${card.id}`, card, {
          headers: { Authorization: `Bearer ${token}` }
        }).pipe(
          catchError((error) => {
            console.error('CardService - Error updating card:', error);
            throw error;
          })
        )
      );
      return response;
    } catch (error) {
      console.error('CardService - Error in updateCard:', error);
      throw error;
    }
  }

  async deleteCard(id: number): Promise<void> {
    try {
      const token = this.authService.getToken();
      console.log('CardService - Token para deleteCard:', token);
      
      await firstValueFrom(
        this.http.delete(`${environment.apiUrl}/cards/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).pipe(
          catchError((error) => {
            console.error('CardService - Error deleting card:', error);
            throw error;
          })
        )
      );
    } catch (error) {
      console.error('CardService - Error in deleteCard:', error);
      throw error;
    }
  }
}
