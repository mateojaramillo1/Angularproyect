export interface Habitacion{
    _id?: string,
    id?: string,
    nombre: string,
    foto:string[],
    descripcion:string,
    precio:number,
    numeropersonas:number,
    servicios?: string[]
}