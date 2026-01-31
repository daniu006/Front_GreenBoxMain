import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonButton,
  IonChip,
  IonBadge,
  IonContent,
  IonIcon,
  IonLabel
} from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import {
  arrowBack,
  checkmarkCircle,
  addCircleOutline,
  leafOutline
} from 'ionicons/icons';
import { Plant } from '../../../../core/models/plant.model';

@Component({
  selector: 'app-plant-list',
  templateUrl: './plant-list.component.html',
  styleUrls: ['./plant-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonButton,
    IonChip,
    IonBadge,
    IonContent,
    IonIcon,
    IonLabel
  ]
})
export class PlantListComponent implements OnInit {
  activePlant: Plant | null = null;
  selectedFilter: string = 'all';
  allPlants: Plant[] = [];
  filteredPlants: Plant[] = [];

  constructor(private router: Router) {
    addIcons({
      'arrow-back': arrowBack,
      'checkmark-circle': checkmarkCircle,
      'add-circle-outline': addCircleOutline,
      'leaf-outline': leafOutline
    });
  }

  ngOnInit() {
    this.loadPlants();
    this.loadActivePlant();
  }

  loadPlants() {
    // Mock data - Replace with actual API service
    this.allPlants = [
      {
        id: '1',
        name: 'Lechuga Romana',
        type: 'Hoja Verde',
        imageUrl: 'assets/plants/lechuga.jpg',
        difficulty: 'Fácil',
        benefits: ['Rica en fibra', 'Vitaminas A y K'],
        isActive: false
      },
      {
        id: '2',
        name: 'Tomate Cherry',
        type: 'Fruto',
        imageUrl: 'assets/plants/tomate.jpg',
        difficulty: 'Medio',
        benefits: ['Antioxidantes', 'Vitamina C'],
        isActive: false
      },
      {
        id: '3',
        name: 'Albahaca',
        type: 'Hierba Aromática',
        imageUrl: 'assets/plants/albahaca.jpg',
        difficulty: 'Fácil',
        benefits: ['Aromática', 'Propiedades medicinales'],
        isActive: false
      },
      {
        id: '4',
        name: 'Espinaca',
        type: 'Hoja Verde',
        imageUrl: 'assets/plants/espinaca.jpg',
        difficulty: 'Fácil',
        benefits: ['Alto en hierro', 'Vitaminas'],
        isActive: false
      },
      {
        id: '5',
        name: 'Fresa',
        type: 'Fruto',
        imageUrl: 'assets/plants/fresa.jpg',
        difficulty: 'Medio',
        benefits: ['Dulce', 'Vitamina C'],
        isActive: false
      },
      {
        id: '6',
        name: 'Cilantro',
        type: 'Hierba Aromática',
        imageUrl: 'assets/plants/cilantro.jpg',
        difficulty: 'Fácil',
        benefits: ['Aromático', 'Digestivo'],
        isActive: false
      }
    ];

    this.filterPlants();
  }

  loadActivePlant() {
    const plantData = localStorage.getItem('activePlant');
    if (plantData) {
      this.activePlant = JSON.parse(plantData);
      // Mark active plant in the list
      this.allPlants.forEach(plant => {
        plant.isActive = plant.id === this.activePlant?.id;
      });
      this.filterPlants();
    }
  }

  onFilterChange(filter: string) {
    this.selectedFilter = filter;
    this.filterPlants();
  }

  filterPlants() {
    if (this.selectedFilter === 'all') {
      this.filteredPlants = [...this.allPlants];
    } else {
      this.filteredPlants = this.allPlants.filter(
        plant => plant.type === this.selectedFilter
      );
    }
  }

  async onPlantSelect(plant: Plant) {
    // Get boxId from localStorage
    const boxId = localStorage.getItem('boxId');

    if (!boxId) {
      console.error('No box ID found');
      alert('Error: No se encontró el ID de la caja');
      return;
    }

    try {
      // TODO: Make API call to update box with selected plant
      // await this.apiService.updateBox(boxId, { plantId: plant.id });

      // For now, just update localStorage
      localStorage.setItem('activePlant', JSON.stringify(plant));

      // Update UI
      this.allPlants.forEach(p => p.isActive = p.id === plant.id);
      this.activePlant = plant;
      this.filterPlants();

      // Show success message
      alert(`${plant.name} seleccionada correctamente`);

      // Navigate back to home
      setTimeout(() => {
        this.router.navigate(['/home']);
      }, 1000);

    } catch (error) {
      console.error('Error selecting plant:', error);
      alert('Error al seleccionar la planta');
    }
  }

  getDifficultyColor(difficulty?: string): string {
    switch (difficulty) {
      case 'Fácil':
        return 'success';
      case 'Medio':
        return 'warning';
      case 'Difícil':
        return 'danger';
      default:
        return 'medium';
    }
  }

  onBackClick() {
    this.router.navigate(['/home']);
  }
}
