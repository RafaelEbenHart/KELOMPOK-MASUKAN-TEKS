import { Routes } from '@angular/router';
import { LoginComponent } from './components/login.component';
import { DashboardComponent } from './components/dashboard.component';
import { KelasComponent } from './components/kelas.component';
import { SiswaComponent } from './components/siswa.component';
import { TambahKelasComponent } from './components/tambah-kelas.component';
import { TambahSiswaComponent } from './components/tambah-siswa.component';
import { KelasDetailComponent } from './components/kelas-detail.component';
import { EditKelasComponent } from './components/edit-kelas.component';
import { TambahJadwalComponent } from './components/tambah-jadwal.component';
import { TambahMateriComponent } from './components/tambah-materi.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'kelas', component: KelasComponent, canActivate: [AuthGuard] },
  { path: 'kelas/add', component: TambahKelasComponent, canActivate: [AuthGuard] },
  { path: 'kelas/:id/jadwal/add', component: TambahJadwalComponent, canActivate: [AuthGuard] },
  { path: 'kelas/:id/materi/add', component: TambahMateriComponent, canActivate: [AuthGuard] },
  { path: 'kelas/:id/edit', component: EditKelasComponent, canActivate: [AuthGuard] },
  { path: 'kelas/:id', component: KelasDetailComponent, canActivate: [AuthGuard] },
  { path: 'siswa', component: SiswaComponent, canActivate: [AuthGuard] },
  { path: 'siswa/add', component: TambahSiswaComponent, canActivate: [AuthGuard] },
  // fallback to login for unknown routes
  { path: '**', redirectTo: '/login' }
];
