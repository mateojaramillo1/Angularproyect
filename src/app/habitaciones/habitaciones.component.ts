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
  public mostrarDatosBancarios: boolean = false;

  public fechainicio: string = '';
  public fechafin: string = '';
  public numeroadultos: number = 1;
  public numeroninos: number = 0;

  public nombreUsuarioReserva: string = '';
  public telefonoUsuarioReserva: string = '';
  public metodoPago: string = 'efectivo';
  public habitacionSeleccionada: Habitacion | null = null;

  // Variables para verificación de disponibilidad
  public verificandoDisponibilidad: boolean = false;
  public disponibilidadVerificada: boolean = false;
  public habitacionDisponible: boolean = true;
  public fechasOcupadas: { fechainicio: Date; fechafin: Date }[] = [];

  // Datos bancarios para transferencia
  public datosBancarios = {
    banco: 'Banco de Bogotá',
    tipoCuenta: 'Cuenta de Ahorros',
    numeroCuenta: '123-456789-00',
    titular: 'Hotel Reservas S.A.S',
    nit: '900.123.456-7'
  };

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
    this.mostrarDatosBancarios = false;

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
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

    this.formularioReservaId = idHabitacion;
    this.habitacionSeleccionada = habitacion;
    this.inicializarFechasPorDefecto();
    this.numeroadultos = 1;
    this.numeroninos = 0;
    this.metodoPago = 'efectivo';
    
    // Resetear estado de disponibilidad
    this.disponibilidadVerificada = false;
    this.habitacionDisponible = true;
    this.fechasOcupadas = [];
    
    // Verificar disponibilidad automáticamente con las fechas por defecto
    this.verificarDisponibilidad();
  }

  // Método para verificar disponibilidad de la habitación
  public verificarDisponibilidad(): void {
    if (!this.habitacionSeleccionada || !this.fechainicio || !this.fechafin) {
      return;
    }

    const idHabitacion = this.habitacionSeleccionada._id || this.habitacionSeleccionada.id;
    if (!idHabitacion) return;

    this.verificandoDisponibilidad = true;
    this.errorReserva = '';

    this.reservaService.verificarDisponibilidad(idHabitacion, this.fechainicio, this.fechafin).subscribe({
      next: (respuesta) => {
        this.verificandoDisponibilidad = false;
        this.disponibilidadVerificada = true;
        this.habitacionDisponible = respuesta.disponible;
        this.fechasOcupadas = respuesta.fechasOcupadas || [];
        
        if (!respuesta.disponible) {
          this.errorReserva = '⚠️ Esta habitación no está disponible para las fechas seleccionadas. Ya existe una reserva pendiente o confirmada.';
        }
      },
      error: (error) => {
        this.verificandoDisponibilidad = false;
        this.disponibilidadVerificada = false;
        // En caso de error, permitir continuar pero advertir
        console.error('Error verificando disponibilidad:', error);
      }
    });
  }

  // Método para manejar cambio de fechas
  public onFechaChange(): void {
    this.disponibilidadVerificada = false;
    this.habitacionDisponible = true;
    this.errorReserva = '';
    
    // Verificar disponibilidad después de un pequeño delay para evitar múltiples llamadas
    if (this.fechainicio && this.fechafin && this.calcularNoches() > 0) {
      this.verificarDisponibilidad();
    }
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

    // Validar capacidad de la habitación
    if (numeropersonas > habitacion.numeropersonas) {
      this.errorReserva = `La habitación tiene capacidad máxima para ${habitacion.numeropersonas} personas. Has seleccionado ${numeropersonas}.`;
      return;
    }

    // Validar que haya al menos una noche
    if (this.calcularNoches() < 1) {
      this.errorReserva = 'Debes seleccionar al menos una noche de estadía.';
      return;
    }

    this.procesandoReservaId = idHabitacion;

    const noches = this.calcularNoches();
    const precioTotal = this.calcularPrecioTotal(habitacion);

    this.reservaService.registrarReserva({
      idHabitacion,
      fechainicio: this.fechainicio,
      fechafin: this.fechafin,
      numeroadultos,
      numeroniños,
      numeropersonas,
      telefono: this.telefonoUsuarioReserva,
      metodoPago: this.metodoPago,
      precioTotal,
      noches
    }).subscribe({
      next: (response) => {
        this.procesandoReservaId = null;
        if (this.metodoPago === 'transferencia') {
          this.mensajeReserva = '¡Reserva creada con estado PENDIENTE! Realiza la transferencia con los datos bancarios que aparecen abajo. Una vez verifiquemos el pago, tu reserva será aprobada.';
          this.mostrarDatosBancarios = true;
        } else {
          this.mensajeReserva = '¡Reserva creada con estado PENDIENTE! El pago se realiza en efectivo al momento de tu llegada. Una vez verificado, tu reserva será aprobada.';
          this.mostrarDatosBancarios = false;
        }
      },
      error: (error) => {
        this.procesandoReservaId = null;
        // Manejar error de disponibilidad específicamente
        if (error?.error?.conflicto) {
          this.errorReserva = '⚠️ ' + (error?.error?.mensaje || 'Esta habitación ya está reservada para las fechas seleccionadas.');
          this.habitacionDisponible = false;
          this.fechasOcupadas = error?.error?.fechasOcupadas || [];
        } else {
          const mensaje = error?.error?.mensaje || 'No fue posible registrar la reserva.';
          this.errorReserva = mensaje;
        }
      }
    });
  }

  public cancelarFormularioReserva(): void {
    this.formularioReservaId = null;
    this.habitacionSeleccionada = null;
    this.errorReserva = '';
    this.mensajeReserva = '';
    this.mostrarDatosBancarios = false;
  }

  public cerrarModalSiClickFuera(event: MouseEvent): void {
    // Solo cerrar si el click fue en el overlay (fondo oscuro), no en el modal
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.cancelarFormularioReserva();
    }
  }

  // Calcular número de noches entre las fechas seleccionadas
  public calcularNoches(): number {
    if (!this.fechainicio || !this.fechafin) return 0;
    const inicio = new Date(this.fechainicio);
    const fin = new Date(this.fechafin);
    const diferencia = fin.getTime() - inicio.getTime();
    const noches = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
    return noches > 0 ? noches : 0;
  }

  // Calcular precio total basado en las noches
  public calcularPrecioTotal(habitacion: Habitacion): number {
    const noches = this.calcularNoches();
    return habitacion.precio * noches;
  }

  // Obtener total de personas seleccionadas
  public getTotalPersonas(): number {
    return (Number(this.numeroadultos) || 0) + (Number(this.numeroninos) || 0);
  }

  // Verificar si la cantidad de personas excede la capacidad
  public excedeCapacidad(habitacion: Habitacion): boolean {
    return this.getTotalPersonas() > habitacion.numeropersonas;
  }

  // Obtener capacidad restante
  public getCapacidadRestante(habitacion: Habitacion): number {
    return habitacion.numeropersonas - this.getTotalPersonas();
  }

  // Formatear precio en COP
  public formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(precio);
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
