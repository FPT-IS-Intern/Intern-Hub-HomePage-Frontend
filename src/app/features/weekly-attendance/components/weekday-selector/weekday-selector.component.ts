import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-weekday-selector',
    templateUrl: './weekday-selector.component.html',
    styleUrls: ['./weekday-selector.component.scss']
})
export class WeekdaySelectorComponent {
    @Input() weekdayName = '';
    @Input() hasCheckin = false;

}
