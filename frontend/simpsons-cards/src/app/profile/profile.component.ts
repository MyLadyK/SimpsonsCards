import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { CardService } from '../services/card.service';
import { Card } from '../models/card';
import { Router } from '@angular/router';

// HeaderComponent eliminado de imports porque ya no se usa directamente aquí
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
  cardQuantities: { [cardId: number]: number } = {};
  loading = true;
  showClaimError = false;
  showClaimSuccess = false;
  claimErrorMessage = '';
  selectedCard: any = null;
  showClaimedModal = false;
  claimedCards: Card[] = [];
  totalCards: number = 0;
  repeatedCards: number = 0;

  private authService = inject(AuthService);
  private cardService = inject(CardService);
  private router = inject(Router);

  constructor() {
    // Redirigir a dashboard si el usuario es admin (por username)
    const user = this.authService.getUser();
    if (user && user.username && user.username.toLowerCase() === 'admin') {
      this.router.navigate(['/admin']);
    }
  }

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
        const decodedToken = this.authService.getUser();
        this.user = {
          username: decodedToken.username
        };
      }

      // Cargar cartas del usuario (ahora incluyen quantity)
      const cards = await this.cardService.getUserCards();
      this.cards = cards;
      // Mapear cantidades para acceso rápido (cast explícito a number)
      this.cardQuantities = {};
      let total = 0;
      let repeated = 0;
      for (const card of cards) {
        const id = card.id as number;
        const quantity = Number(card.quantity) > 0 ? Number(card.quantity) : 1;
        if (id !== undefined) {
          this.cardQuantities[id] = quantity;
          total += quantity;
          if (quantity > 1) {
            repeated += quantity - 1;
          }
        }
      }
      this.totalCards = total;
      this.repeatedCards = repeated;
      this.loading = false;
    } catch (error: any) {
      this.loading = false;
      this.showClaimError = true;
      this.claimErrorMessage = error?.message || 'Error loading profile';
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
          this.claimedCards = response.cards;
          this.showClaimedModal = true;
          await this.loadUserProfile();
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

  onCardClick(card: any) {
    this.selectedCard = card;
  }

  onCloseModal() {
    this.selectedCard = null;
  }

  closeClaimedModal() {
    this.showClaimedModal = false;
    this.claimedCards = [];
  }

  logout() {
    this.authService.logout();
    window.location.href = '/sign-in';
  }
}
