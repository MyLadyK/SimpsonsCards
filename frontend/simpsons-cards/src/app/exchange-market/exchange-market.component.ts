import { Component, OnInit } from '@angular/core';
import { ExchangeService, ExchangeOffer } from '../services/exchange.service';
import { AuthService } from '../services/auth.service';
import { Card } from '../models/card';
import { AdminService } from '../services/admin.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardService } from '../services/card.service'; // Import CardService

@Component({
  selector: 'app-exchange-market',
  templateUrl: './exchange-market.component.html',
  styleUrls: ['./exchange-market.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ExchangeMarketComponent implements OnInit {
  offers: ExchangeOffer[] = [];
  myCards: Card[] = [];
  loading = false;
  error: string | null = null;
  showCreate = false;
  selectedCardId: number | null = null;
  minRarity: string = 'Common';
  requestingOffer: ExchangeOffer | null = null;
  selectedRequestCardId: number | null = null;
  validRequestCards: Card[] = [];
  offerRequests: { [offerId: number]: any[] } = {};

  rarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

  // Utility to compare rarities
  rarityOrder = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
  rarityValue(rarity: string): number {
    return this.rarityOrder.indexOf(rarity);
  }

  public authService: AuthService;

  constructor(
    private exchangeService: ExchangeService,
    private adminService: AdminService,
    authService: AuthService,
    private cardService: CardService // Inject CardService
  ) {
    this.authService = authService;
  }

  ngOnInit(): void {
    this.loadOffers();
    this.loadMyCards();
  }

  loadOffers() {
    this.loading = true;
    this.exchangeService.getOffers().subscribe({
      next: offers => {
        this.offers = offers;
        this.loading = false;
        offers.forEach(offer => this.loadRequestsForOffer(offer.id));
      },
      error: err => {
        this.error = 'Error loading offers';
        this.loading = false;
      }
    });
  }

  loadRequestsForOffer(offerId: number) {
    // Only load requests if the offer belongs to the current user
    const currentUser = this.authService.getUser();
    const offer = this.offers.find(o => o.id === offerId);
    if (!offer || offer.username !== currentUser?.username) {
      this.offerRequests[offerId] = [];
      return;
    }
    this.exchangeService.getRequestsForOffer(offerId).subscribe({
      next: (requests) => {
        this.offerRequests[offerId] = requests;
      },
      error: (err) => {
        console.error('Error loading requests for offer', offerId, err);
        this.offerRequests[offerId] = [];
      }
    });
  }

  loadMyCards() {
    this.adminService.getCards().subscribe({
      next: cards => {
        const userId = this.authService.getUserId();
        // If the endpoint /api/admin/cards does not return owner_id or user_card_id, get them from the correct endpoint
        // Fallback: load from CardService if we are in normal user mode
        if (cards.length && cards[0].owner_id !== undefined) {
          this.myCards = cards.filter((c: any) => c.owner_id === userId);
        } else {
          // fallback: get from /api/cards/user
          this.cardService.getUserCards().then(userCards => {
            this.myCards = userCards;
          });
        }
      }
    });
  }

  openCreate() {
    this.showCreate = true;
  }

  closeCreate() {
    this.showCreate = false;
    this.selectedCardId = null;
    this.minRarity = 'Common';
  }

  createOffer() {
    if (!this.selectedCardId) return;
    this.exchangeService.createOffer(this.selectedCardId, this.minRarity).subscribe({
      next: () => {
        this.closeCreate();
        this.loadOffers();
      },
      error: () => {
        this.error = 'Error creating offer';
      }
    });
  }

  canRequest(offer: ExchangeOffer): boolean {
    // Do not allow if the offer belongs to the current user
    if (offer.user_id === this.authService.getUserId()) return false;
    // Check if the user has cards that meet the minimum rarity
    return this.myCards.some(card => this.rarityValue(card.rarity) >= this.rarityValue(offer.min_rarity));
  }

  openRequestModal(offer: ExchangeOffer) {
    this.requestingOffer = offer;
    // Valid cards: meet the minimum rarity and do not belong to the offer
    this.validRequestCards = this.myCards.filter(card => this.rarityValue(card.rarity) >= this.rarityValue(offer.min_rarity));
    this.selectedRequestCardId = null;
  }

  closeRequestModal() {
    this.requestingOffer = null;
    this.selectedRequestCardId = null;
    this.validRequestCards = [];
  }

  confirmRequest() {
    if (!this.requestingOffer || !this.selectedRequestCardId) return;
    // Debugging: show the selected card for exchange
    const selectedCard = this.myCards.find(card => card.user_card_id === this.selectedRequestCardId || card.id === this.selectedRequestCardId);
    console.log('Exchange request: selectedCard', selectedCard);
    this.exchangeService.requestExchange(this.requestingOffer.id, this.selectedRequestCardId).subscribe({
      next: () => {
        this.closeRequestModal();
        this.loadOffers();
        alert('Request sent successfully');
      },
      error: err => {
        alert(err?.error?.message || 'Error sending request');
      }
    });
  }

  acceptRequest(offerId: number, requestId: number) {
    this.exchangeService.acceptRequest(offerId, requestId).subscribe({
      next: () => {
        this.loadRequestsForOffer(offerId);
        this.loadOffers();
        alert('Request accepted and cards exchanged');
      },
      error: err => {
        alert(err?.error?.message || 'Error accepting request');
      }
    });
  }

  rejectRequest(offerId: number, requestId: number) {
    // The backend API does not have an explicit endpoint to reject, but accepting another request marks the others as rejected.
    // Here we only show a message.
    alert('To reject a request, accept another or cancel the offer.');
  }
}
