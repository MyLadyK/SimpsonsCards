import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { CardService } from '../services/card.service';
import { Card } from '../models/card';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  imports: [CommonModule, RouterModule, HttpClientModule],
  standalone: true,
  providers: [CardService]
})
export class ProfileComponent implements OnInit {
  user: any | null = null;
  cards: Card[] = [];
  loading = true;
  showClaimError = false;
  showClaimSuccess = false;
  claimErrorMessage = '';

  private authService = inject(AuthService);
  private cardService = inject(CardService);

  ngOnInit(): void {
    this.loadUserProfile().finally(() => {
      this.loading = false;
    });
  }

  private async loadUserProfile() {
    try {
      const token = this.authService.getToken();
      if (!token) {
        throw new Error('No token found');
      }

      // Decodificar el JWT token para obtener el username
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));

      // Verificar si el payload contiene el username
      if (!payload.username) {
        throw new Error('Username not found in token');
      }

      this.user = {
        username: payload.username,
        joinDate: new Date().toISOString()
      };
    } catch (error: unknown) {
      console.error('Error loading user profile:', error);
      this.user = null;
    }
  }

  async claimCards() {
    try {
      // Primero intentamos reclamar nuevas cartas
      const response = await this.cardService.claimCards();
      
      if (response.message === 'You can only claim cards once every 8 hours') {
        this.showClaimError = true;
        this.claimErrorMessage = `You can claim cards again in ${response.remainingTime} hours`;
        setTimeout(() => {
          this.showClaimError = false;
        }, 5000);
      } else {
        // Si el reclamo fue exitoso, obtenemos las cartas actualizadas
        const cards = await this.cardService.getUserCards();
        this.cards = cards || [];
        this.showClaimSuccess = true;
        setTimeout(() => {
          this.showClaimSuccess = false;
        }, 5000);
      }
    } catch (error) {
      console.error('Error claiming cards:', error);
      this.showClaimError = true;
      this.claimErrorMessage = 'Error claiming cards. Please try again later.';
      setTimeout(() => {
        this.showClaimError = false;
      }, 5000);
    }
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/';
  }
}
