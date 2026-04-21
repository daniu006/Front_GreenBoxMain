import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonButton,
  IonRefresher,
  IonIcon,
  IonContent,
  IonRefresherContent,
  IonSpinner
} from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import {
  arrowBack,
  bookOutline,
  bulbOutline,
  leafOutline,
  mailOutline,
  helpCircleOutline
} from 'ionicons/icons';
import { Plant, GuideStep } from '../../../../core/models/plant.model';
import { ApiService } from '../../../../core/service/api.service';
import { AuthService } from '../../../../core/service/auth.service';

@Component({
  selector: 'app-plant-guide',
  templateUrl: './plant-guide.component.html',
  styleUrls: ['./plant-guide.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonButton,
    IonRefresher,
    IonIcon,
    IonContent,
    IonRefresherContent,
    IonSpinner
  ]
})
export class PlantGuideComponent implements OnInit {
  isLoading: boolean = true;
  activePlant: Plant | null = null;
  guideSteps: GuideStep[] = [];
  errorMessage: string = '';

  constructor(
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService
  ) {
    addIcons({
      'arrow-back': arrowBack,
      'book-outline': bookOutline,
      'bulb-outline': bulbOutline,
      'leaf-outline': leafOutline,
      'mail-outline': mailOutline,
      'help-circle-outline': helpCircleOutline
    });
  }

  ngOnInit() {
    this.loadGuideData();
  }

  async loadGuideData() {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      // 1. Obtener la planta activa desde el box del usuario
      await this.loadActivePlant();

      // 2. Si hay planta asignada, cargar los pasos de guía desde la BD
      if (this.activePlant) {
        await this.loadGuideSteps();
      } else {
        this.errorMessage = 'No tienes una planta asignada. Ve a la lista de plantas para seleccionar una.';
      }
    } catch (error) {
      console.error('Error loading guide data:', error);
      this.errorMessage = 'Error al cargar la guía. Intenta de nuevo.';
    } finally {
      this.isLoading = false;
    }
  }

  private async loadActivePlant() {
    const boxId = this.authService.getBoxId();
    if (!boxId) return;

    try {
      const response = await this.apiService.getBoxInfo(boxId);
      if (response?.box?.plantId) {
        const plantsRes = await this.apiService.getPlants();
        const plant = plantsRes?.data?.find((p: any) => p.id === response.box.plantId);
        if (plant) {
          this.activePlant = {
            ...plant,
            imageUrl: `assets/plants/${plant.name.toLowerCase().replace(/ /g, '-')}.jpg`
          };
        }
      }
    } catch (error) {
      console.error('Error cargando planta activa:', error);
    }
  }

  private async loadGuideSteps() {
    if (!this.activePlant) return;

    try {
      // Llamada real al backend: GET /guide/plant/:plantId
      // El backend retorna { data: GuideStep[], total, message }
      const steps = await this.apiService.getGuidesByPlant(Number(this.activePlant.id));

      if (steps && steps.length > 0) {
        // Mapear la respuesta del backend al modelo GuideStep del frontend
        this.guideSteps = steps.map((s: any) => ({
          step: s.step,
          title: s.title,
          description: s.description,
          image: s.image || null,
          tips: s.tips || [],
        }));
      } else {
        this.errorMessage = 'Aún no hay guías registradas para esta planta.';
        this.guideSteps = [];
      }
    } catch (error) {
      console.error('Error cargando pasos de guía:', error);
      this.errorMessage = 'Error al cargar los pasos de la guía.';
    }
  }

  async refreshData(event: any) {
    await this.loadGuideData();
    event.target.complete();
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  goToPlantSelection() {
    this.router.navigate(['/plants/list']);
  }

  openSupport() {
    alert('Función de soporte en desarrollo. Por ahora, contacta a soporte@greenbox.com');
  }
}
