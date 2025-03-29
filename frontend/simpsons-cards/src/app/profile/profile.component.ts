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
    this.loadUserProfile();
  }

  private async loadUserProfile() {
    try {
      const token = this.authService.getToken();
      if (!token) {
        throw new Error('No token found');
      }

      // Verificar si el token es válido
      if (!this.authService.isTokenValid()) {
        throw new Error('Token expired');
      }

      // Intentamos obtener la información del usuario desde el backend
      const user = await this.authService.getUserInfo().toPromise();
      if (user && user.username) {
        this.user = {
          username: user.username
        };
      } else {
        // Si no obtenemos datos del backend, usamos el payload del token
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        this.user = {
          username: payload.username
        };
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      this.user = {
        username: 'Usuario no disponible'
      };
      this.cards = [];
    } finally {
      this.loading = false;
    }
  }

  async claimCards() {
    try {
      this.showClaimError = false;
      this.showClaimSuccess = false;
      this.loading = true;

      const response = await this.cardService.claimCards();
      
      if (response.message) {
        if (response.message === 'No available cards to claim') {
          this.showClaimError = true;
          this.claimErrorMessage = 'No hay cartas disponibles para reclamar';
        } else {
          this.showClaimSuccess = true;
          this.cards = response.cards;
        }
      }
    } catch (error) {
      console.error('Error claiming cards:', error);
      this.showClaimError = true;
      this.claimErrorMessage = 'Error al reclamar cartas. Por favor, inténtalo de nuevo.';
    } finally {
      this.loading = false;
    }
  }

  async refreshCards() {
    try {
      this.loading = true;
      this.cards = await this.cardService.getUserCards();
    } catch (error) {
      console.error('Error refreshing cards:', error);
      this.cards = [];
    } finally {
      this.loading = false;
    }
  }

  logout() {
    this.authService.logout();
    window.location.href = '/sign-in';
  }
}
