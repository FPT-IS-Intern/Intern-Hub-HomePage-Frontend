import { Component } from '@angular/core';
import { WeekdaySelectorComponent } from './weekday-selector.component'; // Đảm bảo đúng đường dẫn

@Component({
  selector: 'app-weekday-container',
  standalone: true,
  imports: [WeekdaySelectorComponent],
  templateUrl: './weekday-container.component.html',
  styleUrls: ['./weekday-container.component.css']
})
export class WeekdayContainerComponent {
  weekdays = [
    { name: 'MON', checked: true },
    { name: 'TUE', checked: true },
    { name: 'WED', checked: false },
    { name: 'THU', checked: true },
    { name: 'FRI', checked: false },
  ];
}