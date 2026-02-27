import { Component, OnInit } from '@angular/core';
import { ReservaService } from '../services/reserva.service';
import { Reserva } from '../interfaces/reserva';

@Component({
  selector: 'app-admin-reservas',
  templateUrl: './admin-reservas.component.html',
  styleUrls: ['./admin-reservas.component.css']
})
export class AdminReservasComponent implements OnInit {
  reservas: Reserva[] = [];
  loading = false;
  error: string | null = null;

  constructor(private reservaService: ReservaService) {}

  ngOnInit(): void {
    this.cargarReservas();
  }

  cargarReservas() {
    this.loading = true;
    this.reservaService.obtenerReservas().subscribe({
      next: (res) => {
        this.reservas = res.reservas || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error cargando reservas';
        this.loading = false;
      }
    });
  }

  cambiarEstado(reserva: Reserva, estado: string) {
    if (!reserva._id) return;
    this.reservaService.cambiarEstadoReserva(reserva._id, estado).subscribe({
      next: () => {
        reserva.estado = estado;
      },
      error: () => {
        this.error = 'Error actualizando estado';
      }
    });
  }
}
