import { Component } from '@angular/core';
import {FormGroup, FormBuilder} from '@angular/forms'
import { HabitacionesService } from '../services/habitaciones.service';

@Component({
  selector: 'app-formulariohabitacion',
  templateUrl: './formulariohabitacion.component.html',
  styleUrls: ['./formulariohabitacion.component.css']
})
export class FormulariohabitacionComponent {
  public formulario:FormGroup
  public datosFormulario:any[]=[]

  public constructor(public constructorFormulario:FormBuilder,public servicio:HabitacionesService){
    this.formulario=this.inicializarFormulario()
  }

  public inicializarFormulario():FormGroup{
    return this.constructorFormulario.group({
      nombre:[''],
      foto:[''],
      descripcion:[''],
      precio:[''],
      numeropersonas:['']
    })
  }

  public procesarDatos(): void {
    let datos = this.formulario.value
    
    this.servicio.registrarHabitacion(datos).subscribe((respuesta)=> {
      console.log(respuesta);
      
    })
    
  }

}
