import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-cambiar-contrasena',
  templateUrl: './cambiar-contrasena.component.html',
  styleUrls: ['./cambiar-contrasena.component.css']
})
export class CambiarContrasenaComponent implements OnInit {
  form!: FormGroup;
  cargando = false;
  mensaje: string = '';
  tipoMensaje: 'exito' | 'error' = 'error';
  mostrarFormulario = true;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Verificar si el usuario está logueado
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.form = this.fb.group({
      email: [{ value: this.authService.getStoredUser()?.email || '', disabled: true }],
      nuevaContrasena: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/\d/), // Al menos un número
        Validators.pattern(/[a-zA-Z]/) // Al menos una letra
      ]]
    });
  }

  solicitar(): void {
    if (this.cargando) return;

    const email = this.authService.getStoredUser()?.email;
    if (!email) {
      this.mostrarMensaje('No se pudo obtener tu email', 'error');
      return;
    }

    this.cargando = true;
    this.authService.solicitarCambioContrasena(email).subscribe({
      next: (response: any) => {
        this.cargando = false;
        this.mostrarMensaje(
          'Se ha enviado un enlace a tu correo electrónico. Por favor revisa tu bandeja de entrada.',
          'exito'
        );
        this.mostrarFormulario = false;
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 3000);
      },
      error: (error: any) => {
        this.cargando = false;
        const msg = error?.error?.mensaje || 'Error al procesar la solicitud';
        this.mostrarMensaje(msg, 'error');
      }
    });
  }

  private mostrarMensaje(texto: string, tipo: 'exito' | 'error'): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    window.scrollTo(0, 0);
  }
}
