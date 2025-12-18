import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.services';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./login.component.css'],
  templateUrl: './login.component.html'
})
export class LoginComponent implements AfterViewInit, OnDestroy {
  @ViewChild('snowRoot', { static: false }) snowRoot!: ElementRef<HTMLDivElement>;

  username = '';
  password = '';
  error = '';

  private _reactRoot: any = null;

  constructor(private auth: AuthService, private router: Router) {}

  ngAfterViewInit(): void {
    // mount react snow component into the container using dynamic imports
    if (typeof window === 'undefined' || !this.snowRoot) return;

    (async () => {
      try {
        const React = await import('react');
        const ReactDOMClient = await import('react-dom/client');
        const SnowModule = await import('react-snowfall');
        const Snow = (SnowModule && (SnowModule.default || SnowModule)) as any;

        const root = ReactDOMClient.createRoot(this.snowRoot.nativeElement);
        root.render(React.createElement(Snow, { color: '#fff', snowflakeCount: 80 }));
        this._reactRoot = root;
      } catch (e) {
        console.warn('Failed to initialize snow effect', e);
      }
    })();
  }

  ngOnDestroy(): void {
    if (this._reactRoot && typeof this._reactRoot.unmount === 'function') {
      this._reactRoot.unmount();
    }
  }

  login() {
    if (this.auth.login(this.username, this.password)) {
      this.router.navigate(['/dashboard']);
    } else {
      this.error = 'Username atau password salah';
    }
  }

}