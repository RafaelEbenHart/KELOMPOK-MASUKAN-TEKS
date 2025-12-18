import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tambah-kelas',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
    <div class="py-4">
      <h1 class="mb-3">Tambah Kelas</h1>

      <form (ngSubmit)="submit()">
        <div class="mb-3">
          <label class="form-label">Nama Kelas</label>
          <input class="form-control" [(ngModel)]="form.nama_kelas" name="nama_kelas" required />
        </div>
        <div class="mb-3">
          <label class="form-label">Ruangan</label>
          <select class="form-select" [(ngModel)]="form.ruangan" name="ruangan" required>
            <option value="">Pilih Ruangan</option>
            <option *ngFor="let r of ruanganOptions" [value]="r">{{ r }}</option>
          </select>
        </div>

        <div class="mb-3">
          <label class="form-label">Pengajar</label>
          <select class="form-select" [(ngModel)]="form.pengajar_id" name="pengajar_id" required>
            <option value="">Pilih pengajar</option>
            <option *ngFor="let p of pengajarList" [value]="p._id">{{ p.name || p.email }}</option>
          </select>
          <div *ngIf="pengajarList.length === 0" class="form-text text-muted">Belum ada pengajar terdaftar.</div>
        </div>

        <div class="mb-3">
          <label class="form-label">Deskripsi</label>
          <textarea class="form-control" [(ngModel)]="form.deskripsi" name="deskripsi"></textarea>
        </div>

        <div class="d-flex gap-2">
          <button class="btn btn-primary" [disabled]="loading">Simpan</button>
          <a class="btn btn-secondary" (click)="cancel()">Batal</a>
        </div>

        <div *ngIf="error" class="alert alert-danger mt-3">{{ error }}</div>
      </form>
    </div>
  `
})
export class TambahKelasComponent implements OnInit {
  form: any = { nama_kelas: '', ruangan: '', deskripsi: '', pengajar_id: '' };
  pengajarList: any[] = [];
  // allowed rooms: 1A-5A, 1B-5B, 1C-5C
  ruanganOptions: string[] = Array.from({ length: 5 }, (_, i) => `${i+1}A`).concat(Array.from({ length: 5 }, (_, i) => `${i+1}B`), Array.from({ length: 5 }, (_, i) => `${i+1}C`));
  loading = false;
  error: string | null = null;

  private readonly BASE = 'http://localhost:5000/api/kelas';

  constructor(private http: HttpClient, private auth: AuthService, private router: Router) {}

  ngOnInit() {
    // fetch pengajar list
    const token = this.auth.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined as any;
    this.http.get<any[]>(`http://localhost:5000/api/users`, { headers }).subscribe({
      next: (res) => { this.pengajarList = (res || []).filter(u => (u.role || '').toLowerCase() === 'pengajar'); },
      error: (err) => { console.error('Failed fetching pengajar list', err); }
    });
  }

  submit() {
    if (!this.form.nama_kelas || !this.form.pengajar_id) return;
    this.loading = true;
    const token = this.auth.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined as any;

    this.http.post(this.BASE, this.form, { headers }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/kelas']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Gagal menyimpan.';
      }
    });
  }

  cancel() {
    this.router.navigate(['/kelas']);
  }
}