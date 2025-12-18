import { Component, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, HttpClientModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {

  // UI state used by template
  showSidebar = true;
  showLoginWarning = false;
  animateRoute = false;
  showLogoutConfirm = false;

  // Global confirm modal (used by child components via event)
  showGlobalConfirm = false;
  globalConfirmTitle = '';
  globalConfirmMessage = '';
  private globalConfirmAction: (() => void) | null = null;

  // lists for sidebar dropdowns
  kelasList: any[] = [];
  siswaList: any[] = [];

  private readonly KELAS_API = 'http://localhost:5000/api/kelas';
  private readonly SISWA_API = 'http://localhost:5000/api/siswa';

  constructor(private router: Router, private auth: AuthService, private http: HttpClient) {

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

    // fetch lists initially (if authenticated)
    if (this.auth.isAuthenticated()) {
      this.fetchKelas();
      this.fetchSiswa();
    }

    // listen for global confirm requests from child components
    window.addEventListener('km:confirm', (ev: Event) => {
      const d = (ev as CustomEvent).detail || {};
      // d: { title, message, onConfirm }
      this.showGlobalConfirm = true;
      this.globalConfirmTitle = d.title || 'Konfirmasi';
      this.globalConfirmMessage = d.message || '';
      this.globalConfirmAction = d.onConfirm || null;
    });
  }

  isAuthenticated() {
    return this.auth.isAuthenticated();
  }

  isAdmin() {
    try {
      const raw = localStorage.getItem('km_user');
      const user = raw ? JSON.parse(raw) : null;
      return (user?.role || '').toLowerCase() === 'admin';
    } catch (e) {
      return false;
    }
  }

  fetchKelas() {
    const token = this.auth.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined as any;
    this.http.get<any[]>(this.KELAS_API, { headers }).subscribe({
      next: (res) => {
        try {
          const raw = localStorage.getItem('km_user');
          const user = raw ? JSON.parse(raw) : null;
          const role = (user?.role || '').toLowerCase();
          const userId = user?._id || user?.id || null;

          if (role === 'admin') {
            this.kelasList = res || [];
          } else if (role === 'pengajar' && userId) {
            // show only classes taught by this pengajar
            this.kelasList = (res || []).filter(k => {
              const pid = k.pengajar_id?._id || k.pengajar_id;
              return pid && pid === userId;
            });
          } else {
            // other roles: empty list
            this.kelasList = [];
          }
        } catch (e) {
          console.error('Error processing kelas for sidebar', e);
          this.kelasList = res || [];
        }
      },
      error: (err) => console.error('Failed fetching kelas for sidebar', err)
    });
  }

  fetchSiswa() {
    const token = this.auth.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined as any;
    this.http.get<any[]>(this.SISWA_API, { headers }).subscribe({
      next: (res) => this.siswaList = res || [],
      error: (err) => console.error('Failed fetching siswa for sidebar', err)
    });
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

  // Global confirm modal handlers
  cancelGlobalConfirm() {
    this.showGlobalConfirm = false;
    this.globalConfirmTitle = '';
    this.globalConfirmMessage = '';
    this.globalConfirmAction = null;
  }

  confirmGlobal() {
    if (this.globalConfirmAction) {
      try {
        this.globalConfirmAction();
      } catch (e) {
        console.error('Error executing global confirm action', e);
      }
    }
    this.cancelGlobalConfirm();
  }

  // Actions exposed to template
  editKelas(id: string) {
    this.router.navigate(['/kelas'], { queryParams: { edit: id } });
  }

  deleteKelas(id: string) {
    if (!confirm('Hapus kelas ini?')) return;
    const token = this.auth.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined as any;
    this.http.delete(`${this.KELAS_API}/${id}`, { headers }).subscribe({
      next: () => this.fetchKelas(),
      error: (err) => alert(err?.error?.message || 'Gagal menghapus kelas')
    });
  }

  editSiswa(id: string) {
    this.router.navigate(['/siswa'], { queryParams: { edit: id } });
  }

  deleteSiswa(id: string) {
    if (!confirm('Hapus siswa ini?')) return;
    const token = this.auth.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined as any;
    this.http.delete(`${this.SISWA_API}/${id}`, { headers }).subscribe({
      next: () => this.fetchSiswa(),
      error: (err) => alert(err?.error?.message || 'Gagal menghapus siswa')
    });
  }

}
