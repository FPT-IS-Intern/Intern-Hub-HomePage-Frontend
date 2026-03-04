import { Component, OnInit, inject, signal, computed, viewChild } from '@angular/core';
import { AttendanceService } from '../../../../services/api.attendance.service';
import { AttendanceStatusData } from '../../models/attendance.model';
import { AttendanceItemComponent } from './attendance-item.component';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../../libs/model-popup/modal.component';
import { NotificationService } from '../../../../libs/notification-text/notification-bridge.service';

@Component({
  selector: 'app-attendance-container',
  standalone: true,
  imports: [AttendanceItemComponent, CommonModule, ModalComponent],
  templateUrl: './attendance-container.component.html',
  styleUrls: ['./attendance-container.component.scss'],
})
export class AttendanceContainerComponent implements OnInit {
  private service = inject(AttendanceService);
  private bridge = inject(NotificationService);
  modal = viewChild<ModalComponent>('modal');

  // UI State
  isLoading = signal(false);
  showPopup = signal(false);
  remoteRequestPending = signal(false);
  checkInLoading = signal(false);
  checkOutLoading = signal(false);

  // Data State - Single source of truth from backend
  status = signal<AttendanceStatusData>({
    checkInTime: null,
    checkOutTime: null,
    checkInMessage: null,
    checkOutMessage: null,
    isCheckInValid: false,
    isCheckOutValid: false,
    canCheckIn: false,
    canCheckOut: false,
    sessionOpen: false,
    openSessionBranchId: null,
    statusMessage: null,
  });
  currentBranchId = signal<string | null>(null);

  isDifferentBranch = computed(() => {
    const sessionBranch = this.status().openSessionBranchId;
    const currentBranch = this.currentBranchId();
    return !!sessionBranch && !!currentBranch && sessionBranch !== currentBranch;
  });

  checkInLabel = computed(() => (this.remoteRequestPending() ? 'chờ ghi nhận...' : 'Check In'));

  isCheckInDisabled = computed(
    () => this.showPopup() || this.remoteRequestPending() || !this.status().canCheckIn
  );

  isCheckOutDisabled = computed(
    () => this.showPopup() || this.remoteRequestPending() || !this.status().canCheckOut
  );

  ngOnInit() {
    this.refreshStatus();
  }

  refreshStatus() {
    this.isLoading.set(true);

    // Fetch network info to get current branch ID
    this.service.checkNetwork().subscribe({
      next: (wifi) => this.currentBranchId.set(wifi.branchId),
      error: (err) => console.error('Check Network Fail', err)
    });

    this.service.getAttendanceStatus().subscribe({
      next: (res) => {
        if (res.data) {
          this.status.set(res.data);
        }
      },
      error: (err) => console.error('API Fail', err),
      complete: () => this.isLoading.set(false),
    });
  }

  /**
   * Logic xử lý chung cho cả Checkin và Checkout
   * @param action 'IN' | 'OUT'
   */
  processAttendance(action: 'IN' | 'OUT') {
    const isCheckIn = action === 'IN';
    const modalRef = this.modal();

    if (!modalRef) {
      console.error('Modal component not found');
      return;
    }

    modalRef.open({
      message: 'Bạn có muốn sử dụng vị trí hiện tại của mình để kết quả điểm danh chính xác hơn không?',
      confirmText: 'Sử dụng vị trí',
      cancelText: 'Chỉ dùng WiFi',
      closeOnBackdropClick: true,
      onConfirm: () => {
        if (isCheckIn) this.checkInLoading.set(true);
        else this.checkOutLoading.set(true);

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              this.executeAttendance(action, position.coords.latitude, position.coords.longitude);
            },
            (error) => {
              console.warn('Geolocation failed:', error);
              let errorMsg = '';
              let guide = '';

              if (error.code === error.PERMISSION_DENIED) {
                errorMsg = 'Quyền truy cập vị trí đã bị chặn.';
                guide = '\n\nHướng dẫn: Hãy nhấn vào biểu tượng [Ổ khóa] cạnh địa chỉ trang web trên trình duyệt, chọn Cài đặt trang web và cho phép "Vị trí" (Location). Sau đó hãy Thử lại.';
              } else if (error.code === error.POSITION_UNAVAILABLE) {
                errorMsg = 'GPS trên thiết bị của bạn đang tắt.';
                guide = '\n\nHướng dẫn: Vui lòng bật "Vị trí" (GPS) trong phần cài đặt nhanh của điện thoại hoặc máy tính. Sau đó hãy Thử lại.';
              } else if (error.code === error.TIMEOUT) {
                errorMsg = 'Hết thời gian chờ lấy vị trí.';
                guide = '\n\nHãy đảm bảo bạn đang ở không gian thoáng và nhấn Thử lại.';
              }

              modalRef.open({
                message: `${errorMsg}${guide}\n\nBạn có muốn thử lại hay tiếp tục điểm danh chỉ bằng WiFi?`,
                confirmText: 'Thử lại',
                cancelText: 'Dùng WiFi',
                closeOnBackdropClick: true,
                onConfirm: () => {
                  this.processAttendance(action); // Re-trigger the whole flow
                },
                onCancel: () => this.executeAttendance(action),
              });
            },
            { enableHighAccuracy: true, timeout: 60000, maximumAge: 0 }
          );
        } else {
          this.executeAttendance(action);
        }
      },
      onCancel: () => {
        // Fallback to WiFi only immediately if they choose so
        if (isCheckIn) this.checkInLoading.set(true);
        else this.checkOutLoading.set(true);
        this.executeAttendance(action);
      }
    });
  }

  private executeAttendance(action: 'IN' | 'OUT', lat?: number, lon?: number) {
    const isCheckIn = action === 'IN';
    const apiCall = isCheckIn ? this.service.postCheckIn(lat, lon) : this.service.postCheckOut(lat, lon);

    apiCall.subscribe({
      next: (res) => {
        if (isCheckIn) this.checkInLoading.set(false);
        else this.checkOutLoading.set(false);

        this.bridge.show(res.message || 'Thành công');
        this.refreshStatus(); // Single source of truth update
      },
      error: (err) => {
        if (isCheckIn) this.checkInLoading.set(false);
        else this.checkOutLoading.set(false);

        if (err.status === 400) {
          // Backend might return specific error message for 400
          const errorMsg = err.error?.message || 'Sai vị trí hoặc chưa có phiếu làm Remote.';
          this.showPopup.set(true);
          const modalRef = this.modal();
          if (modalRef) this.openConfirmPopupRemote(modalRef, errorMsg);
        } else {
          console.error('CheckIn/Out failed:', err);
          this.bridge.show(err.error?.message || 'Có lỗi xảy ra khi điểm danh. Vui lòng thử lại sau.');
        }
        this.refreshStatus(); // Always sync status if possible
      },
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

  openConfirmPopupRemote(modal?: ModalComponent, message?: string) {
    modal?.open({
      message: message || 'Hệ thống đang ghi nhận vị trí của bạn sai (hoặc ngoài bán kính cho phép) hoặc chưa có phiếu làm Remote. Vui lòng tạo phiếu',
      cancelText: 'Hủy',
      confirmText: 'Tạo phiếu',
      panelClass: 'my-custom-modal',
      closeOnBackdropClick: true,
      onConfirm: () => this.createRemoteRequest(),
      onCancel: () => this.showPopup.set(false),
    });
  }
}
