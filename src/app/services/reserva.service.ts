import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface RegistrarReservaRequest {
  idHabitacion: string;
  fechainicio: string;
  fechafin: string;
  numeropersonas: number;
  numeroadultos: number;
  numeroniños: number;
  telefono?: string;
  metodoPago?: string;
  precioTotal?: number;
  noches?: number;
}

export interface DisponibilidadResponse {
  disponible: boolean;
  mensaje: string;
  fechasOcupadas?: { fechainicio: Date; fechafin: Date }[];
}

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private readonly url = environment.apiUrl;

  constructor(private http: HttpClient) {}

  registrarReserva(payload: RegistrarReservaRequest): Observable<any> {
    return this.http.post(`${this.url}/registrarreserva`, payload);
  }

  obtenerReservas(): Observable<any> {
    return this.http.get(`${this.url}/buscarreservas`);
  }

  cambiarEstadoReserva(id: string, estado: string): Observable<any> {
    return this.http.put(`${this.url}/cambiar-estado-reserva/${id}`, { estado });
  }

  verificarPago(id: string, pagoVerificado: boolean): Observable<any> {
    return this.http.put(`${this.url}/verificar-pago/${id}`, { pagoVerificado });
  }

  // Obtener reservas del usuario actual
  obtenerMisReservas(): Observable<any> {
    return this.http.get(`${this.url}/mis-reservas`);
  }

  // Verificar disponibilidad de habitación para fechas específicas
  verificarDisponibilidad(idHabitacion: string, fechainicio: string, fechafin: string): Observable<DisponibilidadResponse> {
    return this.http.post<DisponibilidadResponse>(`${this.url}/verificar-disponibilidad`, {
      idHabitacion,
      fechainicio,
      fechafin
    });
  }
}
