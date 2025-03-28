import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CardService } from '../../services/card.service';

@Component({
  selector: 'app-card-collection',
  templateUrl: './card-collection.component.html',
  styleUrls: ['./card-collection.component.css']
})
export class CardCollectionComponent implements OnInit {
  cards: any[] = [];
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

    this.loadCards();
  }

  async loadCards() {
    this.isLoading = true;
    try {
      this.cards = await this.cardService.getUserCards();
    } catch (error) {
      console.error('Error loading cards:', error);
    } finally {
      this.isLoading = false;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
