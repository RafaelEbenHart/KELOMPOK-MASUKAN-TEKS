import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-tambah-jadwal',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
    <div class="py-4">
      <button class="btn btn-sm btn-outline-secondary mb-3" (click)="goBack()">← Kembali</button>

      <h3>Tambah Jadwal</h3>

      <div *ngIf="error" class="alert alert-danger">{{ error }}</div>

      <div *ngIf="isAdmin; else denied">
        <form (ngSubmit)="submit()">
          <div class="mb-3">
            <label class="form-label">Hari</label>
            <select class="form-select" [(ngModel)]="form.hari" (ngModelChange)="onChange()" name="hari" required>
              <option value="">Pilih Hari</option>
              <option *ngFor="let h of hariOptions" [value]="h">{{ h }}</option>
            </select>
          </div>

          <div class="mb-3 row">
            <div class="col">
              <label class="form-label">Jam Mulai</label>
              <input class="form-control" type="time" [(ngModel)]="form.jamMulai" (ngModelChange)="onChange()" name="jamMulai" required />
            </div>
            <div class="col">
              <label class="form-label">Jam Selesai</label>
              <input class="form-control" type="time" [(ngModel)]="form.jamSelesai" (ngModelChange)="onChange()" name="jamSelesai" required />
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Pengajar (terkunci)</label>
            <select class="form-select" [(ngModel)]="form.pengajar" (ngModelChange)="onChange()" name="pengajar" required disabled>
              <option *ngIf="!pengajarList.length" value="">Pengajar tidak tersedia</option>
              <option *ngFor="let p of pengajarList" [value]="p._id">{{ p.name || p.email }}</option>
            </select>
            <div class="form-text">Pengajar di-lock sesuai yang terdaftar di kelas.</div>
          </div>

          <div class="d-flex gap-2">
            <button class="btn btn-secondary" type="button" (click)="goBack()">Batal</button>
            <button class="btn btn-primary" [disabled]="submitting">Simpan</button>
          </div>
        </form>
      </div>

      <ng-template #denied>
        <div class="alert alert-warning">Anda tidak memiliki izin untuk menambah jadwal.</div>
      </ng-template>
    </div>
  `
})
export class TambahJadwalComponent implements OnInit {
  hariOptions = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
  pengajarList: any[] = [];
  form: any = { hari: '', jamMulai: '', jamSelesai: '', pengajar: '' };
  submitting = false;
  error: string | null = null;
  isAdmin = false;  // guard UI and submission for non-admins

  private readonly BASE = 'http://localhost:5000/api/jadwal';

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router, private auth: AuthService) {}

  ngOnInit() {
    const kelasId = this.route.snapshot.paramMap.get('id');
    if (kelasId) this.form.kelas = kelasId;

    // determine admin role for access control
    try {
      const raw = localStorage.getItem('km_user');
      const user = raw ? JSON.parse(raw) : null;
      this.isAdmin = (user?.role || '').toLowerCase() === 'admin';
    } catch (e) {
      this.isAdmin = false;
    }

    const token = this.auth.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined as any;

    if (kelasId) {
      // fetch kelas to determine assigned pengajar and lock selection
      this.http.get<any>(`http://localhost:5000/api/kelas/${kelasId}`, { headers }).subscribe({
        next: (k) => {
          const pid = k.pengajar_id?._id || k.pengajar_id;
          if (pid) {
            if (k.pengajar_id?.name) {
              this.pengajarList = [k.pengajar_id];
              this.form.pengajar = pid;
            } else {
              // fetch pengajar detail
              this.http.get<any>(`http://localhost:5000/api/users/${pid}`, { headers }).subscribe({
                next: (u) => { this.pengajarList = [u]; this.form.pengajar = u._id || u.id; },
                error: () => { this.pengajarList = []; }
              });
            }
          }
        },
        error: (err) => { console.error('Failed fetching kelas for pengajar lock', err); }
      });
    }
  }

  submit() {
    if (!this.isAdmin) { this.error = 'Anda tidak memiliki izin.'; return; }
    if (!this.form.hari || !this.form.jamMulai || !this.form.jamSelesai || !this.form.pengajar || !this.form.kelas) return;
    this.submitting = true;
    const token = this.auth.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined as any;

    this.http.post(this.BASE, {
      hari: this.form.hari,
      jamMulai: this.form.jamMulai,
      jamSelesai: this.form.jamSelesai,
      pengajar: this.form.pengajar,
      kelas: this.form.kelas
    }, { headers }).subscribe({
      next: () => this.router.navigate(['/kelas', this.form.kelas]),
      error: (err) => { this.error = err?.error?.message || 'Gagal menambahkan jadwal.'; console.error(err); this.submitting = false; },
      complete: () => (this.submitting = false)
    });
  }

  goBack() { this.router.navigate(['/kelas', this.form.kelas || '']); }

  // Clear error and allow re-submit when user changes input after a failure
  onChange() {
    this.error = null;
    this.submitting = false;
  }
}
