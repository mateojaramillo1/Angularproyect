import { Component, OnInit } from '@angular/core';
import { ReservaService } from '../services/reserva.service';
import { Reserva } from '../interfaces/reserva';
import { HabitacionesService } from '../services/habitaciones.service';

interface DashboardKpis {
  totalReservas: number;
  totalPendientes: number;
  totalAprobadas: number;
  totalRechazadas: number;
  totalPagosVerificados: number;
  ingresosReales: number;
  ingresosProyectados: number;
  tasaOcupacionHoy: number;
}

interface SerieMensual {
  periodo: string;
  reservas: number;
  ingresosReales: number;
  ingresosProyectados: number;
  ocupacionPromedio: number;
}

interface DiaCalendario {
  dia: number;
  ocupada: boolean;
  reservas: number;
  esPlaceholder?: boolean;
}

@Component({
  selector: 'app-admin-reservas',
  templateUrl: './admin-reservas.component.html',
  styleUrls: ['./admin-reservas.component.css']
})
export class AdminReservasComponent implements OnInit {
  reservas: Reserva[] = [];
  habitaciones: any[] = [];
  loading = false;
  loadingDashboard = false;
  loadingDisponibilidad = false;
  error: string | null = null;
  filtroEstado: string = 'todos';
  filtroPago: string = 'todos';
  filtroDesde: string = '';
  filtroHasta: string = '';

  dashboardKpis: DashboardKpis = {
    totalReservas: 0,
    totalPendientes: 0,
    totalAprobadas: 0,
    totalRechazadas: 0,
    totalPagosVerificados: 0,
    ingresosReales: 0,
    ingresosProyectados: 0,
    tasaOcupacionHoy: 0
  };
  ocupacionMensual: SerieMensual[] = [];

  habitacionSeleccionada: string = '';
  mesCalendario: string = this.getMesActualInput();
  calendarioDias: DiaCalendario[] = [];
  resumenDisponibilidad = {
    diasOcupados: 0,
    diasLibres: 0,
    porcentajeOcupacion: 0,
    totalReservasMes: 0
  };

  constructor(
    private reservaService: ReservaService,
    private habitacionesService: HabitacionesService
  ) {}

  ngOnInit(): void {
    this.cargarReservas();
    this.cargarHabitaciones();
    this.cargarDashboard();
  }

  cargarReservas() {
    this.error = null;
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

  cargarHabitaciones() {
    this.habitacionesService.buscarHabitaciones().subscribe({
      next: (res) => {
        this.habitaciones = res.habitaciones || [];
        if (!this.habitacionSeleccionada && this.habitaciones.length > 0) {
          this.habitacionSeleccionada = this.habitaciones[0]._id;
          this.cargarDisponibilidadMensual();
        }
      },
      error: () => {
        this.error = 'Error cargando habitaciones para disponibilidad';
      }
    });
  }

  cargarDashboard() {
    this.loadingDashboard = true;
    this.reservaService.obtenerDashboardAdmin(this.filtroDesde, this.filtroHasta).subscribe({
      next: (res) => {
        this.dashboardKpis = res.kpis;
        this.ocupacionMensual = res.ocupacionMensual || [];
        this.loadingDashboard = false;
      },
      error: () => {
        this.loadingDashboard = false;
        this.error = 'Error cargando dashboard analitico';
      }
    });
  }

  cargarDisponibilidadMensual() {
    if (!this.habitacionSeleccionada || !this.mesCalendario) {
      return;
    }

    const [anioStr, mesStr] = this.mesCalendario.split('-');
    const anio = Number(anioStr);
    const mes = Number(mesStr);
    if (!anio || !mes) {
      return;
    }

    this.loadingDisponibilidad = true;
    this.reservaService.obtenerDisponibilidadMensual(this.habitacionSeleccionada, anio, mes).subscribe({
      next: (res) => {
        this.resumenDisponibilidad = res.resumen;
        this.calendarioDias = this.construirCalendario(res.dias, anio, mes);
        this.loadingDisponibilidad = false;
      },
      error: () => {
        this.loadingDisponibilidad = false;
        this.error = 'Error cargando disponibilidad mensual';
      }
    });
  }

  actualizarPanelCompleto() {
    this.cargarReservas();
    this.cargarDashboard();
    this.cargarDisponibilidadMensual();
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

  get maxIngresosMensuales(): number {
    const max = Math.max(
      ...this.ocupacionMensual.map(item => Math.max(item.ingresosReales, item.ingresosProyectados)),
      1
    );
    return max;
  }

  get nombreHabitacionSeleccionada(): string {
    const habitacion = this.habitaciones.find(h => h._id === this.habitacionSeleccionada);
    return habitacion?.nombre || 'Habitacion';
  }

  altoBarra(valor: number): number {
    return Math.max(8, Math.round((valor / this.maxIngresosMensuales) * 100));
  }

  exportarExcel() {
    this.reservaService
      .exportarReservasCSV(this.filtroEstado, this.filtroPago, this.filtroDesde, this.filtroHasta)
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `reporte-reservas-${new Date().toISOString().slice(0, 10)}.csv`;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: () => {
          this.error = 'No se pudo exportar el reporte en CSV';
        }
      });
  }

  exportarPDF() {
    const filas = this.reservasFiltradas.slice(0, 40).map((r) => `
      <tr>
        <td>${r.nombre} ${r.apellidos || ''}</td>
        <td>${r.idHabitacion}</td>
        <td>${new Date(r.fechainicio).toLocaleDateString('es-CO')}</td>
        <td>${new Date(r.fechafin).toLocaleDateString('es-CO')}</td>
        <td>${r.estado}</td>
        <td>${this.formatearPrecio(r.precioTotal || 0)}</td>
      </tr>
    `).join('');

    const html = `
      <html>
        <head>
          <title>Reporte de Reservas</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #1f2937; }
            h1 { margin-bottom: 6px; }
            .meta { margin-bottom: 16px; }
            .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px; }
            .kpi { border: 1px solid #dbe2ff; border-radius: 8px; padding: 10px; background: #f7f9ff; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #d1d5db; padding: 6px; text-align: left; }
            th { background: #eef2ff; }
          </style>
        </head>
        <body>
          <h1>Reporte de Reservas</h1>
          <div class="meta">Generado: ${new Date().toLocaleString('es-CO')}</div>
          <div class="kpis">
            <div class="kpi"><strong>Total</strong><br/>${this.dashboardKpis.totalReservas}</div>
            <div class="kpi"><strong>Pendientes</strong><br/>${this.dashboardKpis.totalPendientes}</div>
            <div class="kpi"><strong>Ingresos reales</strong><br/>${this.formatearPrecio(this.dashboardKpis.ingresosReales)}</div>
            <div class="kpi"><strong>Ocupacion hoy</strong><br/>${this.dashboardKpis.tasaOcupacionHoy}%</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Cliente</th><th>Habitacion</th><th>Ingreso</th><th>Salida</th><th>Estado</th><th>Total</th>
              </tr>
            </thead>
            <tbody>${filas}</tbody>
          </table>
        </body>
      </html>
    `;

    const ventana = window.open('', '_blank');
    if (!ventana) {
      this.error = 'No se pudo abrir la ventana para imprimir el PDF';
      return;
    }

    ventana.document.open();
    ventana.document.write(html);
    ventana.document.close();
    ventana.focus();
    setTimeout(() => ventana.print(), 300);
  }

  private construirCalendario(diasApi: any[], anio: number, mes: number): DiaCalendario[] {
    const primerDia = new Date(anio, mes - 1, 1).getDay();
    const resultado: DiaCalendario[] = [];

    for (let i = 0; i < primerDia; i += 1) {
      resultado.push({ dia: 0, ocupada: false, reservas: 0, esPlaceholder: true });
    }

    for (const dia of diasApi) {
      resultado.push({
        dia: dia.dia,
        ocupada: dia.ocupada,
        reservas: dia.reservas
      });
    }

    return resultado;
  }

  private getMesActualInput(): string {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
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
        // Si se aprueba la reserva, también marcar el pago como verificado
        if (estado === 'aprobada') {
          reserva.pagoVerificado = true;
        }
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
