import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tambah-pengajar',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
    <div class="py-4">
      <h1 class="mb-3">Tambah Pengajar</h1>

      <form (ngSubmit)="submit()">
        <div class="mb-3">
          <label class="form-label">Nama</label>
          <input class="form-control" [(ngModel)]="form.name" name="name" required />
        </div>
        <div class="mb-3">
          <label class="form-label">Email</label>
          <input type="email" class="form-control" [(ngModel)]="form.email" name="email" required />
        </div>
        <div class="mb-3">
          <label class="form-label">Password</label>
          <input type="password" class="form-control" [(ngModel)]="form.password" name="password" required />
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
export class TambahPengajarComponent {
  form: any = { name: '', email: '', password: '' };
  loading = false;
  error: string | null = null;

  private readonly BASE = 'http://localhost:5000/api/pengajar';

  constructor(private http: HttpClient, private auth: AuthService, private router: Router) {}

  submit() {
    if (!this.form.name || !this.form.email || !this.form.password) return;
    this.loading = true;
    const token = this.auth.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined as any;

    this.http.post(this.BASE, this.form, { headers }).subscribe({
      next: () => this.router.navigate(['/pengajar']),
      error: (err) => { this.error = err?.error?.message || 'Gagal menyimpan.'; this.loading = false; },
      complete: () => (this.loading = false)
    });
  }

  cancel() { this.router.navigate(['/pengajar']); }
}
