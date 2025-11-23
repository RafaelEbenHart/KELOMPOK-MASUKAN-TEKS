import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  pegawai = signal<any[]>([]);

  constructor() {
    this.loadPegawai();
  }

  async loadPegawai() {
    try {
      const res = await fetch('http://localhost:3000/api/pegawai');
      const data = await res.json();
      this.pegawai.set(data.pegawai);
      console.log('Data pegawai: ', this.pegawai());
    } catch (e) {
      console.error('Gagal mengambil data pegawai:', e);
    }
  }
}
