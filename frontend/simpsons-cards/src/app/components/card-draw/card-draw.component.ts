import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CardService } from '../../services/card.service';

@Component({
  selector: 'app-card-draw',
  templateUrl: './card-draw.component.html',
  styleUrls: ['./card-draw.component.css'],
  imports: [CommonModule, RouterModule],
  standalone: true
})
export class CardDrawComponent implements OnInit {
  cards: any[] = [];
  remainingDraws: number = 0;
  nextDrawTime: Date | null = null;
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private cardService: CardService
  ) {}

  ngOnInit(): void {
    if (!this.authService.getToken()) {
      this.router.navigate(['/login']);
      return;
    }

    this.getCards();
    this.getDrawStatus();
  }

  async drawCards() {
    if (this.remainingDraws <= 0) return;

    this.isLoading = true;
    try {
      const response = await this.cardService.claimCards();
      this.cards = response.cards;
      this.remainingDraws = 4; // Reset to 4 draws after successful claim
    } catch (error) {
      console.error('Error drawing cards:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async getCards() {
    try {
      this.cards = await this.cardService.getUserCards();
    } catch (error) {
      console.error('Error getting cards:', error);
    }
  }

  private async getDrawStatus() {
    try {
      // Aquí deberías implementar la lógica para obtener el estado de los draws
      // Por ahora, asumimos que siempre hay draws disponibles
      this.remainingDraws = 4;
      this.nextDrawTime = null;
    } catch (error) {
      console.error('Error getting draw status:', error);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
