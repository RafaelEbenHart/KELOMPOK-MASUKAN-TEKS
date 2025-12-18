import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tambah-siswa',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
    <div class="py-4">
      <h1 class="mb-3">Tambah Siswa</h1>

      <form (ngSubmit)="submit()">
        <div class="mb-3">
          <label class="form-label">Nama</label>
          <input class="form-control" [(ngModel)]="form.nama" name="nama" required />
        </div>

        <div class="mb-3">
          <label class="form-label">Alamat</label>
          <input class="form-control" [(ngModel)]="form.alamat" name="alamat" />
        </div>

        <div class="mb-3">
          <label class="form-label">Jenis Kelamin</label>
          <select class="form-select" [(ngModel)]="form.jenis_kelamin" name="jenis_kelamin">
            <option value="">Pilih</option>
            <option value="L">L - Laki-laki</option>
            <option value="P">P - Perempuan</option>
          </select>
        </div>

        <div class="mb-3">
          <label class="form-label">Tanggal Lahir</label>
          <input type="date" class="form-control" [(ngModel)]="form.tanggal_lahir" name="tanggal_lahir" />
        </div>

        <div class="mb-3">
          <label class="form-label">Kelas (opsional)</label>
          <select class="form-select" [(ngModel)]="form.kelas" name="kelas">
            <option value="">Pilih kelas</option>
            <option *ngFor="let k of kelasList" [value]="k._id">{{ k.nama_kelas }}</option>
          </select>
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
export class TambahSiswaComponent implements OnInit {
  form: any = { nama: '', alamat: '', jenis_kelamin: '', tanggal_lahir: '', kelas: '' };
  loading = false;
  error: string | null = null;

  kelasList: any[] = [];
  private readonly BASE = 'http://localhost:5000/api/siswa';
  private readonly KELAS = 'http://localhost:5000/api/kelas';

  constructor(private http: HttpClient, private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.fetchKelas();
  }

  fetchKelas() {
    const token = this.auth.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined as any;
    this.http.get<any[]>(this.KELAS, { headers }).subscribe({
      next: (res) => {
        try {
          const raw = localStorage.getItem('km_user');
          const user = raw ? JSON.parse(raw) : null;
          const role = (user?.role || '').toLowerCase();
          const userId = user?._id || user?.id || null;

          if (role === 'admin') {
            this.kelasList = res || [];
          } else if (role === 'pengajar' && userId) {
            this.kelasList = (res || []).filter(k => {
              const pid = k.pengajar_id?._id || k.pengajar_id;
              return pid && pid === userId;
            });
          } else {
            this.kelasList = [];
          }
        } catch (e) {
          console.error('Failed processing kelas for tambah siswa', e);
          this.kelasList = res || [];
        }
      },
      error: (err) => console.error('Failed fetching kelas for tambah siswa', err)
    });
  }

  submit() {
    if (!this.form.nama) return;
    this.loading = true;
    const token = this.auth.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined as any;

    // if kelas selected, send as array (backend expects kelas as array)
    const payload: any = { ...this.form };
    if (payload.kelas) payload.kelas = [payload.kelas];

    this.http.post(this.BASE, payload, { headers }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/siswa']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Gagal menyimpan.';
      }
    });
  }

  cancel() {
    this.router.navigate(['/siswa']);
  }
}