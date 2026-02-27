import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-descripcion',
  templateUrl: './descripcion.component.html',
  styleUrls: ['./descripcion.component.css']
})
export class DescripcionComponent {

  constructor(private router: Router, private authService: AuthService) {}

  reservar() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/reservar', this.habitacion._id]);
    } else {
      this.router.navigate(['/login']);
    }
  }

}
