import { Component } from '@angular/core';
import { AttendanceHeaderComponent } from '../components/attendance-header/attendance-header.component';
import { WeekdayContainerComponent } from './weekday-selector/weekday-container.component';
import { AttendanceContainerComponent } from '../components/attendance-container/attendance-container.component';
import { AttendanceHistoryButtonComponent } from './button-action/attendance-history-button.component';
import { TicketActionButtonComponent } from './button-action/create-ticket-button.component';
import { MyTicketButtonComponent } from './button-action/my-tickets-button.component';

@Component({
    selector: 'app-attendance-layout',
    standalone: true,
    imports: [
        AttendanceHeaderComponent,
        WeekdayContainerComponent,
        AttendanceContainerComponent,
        AttendanceHistoryButtonComponent,
        TicketActionButtonComponent,
        MyTicketButtonComponent
    ],
    templateUrl: './attendance-layout.component.html',
    styleUrls: ['./attendance-layout.component.scss']
})
export class AttendanceLayoutComponent {}
