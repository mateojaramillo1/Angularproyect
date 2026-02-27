export interface Reserva {
    nombre: string,
    apellidos?: string,
    telefono: string,
    fechainicio: Date,
    fechafin: Date,
    idHabitacion: string,
    numeropersonas: number,
    numeroadultos: number,
    numeroniños: number,
    estado: string,
    _id?: string
}