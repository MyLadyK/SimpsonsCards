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

  private authService = inject(AuthService);
  private cardService = inject(CardService);

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadUserCards();
  }

  private async loadUserProfile() {
    try {
      const token = this.authService.getToken();
      if (token) {
        // Here you would typically make an API call to get user profile
        // For now, we'll simulate with a basic user object
        this.user = {
          username: 'SimpsonFan',
          joinDate: new Date().toISOString()
        };
      }
    } catch (error: unknown) {
      console.error('Error loading user profile:', error);
    }
  }

  private async loadUserCards() {
    try {
      const cards$ = this.cardService.getUserCards();
      cards$.subscribe(cards => {
        this.cards = cards || [];
      });
    } catch (error: unknown) {
      console.error('Error loading user cards:', error);
    } finally {
      this.loading = false;
    }
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/';
  }
}
