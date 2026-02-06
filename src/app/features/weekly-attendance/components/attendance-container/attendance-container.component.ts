import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { AttendanceService } from '../../services/api.attendance.service';
import { AttendanceResponseData } from '../../models/attendance.model';
import { AttendanceItemComponent } from './attendance-item.component'
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../../libs/model-popup/modal.component';

@Component({
  selector: 'app-attendance-container',
  standalone: true,
  imports: [AttendanceItemComponent, CommonModule, ModalComponent],
  templateUrl: './attendance-container.component.html',
  styleUrls: ['./attendance-container.component.scss']
})
export class AttendanceContainerComponent {
  private service = inject(AttendanceService);

  // UI State
  isLoading = signal(false);
  showPopup = signal(false);
  remoteRequestPending = signal(false);

  // Data State
  checkIn = signal<AttendanceResponseData>({ time: null, displayMessage: null, attendanceStatus: null });
  checkOut = signal<AttendanceResponseData>({ time: null, displayMessage: null, attendanceStatus: null });

  /**
   * Logic xử lý chung cho cả Checkin và Checkout
   * @param action 'IN' | 'OUT'
   */
  processAttendance(action: 'IN' | 'OUT', modal?: ModalComponent) {
    this.isLoading.set(true);
    this.openConfirmPopupRemote(modal);
    this.service.checkNetwork().subscribe({
      next: (wifi) => {
        if (!wifi.isCompanyWifi) {
          this.isLoading.set(false);
          this.showPopup.set(true);

          return;
        }

        const apiCall = action === 'IN' ? this.service.postCheckIn() : this.service.postCheckOut();

        apiCall.subscribe({
          next: (res) => {
            this.isLoading.set(false);
            if (action === 'IN') {
              this.checkIn.set({ time: res.data.time, displayMessage: res.data.displayMessage, attendanceStatus: res.data.attendanceStatus });
            } else {
              this.checkOut.set({ time: res.data.time, displayMessage: res.data.displayMessage, attendanceStatus: res.data.attendanceStatus });
            }
            console.log('Calling API for action:', res);
          },
          error: () => this.isLoading.set(false)
        });
      },
      error: () => this.isLoading.set(false)
    });
  }

  createRemoteRequest() {
    this.showPopup.set(false);
    this.remoteRequestPending.set(true);

    setTimeout(() => {
      this.checkIn.set({
        time: '08:00',
        displayMessage: 'Đã gửi phiếu Remote - Chờ duyệt',
        attendanceStatus: 'SUCCESS'
      });
    }, 8000);
  }

  openConfirmPopupRemote(modal?: ModalComponent) {
    modal?.open({
      message: 'Hệ thống đang ghi nhận vị trí của bạn sai (hoặc ngoài bán kính cho phép) hoặc chưa có phiếu làm Remote. Vui lòng tạo phiếu',
      cancelText: 'Hủy',
      confirmText: 'Tạo phiếu',
      panelClass: 'my-custom-modal',
      onConfirm: () => this.createRemoteRequest(),
      onCancel: () => this.showPopup.set(false),
    });
  }
}