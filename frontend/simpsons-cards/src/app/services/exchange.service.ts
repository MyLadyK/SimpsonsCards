import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ExchangeOffer {
  id: number;
  user_id: number;
  card_id: number;
  min_rarity: string;
  status: string;
  created_at: string;
  updated_at: string;
  card_base_id: number;
  name: string;
  character_name: string;
  image_url: string;
  rarity: string;
  username: string;
}

@Injectable({ providedIn: 'root' })
export class ExchangeService {
  private apiUrl = environment.apiUrl + '/api/exchanges';

  constructor(private http: HttpClient) {}

  getOffers(): Observable<ExchangeOffer[]> {
    return this.http.get<ExchangeOffer[]>(this.apiUrl);
  }

  createOffer(card_id: number, min_rarity: string) {
    return this.http.post(this.apiUrl, { card_id, min_rarity });
  }

  requestExchange(offerId: number, offered_card_id: number) {
    return this.http.post(`${this.apiUrl}/${offerId}/request`, { offered_card_id });
  }

  acceptRequest(offerId: number, requestId: number) {
    return this.http.post(`${this.apiUrl}/${offerId}/accept/${requestId}`, {});
  }

  cancelOffer(offerId: number) {
    return this.http.post(`${this.apiUrl}/${offerId}/cancel`, {});
  }

  // Get all requests made by the authenticated user
  getMyRequests() {
    return this.http.get<any[]>(`${this.apiUrl}/requests/mine`);
  }

  // Get all requests for a specific offer (only owner)
  getRequestsForOffer(offerId: number) {
    return this.http.get<any[]>(`${this.apiUrl}/${offerId}/requests`);
  }
}
