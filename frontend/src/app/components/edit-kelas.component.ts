import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-edit-kelas',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
    <div class="py-4">
      <button class="btn btn-sm btn-outline-secondary mb-3" (click)="goBack()">← Kembali</button>

      <div *ngIf="loading" class="text-center">Loading...</div>
      <div *ngIf="error" class="alert alert-danger">{{ error }}</div>

      <div *ngIf="!loading && !error">
        <h3>Edit Kelas</h3>

        <div *ngIf="!isAdmin" class="alert alert-warning">Anda tidak memiliki izin untuk mengedit kelas.</div>

        <form *ngIf="isAdmin" (ngSubmit)="save()">
          <div class="mb-3">
            <label class="form-label">Nama Kelas</label>
            <input class="form-control" [(ngModel)]="model.nama_kelas" name="nama_kelas" required />
          </div>

          <div class="mb-3">
            <label class="form-label">Ruangan</label>
            <input class="form-control" [(ngModel)]="model.ruangan" name="ruangan" />
          </div>

          <div class="mb-3">
            <label class="form-label">Pengajar</label>
            <select class="form-select" [(ngModel)]="model.pengajar_id" name="pengajar_id" required>
              <option value="">Ubah Pengajar</option>
              <option *ngFor="let p of pengajarList" [value]="p._id">{{ p.name || p.email }}</option>
            </select>
            <div *ngIf="pengajarList.length === 0" class="form-text text-muted">Belum ada pengajar terdaftar.</div>
          </div>

          <div class="d-flex gap-2">
            <button class="btn btn-secondary" type="button" (click)="goBack()">Batal</button>
            <button class="btn btn-primary" [disabled]="saving">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [``]
})
export class EditKelasComponent implements OnInit {
  model: any = { nama_kelas: '', ruangan: '', deskripsi: '', pengajar_id: '' };
  pengajarList: any[] = [];
  loading = false;
  saving = false;
  error: string | null = null;
  isAdmin = false;

  private readonly BASE = 'http://localhost:5000/api/kelas';

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router, private auth: AuthService) {}

  ngOnInit() {
    // determine admin privilege from stored user (matches other components)
    try {
      const raw = localStorage.getItem('km_user');
      const user = raw ? JSON.parse(raw) : null;
      this.isAdmin = (user?.role || '').toLowerCase() === 'admin';
    } catch (e) {
      this.isAdmin = false;
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'ID kelas tidak ditemukan.';
      return;
    }

    this.loading = true;

    // fetch pengajar list (requires auth token)
    const token = this.auth.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined as any;
    this.http.get<any[]>(`http://localhost:5000/api/users`, { headers }).subscribe({
      next: (res) => {
        this.pengajarList = (res || []).filter(u => (u.role || '').toLowerCase() === 'pengajar');
      },
      error: (err) => console.error('Failed fetching pengajar list', err)
    });

    this.http.get(`${this.BASE}/${id}`, { headers }).subscribe({
      next: (k: any) => {
        // normalize pengajar id (backend may populate object)
        this.model = { ...k };
        this.model.pengajar_id = k.pengajar_id?._id || k.pengajar_id || '';
      },
      error: (err) => { this.error = err?.error?.message || 'Gagal memuat data kelas.'; console.error(err); },
      complete: () => (this.loading = false)
    });
  }

  save() {
    if (!this.isAdmin) return;
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.saving = true;
    const token = this.auth.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined as any;

    this.http.put(`${this.BASE}/${id}`, {
      nama_kelas: this.model.nama_kelas,
      ruangan: this.model.ruangan,
      deskripsi: this.model.deskripsi,
      pengajar_id: this.model.pengajar_id
    }, { headers }).subscribe({
      next: () => this.router.navigate(['/kelas', id]),
      error: (err) => { alert(err?.error?.message || 'Gagal menyimpan'); console.error(err); },
      complete: () => (this.saving = false)
    });
  }

  goBack() { this.router.navigate(['/kelas']); }
}
