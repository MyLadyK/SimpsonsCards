import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Card } from '../models/card';
import { User } from '../models/user';
import { AuthService } from './auth.service';

/**
 * Service for handling administrative operations
 * Provides methods for managing users and cards with administrative privileges
 */
@Injectable({
  providedIn: 'root'
})
export class AdminService {
  /** @private */
  constructor(private http: HttpClient, private authService: AuthService) {}

  /**
   * Retrieves a list of all users
   * @returns Observable containing array of users
   * @throws Error if request fails
   * @see /admin/users
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/api/admin/users`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Deletes a user by ID
   * @param userId The ID of the user to delete
   * @returns Observable that completes when deletion is successful
   * @throws Error if deletion fails
   * @see /admin/users/:id
   */
  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/admin/users/${userId}`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Retrieves a list of all cards
   * @returns Observable containing array of cards
   * @throws Error if request fails
   * @see /admin/cards
   */
  getCards(): Observable<Card[]> {
    return this.http.get<Card[]>(`${environment.apiUrl}/api/admin/cards`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Creates a new card
   * @param card The card data to create (FormData)
   * @returns Observable containing the created card
   * @throws Error if creation fails
   * @see /admin/cards
   */
  addCard(card: FormData): Observable<Card> {
    return this.http.post<Card>(`${environment.apiUrl}/api/admin/cards`, card, {
      headers: this.getAuthHeaders(false) // No content-type para FormData
    });
  }

  /**
   * Updates an existing card
   * @param card The card data to update
   * @returns Observable containing the updated card
   * @throws Error if update fails
   * @see /admin/cards/:id
   */
  updateCard(card: Card): Observable<Card> {
    return this.http.put<Card>(`${environment.apiUrl}/api/admin/cards/${card.id}`, card, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Deletes a card by ID
   * @param cardId The ID of the card to delete
   * @returns Observable that completes when deletion is successful
   * @throws Error if deletion fails
   * @see /admin/cards/:id
   */
  deleteCard(cardId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/admin/cards/${cardId}`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Returns HTTP headers with auth token
   * @param isJson Whether to set Content-Type as application/json
   */
  private getAuthHeaders(isJson = true): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    if (isJson) {
      headers = headers.set('Content-Type', 'application/json');
    }
    return headers;
  }
}
