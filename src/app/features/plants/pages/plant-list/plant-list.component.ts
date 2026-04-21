import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonButton,
  IonBadge,
  IonContent,
  IonIcon
} from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import {
  arrowBack,
  checkmarkCircle,
  addCircleOutline,
  leafOutline,
  thermometerOutline,
  waterOutline
} from 'ionicons/icons';
import { Plant } from '../../../../core/models/api.models';
import { ApiService } from '../../../../core/service/api.service';
import { AuthService } from '../../../../core/service/auth.service';

@Component({
  selector: 'app-plant-list',
  templateUrl: './plant-list.component.html',
  styleUrls: ['./plant-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonButton,
    IonBadge,
    IonContent,
    IonIcon
  ]
})
export class PlantListComponent implements OnInit {
  activePlant: Plant | null = null;
  selectedFilter: string = 'all';
  allPlants: Plant[] = [];
  filteredPlants: Plant[] = [];

  constructor(
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService
  ) {
    addIcons({ arrowBack, checkmarkCircle, thermometerOutline, leafOutline, waterOutline, addCircleOutline });
  }

  ngOnInit() {
    this.loadPlants();
  }

  async loadPlants() {
    try {
      const response = await this.apiService.getPlants();
      this.allPlants = response.data.map((p: any) => ({
        ...p,
        imageUrl: this.getImageUrl(p.name),
        difficulty: p.maxTemperature > 30 ? 'Medio' : 'Fácil',
        benefits: ['Saludable', 'Orgánico'],
        isActive: false
      }));

      await this.loadActivePlant();
    } catch (error) {
      console.error('Error loading plants:', error);
    }
  }

  async loadActivePlant() {
    const boxId = this.authService.getBoxId();
    if (!boxId) return;

    try {
      const response = await this.apiService.getBoxInfo(boxId);
      if (response && response.box && response.box.plantId) {
        const activeId = response.box.plantId;
        this.allPlants.forEach(plant => {
          plant.isActive = plant.id === activeId;
          if (plant.isActive) this.activePlant = plant;
        });
      }
      this.filterPlants();
    } catch (error) {
      console.error('Error loading active plant:', error);
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
    const boxId = this.authService.getBoxId();

    if (!boxId) {
      console.error('No box ID found');
      return;
    }

    try {
      // Llamada real al backend para asignar la planta a la caja
      await this.apiService.updateBoxPlant(boxId, plant.id);

      // Actualizar UI
      this.allPlants.forEach(p => p.isActive = p.id === plant.id);
      this.activePlant = plant;
      this.filterPlants();

      // Navegar de vuelta
      this.router.navigate(['/home']);

    } catch (error) {
      console.error('Error selecting plant:', error);
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

  getImageUrl(name: string): string {
    const specialCases: { [key: string]: string } = {
      'crassula muscosa': 'assets/plants/Crassula%20Muscosa.png',
      'poto': 'assets/plants/poto.avif'
    };
    const key = name.toLowerCase();
    return specialCases[key] || `assets/plants/${name.toLowerCase().replace(/ /g, '-')}.jpg`;
  }
}
