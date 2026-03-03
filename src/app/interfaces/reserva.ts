export interface Reserva {
    nombre: string,
    apellidos?: string,
    telefono: string,
    fechainicio: Date,
    fechafin: Date,
    idHabitacion: string,
    numeropersonas: number,
    numeroadultos: number,
    numeroninos: number,
    estado: string,
    metodoPago?: string,
    pagoVerificado?: boolean,
    precioTotal?: number,
    noches?: number,
    _id?: string
}