import { Component,HostListener, Renderer2 } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {

  public navOpacity: number = 0;

  constructor(private render: Renderer2, public auth: AuthService) {}

  @HostListener('window:scroll')
  onWindowScroll() {
    const elemento = document.getElementById('menu');
    const maxScroll = 200;
    const scrollY = Math.min(window.pageYOffset, maxScroll);
    const targetOpacity = Math.min(scrollY / maxScroll, 1);

    // Transición suave usando CSS
    this.navOpacity = targetOpacity;
    if (elemento) {
      elemento.style.background = `linear-gradient(90deg, rgba(0, 21, 255,${this.navOpacity}) 0%, rgba(17, 36, 179,${this.navOpacity}) 50%, rgba(0, 140, 255,${this.navOpacity}) 100%)`;
      elemento.style.transition = 'background 0.5s cubic-bezier(.4,0,.2,1)';
    }
  }

  // ...existing code...

  logout(){
    this.auth.logout();
  }

  get userDisplayName(): string {
    return this.auth.getDisplayName();
  }

}
