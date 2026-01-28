import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DynamicDsService } from 'dynamic-ds';
import { AttendanceHeaderComponent } from './features/weekly-attendance/components/attendance-header/attendance-header.component';
import { WeekdaySelectorComponent } from './features/weekly-attendance/components/weekday-selector/weekday-selector.component';
import { AttendanceCardComponent } from './features/weekly-attendance/components/attendance-container/attendance-card.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,
    AttendanceHeaderComponent,
    WeekdaySelectorComponent,
    AttendanceCardComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css' //test
})
export class App implements OnInit {
  private themeService = inject(DynamicDsService);
  protected readonly title = signal('Homepage-service-fe');

  ngOnInit() {
    this.themeService.initializeTheme().subscribe();
  }

}
