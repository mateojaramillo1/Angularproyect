import { Component } from '@angular/core';
import { Habitacion } from '../interfaces/habitacion';
import { HabitacionesService } from '../services/habitaciones.service';
import { ReservaPagoService } from '../services/reserva-pago.service';
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

  public constructor(
    public servicio:HabitacionesService,
    private reservaPagoService: ReservaPagoService,
    private authService: AuthService,
    private router: Router
  ){
    
    this.servicio.buscarHabitaciones().subscribe((respuesta)=>{
      this.habitaciones=respuesta.habitaciones
    })


  }

  public reservar(habitacion: Habitacion): void {
    if (!this.authService.isLoggedIn()) {
      alert('Debes iniciar sesión para reservar.');
      this.router.navigate(['/login']);
      return;
    }

    const idHabitacion = habitacion._id || habitacion.id;
    if (!idHabitacion) {
      alert('No se encontró el identificador de la habitación.');
      return;
    }

    const hoy = new Date();
    const manana = new Date();
    manana.setDate(hoy.getDate() + 1);

    const formato = (fecha: Date) => fecha.toISOString().slice(0, 10);

    const fechainicio = prompt('Fecha de ingreso (YYYY-MM-DD):', formato(hoy));
    if (!fechainicio) {
      return;
    }

    const fechafin = prompt('Fecha de salida (YYYY-MM-DD):', formato(manana));
    if (!fechafin) {
      return;
    }

    const adultosInput = prompt('Número de adultos:', '1');
    if (!adultosInput) {
      return;
    }

    const ninosInput = prompt('Número de niños:', '0');
    if (ninosInput === null) {
      return;
    }

    const numeroadultos = Number(adultosInput);
    const numeroniños = Number(ninosInput);
    const numeropersonas = numeroadultos + numeroniños;

    if (!Number.isFinite(numeroadultos) || !Number.isFinite(numeroniños) || numeroadultos < 0 || numeroniños < 0 || numeropersonas <= 0) {
      alert('Debes ingresar números válidos para los huéspedes.');
      return;
    }

    this.procesandoReservaId = idHabitacion;

    this.reservaPagoService.iniciarPagoPse({
      idHabitacion,
      fechainicio,
      fechafin,
      numeroadultos,
      numeroniños,
      numeropersonas
    }).subscribe({
      next: (respuesta) => {
        if (respuesta?.checkoutUrl) {
          window.location.href = respuesta.checkoutUrl;
          return;
        }

        this.procesandoReservaId = null;
        alert('No fue posible obtener la URL de pago.');
      },
      error: (error) => {
        this.procesandoReservaId = null;
        const mensaje = error?.error?.mensaje || 'No fue posible iniciar el pago de la reserva.';
        alert(mensaje);
      }
    });
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
