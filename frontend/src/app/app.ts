import { Component, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {

  // UI state used by template
  showSidebar = true;
  showLoginWarning = false;
  animateRoute = false;
  showLogoutConfirm = false;

  constructor(private router: Router, private auth: AuthService) {

    // update UI state on navigation events
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        const url = e.urlAfterRedirects || e.url;
        this.showSidebar = !url.startsWith('/login');
        this.showLoginWarning = url.startsWith('/login');

        // trigger entrance animation for routed content
        this.animateRoute = true;
        // duration slightly longer than CSS to ensure it completes
        setTimeout(() => (this.animateRoute = false), 420);
      }
    });
  }

  isAuthenticated() {
    return this.auth.isAuthenticated();
  }

  openLogoutConfirm() {
    this.showLogoutConfirm = true;
  }

  cancelLogout() {
    this.showLogoutConfirm = false;
  }

  confirmLogout() {
    this.auth.logout();
    this.showLogoutConfirm = false;
    this.router.navigateByUrl('/login');
  }

}
