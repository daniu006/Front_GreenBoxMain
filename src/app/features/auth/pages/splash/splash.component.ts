import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from "@ionic/angular/standalone";

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss'],
  standalone: true,
  imports: [IonContent]
})
export class SplashComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
    // Navigate to login after animation completes (3 seconds)
    setTimeout(() => {
      this.navigateToLogin();
    }, 3000);
  }

  private navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
