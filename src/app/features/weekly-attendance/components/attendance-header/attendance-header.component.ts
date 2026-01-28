import { Component, Input, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * AttendanceHeaderComponent
 * -------------------------
 * Header hiển thị thông tin điểm danh:
 * - Tên mạng Wi-Fi hiện tại của thiết bị.
 * - Ngày hiện tại (định dạng theo locale VN)
 * - Thời gian thực (HH:mm:ss)
 *
 * Component sử dụng Angular Signals để quản lý state thời gian
 * và tự động cleanup interval khi component bị destroy.
 */

@Component({
  selector: 'app-attendance-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attendance-header.component.html',
  styleUrls: ['./attendance-header.component.css']
})
export class AttendanceHeaderComponent implements OnInit, OnDestroy {
  @Input() wifiName : string = 'FIS HCM';

  currentTime = signal(new Date());
  private intervalId: any;

  // Format thời gian: HH:mm:ss
  displayTime = computed(() => {
    const timeObj = this.currentTime();
    const hours = String(timeObj.getHours()).padStart(2, '0');
    const minutes = String(timeObj.getMinutes()).padStart(2, '0');
    const seconds = String(timeObj.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  });

  displayDate = computed(() => {
    const timeObj = this.currentTime();
    const daysVN = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']; // i18n có thể tích hợp sau
    const dayName = daysVN[timeObj.getDay()];
    const dayNum = String(timeObj.getDate()).padStart(2, '0');
    const month = String(timeObj.getMonth() + 1).padStart(2, '0');
    const year = timeObj.getFullYear();
    
    return `${dayName}, ${dayNum}/${month}/${year}`;
  });

  ngOnInit() {
    this.intervalId = setInterval(() => {
      this.currentTime.set(new Date());
    }, 1000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}