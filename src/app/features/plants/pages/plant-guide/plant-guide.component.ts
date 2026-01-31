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

  constructor(private router: Router) {
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

    try {
      // Load active plant
      await this.loadActivePlant();

      // Load guide steps for the active plant
      if (this.activePlant) {
        await this.loadGuideSteps();
      }
    } catch (error) {
      console.error('Error loading guide data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async loadActivePlant() {
    return new Promise<void>((resolve) => {
      const plantData = localStorage.getItem('activePlant');
      if (plantData) {
        this.activePlant = JSON.parse(plantData);
      }
      resolve();
    });
  }

  private async loadGuideSteps() {
    // Simulate API call - Replace with actual service
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        // Mock guide steps based on plant type
        this.guideSteps = this.getMockGuideSteps();
        resolve();
      }, 800);
    });
  }

  private getMockGuideSteps(): GuideStep[] {
    // Mock data - Replace with actual API call
    return [
      {
        step: 1,
        title: 'Preparación del Sistema',
        description: 'Asegúrate de que tu GreenBox esté correctamente instalado y conectado. Verifica que el nivel de agua sea adecuado y que todos los sensores estén funcionando.',
        tips: [
          'Limpia el tanque de agua antes de comenzar',
          'Verifica que la bomba funcione correctamente',
          'Asegúrate de tener buena iluminación'
        ]
      },
      {
        step: 2,
        title: 'Siembra de Semillas',
        description: 'Coloca las semillas en el sustrato hidropónico siguiendo las indicaciones de profundidad. Mantén la humedad constante durante los primeros días.',
        tips: [
          'No entierres las semillas muy profundo',
          'Mantén el sustrato húmedo pero no encharcado',
          'La temperatura ideal es entre 20-25°C'
        ]
      },
      {
        step: 3,
        title: 'Germinación',
        description: 'Durante esta fase (5-7 días), las semillas comenzarán a germinar. Mantén la humedad alta y asegura buena iluminación.',
        tips: [
          'Revisa diariamente el nivel de humedad',
          'Mantén la luz LED encendida 12-14 horas al día',
          'No agregues nutrientes todavía'
        ]
      },
      {
        step: 4,
        title: 'Crecimiento Vegetativo',
        description: 'Las plántulas comenzarán a desarrollar hojas verdaderas. Es momento de agregar nutrientes al agua según las indicaciones.',
        tips: [
          'Comienza con dosis bajas de nutrientes',
          'Aumenta gradualmente la concentración',
          'Monitorea el pH del agua (6.0-6.5)'
        ]
      },
      {
        step: 5,
        title: 'Mantenimiento',
        description: 'Mantén un monitoreo constante de temperatura, humedad y luz. Realiza podas si es necesario para promover un crecimiento saludable.',
        tips: [
          'Revisa las alertas de tu GreenBox diariamente',
          'Limpia las hojas si acumulan polvo',
          'Ajusta la altura de la luz según el crecimiento'
        ]
      },
      {
        step: 6,
        title: 'Cosecha',
        description: 'Cuando la planta alcance el tamaño adecuado, estará lista para cosechar. Corta las hojas externas primero para permitir que sigan creciendo las internas.',
        tips: [
          'Cosecha en las mañanas para mejor sabor',
          'Usa tijeras limpias y afiladas',
          'No cortes más del 30% de la planta a la vez'
        ]
      }
    ];
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
    // TODO: Implement support contact functionality
    alert('Función de soporte en desarrollo. Por ahora, contacta a soporte@greenbox.com');
  }
}
