import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonFooter, IonToolbar } from "@ionic/angular/standalone";

@Component({
  selector: 'app-tab-bar',
  templateUrl: './tab-bar.component.html',
  styleUrls: ['./tab-bar.component.scss'],
  standalone: true,
  imports: [CommonModule, IonFooter, IonToolbar]
})
export class TabBarComponent {
  @Input() activeTab: string = 'home';
  @Input() unreadCount: number = 0;

  @Output() tabClick = new EventEmitter<string>();

  onTabClick(tab: string) {
    this.tabClick.emit(tab);
  }
}
