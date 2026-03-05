import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { FormulariohabitacionComponent } from './formulariohabitacion/formulariohabitacion.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AuthGuard } from './guards/auth.guard';
import { AlojamientosComponent } from './alojamientos/alojamientos.component';
import { AdminReservasComponent } from './admin-reservas/admin-reservas.component';
import { MisReservasComponent } from './mis-reservas/mis-reservas.component';
import { GaleriaComponent } from './galeria/galeria.component';
import { CambiarContrasenaComponent } from './cambiar-contrasena/cambiar-contrasena.component';
import { ReinicioContrasenaComponent } from './reinicio-contrasena/reinicio-contrasena.component';
import { PublicCheckinComponent } from './public-checkin/public-checkin.component';

const routes: Routes = [
  {path:"", component:HomeComponent,pathMatch:"full"},
  {path:"alojamientos", component:AlojamientosComponent},
  {path:"galeria", component:GaleriaComponent},
  {path:"registrohabitacion", component:FormulariohabitacionComponent, canActivate: [AuthGuard], data: { admin: true }},
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'cambiar-contrasena', component: CambiarContrasenaComponent, canActivate: [AuthGuard] },
  { path: 'cambiar-contrasena-token', component: ReinicioContrasenaComponent },
  { path: 'checkin', component: PublicCheckinComponent },
  { path: 'admin-reservas', component: AdminReservasComponent, canActivate: [AuthGuard], data: { admin: true } },
  { path: 'mis-reservas', component: MisReservasComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
