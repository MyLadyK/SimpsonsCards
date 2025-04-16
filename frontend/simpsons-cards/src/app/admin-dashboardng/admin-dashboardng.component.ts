import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../services/admin.service';
import { Card } from '../models/card';
import { User } from '../models/user';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms'; 
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-admin-dashboardng',
  templateUrl: './admin-dashboardng.component.html',
  styleUrls: ['./admin-dashboardng.component.css'],
  imports: [CommonModule, RouterModule, FormsModule],
  standalone: true
})
export class AdminDashboardngComponent implements OnInit {
  public environment = environment;
  users: User[] = [];
  cards: Card[] = [];
  selectedTab = 'users';
  loading = true;
  error: string | null = null;
  editCardId: number | null = null;
  editCard: Card | null = null;
  imageModalOpen = false;
  imageModalUrl: string | null = null;
  imageModalTitle: string | null = null;
  modalDescription: string = '';
  modalCardId: number | null = null;
  modalDescSaved: boolean = false;
  showAddCardForm = false;
  newCard: Card = {
    name: '',
    character_name: '',
    image_url: '',
    description: '',
    rarity: 'Common'
  };
  addCardSuccess = false;
  addCardError: string | null = null;

  constructor(
    private adminService: AdminService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.loadCards();
  }

  loadUsers() {
    this.loading = true;
    this.error = null;
    this.adminService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.error = 'Error loading users';
        this.loading = false;
      }
    });
  }

  loadCards() {
    this.loading = true;
    this.error = null;
    this.adminService.getCards().subscribe({
      next: (cards) => {
        this.cards = cards;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading cards:', error);
        this.error = 'Error loading cards';
        this.loading = false;
      }
    });
  }

  deleteUser(userId: number) {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      this.adminService.deleteUser(userId).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.error = 'Error deleting user';
        }
      });
    }
  }

  deleteCard(cardId: number | undefined) {
    if (cardId === undefined) return;
    if (confirm('¿Estás seguro de que quieres eliminar esta carta?')) {
      this.adminService.deleteCard(cardId).subscribe({
        next: () => {
          this.loadCards();
        },
        error: (error) => {
          console.error('Error deleting card:', error);
          this.error = 'Error deleting card';
        }
      });
    }
  }

  startEditCard(card: Card) {
    this.editCardId = card.id ?? null;
    // Copia profunda para evitar modificar el array hasta guardar
    this.editCard = { ...card };
  }

  saveEditCard() {
    if (!this.editCard) return;
    this.adminService.updateCard(this.editCard).subscribe({
      next: (updatedCard) => {
        this.editCardId = null;
        this.editCard = null;
        this.loadCards();
      },
      error: (error) => {
        console.error('Error updating card:', error);
        this.error = 'Error updating card';
      }
    });
  }

  cancelEditCard() {
    this.editCardId = null;
    this.editCard = null;
  }

  onTabChange(tab: string) {
    this.selectedTab = tab;
  }

  logout() {
    this.authService.logout();
    window.location.href = '/login';
  }

  // Modal para mostrar imagen grande
  showImageModal(url: string, title: string) {
    const card = this.cards.find(c => c.image_url === url && c.name === title);
    this.imageModalUrl = url;
    this.imageModalTitle = title;
    this.imageModalOpen = true;
    this.modalDescSaved = false;
    if (card) {
      this.modalDescription = card.description;
      this.modalCardId = card.id ?? null;
    } else {
      this.modalDescription = '';
      this.modalCardId = null;
    }
  }

  closeImageModal() {
    this.imageModalOpen = false;
    this.imageModalUrl = null;
    this.imageModalTitle = null;
    this.modalDescription = '';
    this.modalCardId = null;
    this.modalDescSaved = false;
  }

  saveModalDescription() {
    if (this.modalCardId != null) {
      const card = this.cards.find(c => c.id === this.modalCardId);
      if (card) {
        const updatedCard = { ...card, description: this.modalDescription };
        this.adminService.updateCard(updatedCard).subscribe({
          next: () => {
            this.loadCards();
            this.modalDescSaved = true;
          },
          error: (error) => {
            console.error('Error updating description:', error);
            this.error = 'Error updating description';
          }
        });
      }
    }
  }

  toggleAddCardForm() {
    this.showAddCardForm = !this.showAddCardForm;
    this.addCardSuccess = false;
    this.addCardError = null;
    if (this.showAddCardForm) {
      this.newCard = {
        name: '',
        character_name: '',
        image_url: '',
        description: '',
        rarity: 'Common'
      };
    }
  }

  addCard() {
    this.addCardSuccess = false;
    this.addCardError = null;
    this.adminService.addCard(this.newCard).subscribe({
      next: () => {
        this.addCardSuccess = true;
        this.loadCards();
        this.toggleAddCardForm();
      },
      error: (error) => {
        console.error('Error adding card:', error);
        this.addCardError = 'Error adding card';
      }
    });
  }
}
