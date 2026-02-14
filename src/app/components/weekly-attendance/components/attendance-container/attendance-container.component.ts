import { Component, OnInit, inject, signal, computed, viewChild } from '@angular/core';
import { AttendanceService } from '../../services/api.attendance.service';
import { AttendanceResponseData } from '../../models/attendance.model';
import { AttendanceItemComponent } from './attendance-item.component'
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../../libs/model-popup/modal.component';
import { NotificationService } from '../../../../libs/notification-text/notification-bridge.service';

@Component({
  selector: 'app-attendance-container',
  standalone: true,
  imports: [AttendanceItemComponent, CommonModule, ModalComponent],
  templateUrl: './attendance-container.component.html',
  styleUrls: ['./attendance-container.component.scss']
})
export class AttendanceContainerComponent {
  private service = inject(AttendanceService);
  private bridge = inject(NotificationService);
  modal = viewChild<ModalComponent>('modal');
  // UI State
  isLoading = signal(false);
  showPopup = signal(false);
  remoteRequestPending = signal(false);

  // Data State
  checkIn = signal<AttendanceResponseData>({ time: null, displayMessage: null, isCheckTimeValid: false });
  checkOut = signal<AttendanceResponseData>({ time: null, displayMessage: null, isCheckTimeValid: false });

  checkInLabel = computed(() => this.remoteRequestPending() ? 'chờ ghi nhận...' : 'Check In');
  isCheckInDisabled = computed(() => this.showPopup() || this.remoteRequestPending() || !!this.checkIn().time);
  isCheckOutDisabled = computed(() => !this.checkIn().time || this.remoteRequestPending() || !!this.checkOut().time);


  ngOnInit() {
    this.isLoading.set(true);
    this.service.getAttendanceStatus().subscribe({
      next: (res) => {
        if (res.data) {
          this.checkIn.set(res.data.checkIn);
          this.checkOut.set(res.data.checkOut);
        }
      },
      error: (err) => console.error('API Fail', err),
      complete: () => this.isLoading.set(false)
    });
  }

  /**
   * Logic xử lý chung cho cả Checkin và Checkout
   * @param action 'IN' | 'OUT'
   */
  processAttendance(action: 'IN' | 'OUT') {
    this.isLoading.set(true);
    this.service.checkNetwork().subscribe({
      next: (wifi) => {
        console.log('Network check result:', wifi);
        if (!wifi.companyWifi) {
          this.isLoading.set(false); // Fix: Stop loading before showing popup
          this.showPopup.set(true);
          const modalRef = this.modal();
          if (modalRef) {
            this.openConfirmPopupRemote(modalRef);
          }
          return;
        }

        const apiCall = action === 'IN' ? this.service.postCheckIn() : this.service.postCheckOut();

        apiCall.subscribe({
          next: (res) => {
            this.isLoading.set(false);
            if (action === 'IN') {
              this.checkIn.set({ time: res.data.time, displayMessage: res.data.displayMessage, isCheckTimeValid: res.data.isCheckTimeValid });
            } else {
              this.checkOut.set({ time: res.data.time, displayMessage: res.data.displayMessage, isCheckTimeValid: res.data.isCheckTimeValid });
            }
            console.log('Calling API for action:', res);
          },
          error: (err) => {
            console.error('CheckIn/Out success but with error response or HTTP error:', err);
            this.isLoading.set(false);
          }
        });
      },
      error: (err) => {
        console.error('Network check failed:', err);
        this.isLoading.set(false);
      }
    });
  }

  createRemoteRequest() {
    this.showPopup.set(false);
    // redirect to create remote request page

    this.bridge.show('Check in của bạn sẽ được ghi nhận sau khi phiếu yêu cầu  được duyệt.');
    this.remoteRequestPending.set(true);

    // giả lập yêu cầu được phê duyệt sao n(s)
    setTimeout(() => {
      this.remoteRequestPending.set(false);
      this.bridge.clear();
    }, 2000);


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