import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ReservaService } from '../services/reserva.service';
import { Reserva } from '../interfaces/reserva';

@Component({
  selector: 'app-descripcion',
  templateUrl: './descripcion.component.html',
  styleUrls: ['./descripcion.component.css']
})
export class DescripcionComponent {

  constructor(private router: Router, private authService: AuthService, private reservaService: ReservaService) {}

  habitacion: any = {};
  reservaPendiente = false;
  reservaAprobada = false;
  reservaRechazada = false;
  reservaActual: Reserva | null = null;

  reservar() {
    if (this.authService.isLoggedIn()) {
      const payload = {
        idHabitacion: this.habitacion._id,
        fechainicio: new Date().toISOString(),
        fechafin: new Date().toISOString(),
        numeropersonas: 1,
        numeroadultos: 1,
        numeroniños: 0,
        telefono: ''
      };
      this.reservaService.registrarReserva(payload).subscribe({
        next: (res) => {
          // Usar la reserva recién creada directamente
          this.reservaActual = res.reserva;
          this.actualizarEstadoReserva();
        }
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

  actualizarEstadoReserva() {
    if (!this.reservaActual) return;
    this.reservaPendiente = this.reservaActual.estado === 'pendiente';
    this.reservaAprobada = this.reservaActual.estado === 'aprobada';
    this.reservaRechazada = this.reservaActual.estado === 'rechazada';
  }

}
