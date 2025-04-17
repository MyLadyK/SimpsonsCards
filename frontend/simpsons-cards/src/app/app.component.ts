import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent
  ],
  standalone: true
})
export class AppComponent {
  title = 'Simpsons Cards';
  isAuthenticated = false;
  isAdmin = false;
  isProfile = false;

  constructor(private authService: AuthService) {
    this.updateUserState();
    // Suscríbete a cambios de autenticación para refrescar dinámicamente
    this.authService.isAuthenticated$.subscribe(() => {
      this.updateUserState();
    });
  }

  updateUserState() {
    this.isAuthenticated = !!this.authService.getToken();
    const user = this.authService.getUser();
    this.isAdmin = !!user && (user.role === 'admin' || user.isAdmin === true || user.username === 'admin');
    // isProfile se puede manejar por ruta, pero lo dejamos en false globalmente
    this.isProfile = false;
  }
}
