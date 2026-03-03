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
  filtroEstado: string = 'todos';
  filtroPago: string = 'todos';

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

  get reservasFiltradas(): Reserva[] {
    return this.reservas.filter(r => {
      const cumpleEstado = this.filtroEstado === 'todos' || r.estado === this.filtroEstado;
      const cumplePago = this.filtroPago === 'todos' || 
        (this.filtroPago === 'verificado' && r.pagoVerificado) ||
        (this.filtroPago === 'pendiente' && !r.pagoVerificado);
      return cumpleEstado && cumplePago;
    });
  }

  get totalPendientes(): number {
    return this.reservas.filter(r => r.estado === 'pendiente').length;
  }

  get totalPagosVerificados(): number {
    return this.reservas.filter(r => r.pagoVerificado).length;
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

  verificarPago(reserva: Reserva, verificado: boolean) {
    if (!reserva._id) return;
    this.reservaService.verificarPago(reserva._id, verificado).subscribe({
      next: () => {
        reserva.pagoVerificado = verificado;
      },
      error: () => {
        this.error = 'Error actualizando pago';
      }
    });
  }

  getMetodoPagoLabel(metodo: string | undefined): string {
    switch(metodo) {
      case 'efectivo': return '💵 Efectivo';
      case 'transferencia': return '🏦 Transferencia';
      default: return '❓ No especificado';
    }
  }

  getEstadoClass(estado: string): string {
    switch(estado) {
      case 'pendiente': return 'estado-pendiente';
      case 'aprobada': return 'estado-aprobada';
      case 'rechazada': return 'estado-rechazada';
      default: return '';
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
}
