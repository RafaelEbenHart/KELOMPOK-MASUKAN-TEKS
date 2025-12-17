import { Component } from '@angular/core';
import { NavbarComponent } from '../layout/navbar.component';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [NavbarComponent],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {}
