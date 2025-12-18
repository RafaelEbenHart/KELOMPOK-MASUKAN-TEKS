import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-kelas-detail',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    <div class="py-4">
      <button class="btn btn-sm btn-outline-secondary mb-3" (click)="goBack()">← Kembali</button>

      <div *ngIf="loading" class="text-center">Loading...</div>
      <div *ngIf="error" class="alert alert-danger">{{ error }}</div>

      <div *ngIf="kelas && !loading">
        <h2>{{ kelas.nama_kelas }}</h2>
        <p class="text-muted">Ruangan: {{ kelas.ruangan }} · Pengajar: {{ kelas.pengajar_id?.name || kelas.pengajar_id?.email || '-' }}</p>
        <p *ngIf="kelas.deskripsi">{{ kelas.deskripsi }}</p>

        <hr />

        <h4 class="d-flex align-items-center">Jadwal <button class="btn btn-sm btn-outline-success ms-2" *ngIf="canAddJadwal()" (click)="goToAddJadwal()" title="Tambah Jadwal">＋</button></h4>
        <div *ngIf="jadwal.length === 0" class="text-muted">Belum ada jadwal untuk kelas ini.</div>
        <ul class="list-group mb-3">
          <li class="list-group-item d-flex justify-content-between align-items-center" *ngFor="let j of jadwal">
            <div>
              <strong>{{ j.hari }}</strong> — {{ j.jamMulai }} WIB &ndash; {{ j.jamSelesai }} WIB
            </div>
            <div class="d-flex align-items-center">
              <span class="small text-muted">Pengajar: {{ j.pengajar?.name || j.pengajar?.email || '-' }}</span>
              <button *ngIf="canDeleteJadwal(j)" class="btn btn-sm btn-outline-danger ms-2" (click)="requestDeleteJadwal(j._id); $event.stopPropagation()">🗑️</button>
            </div>
          </li>
        </ul>

        <h4 class="d-flex align-items-center">Materi <button class="btn btn-sm btn-outline-success ms-2" *ngIf="canAddMateri()" (click)="goToAddMateri()" title="Tambah Materi">＋</button></h4>
        <div *ngIf="materi.length === 0" class="text-muted">Belum ada materi untuk kelas ini.</div>
        <ul class="list-group">
          <li class="list-group-item d-flex justify-content-between align-items-start" *ngFor="let m of materi">
            <div>
              <div class="fw-bold">{{ m.judul }}</div>
              <div class="small text-muted">{{ m.deskripsi }}</div>
            </div>
            <div class="d-flex align-items-center">
              <a class="btn btn-sm btn-outline-primary" [href]="m.file ? '/' + m.file.replace('\\\\','/') : null" *ngIf="m.file" target="_blank" rel="noopener">Buka</a>
              <button *ngIf="isAdmin()" class="btn btn-sm btn-outline-danger ms-2" (click)="requestDeleteMateri(m._id); $event.stopPropagation()">🗑️</button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: [``]
})
export class KelasDetailComponent implements OnInit {
  kelas: any = null;
  jadwal: any[] = [];
  materi: any[] = [];
  loading = false;
  error: string | null = null;

  isAdmin() {
    try {
      const raw = localStorage.getItem('km_user');
      const user = raw ? JSON.parse(raw) : null;
      return ((user?.role || '').toLowerCase() === 'admin');
    } catch (e) {
      return false;
    }
  }

  requestDeleteMateri(materiId: string) {
    window.dispatchEvent(new CustomEvent('km:confirm', {
      detail: {
        title: 'Konfirmasi Hapus Materi',
        message: 'Apakah Anda yakin ingin menghapus materi ini?',
        onConfirm: () => {
          const token = localStorage.getItem('km_token');
          const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined as any;
          this.http.delete(`${this.MATERI_API}/${materiId}`, { headers }).subscribe({
            next: () => { this.materi = (this.materi || []).filter(m => (m._id || m.id) !== materiId); },
            error: (err) => alert(err?.error?.message || 'Gagal menghapus materi')
          });
        }
      }
    }));
  }

  private readonly KELAS_API = 'http://localhost:5000/api/kelas';
  private readonly JADWAL_API = 'http://localhost:5000/api/jadwal';
  private readonly MATERI_API = 'http://localhost:5000/api/materi';

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) {}

  // only admins can add jadwal
  canAddJadwal() {
    return this.isAdmin();
  }

  // adding materi usually admin-only (backend enforces this)
  canAddMateri() {
    try {
      const raw = localStorage.getItem('km_user');
      const user = raw ? JSON.parse(raw) : null;
      return ((user?.role || '').toLowerCase() === 'admin');
    } catch (e) {
      return false;
    }
  }

  goToAddJadwal() {
    const id = this.kelas?._id || this.kelas?.id || this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.router.navigate(['/kelas', id, 'jadwal', 'add']);
  }

  goToAddMateri() {
    const id = this.kelas?._id || this.kelas?.id || this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.router.navigate(['/kelas', id, 'materi', 'add']);
  }

  ngOnInit() {
    // subscribe to route params so we reload whenever the id changes (or component is reused)
    this.route.paramMap.subscribe((pm) => {
      const id = pm.get('id');
      if (!id) {
        this.error = 'ID kelas tidak ditemukan dalam URL.';
        return;
      }

      this.loadForKelas(id);
    });
  }

  private loadForKelas(id: string) {
    this.loading = true;
    this.error = null;
    this.kelas = null;
    this.jadwal = [];
    this.materi = [];

    this.http.get(`${this.KELAS_API}/${id}`).subscribe({
      next: (k: any) => {
        this.kelas = k;

        // If backend did not populate pengajar details, try to fetch user details
        const pid = k.pengajar_id?._id || k.pengajar_id;
        if (pid && !(k.pengajar_id && k.pengajar_id.name)) {
          const token = localStorage.getItem('km_token');
          const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined as any;
          this.http.get<any>(`http://localhost:5000/api/users/${pid}`, { headers }).subscribe({
            next: (u) => { this.kelas.pengajar_id = u; },
            error: () => { /* ignore - best-effort */ }
          });
        }
      },
      error: (err) => (this.error = err?.error?.message || 'Gagal memuat data kelas.'),
      complete: () => (this.loading = false)
    });

    this.http.get<any[]>(this.JADWAL_API).subscribe({
      next: (res) => {
        const idVal = id;
        this.jadwal = (res || []).filter((j) => {
          const kid = j.kelas?._id || j.kelas;
          return kid && kid.toString() === idVal;
        });
      },
      error: (err) => console.error('Failed fetching jadwal for kelas detail', err)
    });

    this.http.get<any[]>(this.MATERI_API).subscribe({
      next: (res) => {
        const idVal = id;
        this.materi = (res || []).filter((m) => {
          const kid = m.kelas?._id || m.kelas;
          return kid && kid.toString() === idVal;
        });
      },
      error: (err) => console.error('Failed fetching materi for kelas detail', err)
    });
  }

  canDeleteJadwal(j: any) {
    try {
      const raw = localStorage.getItem('km_user');
      const user = raw ? JSON.parse(raw) : null;
      const role = (user?.role || '').toLowerCase();
      const userId = user?._id || user?.id || null;
      if (role === 'admin') return true;
      if (role === 'pengajar') {
        const pid = j.pengajar?._id || j.pengajar;
        return pid && pid === userId;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  requestDeleteJadwal(jadwalId: string) {
    window.dispatchEvent(new CustomEvent('km:confirm', {
      detail: {
        title: 'Konfirmasi Hapus Jadwal',
        message: 'Apakah Anda yakin ingin menghapus jadwal ini?',
        onConfirm: () => {
          const token = localStorage.getItem('km_token');
          const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined as any;
          this.http.delete(`${this.JADWAL_API}/${jadwalId}`, { headers }).subscribe({
            next: () => { this.jadwal = (this.jadwal || []).filter(j => (j._id || j.id) !== jadwalId); },
            error: (err) => alert(err?.error?.message || 'Gagal menghapus jadwal')
          });
        }
      }
    }));
  }

  goBack() {
    this.router.navigate(['/kelas']);
  }
}
