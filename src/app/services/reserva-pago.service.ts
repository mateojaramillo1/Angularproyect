import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface IniciarPagoReservaRequest {
  idHabitacion: string;
  fechainicio: string;
  fechafin: string;
  numeropersonas: number;
  numeroadultos: number;
  numeroniños: number;
  telefono?: string;
}

export interface IniciarPagoReservaResponse {
  mensaje: string;
  reservaId: string;
  referenciaPago: string;
  montoTotal: number;
  moneda: string;
  checkoutUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReservaPagoService {
  private readonly url = environment.apiUrl;

  constructor(private http: HttpClient) {}

  iniciarPagoPse(payload: IniciarPagoReservaRequest): Observable<IniciarPagoReservaResponse> {
    return this.http.post<IniciarPagoReservaResponse>(`${this.url}/reservas/iniciar-pago-pse`, payload);
  }
}
