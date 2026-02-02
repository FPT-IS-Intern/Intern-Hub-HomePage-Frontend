import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DynamicDsService } from 'dynamic-ds';
import { AttendanceHeaderComponent } from './features/weekly-attendance/components/attendance-header/attendance-header.component';
import { WeekdayContainerComponent } from './features/weekly-attendance/components/weekday-selector/weekday-container.component';
import { AttendanceContainerComponent } from './features/weekly-attendance/components/attendance-container/attendance-container.component';

import { HomePageBannerSliderComponent } from './features/slider/slider-banner.component'

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,
    AttendanceHeaderComponent,
    WeekdayContainerComponent,
    AttendanceContainerComponent,
    HomePageBannerSliderComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss' //test
})
  export class App implements OnInit {
    private readonly themeService = inject(DynamicDsService);
    protected readonly title = signal('Homepage-service-fe');

    ngOnInit() {
      this.themeService.initializeTheme().subscribe();
    }

  }
