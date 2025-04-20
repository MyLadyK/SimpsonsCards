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

  rarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

  // Utilidad para comparar rarezas
  rarityOrder = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
  rarityValue(rarity: string): number {
    return this.rarityOrder.indexOf(rarity);
  }

  constructor(
    private exchangeService: ExchangeService,
    private adminService: AdminService,
    private authService: AuthService,
    private cardService: CardService // Inject CardService
  ) {}

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
      },
      error: err => {
        this.error = 'Error loading offers';
        this.loading = false;
      }
    });
  }

  loadMyCards() {
    this.adminService.getCards().subscribe({
      next: cards => {
        const userId = this.authService.getUserId();
        // Si el endpoint /api/admin/cards no devuelve owner_id ni user_card_id, obtenlas del endpoint correcto
        // Fallback: cargar desde CardService si estamos en modo usuario normal
        if (cards.length && cards[0].owner_id !== undefined) {
          this.myCards = cards.filter((c: any) => c.owner_id === userId);
        } else {
          // fallback: pedir a /api/cards/user
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
    // No permitir si la oferta es del propio usuario
    if (offer.user_id === this.authService.getUserId()) return false;
    // Verificar si tiene cartas que cumplen la rareza mínima
    return this.myCards.some(card => this.rarityValue(card.rarity) >= this.rarityValue(offer.min_rarity));
  }

  openRequestModal(offer: ExchangeOffer) {
    this.requestingOffer = offer;
    // Cartas válidas: cumplen rareza mínima y no son de la oferta
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
    this.exchangeService.requestExchange(this.requestingOffer.id, this.selectedRequestCardId).subscribe({
      next: () => {
        this.closeRequestModal();
        this.loadOffers();
        alert('Solicitud enviada correctamente');
      },
      error: err => {
        alert(err?.error?.message || 'Error al solicitar intercambio');
      }
    });
  }
}
