import { Component } from '@angular/core';
import { AttendanceHeaderComponent } from '../components/attendance-header/attendance-header.component';
import { WeekdayContainerComponent } from './weekday-selector/weekday-container.component';
import { AttendanceContainerComponent } from '../components/attendance-container/attendance-container.component';
import { AttendanceHistoryButtonComponent } from './button-action/attendance-history.component';

@Component({
    selector: 'app-attendance-layout',
    standalone: true,
    imports: [
        AttendanceHeaderComponent,
        WeekdayContainerComponent,
        AttendanceContainerComponent,
        AttendanceHistoryButtonComponent
    ],
    templateUrl: './attendance-layout.component.html',
    styleUrls: ['./attendance-layout.component.scss']
})
export class AttendanceLayoutComponent {}
