import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Card } from '../models/card';
import { AuthService } from './auth.service';

/**
 * Service for managing card operations
 * Handles card collection, claiming, and CRUD operations
 */
export interface CardClaimResponse {
  /** Message indicating the result of the card claim */
  message: string;
  /** Time remaining before next claim attempt */
  remainingTime: number;
  /** Array of cards that were claimed */
  cards: Card[];
}

/**
 * Service for managing card operations
 * Handles card collection, claiming, and CRUD operations
 */
@Injectable({
  providedIn: 'root'
})
export class CardService {
  /** @private */
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Retrieves the user's card collection
   * @returns Promise containing array of cards
   * @throws Error if request fails
   * @see /cards/user
   */
  async getUserCards(): Promise<Card[]> {
    try {
      const token = this.authService.getToken();
      console.log('CardService - Token for getUserCards:', token);
      
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

  /**
   * Claims new cards for the user
   * @returns Promise containing claim response with claimed cards
   * @throws Error if claim fails
   * @see /cards/claim-cards
   */
  async claimCards(): Promise<CardClaimResponse> {
    try {
      const token = this.authService.getToken();
      console.log('CardService - Token for claimCards:', token);
      
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

  /**
   * Retrieves a specific card by ID
   * @param id The ID of the card to retrieve
   * @returns Promise containing the card or null if not found
   * @throws Error if request fails
   * @see /cards/:id
   */
  async getCardById(id: number): Promise<Card | null> {
    try {
      const token = this.authService.getToken();
      console.log('CardService - Token for getCardById:', token);
      
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

  /**
   * Creates a new card
   * @param card The card data to create
   * @returns Promise containing the created card
   * @throws Error if creation fails
   * @see /cards
   */
  async addCard(card: Card): Promise<Card> {
    try {
      const token = this.authService.getToken();
      console.log('CardService - Token for addCard:', token);
      
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

  /**
   * Updates an existing card
   * @param card The card data to update
   * @returns Promise containing the updated card
   * @throws Error if update fails
   * @see /cards/:id
   */
  async updateCard(card: Card): Promise<Card> {
    try {
      const token = this.authService.getToken();
      console.log('CardService - Token for updateCard:', token);
      
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

  /**
   * Deletes a card by ID
   * @param id The ID of the card to delete
   * @throws Error if deletion fails
   * @see /cards/:id
   */
  async deleteCard(id: number): Promise<void> {
    try {
      const token = this.authService.getToken();
      console.log('CardService - Token for deleteCard:', token);
      
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
