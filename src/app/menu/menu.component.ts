import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit, OnDestroy {

  public navOpacity: number = 0;
  public isScrolled: boolean = false;
  public isMobileMenuOpen: boolean = false;

  private readonly onAnyScroll = (event: Event): void => {
    this.updateNavFromEvent(event);
  };

  constructor(public auth: AuthService) {}

  ngOnInit(): void {
    window.addEventListener('scroll', this.onAnyScroll, true);
    this.updateNavFromEvent();
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onAnyScroll, true);
  }

  private updateNavFromEvent(event?: Event): void {
    const maxScroll = 200;
    const target = event?.target as HTMLElement | Document | null;

    let currentScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    if (target && 'scrollTop' in target) {
      const targetScrollTop = Number((target as HTMLElement).scrollTop || 0);
      if (targetScrollTop > currentScroll) {
        currentScroll = targetScrollTop;
      }
    }

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
