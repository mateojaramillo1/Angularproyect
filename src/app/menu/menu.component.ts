import { Component, HostListener, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  public navOpacity: number = 0;
  public isScrolled: boolean = false;
  public isMobileMenuOpen: boolean = false;

  constructor(public auth: AuthService) {}

  ngOnInit(): void {
    this.onWindowScroll();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const maxScroll = 200;
    const currentScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    const scrollY = Math.min(currentScroll, maxScroll);
    const targetOpacity = Math.min(scrollY / maxScroll, 1);

    this.navOpacity = targetOpacity;
    this.isScrolled = currentScroll > 0;
  }

  get navBackground(): string {
    return `linear-gradient(90deg, rgba(0, 21, 255,${this.navOpacity}) 0%, rgba(17, 36, 179,${this.navOpacity}) 50%, rgba(0, 140, 255,${this.navOpacity}) 100%)`;
  }

  logout(){
    this.closeMobileMenu();
    this.auth.logout();
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  get userDisplayName(): string {
    return this.auth.getDisplayName();
  }

}
