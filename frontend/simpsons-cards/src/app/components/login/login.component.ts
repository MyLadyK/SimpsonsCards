import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  standalone: true
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  error: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const token = this.authService.getToken();
    if (token) {
      this.authService.getUserInfo().subscribe({
        next: (user) => {
          if (user && user.username === 'Admin') {
            this.router.navigate(['/admin']).then(() => {
              window.location.reload();
            });
          } else {
            this.router.navigate(['/profile']).then(() => {
              window.location.reload();
            });
          }
        },
        error: () => {
          this.router.navigate(['/login']);
        }
      });
    }
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.authService.login(username, password).subscribe({
        next: (response) => {
          this.authService.getUserInfo().subscribe({
            next: (user) => {
              if (user && user.username === 'Admin') {
                this.router.navigate(['/admin']).then(() => {
                  window.location.reload();
                });
              } else {
                this.router.navigate(['/profile']).then(() => {
                  window.location.reload();
                });
              }
            },
            error: () => {
              this.router.navigate(['/login']);
            }
          });
        },
        error: (error) => {
          this.error = 'Invalid username or password';
        }
      });
    }
  }
}
