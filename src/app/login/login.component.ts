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
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  error: string | null = null;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  submit() {
    if (this.form.invalid) return;
    this.auth.login(this.form.value).subscribe({
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
}
