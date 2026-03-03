import { Component, OnInit } from '@angular/core';
import { ReservaService } from '../services/reserva.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

interface MiReserva {
  _id?: string;
  nombre: string;
  apellido?: string;
  telefono: string;
  fechainicio: Date;
  fechafin: Date;
  idHabitacion: string;
  numeroadultos: number;
  numeroninos?: number;
  numeropersonas: number;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  metodoPago?: string;
  pagoVerificado?: boolean;
  precioTotal?: number;
  noches?: number;
}

@Component({
  selector: 'app-mis-reservas',
  templateUrl: './mis-reservas.component.html',
  styleUrls: ['./mis-reservas.component.css']
})
export class MisReservasComponent implements OnInit {
  reservas: MiReserva[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private reservaService: ReservaService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.cargarMisReservas();
  }

  cargarMisReservas(): void {
    this.loading = true;
    this.error = null;
    
    this.reservaService.obtenerMisReservas().subscribe({
      next: (res) => {
        this.reservas = res.reservas || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar tus reservas. Por favor, intenta de nuevo.';
        this.loading = false;
      }
    });
  }

  get reservasPendientes(): MiReserva[] {
    return this.reservas.filter(r => r.estado === 'pendiente');
  }

  get reservasAprobadas(): MiReserva[] {
    return this.reservas.filter(r => r.estado === 'aprobada');
  }

  get reservasRechazadas(): MiReserva[] {
    return this.reservas.filter(r => r.estado === 'rechazada');
  }

  getEstadoTexto(estado: string): string {
    switch (estado) {
      case 'pendiente':
        return '⏳ Pendiente de aprobación';
      case 'aprobada':
        return '✅ Reserva confirmada';
      case 'rechazada':
        return '❌ Reserva rechazada';
      default:
        return estado;
    }
  }

  getEstadoDescripcion(reserva: MiReserva): string {
    switch (reserva.estado) {
      case 'pendiente':
        if (reserva.metodoPago === 'transferencia') {
          return 'Tu reserva está pendiente. Por favor, realiza la transferencia y envía el comprobante para que podamos aprobarla.';
        }
        return 'Tu reserva está pendiente. Será aprobada una vez se verifique el pago.';
      case 'aprobada':
        return '¡Tu reserva ha sido aprobada! Te esperamos en las fechas indicadas.';
      case 'rechazada':
        return 'Lamentablemente tu reserva fue rechazada. Por favor, contáctanos para más información.';
      default:
        return '';
    }
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'pendiente':
        return 'estado-pendiente';
      case 'aprobada':
        return 'estado-aprobada';
      case 'rechazada':
        return 'estado-rechazada';
      default:
        return '';
    }
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(precio);
  }

  getMetodoPagoLabel(metodo: string | undefined): string {
    switch (metodo) {
      case 'efectivo':
        return '💵 Efectivo';
      case 'transferencia':
        return '🏦 Transferencia';
      default:
        return '❓ No especificado';
    }
  }
}
