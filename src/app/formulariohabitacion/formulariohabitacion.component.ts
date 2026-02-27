import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HabitacionesService } from '../services/habitaciones.service';
import { Habitacion } from '../interfaces/habitacion';

@Component({
  selector: 'app-formulariohabitacion',
  templateUrl: './formulariohabitacion.component.html',
  styleUrls: ['./formulariohabitacion.component.css']
})
export class FormulariohabitacionComponent {
  public formulario: FormGroup;
  public cargandoRegistro = false;
  public mensajeRegistro = '';
  public registroExitoso = false;
  public serviciosDisponibles: string[] = ['Televisión', 'Aire acondicionado', 'Baño', 'Jacuzzi'];

  public constructor(
    public constructorFormulario: FormBuilder,
    public servicio: HabitacionesService
  ) {
    this.formulario = this.inicializarFormulario();
  }

  public inicializarFormulario(): FormGroup {
    return this.constructorFormulario.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      foto: ['', [Validators.required]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      precio: [null, [Validators.required, Validators.min(1)]],
      numeropersonas: [null, [Validators.required, Validators.min(1), Validators.max(20)]],
      servicios: [[]]
    });
  }

  public toggleServicio(servicio: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const actuales = (this.formulario.get('servicios')?.value as string[]) || [];

    const nuevos = checked
      ? [...actuales, servicio]
      : actuales.filter((item) => item !== servicio);

    this.formulario.get('servicios')?.setValue(nuevos);
  }

  public isServicioSeleccionado(servicio: string): boolean {
    const actuales = (this.formulario.get('servicios')?.value as string[]) || [];
    return actuales.includes(servicio);
  }

  public procesarDatos(): void {
    if (this.formulario.invalid || this.cargandoRegistro) {
      this.formulario.markAllAsTouched();
      return;
    }

    const serviciosSeleccionados = (this.formulario.get('servicios')?.value as string[]) || [];
    if (serviciosSeleccionados.length === 0) {
      this.registroExitoso = false;
      this.mensajeRegistro = 'Selecciona al menos un servicio para la habitación.';
      return;
    }

    this.cargandoRegistro = true;
    this.mensajeRegistro = '';
    this.registroExitoso = false;

    const datos = this.formulario.value as Habitacion;

    this.servicio.registrarHabitacion(datos).subscribe({
      next: () => {
        this.registroExitoso = true;
        this.mensajeRegistro = 'Habitación registrada correctamente.';
        this.formulario.reset();
        this.formulario.get('servicios')?.setValue([]);
        this.cargandoRegistro = false;
      },
      error: (error) => {
        this.registroExitoso = false;
        this.mensajeRegistro = error?.error?.mensaje || 'No se pudo registrar la habitación. Verifica la URL y el endpoint de tu API.';
        this.cargandoRegistro = false;
      }
    });
  }

}
