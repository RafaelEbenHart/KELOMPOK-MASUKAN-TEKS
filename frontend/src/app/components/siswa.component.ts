import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-siswa',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  template: `
    <div class="py-4">
      <h1 class="mb-3 text-center">Siswa Aktif</h1>

      <!-- filter by kelas -->
      <div class="d-flex justify-content-center mb-3">
        <div class="w-50">
          <select class="form-select" [(ngModel)]="selectedKelas" (ngModelChange)="applyFilter()">
            <option *ngIf="isAdmin()" value="">Semua Kelas</option>
            <option *ngFor="let k of kelasList" [value]="k._id">{{ k.nama_kelas }}</option>
          </select>
        </div>
      </div>

      <div *ngIf="loading" class="text-center">Loading...</div>
      <div *ngIf="error" class="alert alert-danger">{{ error }}</div>

      <div *ngIf="!loading && siswaList.length === 0" class="text-center text-muted">Belum ada siswa.</div>

      <div class="list-group mt-3">
        <div class="list-group-item d-flex justify-content-between align-items-center" *ngFor="let s of siswaList">
          <div>
            <div class="fw-bold">{{ s.nama }}</div>
            <div class="small text-muted">{{ s.alamat || '-' }}</div>
            <div class="small text-muted">Kelas: {{ formatKelas(s.kelas) }}</div>
          </div>
          <div *ngIf="isAdmin()" class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-primary" (click)="editSiswa(s._id)">Edit</button>
            <button class="btn btn-sm btn-outline-danger" (click)="deleteSiswa(s._id)">Hapus</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class SiswaComponent implements OnInit {
  siswaList: any[] = [];
  allSiswa: any[] = [];
  kelasList: any[] = [];
  selectedKelas: string = '';

  loading = false;
  error: string | null = null;

  private readonly BASE = 'http://localhost:5000/api/siswa';
  private readonly KELAS = 'http://localhost:5000/api/kelas';

  constructor(private http: HttpClient, private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.fetchKelas();
    this.fetchSiswa();
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
            // admin keeps the "Semua Kelas" option (selectedKelas can be empty)
          } else if (role === 'pengajar' && userId) {
            this.kelasList = (res || []).filter(k => {
              const pid = k.pengajar_id?._id || k.pengajar_id;
              return pid && pid === userId;
            });
            // default select the first kelas for pengajar (no "Semua Kelas" option)
            if (!this.selectedKelas && this.kelasList.length > 0) {
              this.selectedKelas = this.kelasList[0]._id;
              this.applyFilter();
            }
          } else {
            this.kelasList = [];
          }
        } catch (e) {
          console.error('Failed processing kelas for siswa filter', e);
          this.kelasList = res || [];
        }
      },
      error: (err) => console.error('Failed fetching kelas for siswa filter', err)
    });
  }

  applyFilter() {
    if (!this.selectedKelas) {
      this.siswaList = this.allSiswa.slice();
      return;
    }

    this.siswaList = this.allSiswa.filter(s => {
      if (!s.kelas) return false;
      // kelas might be array of ids or array of objects
      const arr = Array.isArray(s.kelas) ? s.kelas : [s.kelas];
      return arr.some((k: any) => (k?._id || k) === this.selectedKelas);
    });
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

  fetchSiswa() {
    this.loading = true;
    const token = this.auth.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined as any;
    this.http.get<any[]>(this.BASE, { headers }).subscribe({
      next: (res) => { this.allSiswa = res || []; this.applyFilter(); this.loading = false; },
      error: (err) => { console.error(err); this.error = err?.error?.message || 'Gagal memuat siswa.'; this.loading = false; }
    });
  }

  editSiswa(id: string) {
    this.router.navigate(['/siswa'], { queryParams: { edit: id } });
  }

  deleteSiswa(id: string) {
    if (!confirm('Hapus siswa ini?')) return;
    const token = this.auth.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined as any;
    this.http.delete(`${this.BASE}/${id}`, { headers }).subscribe({
      next: () => this.fetchSiswa(),
      error: (err) => alert(err?.error?.message || 'Gagal menghapus siswa')
    });
  }

  formatKelas(kelas: any) {
    if (!kelas) return '-';
    const arr = Array.isArray(kelas) ? kelas : [kelas];
    const names = arr.map(k => (k?.nama_kelas || k?.name || k || '') ).filter(Boolean);
    return names.join(', ');
  }
}