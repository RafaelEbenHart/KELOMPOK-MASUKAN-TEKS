import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pengajar',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    <div class="py-4">
      <h1 class="mb-3">Pengajar</h1>

      <div *ngIf="loading" class="text-center">Loading...</div>
      <div *ngIf="error" class="alert alert-danger">{{ error }}</div>

      <div *ngIf="!loading && pengajarList.length === 0" class="text-center text-muted">Belum ada pengajar.</div>

      <div class="list-group mt-3">
        <div class="list-group-item d-flex justify-content-between align-items-center" *ngFor="let p of pengajarList">
          <div>
            <div class="fw-bold">{{ p.name || '-' }}</div>
            <div class="small text-muted">{{ p.email }}</div>
          </div>
          <div *ngIf="isAdmin()" class="d-flex gap-2">
            <!-- Edit route could be added later -->
            <button class="btn btn-sm btn-outline-danger" (click)="requestDelete(p._id)">
                Hapus
            </button>

          </div>
        </div>
      </div>
    </div>
  `
})
export class PengajarComponent implements OnInit {
  pengajarList: any[] = [];
  loading = false;
  error: string | null = null;

  private readonly BASE = 'http://localhost:5000/api/pengajar';

  constructor(private http: HttpClient, private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.fetchPengajar();
  }

  isAdmin() {
    try {
      const raw = localStorage.getItem('km_user');
      const user = raw ? JSON.parse(raw) : null;
      return (user?.role || '').toLowerCase() === 'admin';
    } catch (e) { return false; }
  }

  fetchPengajar() {
    this.loading = true;
    const token = this.auth.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined as any;
    this.http.get<any[]>(this.BASE, { headers }).subscribe({
      next: (res) => { this.pengajarList = res || []; this.loading = false; },
      error: (err) => { console.error(err); this.error = err?.error?.message || 'Gagal memuat pengajar.'; this.loading = false; }
    });
  }

  deletePengajar(id: string) {
    if (!confirm('Hapus pengajar ini?')) return;
    const token = this.auth.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined as any;
    this.http.delete(`${this.BASE}/${id}`, { headers }).subscribe({
      next: () => this.fetchPengajar(),
      error: (err) => alert(err?.error?.message || 'Gagal menghapus pengajar')
    });
  }
    // delete request is delegated to global confirm modal via custom event
  requestDelete(id: string) {
    const onConfirm = () => {
      const token = this.auth.getToken();
      const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined as any;
      this.http.delete(`${this.BASE}/${id}`, { headers }).subscribe({
        next: () => this.fetchPengajar(),
        error: (err) => alert(err?.error?.message || 'Gagal menghapus kelas')
      });
    };

    window.dispatchEvent(new CustomEvent('km:confirm', {
      detail: {
        title: 'Konfirmasi Hapus',
        message: 'Apakah Anda yakin ingin menghapus pengajar ini?',
        onConfirm
      }
    }));
  }
}

