import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonRefresher,
  IonButton,
  IonIcon,
  IonContent,
  IonRefresherContent
} from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import {
  arrowBack,
  timeOutline,
  arrowUp,
  arrowDown,
  analyticsOutline,
  chevronForward
} from 'ionicons/icons';
import { HistoryDataPoint } from '../../../../core/models/sensor.model';
import { TabBarComponent } from '../../../../shared/components/tab-bar/tab-bar.component';

@Component({
  selector: 'app-sensor-detail',
  templateUrl: './sensor-detail.component.html',
  styleUrls: ['./sensor-detail.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonRefresher,
    IonButton,
    IonIcon,
    IonContent,
    IonRefresherContent,
    TabBarComponent
  ]
})
export class SensorDetailComponent implements OnInit {
  selectedSensor: string = 'temperature';
  sensorTitle: string = 'Temperatura';
  currentUnit: string = '°C';
  currentAverage: number = 0;
  weeklyChange: number = 0;
  maxValue: number = 0;
  minValue: number = 0;

  weeklyData: HistoryDataPoint[] = [];
  dailyDetails: HistoryDataPoint[] = [];

  constructor(private router: Router) {
    addIcons({ arrowBack, timeOutline, analyticsOutline, chevronForward, arrowUp, arrowDown });
  }

  ngOnInit() {
    this.loadSensorData();
  }

  async loadSensorData() {
    // Generate mock data for the selected sensor
    this.updateSensorInfo();
    await this.fetchWeeklyData();
    this.calculateStatistics();
  }

  private updateSensorInfo() {
    switch (this.selectedSensor) {
      case 'temperature':
        this.sensorTitle = 'Temperatura';
        this.currentUnit = '°C';
        break;
      case 'humidity':
        this.sensorTitle = 'Humedad';
        this.currentUnit = '%';
        break;
      case 'light':
        this.sensorTitle = 'Luz';
        this.currentUnit = '%';
        break;
      case 'water':
        this.sensorTitle = 'Nivel de Agua';
        this.currentUnit = '%';
        break;
    }
  }

  private async fetchWeeklyData() {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        const { min, max } = this.getSensorRange();
        const range = max - min;

        this.weeklyData = days.map((day, index) => {
          const value = Math.round(min + Math.random() * range);
          const percentage = ((value - min) / range) * 100;

          return {
            day,
            value,
            percentage: Math.max(30, percentage)
          };
        });

        // Generate daily details
        this.dailyDetails = days.map((day, index) => {
          const value = this.weeklyData[index].value;
          const prevValue = index > 0 ? this.weeklyData[index - 1].value : value;
          const change = value - prevValue;

          return {
            dayName: day,
            date: this.getDateString(index),
            value,
            percentage: this.weeklyData[index].percentage,
            change
          };
        });

        resolve();
      }, 500);
    });
  }

  private getSensorRange(): { min: number; max: number } {
    switch (this.selectedSensor) {
      case 'temperature':
        return { min: 18, max: 28 };
      case 'humidity':
        return { min: 50, max: 80 };
      case 'light':
        return { min: 60, max: 90 };
      case 'water':
        return { min: 40, max: 100 };
      default:
        return { min: 0, max: 100 };
    }
  }

  private getDateString(daysAgo: number): string {
    const date = new Date();
    date.setDate(date.getDate() - (6 - daysAgo));
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  }

  private calculateStatistics() {
    if (this.weeklyData.length === 0) return;

    const values = this.weeklyData.map(d => d.value);
    const sum = values.reduce((a, b) => a + b, 0);

    this.currentAverage = Math.round(sum / values.length);
    this.maxValue = Math.max(...values);
    this.minValue = Math.min(...values);

    // Calculate weekly change (last day vs first day)
    this.weeklyChange = values[values.length - 1] - values[0];
  }

  onSensorSelect(sensor: string) {
    this.selectedSensor = sensor;
    this.loadSensorData();
  }

  getSensorIcon(): string {
    switch (this.selectedSensor) {
      case 'temperature':
        return 'assets/icon/temperatura.png';
      case 'humidity':
        return 'assets/icon/humedad.png';
      case 'light':
        return 'assets/icon/luz.png';
      case 'water':
        return 'assets/icon/agua.png';
      default:
        return 'assets/icon/temperatura.png';
    }
  }

  showDayDetail(day: HistoryDataPoint) {
    alert(`${day.dayName}: ${day.value}${this.currentUnit}\nCambio: ${day.change}${this.currentUnit}`);
  }

  async onRefresh(event: any) {
    await this.loadSensorData();
    event.target.complete();
  }

  onBackClick() {
    this.router.navigate(['/history']);
  }

  goToHistoryOverview() {
    this.router.navigate(['/history']);
  }

  onTabChange(tab: string) {
    switch (tab) {
      case 'home':
        this.router.navigate(['/home']);
        break;
      case 'history':
        this.router.navigate(['/history']);
        break;
      case 'notifications':
        this.router.navigate(['/notifications']);
        break;
    }
  }
}
