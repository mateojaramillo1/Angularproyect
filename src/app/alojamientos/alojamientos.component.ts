import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReservaPagoService } from '../services/reserva-pago.service';

@Component({
  selector: 'app-alojamientos',
  templateUrl: './alojamientos.component.html',
  styleUrls: ['./alojamientos.component.css']
})
export class AlojamientosComponent implements OnInit {
  public mostrarEstadoPago = false;
  public estadoPagoTipo: 'ok' | 'error' | 'pendiente' = 'pendiente';
  public estadoPagoTitulo = '';
  public estadoPagoMensaje = '';

  constructor(
    private route: ActivatedRoute,
    private reservaPagoService: ReservaPagoService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const transactionId =
        params.get('id') ||
        params.get('transaction_id') ||
        params.get('transactionId');

      const statusParam = String(params.get('status') || '').toUpperCase();

      if (!transactionId && !statusParam) {
        this.mostrarEstadoPago = false;
        return;
      }

      if (transactionId) {
        this.consultarEstadoReal(transactionId);
        return;
      }

      this.mostrarEstadoDesdeParametro(statusParam);
    });
  }

  private consultarEstadoReal(transactionId: string): void {
    this.mostrarEstadoPago = true;
    this.estadoPagoTipo = 'pendiente';
    this.estadoPagoTitulo = 'Validando pago';
    this.estadoPagoMensaje = 'Estamos consultando el estado de tu transacción.';

    this.reservaPagoService.consultarEstadoPago(transactionId).subscribe({
      next: (respuesta) => {
        const estado = String(respuesta?.transaccion?.status || '').toUpperCase();

        if (estado === 'APPROVED') {
          this.estadoPagoTipo = 'ok';
          this.estadoPagoTitulo = 'Pago aprobado';
          this.estadoPagoMensaje = 'Tu reserva fue confirmada correctamente.';
          return;
        }

        if (['DECLINED', 'ERROR', 'VOIDED'].includes(estado)) {
          this.estadoPagoTipo = 'error';
          this.estadoPagoTitulo = 'Pago rechazado';
          this.estadoPagoMensaje = 'No fue posible completar el pago. Puedes intentarlo nuevamente.';
          return;
        }

        this.estadoPagoTipo = 'pendiente';
        this.estadoPagoTitulo = 'Pago pendiente';
        this.estadoPagoMensaje = 'Tu transacción está en proceso de confirmación.';
      },
      error: () => {
        this.estadoPagoTipo = 'error';
        this.estadoPagoTitulo = 'No se pudo validar el pago';
        this.estadoPagoMensaje = 'No logramos consultar el estado de la transacción en este momento.';
      }
    });
  }

  private mostrarEstadoDesdeParametro(statusParam: string): void {
    this.mostrarEstadoPago = true;

    if (statusParam === 'APPROVED') {
      this.estadoPagoTipo = 'ok';
      this.estadoPagoTitulo = 'Pago aprobado';
      this.estadoPagoMensaje = 'Tu pago fue confirmado exitosamente.';
      return;
    }

    if (['DECLINED', 'ERROR', 'VOIDED'].includes(statusParam)) {
      this.estadoPagoTipo = 'error';
      this.estadoPagoTitulo = 'Pago rechazado';
      this.estadoPagoMensaje = 'Tu pago no pudo ser procesado.';
      return;
    }

    this.estadoPagoTipo = 'pendiente';
    this.estadoPagoTitulo = 'Pago pendiente';
    this.estadoPagoMensaje = 'Estamos esperando confirmación de la transacción.';
  }
}
