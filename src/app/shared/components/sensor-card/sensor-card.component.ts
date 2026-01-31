import { Component, Input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-sensor-card',
  templateUrl: './sensor-card.component.html',
  styleUrls: ['./sensor-card.component.scss'],
  standalone: true,
  imports: [CommonModule, DecimalPipe]
})
export class SensorCardComponent {
  @Input() title: string = '';
  @Input() value: number = 0;
  @Input() unit: string = '';
  @Input() iconPath: string = '';
  @Input() status: 'good' | 'bad' = 'good';
  @Input() statusText: string = '';
}
