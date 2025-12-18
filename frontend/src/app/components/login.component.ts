import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
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
      <div #snowRoot class="snow-overlay" aria-hidden="true"></div>
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

    /* snow overlay inside login-bg */
    .snow-overlay { position: absolute; inset: 0; z-index: 0; pointer-events: none; }

    .login-panel {
      position: relative;
      z-index: 1; /* ensure panel sits above the background and snow */
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
export class LoginComponent implements AfterViewInit, OnDestroy {
  @ViewChild('snowRoot', { static: false }) snowRoot!: ElementRef<HTMLDivElement>;

  email = 'epan@gmail.com';
  password = '12345678';
  error: any = null;
  loading = false;

  private _reactRoot: any = null;
  private _canvas?: HTMLCanvasElement;
  private _snowRafId?: number;
  private _particles: Array<any> = [];
  private _onResizeHandler: any = null;

  constructor(private auth: AuthService, private router: Router) {}

  ngAfterViewInit(): void {
    if (typeof window === 'undefined' || !this.snowRoot) return;
    console.debug('LoginComponent: initializing snow overlay');

    (async () => {
      try {
        const React = await import('react');
        const ReactDOMClient = await import('react-dom/client');
        const SnowModule = await import('react-snowfall');
        const Snow = (SnowModule && (SnowModule.default || SnowModule)) as any;

        if (!React || !ReactDOMClient || !Snow) throw new Error('React or Snow module missing');

        const root = ReactDOMClient.createRoot(this.snowRoot.nativeElement);
        root.render(React.createElement(Snow, { color: '#ffffff', snowflakeCount: 90 }));
        this._reactRoot = root;
        console.debug('LoginComponent: mounted react-snowfall');
      } catch (e) {
        console.warn('Failed to initialize react-snowfall, falling back to canvas', e);
        this._initCanvasSnow();
      }
    })();
  }

  ngOnDestroy(): void {
    if (this._reactRoot && typeof this._reactRoot.unmount === 'function') {
      try { this._reactRoot.unmount(); } catch (e) { /* ignore */ }
      this._reactRoot = null;
    }
    this._destroyCanvasSnow();
  }

  // Canvas-based snow fallback
  private _initCanvasSnow() {
    try {
      const el = this.snowRoot?.nativeElement;
      if (!el) return;

      const canvas = document.createElement('canvas');
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.display = 'block';
      canvas.style.pointerEvents = 'none';
      canvas.width = el.clientWidth;
      canvas.height = el.clientHeight;
      el.appendChild(canvas);
      this._canvas = canvas;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const count = 90;
      this._particles = [];
      for (let i = 0; i < count; i++) {
        this._particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: 1 + Math.random() * 3,
          speed: 0.5 + Math.random() * 1.5,
          drift: -0.5 + Math.random() * 1
        });
      }

      const render = () => {
        if (!this._canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.9;
        for (const p of this._particles) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
          p.y += p.speed;
          p.x += p.drift;

          if (p.y > canvas.height + 10) {
            p.y = -10;
            p.x = Math.random() * canvas.width;
          }
          if (p.x < -20) p.x = canvas.width + 20;
          if (p.x > canvas.width + 20) p.x = -20;
        }
        this._snowRafId = requestAnimationFrame(render);
      };

      // resize handler
      this._onResizeHandler = () => {
        if (!this._canvas) return;
        const rect = el.getBoundingClientRect();
        this._canvas.width = rect.width;
        this._canvas.height = rect.height;
      };
      window.addEventListener('resize', this._onResizeHandler);

      render();
      console.debug('LoginComponent: canvas snow fallback initialized');
    } catch (err) {
      console.warn('Failed to initialize canvas snow fallback', err);
    }
  }

  private _destroyCanvasSnow() {
    if (this._snowRafId) {
      cancelAnimationFrame(this._snowRafId);
      this._snowRafId = undefined;
    }
    if (this._onResizeHandler) {
      window.removeEventListener('resize', this._onResizeHandler);
      this._onResizeHandler = null;
    }
    if (this._canvas && this.snowRoot?.nativeElement.contains(this._canvas)) {
      try { this.snowRoot.nativeElement.removeChild(this._canvas); } catch (e) { /* ignore */ }
    }
    this._canvas = undefined;
    this._particles = [];
  }

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
