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

export interface CheckInQrResponse {
  mensaje: string;
  reservaId: string;
  token: string;
  digitalKey: string;
  qrPayload: string;
  qrDataText: string;
}

export interface CRMCliente {
  usuarioId: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  totalReservas: number;
  nochesTotales: number;
  gastoTotal: number;
  ultimaReserva: string;
  nivelFidelidad: 'bronce' | 'plata' | 'oro' | 'platino';
  descuentoSugerido: number;
}

export interface EstadisticasMarketingResponse {
  exito: boolean;
  estadisticas: {
    total: number;
    platino: number;
    oro: number;
    plata: number;
    bronce: number;
    inactivos: number;
    nuevos: number;
  };
}

export interface ClienteMarketing {
  _id: string;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  totalReservas: number;
  gastoTotal: number;
  ultimaReserva: string | null;
  diasDesdeUltima: number;
  nivel: 'bronce' | 'plata' | 'oro' | 'platino';
}

export interface ClientesSegmentoResponse {
  exito: boolean;
  segmento: string;
  total: number;
  clientes: ClienteMarketing[];
}

export interface EnviarCampaniaResponse {
  exito: boolean;
  mensaje: string;
  resultado: {
    exito: boolean;
    enviados: number;
    fallos: number;
    total: number;
  };
}

export interface VistaPreviaResponse {
  exito: boolean;
  htmlPreview: string;
  clienteEjemplo: {
    nombre: string;
    nivel: string;
    totalReservas: number;
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

  generarCheckInQR(idReserva: string): Observable<CheckInQrResponse> {
    return this.http.post<CheckInQrResponse>(`${this.url}/admin/generar-checkin-qr/${idReserva}`, {});
  }

  procesarCheckIn(token: string): Observable<any> {
    return this.http.post(`${this.url}/admin/procesar-checkin`, { token });
  }

  procesarCheckOut(token: string): Observable<any> {
    return this.http.post(`${this.url}/admin/procesar-checkout`, { token });
  }

  obtenerCRMClientes(limite: number = 40): Observable<{ mensaje: string; clientes: CRMCliente[] }> {
    return this.http.get<{ mensaje: string; clientes: CRMCliente[] }>(`${this.url}/admin/crm-clientes?limite=${limite}`);
  }

  // Marketing automatizado por segmentos CRM
  obtenerEstadisticasMarketing(): Observable<EstadisticasMarketingResponse> {
    return this.http.get<EstadisticasMarketingResponse>(`${this.url}/admin/marketing/estadisticas`);
  }

  obtenerClientesSegmento(segmento: string): Observable<ClientesSegmentoResponse> {
    return this.http.get<ClientesSegmentoResponse>(`${this.url}/admin/marketing/segmento/${segmento}`);
  }

  enviarCampaniaMarketing(
    segmento: string,
    asunto: string,
    tipoCampania: string,
    opciones?: any
  ): Observable<EnviarCampaniaResponse> {
    return this.http.post<EnviarCampaniaResponse>(`${this.url}/admin/marketing/enviar-campania`, {
      segmento,
      asunto,
      tipoCampania,
      opciones
    });
  }

  obtenerVistaPreviaMarketing(
    segmento: string,
    tipoCampania: string,
    opciones?: any
  ): Observable<VistaPreviaResponse> {
    return this.http.post<VistaPreviaResponse>(`${this.url}/admin/marketing/vista-previa`, {
      segmento,
      tipoCampania,
      opciones
    });
  }
}
