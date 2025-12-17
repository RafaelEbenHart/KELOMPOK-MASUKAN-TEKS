import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-center d-flex flex-column align-items-center justify-content-center text-center">
      <h1 class="mb-2 display-title">Welcome, {{ userName || 'User' }}</h1>

      <p class="lead mb-2 text-muted role-label" *ngIf="role">{{ roleLabel }}</p>

      <p class="lead rotating-text" [class.fade]="fade">{{ currentPhrase }}</p>
    </div>
  `,
  styles: [
    `
    .dashboard-center {
      min-height: calc(95vh - 56px);
      padding: 3rem 1rem;
      position: relative;
      overflow: hidden;
    }

    /* background image sits behind the text, centered */
    .dashboard-center::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: url('/dashboardBG.png');
      background-repeat: no-repeat;
      background-position: center;
      background-size: contain;
      z-index: 0;
      pointer-events: none;
    }

    .dashboard-center > * { position: relative; z-index: 1; }

    .display-title {
      font-size: 2.6rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .role-label {
      font-size: 1rem;
      margin-bottom: 0.5rem;
    }

    .rotating-text {
      min-height: 1.8rem;
      transition: opacity .45s ease-in-out;
      opacity: 1;
      font-weight: 600;
      font-size: 1.25rem;
    }
    .rotating-text.fade { opacity: 0; }
    `
  ]
})
export class DashboardComponent implements OnInit, OnDestroy {
  userName: string | null = null;
  role: string | null = null;
  roleLabel = '';

  phrases: string[] = [];
  currentPhrase = '';
  currentIndex = 0;
  intervalId: any = null;
  fade = false;

  private readonly ROLE_PHRASES: Record<string, string[]> = {
    admin: ['Thanks for your hardwork', 'We got lot to do!'],
    pengajar: ['Creating confidence & success', 'Teach!']
  };

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    try {
      const raw = localStorage.getItem('km_user');
      const user = raw ? JSON.parse(raw) : null;
      this.userName = user?.name || user?.username || user?.email || null;
      this.role = (user?.role || user?.jenis || user?.type || '')?.toLowerCase() || null;
      this.roleLabel = this.role ? (this.role === 'pengajar' ? 'Pengajar' : this.role.charAt(0).toUpperCase() + this.role.slice(1)) : '';

      this.phrases = this.role && this.ROLE_PHRASES[this.role] ? this.ROLE_PHRASES[this.role] : [];
      if (this.phrases.length > 0) {
        this.currentPhrase = this.phrases[0];
        this.intervalId = setInterval(() => this.rotatePhrase(), 3000);
      }
    } catch (e) {
      console.error('Failed to load user info for dashboard:', e);
    }
  }

  rotatePhrase() {
    // fade out, update text, fade in
    this.fade = true;
    setTimeout(() => {
      this.currentIndex = (this.currentIndex + 1) % this.phrases.length;
      this.currentPhrase = this.phrases[this.currentIndex];
      this.fade = false;
    }, 450);
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
