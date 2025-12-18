import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-bg d-flex align-items-center justify-content-center">
      <div class="login-panel text-dark">
        <h2 class="text-center mb-3">Welcome</h2>

        <form (ngSubmit)="submit()">
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input class="form-control" name="email" [(ngModel)]="email" required />
          </div>

          <div class="mb-3">
            <label class="form-label">Password</label>
            <input class="form-control" type="password" name="password" [(ngModel)]="password" required />
          </div>

          <div class="d-grid gap-2">
            <button style="background-color: #4d4d4d;" class="text-white rounded btn" type="submit" [disabled]="loading">{{ loading ? 'Logging in...' : 'Login' }}</button>
          </div>

          <div *ngIf="error" class="alert alert-danger mt-3" role="alert">
            <strong>Error:</strong> {{ errorMessage }} <small *ngIf="errorStatus">(status: {{ errorStatus }})</small>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
    .login-bg {
      position: fixed;
      inset: 0; /* top:0; right:0; bottom:0; left:0 */
      background-image: url('/loginBG.png');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      padding: 3rem 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 0;
    }
    .login-panel {
      position: relative;
      z-index: 1; /* ensure panel sits above the background */
      width: 100%;
      max-width: 420px;
      background: rgba(255, 255, 255, 0.75);
      padding: 1.75rem;
      border-radius: 8px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.2);
      backdrop-filter: blur(3px);
    }
    `
  ]
})
export class LoginComponent {
  email = 'epan@gmail.com';
  password = '12345678';
  error: any = null;
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  get errorMessage() {
    return this.error?.error?.message || this.error?.message || (this.error && this.error.toString()) || null;
  }

  get errorStatus() {
    return this.error?.status || null;
  }

  submit() {
    this.error = null;
    this.loading = true;
    console.log('Submitting login for', this.email);
    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        console.log('Login success', res);
        this.loading = false;
        this.router.navigateByUrl('/dashboard');
      },
      error: (err) => {
        console.error('Login failed', err);
        this.error = err;
        this.loading = false;
      }
    });
  }
}
