import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:3000/api';

@Injectable({
  providedIn: 'root'
})
export class CardsService {
  constructor(private http: HttpClient) {}

  drawCards(): Observable<any> {
    return this.http.post(`${API_URL}/cards/draw`, {});
  }

  getCards(): Observable<any> {
    return this.http.get(`${API_URL}/cards/collection`);
  }

  getDrawStatus(): Observable<any> {
    return this.http.get(`${API_URL}/cards/draw-status`);
  }
}
