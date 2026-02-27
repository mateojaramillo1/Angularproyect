import { Component } from '@angular/core';
import { Habitacion } from '../interfaces/habitacion';
import { HabitacionesService } from '../services/habitaciones.service';
import { ReservaService } from '../services/reserva.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-habitaciones',
  templateUrl: './habitaciones.component.html',
  styleUrls: ['./habitaciones.component.css']
})
export class HabitacionesComponent {


  public habitaciones:Habitacion[]=[]
  public procesandoReservaId: string | null = null;
  public formularioReservaId: string | null = null;
  public mensajeReserva: string = '';
  public errorReserva: string = '';

  public fechainicio: string = '';
  public fechafin: string = '';
  public numeroadultos: number = 1;
  public numeroninos: number = 0;

  public nombreUsuarioReserva: string = '';
  public telefonoUsuarioReserva: string = '';

  public constructor(
    public servicio:HabitacionesService,
    private reservaService: ReservaService,
    private authService: AuthService,
    private router: Router
  ){
    
    this.servicio.buscarHabitaciones().subscribe((respuesta)=>{
      this.habitaciones=respuesta.habitaciones
    })

    this.inicializarFechasPorDefecto();


  }

  private inicializarFechasPorDefecto(): void {
    const hoy = new Date();
    const manana = new Date();
    manana.setDate(hoy.getDate() + 1);

    this.fechainicio = this.formatearFecha(hoy);
    this.fechafin = this.formatearFecha(manana);
  }

  private formatearFecha(fecha: Date): string {
    return fecha.toISOString().slice(0, 10);
  }

  public abrirFormularioReserva(habitacion: Habitacion): void {
    this.errorReserva = '';
    this.mensajeReserva = '';

    if (!this.authService.isLoggedIn()) {
      this.errorReserva = 'Debes registrarte o iniciar sesión antes de reservar.';
      this.router.navigate(['/register']);
      return;
    }

    const usuario = this.authService.getStoredUser();
    this.nombreUsuarioReserva = [usuario?.nombre, usuario?.apellido].filter(Boolean).join(' ').trim() || 'Usuario';
    this.telefonoUsuarioReserva = usuario?.telefono || '';

    const idHabitacion = habitacion._id || habitacion.id;
    if (!idHabitacion) {
      this.errorReserva = 'No se encontró el identificador de la habitación.';
      return;
    }

    if (this.formularioReservaId === idHabitacion) {
      this.cancelarFormularioReserva();
      return;
    }

    this.formularioReservaId = idHabitacion;
    this.inicializarFechasPorDefecto();
    this.numeroadultos = 1;
    this.numeroninos = 0;
    this.mensajeReserva = `Reservarás como ${this.nombreUsuarioReserva}.`;
  }

  public reservar(habitacion: Habitacion): void {
    this.errorReserva = '';
    this.mensajeReserva = '';

    const idHabitacion = habitacion._id || habitacion.id;
    if (!idHabitacion || this.formularioReservaId !== idHabitacion) {
      this.errorReserva = 'Primero abre el formulario de reserva para esta habitación.';
      return;
    }

    const numeroadultos = Number(this.numeroadultos);
    const numeroniños = Number(this.numeroninos);
    const numeropersonas = numeroadultos + numeroniños;

    if (!Number.isFinite(numeroadultos) || !Number.isFinite(numeroniños) || numeroadultos < 0 || numeroniños < 0 || numeropersonas <= 0) {
      this.errorReserva = 'Debes ingresar números válidos para los huéspedes.';
      return;
    }

    if (!this.fechainicio || !this.fechafin) {
      this.errorReserva = 'Debes seleccionar fecha de ingreso y salida.';
      return;
    }

    if (this.fechainicio > this.fechafin) {
      this.errorReserva = 'La fecha de ingreso no puede ser mayor a la fecha de salida.';
      return;
    }

    this.procesandoReservaId = idHabitacion;

    this.reservaService.registrarReserva({
      idHabitacion,
      fechainicio: this.fechainicio,
      fechafin: this.fechafin,
      numeroadultos,
      numeroniños,
      numeropersonas,
      telefono: this.telefonoUsuarioReserva
    }).subscribe({
      next: () => {
        this.procesandoReservaId = null;
        this.mensajeReserva = 'Reserva creada correctamente.';
      },
      error: (error) => {
        this.procesandoReservaId = null;
        const mensaje = error?.error?.mensaje || 'No fue posible registrar la reserva.';
        this.errorReserva = mensaje;
      }
    });
  }

  public cancelarFormularioReserva(): void {
    this.formularioReservaId = null;
    this.errorReserva = '';
    this.mensajeReserva = '';
  }

  public getServicioIcono(servicio: string): string {
    const key = servicio?.toLowerCase().trim();

    switch (key) {
      case 'televisión':
      case 'television':
        return '📺';
      case 'aire acondicionado':
        return '❄️';
      case 'baño':
      case 'bano':
        return '🛁';
      case 'jacuzzi':
        return '🫧';
      default:
        return '✔️';
    }
  }
}
