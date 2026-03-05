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

export interface DashboardAdminResponse {
  mensaje: string;
  kpis: {
    totalReservas: number;
    totalPendientes: number;
    totalAprobadas: number;
    totalRechazadas: number;
    totalPagosVerificados: number;
    ingresosReales: number;
    ingresosProyectados: number;
    tasaOcupacionHoy: number;
  };
  ocupacionMensual: {
    periodo: string;
    reservas: number;
    ingresosReales: number;
    ingresosProyectados: number;
    ocupacionPromedio: number;
  }[];
}

export interface DisponibilidadMensualResponse {
  mensaje: string;
  anio: number;
  mes: number;
  totalDias: number;
  dias: {
    dia: number;
    fecha: string;
    reservas: number;
    ocupada: boolean;
  }[];
  resumen: {
    diasOcupados: number;
    diasLibres: number;
    porcentajeOcupacion: number;
    totalReservasMes: number;
  };
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

  obtenerDashboardAdmin(desde?: string, hasta?: string): Observable<DashboardAdminResponse> {
    const params = new URLSearchParams();
    if (desde) {
      params.set('desde', desde);
    }
    if (hasta) {
      params.set('hasta', hasta);
    }

    const qs = params.toString();
    const url = qs
      ? `${this.url}/admin/dashboard-reservas?${qs}`
      : `${this.url}/admin/dashboard-reservas`;

    return this.http.get<DashboardAdminResponse>(url);
  }

  obtenerDisponibilidadMensual(idHabitacion: string, anio: number, mes: number): Observable<DisponibilidadMensualResponse> {
    return this.http.get<DisponibilidadMensualResponse>(
      `${this.url}/admin/disponibilidad-mensual?idHabitacion=${encodeURIComponent(idHabitacion)}&anio=${anio}&mes=${mes}`
    );
  }

  exportarReservasCSV(estado: string, pago: string, desde?: string, hasta?: string): Observable<Blob> {
    const params = new URLSearchParams();
    if (estado) {
      params.set('estado', estado);
    }
    if (pago) {
      params.set('pago', pago);
    }
    if (desde) {
      params.set('desde', desde);
    }
    if (hasta) {
      params.set('hasta', hasta);
    }

    return this.http.get(`${this.url}/admin/exportar-reservas?${params.toString()}`, {
      responseType: 'blob'
    });
  }
}
