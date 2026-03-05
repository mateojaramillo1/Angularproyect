# Clienteangular

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.2.2.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Credenciales de inicio de sesión

email: admin@admin.com
password: admin123

## Manual rapido de administrador

1. Inicia sesion con cuenta `admin`.
2. Ve al panel `Gestion de Reservas`.
3. Usa filtros por estado y pago para revisar pendientes.
4. Verifica pagos por transferencia y aprueba/rechaza cada reserva.
5. Revisa periodicamente que no existan reservas duplicadas en fechas cruzadas.
6. Usa el dashboard para ver ocupacion mensual, ingresos reales y proyectados.
7. Usa calendario de disponibilidad por habitacion para planificacion operativa.
8. Exporta reportes en CSV (Excel) o PDF desde el panel admin.
9. Genera QR de check-in por reserva aprobada y procesa check-in/check-out digital.
10. Revisa CRM de clientes y aplica descuentos sugeridos por nivel de fidelidad.

## Operacion segura recomendada

- Mantener `SECRETO_JWT` y `DATABASE` solo en variables de entorno.
- Rotar contrasenas de administrador cada 90 dias.
- Ejecutar backups diarios desde backend (`npm run backup:db`).
- Validar una restauracion de prueba al menos 1 vez al mes.
- Mantener 1 cuenta admin principal y 1 cuenta admin de emergencia.

## Checklist legal minimo para venta

- Contrato con clausula de limitacion de responsabilidad y plan de soporte.
- Politica de privacidad y tratamiento de datos personales (RGPD/LOPDGDD).
- Aviso al cliente sobre tiempos de retencion y respaldo de informacion.
- Registro de auditoria habilitado para acciones sensibles (login y reservas).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
