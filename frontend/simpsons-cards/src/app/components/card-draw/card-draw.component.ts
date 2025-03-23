import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CardsService } from '../../services/cards.service';

@Component({
  selector: 'app-card-draw',
  templateUrl: './card-draw.component.html',
  styleUrls: ['./card-draw.component.css']
})
export class CardDrawComponent implements OnInit {
  cards: any[] = [];
  remainingDraws: number = 0;
  nextDrawTime: Date | null = null;
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private cardsService: CardsService
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
      const response = await this.cardsService.drawCards().toPromise();
      this.cards = response.cards;
      this.remainingDraws = response.remainingDraws;
    } catch (error) {
      console.error('Error drawing cards:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async getCards() {
    try {
      this.cards = await this.cardsService.getCards().toPromise();
    } catch (error) {
      console.error('Error fetching cards:', error);
    }
  }

  private async getDrawStatus() {
    try {
      const status = await this.cardsService.getDrawStatus().toPromise();
      this.remainingDraws = status.remainingDraws;
      this.nextDrawTime = status.nextDrawTime;
    } catch (error) {
      console.error('Error fetching draw status:', error);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
