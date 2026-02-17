import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  modoRegistro = false;
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });
  registerForm = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telefono: [''],
    password: ['', Validators.required]
  });
  error: string | null = null;
  success: string | null = null;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  submitLogin() {
    if (this.loginForm.invalid) return;
    this.auth.login(this.loginForm.value).subscribe({
      next: (res: any) => {
        if (res && res.token) {
          this.auth.setToken(res.token);
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.error = err?.error?.mensaje || 'Error en login';
      }
    });
  }

  submitRegister() {
    if (this.registerForm.invalid) return;
    this.auth.register(this.registerForm.value).subscribe({
      next: () => {
        this.success = 'Registro exitoso. Ahora puedes iniciar sesión.';
        this.error = null;
        this.modoRegistro = false;
        this.registerForm.reset();
      },
      error: (err) => {
        this.error = err?.error?.mensaje || 'Error registrando';
        this.success = null;
      }
    });
  }

  toggleModo() {
    this.modoRegistro = !this.modoRegistro;
    this.error = null;
    this.success = null;
  }
}
