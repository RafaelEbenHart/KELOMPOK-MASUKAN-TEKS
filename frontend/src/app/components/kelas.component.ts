import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-kelas',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    <div class="py-4">
      <h1 class="mb-3 text-center">Kelas</h1>

      <div *ngIf="loading" class="text-center">Loading...</div>
      <div *ngIf="error" class="alert alert-danger">{{ error }}</div>

      <div *ngIf="!loading && kelasList.length === 0" class="text-center text-muted">Belum ada kelas.</div>

      <div class="row g-3 mt-3">
        <div class="col-12 col-md-6" *ngFor="let k of kelasList">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">{{ k.nama_kelas }}</h5>
              <h6 class="card-subtitle mb-2 text-muted">Ruangan: {{ k.ruangan }}</h6>
              <p class="card-text" *ngIf="k.deskripsi">{{ k.deskripsi }}</p>
              <p class="small text-muted mb-0">Pengajar: {{ k.pengajar_id?.name || k.pengajar_id?.email || '-' }}</p>
              <p class="small text-muted">Dibuat: {{ k.createdAt | date:'medium' }}</p>
            </div>
            <div *ngIf="isAdmin()" class="card-footer bg-transparent border-0 d-flex gap-2">
              <button class="btn btn-sm btn-outline-primary" (click)="editKelas(k._id)">✏️ Edit</button>
              <button class="btn btn-sm btn-outline-danger" (click)="deleteKelas(k._id)">🗑️ Hapus</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .lead { color: #444; }
    .card { border-radius: 8px; }
    `
  ]
})
export class KelasComponent implements OnInit {
  kelasList: any[] = [];
  loading = false;
  error: string | null = null;

  private readonly BASE = 'http://localhost:5000/api/kelas';

  constructor(private http: HttpClient, private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.fetchKelas();
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
    this.loading = true;
    this.error = null;

    const token = this.auth.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    this.http.get<any[]>(this.BASE, { headers }).subscribe({
      next: (res) => {
        try {
          const raw = localStorage.getItem('km_user');
          const user = raw ? JSON.parse(raw) : null;
          const role = (user?.role || '').toLowerCase();
          const userId = user?._id || user?.id || null;

          if (role === 'admin') {
            this.kelasList = res;
          } else if (role === 'pengajar' && userId) {
            // filter classes where pengajar_id matches
            this.kelasList = res.filter(k => {
              const pid = k.pengajar_id?._id || k.pengajar_id;
              return pid && pid === userId;
            });
          } else {
            this.kelasList = [];
          }
        } catch (e) {
          this.error = 'Gagal memproses data kelas.';
          console.error(e);
        } finally {
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error fetching kelas:', err);
        this.error = err?.error?.message || 'Gagal memuat data kelas.';
        this.loading = false;
      }
    });
  }

  editKelas(id: string) {
    this.router.navigate(['/kelas'], { queryParams: { edit: id } });
  }

  deleteKelas(id: string) {
    if (!confirm('Hapus kelas ini?')) return;
    const token = this.auth.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined as any;
    this.http.delete(`${this.BASE}/${id}`, { headers }).subscribe({
      next: () => this.fetchKelas(),
      error: (err) => alert(err?.error?.message || 'Gagal menghapus kelas')
    });
  }
}
