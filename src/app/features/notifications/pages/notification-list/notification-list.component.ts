import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonRefresher,
  IonButton,
  IonSegment,
  IonIcon,
  IonContent,
  IonRefresherContent,
  IonSegmentButton,
  IonLabel,
  IonSpinner
} from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import {
  arrowBack,
  notificationsOutline,
  checkmarkDone,
  close,
  leafOutline,
  settingsOutline,
  notificationsOffOutline,
  alertCircle,
  alertCircleOutline,
  timeOutline,
  informationCircle,
  warning,
  thermometerOutline,
  waterOutline,
  sunnyOutline,
  cloudyOutline
} from 'ionicons/icons';
import { Notification } from '../../../../core/models/notification.model';
import { Alert } from '../../../../core/models/api.models';
import { ApiService } from '../../../../core/service/api.service';
import { AuthService } from '../../../../core/service/auth.service';

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonRefresher,
    IonButton,
    IonSegment,
    IonIcon,
    IonContent,
    IonRefresherContent,
    IonSegmentButton,
    IonLabel,
    IonSpinner
  ]
})
export class NotificationListComponent implements OnInit {
  isLoading: boolean = true;
  selectedFilter: string = 'all';
  unreadCount: number = 0;

  allNotifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  todayNotifications: Notification[] = [];
  olderNotifications: Notification[] = [];

  constructor(
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService
  ) {
    addIcons({
      arrowBack,
      notificationsOutline,
      checkmarkDone,
      leafOutline,
      close,
      settingsOutline,
      notificationsOffOutline,
      alertCircle,
      alertCircleOutline,
      timeOutline,
      informationCircle,
      warning,
      thermometerOutline,
      waterOutline,
      sunnyOutline,
      cloudyOutline
    });
  }

  ngOnInit() {
    this.loadNotifications();
  }

  async loadNotifications() {
    this.isLoading = true;

    try {
      await this.fetchNotifications();
      this.filterNotifications();
      this.separateNotificationsByDate();
      this.calculateUnreadCount();
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async fetchNotifications() {
    const boxId = this.authService.getBoxId();
    if (!boxId) {
      console.warn('No boxId found');
      return;
    }

    try {
      const response: any = await this.apiService.getNotifications(boxId);
      const alerts = Array.isArray(response) ? response : (response.data || []);

      // Convert API alerts to local notification format
      this.allNotifications = alerts.map((alert: any) => this.convertAlertToNotification(alert));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      this.allNotifications = [];
    }
  }

  private convertAlertToNotification(alert: Alert): Notification {
    const timestamp = new Date(alert.createdAt);
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    let timeText = '';
    if (diffMins < 60) {
      timeText = `Hace ${diffMins} min`;
    } else if (diffHours < 24) {
      timeText = `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else if (diffDays === 1) {
      timeText = 'Ayer';
    } else {
      timeText = timestamp.toLocaleDateString();
    }

    return {
      id: alert.id.toString(),
      type: alert.type as any,
      priority: alert.priority as 'high' | 'medium' | 'low',
      title: this.getAlertTitle(alert.type),
      message: alert.message,
      time: timeText,
      date: timestamp.toLocaleDateString(),
      read: alert.resolved,
      timestamp: timestamp,
      plantName: 'GreenBox'
    };
  }

  private getAlertTitle(type: string): string {
    const titleMap: { [key: string]: string } = {
      'temperature': 'Temperatura Anormal',
      'humidity': 'Humedad Fuera de Rango',
      'light': 'Problema de Iluminación',
      'soilMoisture': 'Humedad de Suelo',
      'water': 'Nivel de Agua',
      'system': 'Sistema',
      'info': 'Información'
    };
    return titleMap[type] || 'Alerta';
  }

  private filterNotifications() {
    if (this.selectedFilter === 'active') {
      this.filteredNotifications = this.allNotifications.filter(n => !n.read);
    } else {
      this.filteredNotifications = [...this.allNotifications];
    }
  }

  private separateNotificationsByDate() {
    const today = new Date().toLocaleDateString();

    this.todayNotifications = this.filteredNotifications.filter(
      n => n.date === today
    );

    this.olderNotifications = this.filteredNotifications.filter(
      n => n.date !== today
    );
  }

  private calculateUnreadCount() {
    this.unreadCount = this.allNotifications.filter(n => !n.read).length;
  }

  onFilterChange(event: any) {
    this.selectedFilter = event.detail.value;
    this.filterNotifications();
    this.separateNotificationsByDate();
  }

  openNotification(notification: Notification) {
    // Mark as read locally, but wait for user action or backend sync if needed
    // notification.read = true; 
    // this.calculateUnreadCount();

    // Navigate based on notification type
    if (notification.plantId) {
      this.router.navigate(['/home']);
    }
  }

  async dismissNotification(notification: Notification, event: Event) {
    event.stopPropagation();
    try {
      await this.apiService.deleteNotification(parseInt(notification.id));
      this.allNotifications = this.allNotifications.filter(n => n.id !== notification.id);
      this.filterNotifications();
      this.separateNotificationsByDate();
      this.calculateUnreadCount();
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  }

  async markAllAsRead() {
    const boxId = this.authService.getBoxId();
    if (!boxId) return;

    try {
      await this.apiService.markAllNotificationsAsRead(boxId);
      this.allNotifications.forEach(n => n.read = true);
      this.calculateUnreadCount();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }

  getIconName(type: string): string {
    switch (type) {
      case 'temperature':
        return 'thermometer-outline';
      case 'water':
        return 'water-outline';
      case 'soilMoisture':
        return 'leaf-outline';
      case 'humidity':
        return 'cloudy-outline';
      case 'light':
        return 'sunny-outline';
      case 'system':
        return 'settings-outline';
      case 'info':
        return 'information-circle';
      default:
        return 'alert-circle-outline';
    }
  }

  getIconClass(type: string): string {
    return `icon-${type}`;
  }

  getPriorityText(priority: string): string {
    switch (priority) {
      case 'high':
        return 'Urgente';
      case 'medium':
        return 'Media';
      case 'low':
        return 'Baja';
      default:
        return '';
    }
  }

  async refreshData(event: any) {
    await this.loadNotifications();
    event.target.complete();
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  openSettings() {
    alert('Configuración de notificaciones en desarrollo');
  }
}
