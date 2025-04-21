import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { CardService } from '../services/card.service';
import { ExchangeService } from '../services/exchange.service';
import { Card } from '../models/card';
import { Router } from '@angular/router';

// HeaderComponent removed from imports because it is no longer used directly here
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  imports: [CommonModule, RouterModule, HttpClientModule, FormsModule],
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
  showOfferModal = false;
  offerCard: Card | null = null;
  offerMinRarity: string = 'Common';
  rarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
  myRequests: any[] = [];
  archivedRequests: any[] = [];
  archivedRequestsLoaded = false;
  showExchangeHistory = false;

  private authService = inject(AuthService);
  private cardService = inject(CardService);
  private exchangeService = inject(ExchangeService);
  private router = inject(Router);

  constructor() {
    // Redirect to dashboard if the user is an admin (by username)
    const user = this.authService.getUser();
    if (user && user.username && user.username.toLowerCase() === 'admin') {
      this.router.navigate(['/admin']);
    }
  }

  async ngOnInit() {
    this.loadUserProfile();
    await this.loadMyRequests();
  }

  private async loadUserProfile() {
    try {
      const token = this.authService.getToken();
      if (!token) {
        throw new Error('No token found');
      }

      // Verify if the token is valid
      if (!this.authService.isTokenValid()) {
        throw new Error('Token expired');
      }

      // Attempt to get user information from the backend
      const user = await this.authService.getUserInfo().toPromise();
      if (user && user.username) {
        this.user = {
          username: user.username
        };
      } else {
        // If we don't get data from the backend, use the token payload
        const decodedToken = this.authService.getUser();
        this.user = {
          username: decodedToken.username
        };
      }

      // Load user cards (now includes quantity)
      const cards = await this.cardService.getUserCards();
      // Ensure each card has user_card_id and owner_id
      this.cards = cards.map(card => ({
        ...card,
        user_card_id: card.user_card_id ?? card.id,
        owner_id: this.user?.id
      }));
      // Map quantities for quick access (explicit cast to number)
      this.cardQuantities = {};
      let total = 0;
      let repeated = 0;
      for (const card of this.cards) {
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

  async loadMyRequests() {
    try {
      const result = await this.exchangeService.getMyRequests().toPromise();
      this.myRequests = result ?? [];
    } catch (error) {
      console.error('Error loading my exchange requests:', error);
      this.myRequests = [];
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
          this.claimErrorMessage = 'No available cards to claim';
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
      this.claimErrorMessage = 'Error claiming cards. Please try again.';
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

  openOfferModal(card: Card, event: MouseEvent) {
    event.stopPropagation();
    this.offerCard = card;
    this.offerMinRarity = card.rarity;
    this.showOfferModal = true;
  }

  closeOfferModal() {
    this.showOfferModal = false;
    this.offerCard = null;
    this.offerMinRarity = 'Common';
  }

  confirmOffer() {
    if (!this.offerCard) return;
    // Debugging: show the card being offered
    console.log('Offer: offerCard', this.offerCard);
    // Use user_card_id if it exists, otherwise id
    const user_card_id = this.offerCard.user_card_id || this.offerCard.id;
    if (!user_card_id) {
      alert('Could not identify the card to offer');
      return;
    }
    this.exchangeService.createOffer(user_card_id, this.offerMinRarity).subscribe({
      next: () => {
        this.closeOfferModal();
        alert('Offer published in the exchange market');
      },
      error: (err) => {
        alert(err?.error?.message || 'Error publishing the offer');
      }
    });
  }

  logout() {
    this.authService.logout();
    window.location.href = '/sign-in';
  }

  async removeRequest(index: number) {
    const req = this.myRequests[index];
    if (!req) return;
    try {
      await this.exchangeService.archiveRequest(req.id).toPromise();
      this.myRequests.splice(index, 1);
    } catch (error) {
      console.error('Error archiving request:', error);
      // Optionally show a message to the user
    }
  }

  async loadArchivedRequests() {
    try {
      const result = await this.exchangeService.getMyRequests(true).toPromise();
      this.archivedRequests = (result ?? []).filter(r => r.archived);
    } catch (error) {
      console.error('Error loading archived requests:', error);
      this.archivedRequests = [];
    }
  }

  toggleExchangeHistory() {
    this.showExchangeHistory = !this.showExchangeHistory;
    if (this.showExchangeHistory && !this.archivedRequestsLoaded) {
      this.loadArchivedRequests();
      this.archivedRequestsLoaded = true;
    }
  }
}
