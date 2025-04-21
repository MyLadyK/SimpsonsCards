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

  // Utilidad para comparar rarezas
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
    // Solo cargar solicitudes si la oferta es del usuario actual
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
    // Depuración: mostrar la carta seleccionada para intercambio
    const selectedCard = this.myCards.find(card => card.user_card_id === this.selectedRequestCardId || card.id === this.selectedRequestCardId);
    console.log('Solicitud de intercambio: selectedCard', selectedCard);
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

  acceptRequest(offerId: number, requestId: number) {
    this.exchangeService.acceptRequest(offerId, requestId).subscribe({
      next: () => {
        this.loadRequestsForOffer(offerId);
        this.loadOffers();
        alert('Solicitud aceptada y cartas intercambiadas');
      },
      error: err => {
        alert(err?.error?.message || 'Error al aceptar la solicitud');
      }
    });
  }

  rejectRequest(offerId: number, requestId: number) {
    // La API backend no tiene endpoint explícito para rechazar, pero aceptar otra solicitud marca las demás como rechazadas.
    // Aquí solo mostramos un mensaje.
    alert('Para rechazar una solicitud, acepta otra o cancela la oferta.');
  }
}
