import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports: [CommonModule],
  standalone: true
})
export class HeaderComponent {
  @Input() isAdmin = false;
  @Input() isProfile = false;
  @Input() isAuthenticated = false;

  constructor(public router: Router) {}

  goTo(path: string) {
    // If the destination is '/profile' and the user is an admin, redirect to /admin
    if (path === '/profile' && this.isAdmin) {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate([path]);
    }
  }
}
