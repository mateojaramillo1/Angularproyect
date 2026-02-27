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
}
