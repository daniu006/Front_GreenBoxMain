import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'splash',
    pathMatch: 'full',
  },
  {
    path: 'splash',
    loadComponent: () => import('./features/auth/pages/splash/splash.component').then((m) => m.SplashComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'home',
    loadComponent: () => import('./features/home/pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'plants/list',
    loadComponent: () => import('./features/plants/pages/plant-list/plant-list.component').then((m) => m.PlantListComponent),
  },
  {
    path: 'plants/guide',
    loadComponent: () => import('./features/plants/pages/plant-guide/plant-guide.component').then((m) => m.PlantGuideComponent),
  },
  {
    path: 'history',
    loadComponent: () => import('./features/history/pages/history-overview/history-overview.component').then((m) => m.HistoryOverviewComponent),
  },
  {
    path: 'history/sensor-detail',
    loadComponent: () => import('./features/history/pages/sensor-detail/sensor-detail.component').then((m) => m.SensorDetailComponent),
  },
  {
    path: 'notifications',
    loadComponent: () => import('./features/notifications/pages/notification-list/notification-list.component').then((m) => m.NotificationListComponent),
  },
];
