import { Component } from '@angular/core';
import { AttendanceHeaderComponent } from '../components/attendance-header/attendance-header.component';
import { WeekdayContainerComponent } from './weekday-selector/weekday-container.component';
import { AttendanceContainerComponent } from '../components/attendance-container/attendance-container.component';
import { Weekday } from '../models/weekday.model';

@Component({
    selector: 'app-attendance-layout',
    standalone: true,
    imports: [
        AttendanceHeaderComponent,
        WeekdayContainerComponent,
        AttendanceContainerComponent
    ],
    templateUrl: './attendance-layout.component.html',
    styleUrls: ['./attendance-layout.component.css']
})
export class AttendanceLayoutComponent {}
