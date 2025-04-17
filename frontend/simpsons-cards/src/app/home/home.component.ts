import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [CommonModule, RouterModule],
  standalone: true
})
export class HomeComponent {
  isAuthenticated = false;

  // Haz router público para usarlo en el template
  constructor(public router: Router, private authService: AuthService) {
    this.isAuthenticated = !!this.authService.getToken();
    // Si quieres actualización en tiempo real:
    // this.authService.isAuthenticated$.subscribe(val => this.isAuthenticated = val);
  }

  goToSignIn() {
    if (this.isAuthenticated) {
      const user = this.authService.getUser();
      if (user && (user.role === 'admin' || user.isAdmin === true || user.username === 'admin')) {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/profile']);
      }
    } else {
      this.router.navigate(['/sign-in']);
    }
  }

  goToSignUp() {
    if (this.isAuthenticated) {
      const user = this.authService.getUser();
      if (user && (user.role === 'admin' || user.isAdmin === true || user.username === 'admin')) {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/profile']);
      }
    } else {
      this.router.navigate(['/sign-up']);
    }
  }

  logout() {
    this.authService.logout();
    this.isAuthenticated = false;
    this.router.navigate(['/']);
  }
}
