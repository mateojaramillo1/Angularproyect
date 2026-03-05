import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReservaService } from '../services/ReservaService';

interface Reserva {
  _id?: string;
  nombre?: string;
  apellido?: string;
  fechainicio?: Date;
  fechafin?: Date;
  idHabitacion?: string;
  digitalKey?: string;
  checkInEstado?: string;
  checkInAt?: Date;
}

@Component({
  selector: 'app-public-checkin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './public-checkin.component.html',
  styleUrls: ['./public-checkin.component.css']
})
export class PublicCheckinComponent implements OnInit {
  loading = true;
  error: string = '';
  success: string = '';
  reserva: Reserva | null = null;
  token: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reservaService: ReservaService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'];
      if (!this.token) {
        this.error = 'Token QR no válido. Por favor intenta nuevamente.';
        this.loading = false;
        return;
      }

      this.procesarCheckIn();
    });
  }

  procesarCheckIn() {
    this.loading = true;
    this.error = '';
    this.success = '';

    this.reservaService.procesarCheckIn(this.token).subscribe({
      next: (resp: any) => {
        this.loading = false;
        this.success = '✅ Check-in realizado correctamente';
        this.reserva = resp.reserva || resp;
        console.log('Check-in exitoso:', this.reserva);
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err?.error?.mensaje || 'Error al procesar check-in. Token inválido o expirado.';
        console.error('Error en check-in:', err);
      }
    });
  }

  getHoraFormato(fecha?: Date | string): string {
    if (!fecha) return '--:--';
    const date = new Date(fecha);
    return date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  getFechaFormato(fecha?: Date | string): string {
    if (!fecha) return '--/--/----';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO');
  }

  volverAInicio() {
    this.router.navigate(['/home']);
  }
}
