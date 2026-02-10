import { Component, signal, inject, OnInit } from '@angular/core';
import { DynamicDsService } from 'dynamic-ds';
import { HomePageBannerSliderComponent } from '../../components/slider/slider-banner.component';
import { AttendanceLayoutComponent } from '../../components/weekly-attendance/components/attendance-layout.component';
import { CardListContainerComponent } from '../../components/card-list/card-list-container.component';

@Component({
  selector: 'app-main',
  imports: [HomePageBannerSliderComponent, AttendanceLayoutComponent, CardListContainerComponent],
  templateUrl: './main.html',
  styleUrl: './main.scss',
})
export class Main implements OnInit {
  private readonly themeService = inject(DynamicDsService);
  protected readonly title = signal('Homepage-service-fe');

  ngOnInit() {
    this.themeService.initializeTheme().subscribe();
  }
}
