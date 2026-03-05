import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-reinicio-contrasena',
  templateUrl: './reinicio-contrasena.component.html',
  styleUrls: ['./reinicio-contrasena.component.css']
})
export class ReinicioContrasenaComponent implements OnInit {
  form!: FormGroup;
  formSolicitud!: FormGroup;
  cargando = false;
  mensaje: string = '';
  tipoMensaje: 'exito' | 'error' = 'error';
  tokenValido = false;
  token: string = '';
  mostrarFormulario = false;
  paso = 1; // 1 = solicitar email, 2 = cambiar contraseña
  
  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    // Obtener el token de la URL
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      
      if (!this.token) {
        // No hay token, mostrar formulario de solicitud
        this.paso = 1;
        this.crearFormularioSolicitud();
      } else {
        // Hay token, mostrar formulario de cambio
        this.paso = 2;
        this.tokenValido = true;
        this.mostrarFormulario = true;
        this.crearFormulario();
      }
    });
  }

  private crearFormularioSolicitud(): void {
    this.formSolicitud = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  private crearFormulario(): void {
    this.form = this.fb.group({
      nuevaContrasena: ['', [
        Validators.required,
        Validators.minLength(8),
        this.validarContrasena.bind(this)
      ]],
      confirmarContrasena: ['', Validators.required]
    }, { validators: this.coincidirContrasenas });
  }

  private validarContrasena(control: AbstractControl): ValidationErrors | null {
    const valor = control.value;
    if (!valor) return null;

    const tieneNumero = /\d/.test(valor);
    const tieneLQueMinus = /[a-z]/.test(valor);
    const tieneLqueMayus = /[A-Z]/.test(valor);

    if (!tieneNumero || !tieneLQueMinus || !tieneLqueMayus) {
      return { 
        passwordDebil: true 
      };
    }

    return null;
  }

  private coincidirContrasenas(group: AbstractControl): ValidationErrors | null {
    const contrasena = group.get('nuevaContrasena')?.value;
    const confirmacion = group.get('confirmarContrasena')?.value;

    if (!contrasena || !confirmacion) return null;

    return contrasena === confirmacion ? null : { noCoinciden: true };
  }

  solicitarEnlace(): void {
    if (!this.formSolicitud.valid || this.cargando) return;

    const email = this.formSolicitud.get('email')?.value;

    this.cargando = true;
    this.authService.solicitarCambioContrasena(email).subscribe({
      next: (response: any) => {
        this.cargando = false;
        this.mostrarMensaje(
          'Se ha enviado un enlace a tu correo electrónico. Por favor revisa tu bandeja de entrada y sigue las instrucciones.',
          'exito'
        );
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 4000);
      },
      error: (error: any) => {
        this.cargando = false;
        const msg = error?.error?.mensaje || 'Error al procesar la solicitud';
        this.mostrarMensaje(msg, 'error');
      }
    });
  }

  cambiar(): void {
    if (!this.form.valid || this.cargando) return;

    const nuevaContrasena = this.form.get('nuevaContrasena')?.value;

    this.cargando = true;
    this.authService.confirmarCambioContrasena(this.token, nuevaContrasena).subscribe({
      next: (response: any) => {
        this.cargando = false;
        this.mostrarMensaje(response.mensaje, 'exito');
        this.mostrarFormulario = false;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error: any) => {
        this.cargando = false;
        const msg = error?.error?.mensaje || 'Error al cambiar la contraseña';
        this.mostrarMensaje(msg, 'error');
      }
    });
  }

  private mostrarMensaje(texto: string, tipo: 'exito' | 'error'): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    window.scrollTo(0, 0);
  }

  get errorContrasena(): string {
    const control = this.form?.get('nuevaContrasena');
    if (!control || !control.errors) return '';

    if (control.errors['required']) return 'La contraseña es requerida';
    if (control.errors['minlength']) return 'Mínimo 8 caracteres';
    if (control.errors['passwordDebil']) return 'Debe contener mayúsculas, minúsculas y números';

    return '';
  }

  get errorConfirmacion(): string {
    const control = this.form?.get('confirmarContrasena');
    if (!control || !control.errors) return '';

    if (control.errors['required']) return 'Confirma tu contraseña';

    if (this.form?.errors?.['noCoinciden']) {
      return 'Las contraseñas no coinciden';
    }

    return '';
  }
}
