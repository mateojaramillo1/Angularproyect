import { Component,HostListener, Renderer2 } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {

  public scroll:boolean= false

  constructor(private render:Renderer2, public auth: AuthService){}

  @HostListener('window:scroll')
  onWindowScroll(){
    let elemento = document.getElementById("menu")
    if(window.pageYOffset>0){
      this.scroll=true
      this.render.addClass(elemento,'menu2')
      this.render.removeClass(elemento,'menu')
    }else{
      this.scroll=false
      this.render.removeClass(elemento,'menu2')
      this.render.addClass(elemento,'menu')
    }
  }

  logout(){
    this.auth.logout();
  }

}
