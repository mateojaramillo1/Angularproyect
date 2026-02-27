import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReservaPagoService, EstadoPagoWompiResponse } from '../services/reserva-pago.service';

@Component({
  selector: 'app-pago-resultado',
  templateUrl: './pago-resultado.component.html',
  styleUrls: ['./pago-resultado.component.css']
})
export class PagoResultadoComponent implements OnInit {
  public cargando = true;
  public error = '';
  public data: EstadoPagoWompiResponse | null = null;
  public estadoVisual: 'APROBADO' | 'RECHAZADO' | 'PENDIENTE' = 'PENDIENTE';

  constructor(
    private route: ActivatedRoute,
    private reservaPagoService: ReservaPagoService
  ) {}

  ngOnInit(): void {
    const query = this.route.snapshot.queryParamMap;
    const transactionId = query.get('id') || query.get('transaction_id') || query.get('transactionId');

    if (!transactionId) {
      this.cargando = false;
      this.error = 'No se encontró el identificador de la transacción en la URL de retorno.';
      return;
    }

    this.reservaPagoService.consultarEstadoPago(transactionId).subscribe({
      next: (respuesta) => {
        this.data = respuesta;
        const estado = String(respuesta?.transaccion?.status || '').toUpperCase();

        if (estado === 'APPROVED') {
          this.estadoVisual = 'APROBADO';
        } else if (['DECLINED', 'ERROR', 'VOIDED'].includes(estado)) {
          this.estadoVisual = 'RECHAZADO';
        } else {
          this.estadoVisual = 'PENDIENTE';
        }

        this.cargando = false;
      },
      error: (error) => {
        this.cargando = false;
        this.error = error?.error?.mensaje || 'No fue posible consultar el estado del pago.';
      }
    });
  }
}
