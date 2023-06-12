import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormulariohabitacionComponent } from './formulariohabitacion.component';

describe('FormulariohabitacionComponent', () => {
  let component: FormulariohabitacionComponent;
  let fixture: ComponentFixture<FormulariohabitacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormulariohabitacionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormulariohabitacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
