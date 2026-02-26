import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { FormulariohabitacionComponent } from './formulariohabitacion/formulariohabitacion.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AuthGuard } from './guards/auth.guard';
import { AlojamientosComponent } from './alojamientos/alojamientos.component';

const routes: Routes = [
  {path:"", component:HomeComponent,pathMatch:"full"},
  {path:"alojamientos", component:AlojamientosComponent},
  {path:"registrohabitacion", component:FormulariohabitacionComponent, canActivate: [AuthGuard], data: { admin: true }},
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
