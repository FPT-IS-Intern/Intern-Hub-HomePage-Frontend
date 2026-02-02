import { Component, OnInit, inject } from '@angular/core';
import { WeekdaySelectorComponent } from './weekday-selector.component';
import { Weekday } from '../../models/weekday.model';
import { ScheduleApiService } from '../../services/api.schedule.service';

@Component({
  selector: 'app-weekday-container',
  standalone: true,
  imports: [WeekdaySelectorComponent],
  templateUrl: './weekday-container.component.html',
  styleUrls: ['./weekday-container.component.css']
})
export class WeekdayContainerComponent implements OnInit {
  private api = inject(ScheduleApiService);

  weekdays: Weekday[] = [
    { name: 'MON', checked: false },
    { name: 'TUE', checked: false },
    { name: 'WED', checked: false },
    { name: 'THU', checked: false },
    { name: 'FRI', checked: false },
  ];

  ngOnInit(): void {
    this.api.getCheckedDays().subscribe({
      next: (daysFromApi) => this.updateCheckedState(daysFromApi),
      error: (err) => console.error('Lỗi khi tải dữ liệu:', err)
    });
  }

  private updateCheckedState(apiDays: string[]): void {
    this.weekdays.forEach(day => {
      day.checked = apiDays.includes(day.name);
    });
  }
  
}