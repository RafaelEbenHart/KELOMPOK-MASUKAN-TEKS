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

        <div class="mb-3">
          <label class="form-label">Foto (opsional)</label>
          <input type="file" accept="image/*" (change)="onFile($event)" class="form-control" />
          <div *ngIf="imagePreview" class="mt-2">
            <img [src]="imagePreview" alt="Preview" style="max-height:120px; max-width:100%;" />
          </div>
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
  file: File | null = null;
  imagePreview: string | null = null;
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

  onFile(e: any) {
    const f = e.target.files && e.target.files[0];
    if (f) {
      this.file = f;
      // preview
      const reader = new FileReader();
      reader.onload = (ev: any) => (this.imagePreview = ev.target.result);
      reader.readAsDataURL(f);
    } else {
      this.file = null;
      this.imagePreview = null;
    }
  }

  submit() {
    if (!this.form.nama) return;
    this.loading = true;
    const token = this.auth.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined as any;

    const fd = new FormData();
    fd.append('nama', this.form.nama);
    fd.append('alamat', this.form.alamat || '');
    fd.append('jenis_kelamin', this.form.jenis_kelamin || '');
    fd.append('tanggal_lahir', this.form.tanggal_lahir || '');

    // send kelas as array string to keep backend compatibility
    if (this.form.kelas) fd.append('kelas', JSON.stringify([this.form.kelas]));

    if (this.file) fd.append('gambar', this.file);

    this.http.post(this.BASE, fd, { headers }).subscribe({
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