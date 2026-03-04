import { Component, OnInit } from '@angular/core';

interface Foto {
  id: number;
  titulo: string;
  descripcion: string;
  ruta: string;
  categoria: string;
}

@Component({
  selector: 'app-galeria',
  templateUrl: './galeria.component.html',
  styleUrls: ['./galeria.component.css']
})
export class GaleriaComponent implements OnInit {
  fotos: Foto[] = [
    {
      id: 1,
      titulo: 'Habitación Deluxe',
      descripcion: 'Lujosa habitación con vista al mar',
      ruta: 'assets/imagen1.jpg',
      categoria: 'Habitaciones'
    },
    {
      id: 2,
      titulo: 'Piscina Principal',
      descripcion: 'Espectacular piscina al aire libre',
      ruta: 'assets/imagen2.jpg',
      categoria: 'Instalaciones'
    },
    {
      id: 3,
      titulo: 'Restaurante',
      descripcion: 'Comida deliciosa y atención excelente',
      ruta: 'assets/imagen3.jpg',
      categoria: 'Servicios'
    },
    {
      id: 4,
      titulo: 'Playa Privada',
      descripcion: 'Acceso exclusivo a la playa del hotel',
      ruta: 'assets/imagen4.jpg',
      categoria: 'Playas'
    },
    {
      id: 5,
      titulo: 'Spa y Bienestar',
      descripcion: 'Relajación total con nuestros servicios',
      ruta: 'assets/imagen5.jpg',
      categoria: 'Servicios'
    },
    {
      id: 6,
      titulo: 'Salón de Eventos',
      descripcion: 'Perfecto para bodas y eventos especiales',
      ruta: 'assets/banner.jpg',
      categoria: 'Instalaciones'
    }
  ];

  categorias: string[] = [];
  filtroSeleccionado: string = 'Todas';
  fotoSeleccionada: Foto | null = null;
  mostrarModal: boolean = false;

  constructor() {
    this.categorias = ['Todas', ...new Set(this.fotos.map(f => f.categoria))];
  }

  ngOnInit(): void {}

  get fotosFiltradas(): Foto[] {
    if (this.filtroSeleccionado === 'Todas') {
      return this.fotos;
    }
    return this.fotos.filter(f => f.categoria === this.filtroSeleccionado);
  }

  abrirModal(foto: Foto): void {
    this.fotoSeleccionada = foto;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.fotoSeleccionada = null;
  }

  filtrar(categoria: string): void {
    this.filtroSeleccionado = categoria;
  }
}
