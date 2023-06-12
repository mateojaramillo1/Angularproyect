import { Component } from '@angular/core';
import { Habitacion } from '../interfaces/habitacion';
import { HabitacionesService } from '../services/habitaciones.service';
@Component({
  selector: 'app-habitaciones',
  templateUrl: './habitaciones.component.html',
  styleUrls: ['./habitaciones.component.css']
})
export class HabitacionesComponent {


  public habitaciones:Habitacion[]=[]

  public constructor(public servicio:HabitacionesService){
    
    this.servicio.buscarHabitaciones().subscribe((respuesta)=>{
      this.habitaciones=respuesta.habitaciones
    })


  }
}
