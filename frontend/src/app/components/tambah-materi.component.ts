import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-tambah-materi',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
    <div class="py-4">
      <button class="btn btn-sm btn-outline-secondary mb-3" (click)="goBack()">← Kembali</button>

      <h3>Tambah Materi</h3>

      <div *ngIf="error" class="alert alert-danger">{{ error }}</div>

      <form (ngSubmit)="submit()">
        <div class="mb-3">
          <label class="form-label">Judul</label>
          <input class="form-control" [(ngModel)]="form.judul" name="judul" required />
        </div>

        <div class="mb-3">
          <label class="form-label">Deskripsi</label>
          <textarea class="form-control" rows="4" [(ngModel)]="form.deskripsi" name="deskripsi"></textarea>
        </div>

        <div class="mb-3">
          <label class="form-label">File (opsional)</label>
          <input type="file" (change)="onFile($event)" class="form-control" />
        </div>

        <div class="d-flex gap-2">
          <button class="btn btn-secondary" type="button" (click)="goBack()">Batal</button>
          <button class="btn btn-primary" [disabled]="submitting">Simpan</button>
        </div>
      </form>
    </div>
  `
})
export class TambahMateriComponent implements OnInit {
  form: any = { judul: '', deskripsi: '' };
  file: File | null = null;
  submitting = false;
  error: string | null = null;

  private readonly BASE = 'http://localhost:5000/api/materi';

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router, private auth: AuthService) {}

  ngOnInit() {
    const kelasId = this.route.snapshot.paramMap.get('id');
    if (kelasId) this.form.kelas = kelasId;
  }

  onFile(e: any) {
    const f = e.target.files && e.target.files[0];
    this.file = f || null;
  }

  submit() {
    if (!this.form.judul || !this.form.kelas) return;
    this.submitting = true;
    const token = this.auth.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined as any;

    const fd = new FormData();
    fd.append('judul', this.form.judul);
    fd.append('deskripsi', this.form.deskripsi || '');
    fd.append('kelas', this.form.kelas);
    if (this.file) fd.append('file', this.file);

    this.http.post(this.BASE, fd, { headers }).subscribe({
      next: () => this.router.navigate(['/kelas', this.form.kelas]),
      error: (err) => { this.error = err?.error?.message || 'Gagal menambahkan materi.'; console.error(err); },
      complete: () => (this.submitting = false)
    });
  }

  goBack() { this.router.navigate(['/kelas', this.form.kelas || '']); }
}
