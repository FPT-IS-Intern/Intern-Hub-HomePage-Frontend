import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { AttendanceItemComponent } from './attendance-item.component'; // Import con

@Component({
  selector: 'app-attendance-container',
  standalone: true,
  imports: [AttendanceItemComponent],
  templateUrl: './attendance-container.component.html',
  styleUrls: ['./attendance-container.component.css']
})

export class AttendanceContainerComponent {
  checkInImage = 'assets/img/home/img_checkin.svg';
  checkOutImage = 'assets/img/home/img_checkout.svg';
  checkInLabel = 'Check In';
  checkOutLabel = 'Check Out';

  // Tách biệt dữ liệu cho 2 nút
  checkInTime: string | null = null;
  checkInMessage: string | null = null;

  checkOutTime: string | null = null;
  checkOutMessage: string | null = null;

  constructor(private http: HttpClient) { }

  handleCheckIn() {
    // this.checkInMessage = 'Check in thành công (7:45) trước  8:30';
    this.checkInMessage = 'Check in thành công (10:30) trễ hơn 8:30';
  }

  handleCheckOut() {
    // this.checkOutMessage = 'Check out thành công (18:05) sau 17:30';
    this.checkOutMessage = 'Check out thành công (18:05) sau 17:30';
  }
}