import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-edit-siswa',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
    <div class="py-4">
      <button class="btn btn-sm btn-outline-secondary mb-3" (click)="goBack()">← Kembali</button>

      <div *ngIf="loading" class="text-center">Loading...</div>
      <div *ngIf="error" class="alert alert-danger">{{ error }}</div>

      <div *ngIf="!loading && !error">
        <h3>Edit Siswa</h3>

        <div *ngIf="!isAdmin" class="alert alert-warning">Anda tidak memiliki izin untuk mengedit siswa.</div>

        <form *ngIf="isAdmin" (ngSubmit)="save()">
          <div class="mb-3">
            <label class="form-label">Nama</label>
            <input class="form-control" [(ngModel)]="model.nama" name="nama" required />
          </div>

          <div class="mb-3">
            <label class="form-label">Alamat</label>
            <input class="form-control" [(ngModel)]="model.alamat" name="alamat" />
          </div>

          <div class="mb-3">
            <label class="form-label">Jenis Kelamin</label>
            <select class="form-select" [(ngModel)]="model.jenis_kelamin" name="jenis_kelamin">
              <option value="">Pilih</option>
              <option value="L">L - Laki-laki</option>
              <option value="P">P - Perempuan</option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label">Tanggal Lahir</label>
            <input type="date" class="form-control" [(ngModel)]="model.tanggal_lahir" name="tanggal_lahir" />
          </div>

          <div class="mb-3">
            <label class="form-label">Kelas</label>
            <select class="form-select" [(ngModel)]="selectedKelas" name="kelas">
              <option value="">Pilih kelas</option>
              <option *ngFor="let k of kelasList" [value]="k._id">{{ k.nama_kelas }}</option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label">Foto (ubah)</label>
            <input type="file" accept="image/*" (change)="onFile($event)" class="form-control" />
            <div *ngIf="imagePreview" class="mt-2">
              <img [src]="imagePreview" alt="Preview" style="width:100%; height:auto; max-height:320px; object-fit:contain; display:block;" />
            </div>
            <div *ngIf="!imagePreview && model.gambar" class="mt-2">
              <img [src]="getImageUrl(model.gambar)" alt="Existing" style="width:100%; height:auto; max-height:320px; object-fit:contain; display:block;" />
            </div>
          </div>

          <div class="d-flex gap-2">
            <button class="btn btn-secondary" type="button" (click)="goBack()">Batal</button>
            <button class="btn btn-primary" [disabled]="saving">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class EditSiswaComponent implements OnInit {
  model: any = { nama: '', alamat: '', jenis_kelamin: '', tanggal_lahir: '', kelas: [] };
  kelasList: any[] = [];
  selectedKelas: string = '';
  file: File | null = null;
  imagePreview: string | null = null;

  loading = false;
  saving = false;
  error: string | null = null;
  isAdmin = false;

  private readonly BASE = 'http://localhost:5000/api/siswa';
  private readonly KELAS = 'http://localhost:5000/api/kelas';

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router, private auth: AuthService) {}

  ngOnInit() {
    // check admin
    try {
      const raw = localStorage.getItem('km_user');
      const user = raw ? JSON.parse(raw) : null;
      this.isAdmin = (user?.role || '').toLowerCase() === 'admin';
    } catch (e) {
      this.isAdmin = false;
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'ID siswa tidak ditemukan.';
      return;
    }

    this.loading = true;
    const token = this.auth.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined as any;

    // fetch kelas for selection
    this.http.get<any[]>(this.KELAS, { headers }).subscribe({
      next: (res) => this.kelasList = res || [],
      error: (err) => console.error('Failed fetching kelas for edit siswa', err)
    });

    this.http.get(`${this.BASE}/${id}`, { headers }).subscribe({
      next: (s: any) => {
        this.model = { ...s };
        // normalize kelas selection to first id if any
        if (s.kelas) {
          const arr = Array.isArray(s.kelas) ? s.kelas : [s.kelas];
          this.selectedKelas = arr[0]?._id || arr[0] || '';
        }
      },
      error: (err) => { this.error = err?.error?.message || 'Gagal memuat data siswa.'; console.error(err); },
      complete: () => (this.loading = false)
    });
  }

  onFile(e: any) {
    const f = e.target.files && e.target.files[0];
    if (f) {
      this.file = f;
      const reader = new FileReader();
      reader.onload = (ev: any) => (this.imagePreview = ev.target.result);
      reader.readAsDataURL(f);
    } else {
      this.file = null;
      this.imagePreview = null;
    }
  }

  save() {
    if (!this.isAdmin) return;
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.saving = true;
    const token = this.auth.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined as any;

    const fd = new FormData();
    fd.append('nama', this.model.nama || '');
    fd.append('alamat', this.model.alamat || '');
    fd.append('jenis_kelamin', this.model.jenis_kelamin || '');
    fd.append('tanggal_lahir', this.model.tanggal_lahir || '');
    if (this.selectedKelas) fd.append('kelas', JSON.stringify([this.selectedKelas]));
    if (this.file) fd.append('gambar', this.file);

    this.http.put(`${this.BASE}/${id}`, fd, { headers }).subscribe({
      next: () => this.router.navigate(['/siswa']),
      error: (err) => { this.error = err?.error?.message || 'Gagal menyimpan.'; console.error(err); },
      complete: () => (this.saving = false)
    });
  }

  goBack() { this.router.navigate(['/siswa']); }

  getImageUrl(path?: string) {
    if (!path) return 'https://via.placeholder.com/280x160?text=No+Photo';
    const p = path.replace(/\\/g, '/').replace(/^\//, '');
    return `http://localhost:5000/${p}`;
  }
}
