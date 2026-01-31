import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonIcon } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { arrowBack, helpCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon]
})
export class HeaderComponent {
  @Input() title: string = '';
  @Input() subtitle?: string;
  @Input() showBackButton: boolean = false;
  @Input() showHelpButton: boolean = false;

  @Output() backClick = new EventEmitter<void>();
  @Output() helpClick = new EventEmitter<void>();

  constructor() {
    addIcons({
      'arrow-back': arrowBack,
      'help-circle-outline': helpCircleOutline
    });
  }

  onBackClick() {
    this.backClick.emit();
  }

  onHelpClick() {
    this.helpClick.emit();
  }
}
