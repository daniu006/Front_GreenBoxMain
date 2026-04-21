import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { IonApp, IonRouterOutlet, Platform } from '@ionic/angular/standalone';
import { App } from '@capacitor/app';

import { NotificationService } from './core/service/notification.service';

/**
 * Rutas que se consideran "raíz" — al pulsar atrás desde ellas se sale de la app.
 * El splash y login también cierran la app para evitar que el usuario regrese a ellos
 * después de autenticarse.
 */
const ROOT_ROUTES = ['/home', '/splash', '/login'];

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {

  constructor(
    private notificationService: NotificationService,
    private platform: Platform,
    private router: Router,
    private location: Location,
  ) {
    this.notificationService.initPush();
    this.initBackButton();
  }

  /**
   * Maneja el botón físico "atrás" de Android.
   *
   * Lógica:
   * - Si estamos en una ruta raíz (home, splash, login) → salir de la app.
   * - Cualquier otra ruta → `location.back()` que usa el historial del navegador/router de Angular.
   */
  private initBackButton(): void {
    this.platform.backButton.subscribeWithPriority(10, () => {
      const currentUrl = this.router.url.split('?')[0]; // quitar query params

      const isRootRoute = ROOT_ROUTES.includes(currentUrl);

      if (isRootRoute) {
        // Salir de la aplicación
        App.exitApp();
      } else {
        // Navegar hacia atrás usando el historial del browser/angular router
        this.location.back();
      }
    });
  }
}
