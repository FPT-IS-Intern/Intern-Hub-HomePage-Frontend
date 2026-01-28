import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-weekday-selector',
    templateUrl: './weekday-selector.component.html',
    styleUrls: ['./weekday-selector.component.css']
})
export class WeekdaySelectorComponent {
    @Input() weekdayName = '';
    @Input() hasCheckin = false;

}
