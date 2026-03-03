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
    _id?: string
}