import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.getUserInfo().pipe(
      map((user) => {
        if (user && user.username === 'Admin') {
          return true;
        }
        this.router.navigate(['/profile']);
        return false;
      }),
      catchError(() => {
        this.router.navigate(['/profile']);
        return of(false);
      })
    );
  }
}