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

  constructor(private router: Router) {
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
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        // Generate mock data based on selected range
        const dataPoints = this.getDataPointsCount();

        this.temperatureData = this.generateMockData(18, 28, dataPoints);
        this.humidityData = this.generateMockData(50, 80, dataPoints);
        this.lightData = this.generateMockData(60, 90, dataPoints);
        this.waterData = this.generateMockData(40, 100, dataPoints);

        resolve();
      }, 800);
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

  private generateMockData(min: number, max: number, count: number): HistoryDataPoint[] {
    const data: HistoryDataPoint[] = [];
    const range = max - min;

    for (let i = 0; i < count; i++) {
      const value = Math.round(min + Math.random() * range);
      const percentage = ((value - min) / range) * 100;

      data.push({
        value,
        percentage: Math.max(30, percentage) // Minimum 30% for visibility
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
