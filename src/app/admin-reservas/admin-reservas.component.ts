import { Component, OnInit } from '@angular/core';
import { CRMCliente, CheckInQrResponse, ReservaService } from '../services/reserva.service';
import { Reserva } from '../interfaces/reserva';
import { HabitacionesService } from '../services/habitaciones.service';
import jsQR from 'jsqr';

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
  // Control de tabs
  tabActivo: string = 'reservas';
  
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

  crmClientes: CRMCliente[] = [];
  loadingCRM = false;
  qrSeleccionado: CheckInQrResponse | null = null;

  // Marketing automatizado
  mostrarPanelMarketing = false;
  estadisticasMarketing = {
    total: 0,
    platino: 0,
    oro: 0,
    plata: 0,
    bronce: 0,
    inactivos: 0,
    nuevos: 0
  };
  segmentoSeleccionado = 'oro';
  tipoCampaniaSeleccionada = 'descuento';
  asuntoCampania = '';
  descuentoCampania = 15;
  mensajePersonalizado = '';
  loadingMarketing = false;
  vistaPreviaHTML = '';
  clientesSegmento: any[] = [];

  // Lector de QR por cámara
  mostrarCamaraQR = false;
  videoElement: HTMLVideoElement | null = null;
  canvasElement: HTMLCanvasElement | null = null;
  canvasContext: CanvasRenderingContext2D | null = null;
  escaneandoQR = false;
  qrDetectado = '';
  stream: MediaStream | null = null;

  constructor(
    private reservaService: ReservaService,
    private habitacionesService: HabitacionesService
  ) {}

  ngOnInit(): void {
    this.cargarReservas();
    this.cargarHabitaciones();
    this.cargarDashboard();
    this.cargarCRM();
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
    this.cargarCRM();
  }

  cargarCRM() {
    this.loadingCRM = true;
    this.reservaService.obtenerCRMClientes(50).subscribe({
      next: (res) => {
        this.crmClientes = res.clientes || [];
        this.loadingCRM = false;
      },
      error: () => {
        this.loadingCRM = false;
        this.error = 'Error cargando CRM de clientes';
      }
    });
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

  generarQR(reserva: Reserva) {
    if (!reserva._id) {
      return;
    }

    this.reservaService.generarCheckInQR(reserva._id).subscribe({
      next: (resp) => {
        this.qrSeleccionado = resp;
        reserva.checkInEstado = 'generado';
        reserva.checkInQrToken = resp.token;
        reserva.digitalKey = resp.digitalKey;
      },
      error: (err) => {
        this.error = err?.error?.mensaje || 'No se pudo generar QR de check-in';
      }
    });
  }

  realizarCheckIn(reserva: Reserva) {
    const token = reserva.checkInQrToken || this.qrSeleccionado?.token || '';
    if (!token) {
      this.error = 'Primero genera QR para esta reserva';
      return;
    }

    this.reservaService.procesarCheckIn(token).subscribe({
      next: () => {
        reserva.checkInEstado = 'checkin';
        reserva.checkInAt = new Date();
      },
      error: (err) => {
        this.error = err?.error?.mensaje || 'No se pudo procesar check-in';
      }
    });
  }

  realizarCheckOut(reserva: Reserva) {
    const token = reserva.checkInQrToken || this.qrSeleccionado?.token || '';
    if (!token) {
      this.error = 'No hay token QR disponible para check-out';
      return;
    }

    this.reservaService.procesarCheckOut(token).subscribe({
      next: () => {
        reserva.checkInEstado = 'checkout';
        reserva.checkOutAt = new Date();
      },
      error: (err) => {
        this.error = err?.error?.mensaje || 'No se pudo procesar check-out';
      }
    });
  }

  getEstadoCheckInLabel(estado?: string): string {
    switch (estado) {
      case 'generado': return 'QR generado';
      case 'checkin': return 'Check-in realizado';
      case 'checkout': return 'Check-out realizado';
      default: return 'Pendiente';
    }
  }

  getQrImageUrl(token?: string, reservaId?: string, digitalKey?: string): string {
    if (!token) {
      return '';
    }
    // Crear payload JSON que será escaneable
    const payload = {
      tipo: 'checkin',
      token: token,
      reservaId: reservaId || '',
      digitalKey: digitalKey || ''
    };
    const data = encodeURIComponent(JSON.stringify(payload));
    return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${data}`;
  }

  getFidelidadClass(nivel: string): string {
    return `fidelidad-${nivel}`;
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

  // Marketing automatizado
  togglePanelMarketing() {
    this.mostrarPanelMarketing = !this.mostrarPanelMarketing;
    if (this.mostrarPanelMarketing && this.estadisticasMarketing.total === 0) {
      this.cargarEstadisticasMarketing();
    }
  }

  cargarEstadisticasMarketing() {
    this.loadingMarketing = true;
    this.reservaService.obtenerEstadisticasMarketing().subscribe({
      next: (response) => {
        this.estadisticasMarketing = response.estadisticas;
        this.loadingMarketing = false;
      },
      error: (error) => {
        console.error('Error cargando estadísticas de marketing:', error);
        this.loadingMarketing = false;
      }
    });
  }

  cargarClientesSegmento() {
    this.loadingMarketing = true;
    this.reservaService.obtenerClientesSegmento(this.segmentoSeleccionado).subscribe({
      next: (response) => {
        this.clientesSegmento = response.clientes;
        this.loadingMarketing = false;
      },
      error: (error) => {
        console.error('Error cargando clientes del segmento:', error);
        this.loadingMarketing = false;
      }
    });
  }

  generarVistaPrevia() {
    if (!this.tipoCampaniaSeleccionada) {
      alert('Selecciona un tipo de campaña');
      return;
    }

    const opciones: any = {};
    
    if (this.tipoCampaniaSeleccionada === 'descuento' || this.tipoCampaniaSeleccionada === 'reactivacion') {
      opciones.descuento = this.descuentoCampania;
    }
    
    if (this.tipoCampaniaSeleccionada === 'personalizado' && this.mensajePersonalizado) {
      opciones.mensajePersonalizado = this.mensajePersonalizado;
    }

    this.loadingMarketing = true;
    this.reservaService.obtenerVistaPreviaMarketing(
      this.segmentoSeleccionado,
      this.tipoCampaniaSeleccionada,
      opciones
    ).subscribe({
      next: (response) => {
        this.vistaPreviaHTML = response.htmlPreview;
        this.loadingMarketing = false;
        
        // Abrir en nueva ventana
        const ventana = window.open('', '_blank', 'width=800,height=600');
        if (ventana) {
          ventana.document.write(this.vistaPreviaHTML);
          ventana.document.close();
        }
      },
      error: (error) => {
        console.error('Error generando vista previa:', error);
        alert('Error generando vista previa');
        this.loadingMarketing = false;
      }
    });
  }

  enviarCampania() {
    if (!this.asuntoCampania) {
      alert('El asunto es requerido');
      return;
    }

    if (!confirm(`¿Estás seguro de enviar esta campaña a todos los clientes del segmento "${this.segmentoSeleccionado}"?`)) {
      return;
    }

    const opciones: any = {};
    
    if (this.tipoCampaniaSeleccionada === 'descuento' || this.tipoCampaniaSeleccionada === 'reactivacion') {
      opciones.descuento = this.descuentoCampania;
    }
    
    if (this.tipoCampaniaSeleccionada === 'personalizado' && this.mensajePersonalizado) {
      opciones.mensajePersonalizado = this.mensajePersonalizado;
    }

    this.loadingMarketing = true;
    this.reservaService.enviarCampaniaMarketing(
      this.segmentoSeleccionado,
      this.asuntoCampania,
      this.tipoCampaniaSeleccionada,
      opciones
    ).subscribe({
      next: (response) => {
        this.loadingMarketing = false;
        const resultado = response.resultado;
        alert(`Campaña enviada:\n✅ Enviados: ${resultado.enviados}\n❌ Fallos: ${resultado.fallos}\n📊 Total: ${resultado.total}`);
        
        // Resetear campos
        this.asuntoCampania = '';
        this.mensajePersonalizado = '';
      },
      error: (error) => {
        console.error('Error enviando campaña:', error);
        alert('Error enviando campaña');
        this.loadingMarketing = false;
      }
    });
  }

  getNombreSegmento(segmento: string): string {
    const nombres: any = {
      'oro': 'Clientes Oro',
      'platino': 'Clientes Platino',
      'plata': 'Clientes Plata',
      'bronce': 'Clientes Bronce',
      'inactivos': 'Clientes Inactivos (>6 meses)',
      'nuevos': 'Clientes Nuevos (1-2 reservas)',
      'todos': 'Todos los Clientes'
    };
    return nombres[segmento] || segmento;
  }

  getTipoCampaniaDescripcion(tipo: string): string {
    const descripciones: any = {
      descuento: 'Ofrece descuento exclusivo según nivel de fidelidad',
      reactivacion: 'Campana especial para reactivar clientes inactivos',
      agradecimiento: 'Mensaje de agradecimiento por su lealtad',
      personalizado: 'Mensaje personalizado (escribe tu propio contenido)'
    };
    return descripciones[tipo] || '';
  }

  abrirCamaraQR() {
    this.mostrarCamaraQR = true;
    this.qrDetectado = '';
    setTimeout(() => this.iniciarCamara(), 100);
  }

  cerrarCamaraQR() {
    this.mostrarCamaraQR = false;
    this.detenerCamara();
  }

  async iniciarCamara() {
    try {
      this.videoElement = document.getElementById('qr-video') as HTMLVideoElement | null;
      this.canvasElement = document.getElementById('qr-canvas') as HTMLCanvasElement | null;

      if (!this.videoElement || !this.canvasElement) {
        return;
      }

      this.canvasContext = this.canvasElement.getContext('2d', { willReadFrequently: true });
      if (!this.canvasContext) {
        return;
      }

      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      this.videoElement.srcObject = this.stream;
      this.videoElement.setAttribute('playsinline', 'true');
      await this.videoElement.play();

      this.escaneandoQR = true;
      requestAnimationFrame(() => this.escanearFrame());
    } catch (error) {
      console.error('Error accediendo a la camara:', error);
      alert('No se pudo acceder a la camara. Verifica permisos.');
    }
  }

  detenerCamara() {
    this.escaneandoQR = false;

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
  }

  escanearFrame() {
    if (!this.escaneandoQR || !this.videoElement || !this.canvasElement || !this.canvasContext) {
      return;
    }

    if (this.videoElement.readyState === this.videoElement.HAVE_ENOUGH_DATA) {
      this.canvasElement.height = this.videoElement.videoHeight;
      this.canvasElement.width = this.videoElement.videoWidth;
      this.canvasContext.drawImage(this.videoElement, 0, 0, this.canvasElement.width, this.canvasElement.height);

      const imageData = this.canvasContext.getImageData(0, 0, this.canvasElement.width, this.canvasElement.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });

      if (code?.data) {
        this.qrDetectado = code.data;
        this.procesarQRDetectado(code.data);
        return;
      }
    }

    requestAnimationFrame(() => this.escanearFrame());
  }

  procesarQRDetectado(qrData: string) {
    try {
      const data = JSON.parse(qrData);

      if (data.tipo === 'checkin' && data.token) {
        const confirmar = confirm(
          `QR Detectado:\n\nReserva ID: ${data.reservaId || 'N/A'}\nClave Digital: ${data.digitalKey || 'N/A'}\n\nProcesar CHECK-IN?`
        );

        if (confirmar) {
          this.procesarCheckInDesdeQR(data.token);
        } else {
          this.qrDetectado = '';
          requestAnimationFrame(() => this.escanearFrame());
        }
      } else {
        alert('QR no valido para check-in');
        this.qrDetectado = '';
        requestAnimationFrame(() => this.escanearFrame());
      }
    } catch {
      alert('QR no valido o corrupto');
      this.qrDetectado = '';
      requestAnimationFrame(() => this.escanearFrame());
    }
  }

  procesarCheckInDesdeQR(token: string) {
    this.detenerCamara();
    this.loading = true;

    this.reservaService.procesarCheckIn(token).subscribe({
      next: (response) => {
        this.loading = false;
        alert(`OK ${response.mensaje}\n\n${response.instrucciones || ''}`);
        this.cerrarCamaraQR();
        this.cargarReservas();
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.mensaje || 'Error procesando check-in';
        alert(this.error);
        setTimeout(() => {
          this.qrDetectado = '';
          this.iniciarCamara();
        }, 1200);
      }
    });
  }
}
