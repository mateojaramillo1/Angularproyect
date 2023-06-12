import { Component } from '@angular/core';
import { Habitacion } from '../interfaces/habitacion';
@Component({
  selector: 'app-habitaciones',
  templateUrl: './habitaciones.component.html',
  styleUrls: ['./habitaciones.component.css']
})
export class HabitacionesComponent {
  public habitacion1:Habitacion={
    nombre: "Hotel roises",
    foto:["https://firebasestorage.googleapis.com/v0/b/hotellunesteo.appspot.com/o/hotel1.1.jpg?alt=media&token=c9ec12c8-97a6-4430-902c-beb0ba285ded","https://firebasestorage.googleapis.com/v0/b/hotellunesteo.appspot.com/o/hotel1.2.jpg?alt=media&token=090c6cbf-233a-4b56-ac6e-b6653188d152"],
    descripcion: "Hotel con dos camas Cocina de lujo y Comedor",
    precio:250,
    numeropersonas:4
  }
  public habitacion2:Habitacion={
    nombre: "Hotel encantos",
    foto:["https://firebasestorage.googleapis.com/v0/b/hotellunesteo.appspot.com/o/hotel1.1.jpg?alt=media&token=c9ec12c8-97a6-4430-902c-beb0ba285ded","https://firebasestorage.googleapis.com/v0/b/hotellunesteo.appspot.com/o/hotel1.2.jpg?alt=media&token=090c6cbf-233a-4b56-ac6e-b6653188d152"],
    descripcion: "Hotel con 4 camas Cocina de lujo y Comedor y baños termales",
    precio:450,
    numeropersonas:3
  }

  public habitaciones:Habitacion[]=[this.habitacion1,this.habitacion2]

  public constructor(){
    console.log(this.habitaciones)
  }
}
