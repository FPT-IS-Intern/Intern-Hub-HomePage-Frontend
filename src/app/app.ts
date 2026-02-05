import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DynamicDsService } from 'dynamic-ds';

import { AttendanceLayoutComponent } from './features/weekly-attendance/components/attendance-layout.component';
import { HomePageBannerSliderComponent } from './features/slider/slider-banner.component'
import { CardListContainerComponent } from './features/card-list/card-list-container.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,
    HomePageBannerSliderComponent,
    AttendanceLayoutComponent,
    CardListContainerComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private readonly themeService = inject(DynamicDsService);
  protected readonly title = signal('Homepage-service-fe');

  ngOnInit() {
    this.themeService.initializeTheme().subscribe();
  }

}
