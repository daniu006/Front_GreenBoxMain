import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonRefresher,
  IonIcon,
  IonContent,
  IonRefresherContent,
  IonButton
} from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import {
  helpCircleOutline,
  swapHorizontal,
  settingsOutline,
  water,
  bulb, waterOutline, timeOutline, logOutOutline
} from 'ionicons/icons';
import { SensorData, ActuatorStatus, Plant } from '../../../../core/models/api.models';
import { ApiService } from '../../../../core/service/api.service';
import { AuthService } from '../../../../core/service/auth.service';

// Import shared components
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { SensorCardComponent } from '../../../../shared/components/sensor-card/sensor-card.component';
import { TabBarComponent } from '../../../../shared/components/tab-bar/tab-bar.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonRefresher,
    IonIcon,
    IonContent,
    IonRefresherContent,
    LoadingSpinnerComponent,
    SensorCardComponent,
    TabBarComponent
  ]
})
export class HomeComponent implements OnInit {
  isLoading: boolean = true;
  activePlant: Plant | null = null;
  unreadCount: number = 0;

  sensorData: SensorData = {
    temp: 0,
    hum: 0,
    light: 0,
    water: 0,
    soilMoisture: 0
  };

  actuatorStatus: ActuatorStatus | null = null;
  plantHealthStatus: string = 'good';
  plantHealthText: string = 'Saludable';

  constructor(
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService
  ) {
    addIcons({ helpCircleOutline, settingsOutline, bulb, water, waterOutline, timeOutline, swapHorizontal, logOutOutline });
  }

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.isLoading = true;

    try {
      // Load active plant from localStorage or API
      await this.loadActivePlant();

      // Load sensor data
      await this.loadSensorData();

      // Load actuator status
      await this.loadActuatorStatus();

      // Load notifications count
      await this.loadNotificationsCount();

      // Calculate plant health
      this.calculatePlantHealth();

    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async loadActivePlant() {
    const boxId = this.authService.getBoxId();
    if (!boxId) return;

    try {
      const response = await this.apiService.getBoxInfo(boxId);
      if (response && response.box && response.box.plantId) {
        // Obtenemos la información de la planta desde el catálogo
        const plantsRes = await this.apiService.getPlants();
        const plant = plantsRes.data.find((p: any) => p.id === response.box.plantId);

        if (plant) {
          this.activePlant = {
            ...plant,
            imageUrl: `assets/plants/${plant.name.toLowerCase().replace(/ /g, '-')}.jpg`
          };
        }
      } else {
        this.activePlant = null;
      }
    } catch (error) {
      console.error('Error loading active plant:', error);
      this.activePlant = null;
    }
  }

  private async loadSensorData() {
    const boxId = this.authService.getBoxId();
    if (!boxId) {
      console.warn('No boxId found');
      return;
    }

    try {
      const data = await this.apiService.getLatestByBox(boxId);
      this.sensorData = {
        temp: data.temp,
        hum: data.hum,
        light: data.light,
        water: data.water,
        soilMoisture: data.soilMoisture
      };
    } catch (error) {
      console.error('Error loading sensor data:', error);
    }
  }

  private async loadActuatorStatus() {
    const boxId = this.authService.getBoxId();
    if (!boxId) {
      console.warn('No boxId found');
      return;
    }

    try {
      const status = await this.apiService.getActuatorStatus(boxId);
      if (status) {
        this.actuatorStatus = status as any; // API model compatibility
      }
    } catch (error) {
      console.error('Error loading actuator status:', error);
    }
  }

  private async loadNotificationsCount() {
    const boxId = this.authService.getBoxId();
    if (!boxId) {
      console.warn('No boxId found');
      return;
    }

    try {
      const notifications = await this.apiService.getActiveNotifications(boxId);
      this.unreadCount = notifications.length;
    } catch (error) {
      console.error('Error loading notifications count:', error);
      this.unreadCount = 0;
    }
  }

  private calculatePlantHealth() {
    const { temp, hum, light, water } = this.sensorData;

    // Simple health calculation - can be improved with plant-specific ranges
    const tempOk = temp >= 18 && temp <= 28;
    const humOk = hum >= 50 && hum <= 80;
    const lightOk = light >= 60;
    const waterOk = water >= 40;
    const soilOk = this.sensorData.soilMoisture >= 30; // Validación simple

    const healthyCount = [tempOk, humOk, lightOk, waterOk, soilOk].filter(Boolean).length;

    if (healthyCount >= 4) { // Requiere 4/5 para estar "bien"
      this.plantHealthStatus = 'good';
      this.plantHealthText = 'Saludable';
    } else {
      this.plantHealthStatus = 'bad';
      this.plantHealthText = 'Requiere atención';
    }
  }

  getSensorStatus(sensor: string): 'good' | 'bad' {
    const value = this.sensorData[sensor as keyof SensorData] as number;

    switch (sensor) {
      case 'temp':
        return value >= 18 && value <= 28 ? 'good' : 'bad';
      case 'hum':
        return value >= 50 && value <= 80 ? 'good' : 'bad';
      case 'light':
        return value >= 60 ? 'good' : 'bad';
      case 'water':
        return value >= 40 ? 'good' : 'bad';
      case 'soilMoisture':
        return value >= 30 ? 'good' : 'bad';
      default:
        return 'good';
    }
  }

  getSensorStatusText(sensor: string): string {
    const status = this.getSensorStatus(sensor);
    return status === 'good' ? 'Óptimo' : 'Bajo';
  }

  async onRefresh(event: any) {
    await this.loadData();
    event.target.complete();
  }

  onGuideClick() {
    this.router.navigate(['/plants/guide']);
  }

  onChangePlantClick() {
    this.router.navigate(['/plants/list']);
  }

  onImageError(event: any) {
    event.target.src = 'assets/plants/default-plant.jpg';
  }

  onTabChange(tab: string) {
    switch (tab) {
      case 'home':
        // Already on home
        break;
      case 'history':
        this.router.navigate(['/history']);
        break;
      case 'notifications':
        this.router.navigate(['/notifications']);
        break;
    }
  }

  onLogout() {
    this.authService.logout();
  }
}
