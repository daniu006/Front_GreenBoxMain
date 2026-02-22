import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonSegment,
  IonRefresher,
  IonContent,
  IonSegmentButton,
  IonLabel,
  IonRefresherContent
} from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { arrowBack } from 'ionicons/icons';
import { HistoryDataPoint } from '../../../../core/models/sensor.model';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { TabBarComponent } from '../../../../shared/components/tab-bar/tab-bar.component';
import { ApiService } from '../../../../core/service/api.service';

@Component({
  selector: 'app-history-overview',
  templateUrl: './history-overview.component.html',
  styleUrls: ['./history-overview.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonSegment,
    IonRefresher,
    IonContent,
    IonSegmentButton,
    IonLabel,
    IonRefresherContent,
    HeaderComponent,
    LoadingSpinnerComponent,
    TabBarComponent
  ]
})
export class HistoryOverviewComponent implements OnInit {
  isLoading: boolean = true;
  selectedRange: string = '24h';

  temperatureData: HistoryDataPoint[] = [];
  humidityData: HistoryDataPoint[] = [];
  lightData: HistoryDataPoint[] = [];
  waterData: HistoryDataPoint[] = [];
  plantInfo: any = null;

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {
    addIcons({
      'arrow-back': arrowBack
    });
  }

  ngOnInit() {
    this.loadHistoryData();
  }

  async loadHistoryData() {
    this.isLoading = true;

    try {
      // Simulate API call - Replace with actual service
      await this.fetchHistoryData();
    } catch (error) {
      console.error('Error loading history data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async fetchHistoryData() {
    const boxId = localStorage.getItem('selectedBoxId') || '1';

    try {
      // 1. Obtener info de la planta para tener los rangos
      const boxResponse = await this.apiService.getBoxInfo(boxId);
      this.plantInfo = boxResponse.box?.plant || null;
      console.log('Plant Info for Charts:', this.plantInfo);
    } catch (e) {
      console.warn('Could not fetch plant info, using defaults');
    }

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const dataPoints = this.getDataPointsCount();

        // Usar límites de la planta o valores por defecto razonables
        const tMin = this.plantInfo?.minTemperature || 18;
        const tMax = this.plantInfo?.maxTemperature || 30;

        const hMin = this.plantInfo?.minHumidity || 40;
        const hMax = this.plantInfo?.maxHumidity || 80;

        this.temperatureData = this.generateMockData(tMin - 5, tMax + 5, dataPoints, tMin, tMax);
        this.humidityData = this.generateMockData(hMin - 10, hMax + 10, dataPoints, hMin, hMax);
        this.lightData = this.generateMockData(0, 100, dataPoints, 0, 100);
        this.waterData = this.generateMockData(0, 100, dataPoints, 20, 100);

        resolve();
      }, 500);
    });
  }

  private getDataPointsCount(): number {
    switch (this.selectedRange) {
      case '24h':
        return 8; // Every 3 hours
      case '7d':
        return 7; // Daily
      case '30d':
        return 10; // Every 3 days
      default:
        return 8;
    }
  }

  private generateMockData(min: number, max: number, count: number, idealMin?: number, idealMax?: number): HistoryDataPoint[] {
    const data: HistoryDataPoint[] = [];
    const range = max - min;

    // Si no hay límites ideales, usamos el rango de generación
    const scaleMin = idealMin !== undefined ? idealMin - (idealMax! - idealMin!) * 0.5 : min;
    const scaleMax = idealMax !== undefined ? idealMax + (idealMax - idealMin!) * 0.5 : max;
    const scaleRange = scaleMax - scaleMin;

    for (let i = 0; i < count; i++) {
      // Generar valor aleatorio dentro del rango [min, max]
      const value = Math.round(min + Math.random() * range);

      // Calcular porcentaje relativo a una escala visual (para que no todas las barras se vean iguales)
      // Usamos una escala un poco más amplia que los límites ideales para dar contexto
      let percentage = ((value - scaleMin) / scaleRange) * 100;

      // Limitar entre 15% y 100% para estética
      percentage = Math.min(100, Math.max(15, percentage));

      data.push({
        value,
        percentage
      });
    }

    return data;
  }

  getSubtitle(): string {
    switch (this.selectedRange) {
      case '24h':
        return 'Últimas 24 horas';
      case '7d':
        return 'Última semana';
      case '30d':
        return 'Último mes';
      default:
        return '';
    }
  }

  onRangeChange(event: any) {
    this.selectedRange = event.detail.value;
    this.loadHistoryData();
  }

  async onRefresh(event: any) {
    await this.loadHistoryData();
    event.target.complete();
  }

  onBackClick() {
    this.router.navigate(['/home']);
  }

  onTabChange(tab: string) {
    switch (tab) {
      case 'home':
        this.router.navigate(['/home']);
        break;
      case 'history':
        // Already on history
        break;
      case 'notifications':
        this.router.navigate(['/notifications']);
        break;
    }
  }
}
