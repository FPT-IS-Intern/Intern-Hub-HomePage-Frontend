import { Component, OnInit, inject } from '@angular/core';
import { WeekdaySelectorComponent } from './weekday-selector.component';
import { Weekday } from '../../models/weekday.model';
import { AttendanceService } from '../../../../services/api.attendance.service';

@Component({
  selector: 'app-weekday-container',
  standalone: true,
  imports: [WeekdaySelectorComponent],
  templateUrl: './weekday-container.component.html',
  styleUrls: ['./weekday-container.component.scss'],
})
export class WeekdayContainerComponent implements OnInit {
  private api = inject(AttendanceService);

  weekdays: Weekday[] = [
    { name: 'MON', checked: false },
    { name: 'TUE', checked: false },
    { name: 'WED', checked: false },
    { name: 'THU', checked: false },
    { name: 'FRI', checked: false },
  ];

  ngOnInit(): void {
    this.api.getAttendanceInWeek().subscribe({
      next: (daysFromApi) => this.updateCheckedState(daysFromApi),
      error: (err) => console.error('Lỗi khi tải dữ liệu:', err),
    });
  }

  private updateCheckedState(apiDays: string[]): void {
    const checkedDaySet = new Set(apiDays.map((d) => String(d || '').trim().toUpperCase()));
    this.weekdays = this.weekdays.map((day) => ({
      ...day,
      checked: checkedDaySet.has(day.name),
    }));
  }
}
