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

  // Trạng thái giao diện (UI State)
  isLoading = signal(false); // Đang tải dữ liệu tổng thể
  showPopup = signal(false); // Đang hiển thị modal popup
  remoteRequestPending = signal(false); // Đang chờ xử lý yêu cầu Remote
  checkInLoading = signal(false); // Đang thực hiện call API Check-in
  checkOutLoading = signal(false); // Đang thực hiện call API Check-out
  forceInitAfterCrossBranchCheckout = signal(false); // Flag để reset UI sau khi đổi chi nhánh thành công

  // Dữ liệu từ Backend (Data State)
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
    currentBranchId: null,
    canResetByBranchChange: false,
    statusMessage: null,
  });
  currentBranchId = signal<string | null>(null); // ID chi nhánh hiện tại (từ checkNetwork)
  networkChecked = signal(false); // Đã hoàn thành kiểm tra mạng/vị trí
  private popupShownInSession = false; // Cờ theo dõi việc hiện popup trong một phiên (reload trang)

  /**
   * Kiểm tra xem vị trí hiện tại có khác chi nhánh của phiên đang mở không
   */
  isDifferentBranch = computed(() => {
    const sessionBranch = this.status().openSessionBranchId;
    const currentBranch = this.currentBranchId();
    return !!sessionBranch && !!currentBranch && sessionBranch !== currentBranch;
  });

  /**
   * Hiển thị cảnh báo nếu đang ở chi nhánh khác khi phiên vẫn đang mở
   */
  showCrossBranchWarning = computed(() => this.status().sessionOpen && this.isDifferentBranch());

  checkInLabel = computed(() => (this.remoteRequestPending() ? 'chờ ghi nhận...' : 'Check In'));

  // Logic hiển thị giờ Check-in/out (ẩn đi nếu đang trong trạng thái reset hoặc cảnh báo)
  checkInDisplayTime = computed(() =>
    this.forceInitAfterCrossBranchCheckout() ? null : this.status().checkInTime
  );
  checkOutDisplayTime = computed(() =>
    this.showCrossBranchWarning() || this.forceInitAfterCrossBranchCheckout()
      ? null
      : this.status().checkOutTime
  );

  // Logic hiển thị tin nhắn trạng thái
  checkInDisplayMessage = computed(() => {
    if (!this.networkChecked()) return null;
    if (this.forceInitAfterCrossBranchCheckout()) return null;
    if (!this.status().sessionOpen && this.status().canResetByBranchChange) return null;
    return this.showCrossBranchWarning() ? this.status().statusMessage : this.status().checkInMessage;
  });

  checkOutDisplayMessage = computed(() => {
    if (this.showCrossBranchWarning() || this.forceInitAfterCrossBranchCheckout()) return null;
    if (!this.status().sessionOpen && this.status().canResetByBranchChange) return null;
    return this.status().checkOutMessage;
  });

  // Logic vô hiệu hóa nút bấm
  isCheckInDisabled = computed(() =>
    this.showPopup() ||
    this.remoteRequestPending() ||
    (this.forceInitAfterCrossBranchCheckout() ? false : !this.status().canCheckIn)
  );

  isCheckOutDisabled = computed(() =>
    this.showPopup() ||
    this.remoteRequestPending() ||
    (this.forceInitAfterCrossBranchCheckout() ? true : !this.status().canCheckOut)
  );

  ngOnInit() {
    this.refreshStatus();
  }

  /**
   * Làm mới trạng thái điểm danh và kiểm tra mạng/vị trí
   */
  refreshStatus() {
    this.isLoading.set(true);
    this.networkChecked.set(false);
    this.currentBranchId.set(null);

    /**
     * Lấy dữ liệu trạng thái điểm danh từ Server
     */
    const fetchStatus = (latitude?: number, longitude?: number) => {
      this.service.getAttendanceStatus(latitude, longitude).subscribe({
        next: (res) => {
          if (res.data) {
            // Kiểm tra xem có cần reset UI (giờ giấc) về mặc định không (áp dụng khi đã Checkout và đổi chi nhánh)
            const shouldResetUiStatus = !res.data.sessionOpen && res.data.canResetByBranchChange;
            this.status.set(
              shouldResetUiStatus
                ? {
                  ...res.data,
                  checkInTime: null,
                  checkOutTime: null,
                  checkInMessage: null,
                  checkOutMessage: null,
                  isCheckInValid: false,
                  isCheckOutValid: false,
                  statusMessage: null,
                }
                : res.data
            );
            if (res.data.sessionOpen) {
              this.forceInitAfterCrossBranchCheckout.set(false);
            }
          }
        },
        error: (err) => console.error('API Fail', err),
        complete: () => this.isLoading.set(false),
      });
    };

    /**
     * Vừa kiểm tra chi nhánh qua mạng, vừa lấy trạng thái điểm danh
     */
    const fetchNetworkAndStatus = (latitude?: number, longitude?: number) => {
      this.service.checkNetwork(latitude, longitude).subscribe({
        next: (wifi) => {
          this.currentBranchId.set(wifi.branchId);
          this.networkChecked.set(true);
        },
        error: () => this.networkChecked.set(true),
      });
      fetchStatus(latitude, longitude);
    };

    // Luồng khởi tạo: Kiểm tra quyền GPS trước để quyết định cách gọi API
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          // Chỉ tự động gọi GPS nếu đã được cấp quyền trước đó (tránh hiện popup trình duyệt ngay khi load trang)
          navigator.geolocation.getCurrentPosition(
            (pos) => fetchNetworkAndStatus(pos.coords.latitude, pos.coords.longitude),
            () => fetchNetworkAndStatus(), // Fallback nếu có lỗi lấy tọa độ (ví dụ: timeout)
            { timeout: 5000 }
          );
        } else {
          // Với trạng thái 'prompt' hoặc 'denied': Không gọi GPS ngay mà chỉ check qua IP/WiFi để tránh làm phiền
          fetchNetworkAndStatus();
        }
      });
    } else {
      // Fallback cho trình duyệt cũ: Chỉ check qua IP/WiFi để an toàn
      fetchNetworkAndStatus();
    }

    // Delayed check for location help popup (3s)
    setTimeout(() => {
      // Chỉ hiện 1 lần duy nhất trong 1 lần load trang
      if (this.popupShownInSession) return;

      const s = this.status();

      // Điều kiện hiện popup trợ giúp của riêng mình:
      // 1. Đã hoàn thành cả Check-In và Check-Out
      const hasCompletedToday = s.checkInTime && s.checkOutTime;
      // 2. Nút Check-In vẫn đang bị khóa (chưa được reset)
      const notReset = !s.canCheckIn;

      if (hasCompletedToday && notReset) {
        if (navigator.permissions) {
          navigator.permissions.query({ name: 'geolocation' }).then((p) => {
            // 3. Nếu quyền vị trí chưa được cấp (prompt) hoặc bị chặn (denied)
            // Hiện popup trợ giúp của mình trước khi gọi yêu cầu của trình duyệt
            if (p.state !== 'granted') {
              this.showLocationPermissionPopup();
            }
          });
        } else {
          this.showLocationPermissionPopup();
        }
      }
    }, 3000);
  }

  /**
   * Hiển thị popup giải thích lý do cần vị trí để giúp người dùng reset nút điểm danh
   */
  private showLocationPermissionPopup() {
    const modalRef = this.modal();
    if (!modalRef) return;

    this.showPopup.set(true);
    this.popupShownInSession = true;
    modalRef.open({
      message:
        'Bạn đã hoàn thành phiên điểm danh? Để tự động mở lại nút Check-In cho chi nhánh mới, trình duyệt cần được cấp quyền truy cập vị trí (GPS) để xác minh bạn đã đổi địa điểm. Vui lòng bật và cho phép truy cập vị trí nhé!',
      confirmText: 'Sử dụng vị trí',
      cancelText: 'Bỏ qua',
      closeOnBackdropClick: true,
      onConfirm: () => {
        this.showPopup.set(false);
        if (navigator.geolocation) {
          // Gọi lấy GPS - Lúc này trình duyệt sẽ hiện popup mặc định của nó
          navigator.geolocation.getCurrentPosition(
            () => this.refreshStatus(),
            () => this.refreshStatus(),
            { timeout: 10000 }
          );
        }
      },
      onCancel: () => this.showPopup.set(false),
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

    const proceedWithGPS = () => {
      if (isCheckIn) this.checkInLoading.set(true);
      else this.checkOutLoading.set(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.executeAttendance(action, position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn('Geolocation failed:', error);
          if (isCheckIn) this.checkInLoading.set(false);
          else this.checkOutLoading.set(false);
        },
        { enableHighAccuracy: true, timeout: 60000, maximumAge: 0 }
      );
    };

    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          // Location đang bật → bỏ popup, lấy GPS thẳng
          proceedWithGPS();
        } else {
          // Location tắt hoặc chưa cấp quyền → hiện popup hỏi
          this.showPopup.set(true);
          modalRef.open({
            message: 'Bạn có muốn sử dụng vị trí hiện tại của mình để kết quả điểm danh chính xác hơn không?',
            confirmText: 'Sử dụng vị trí',
            cancelText: 'Chỉ dùng WiFi',
            closeOnBackdropClick: true,
            onConfirm: () => {
              this.showPopup.set(false);
              if (isCheckIn) this.checkInLoading.set(true);
              else this.checkOutLoading.set(true);
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    this.executeAttendance(action, position.coords.latitude, position.coords.longitude);
                  },
                  (error) => {
                    console.warn('Geolocation failed:', error);
                    if (isCheckIn) this.checkInLoading.set(false);
                    else this.checkOutLoading.set(false);
                  },
                  { enableHighAccuracy: true, timeout: 60000, maximumAge: 0 }
                );
              } else {
                this.executeAttendance(action);
              }
            },
            onCancel: () => {
              this.showPopup.set(false);
              if (isCheckIn) this.checkInLoading.set(true);
              else this.checkOutLoading.set(true);
              this.executeAttendance(action);
            }
          });
        }
      });
    } else {
      // Permissions API not supported → show popup
      this.showPopup.set(true);
      modalRef.open({
        message: 'Bạn có muốn sử dụng vị trí hiện tại của mình để kết quả điểm danh chính xác hơn không?',
        confirmText: 'Sử dụng vị trí',
        cancelText: 'Chỉ dùng WiFi',
        closeOnBackdropClick: true,
        onConfirm: () => {
          this.showPopup.set(false);
          if (isCheckIn) this.checkInLoading.set(true);
          else this.checkOutLoading.set(true);
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                this.executeAttendance(action, position.coords.latitude, position.coords.longitude);
              },
              (error) => {
                console.warn('Geolocation failed:', error);
                if (isCheckIn) this.checkInLoading.set(false);
                else this.checkOutLoading.set(false);
              },
              { enableHighAccuracy: true, timeout: 60000, maximumAge: 0 }
            );
          } else {
            this.executeAttendance(action);
          }
        },
        onCancel: () => {
          this.showPopup.set(false);
          if (isCheckIn) this.checkInLoading.set(true);
          else this.checkOutLoading.set(true);
          this.executeAttendance(action);
        }
      });
    }
  }

  private executeAttendance(action: 'IN' | 'OUT', lat?: number, lon?: number) {
    const isCheckIn = action === 'IN';
    const wasCrossBranchWarning = this.showCrossBranchWarning();
    const crossBranchStatusMessage = !isCheckIn && wasCrossBranchWarning ? this.status().statusMessage : null;
    const apiCall = isCheckIn ? this.service.postCheckIn(lat, lon) : this.service.postCheckOut(lat, lon);

    apiCall.subscribe({
      next: (res) => {
        if (isCheckIn) this.checkInLoading.set(false);
        else this.checkOutLoading.set(false);
        this.showPopup.set(false);
        if (!isCheckIn && wasCrossBranchWarning) {
          this.forceInitAfterCrossBranchCheckout.set(true);
          if (crossBranchStatusMessage) {
            this.openInfoPopup(crossBranchStatusMessage);
          }
        } else if (isCheckIn) {
          this.forceInitAfterCrossBranchCheckout.set(false);
        }
        this.refreshStatus();
      },
      error: (err) => {
        if (isCheckIn) this.checkInLoading.set(false);
        else this.checkOutLoading.set(false);

        const errorCode = String(err?.error?.status?.code || err?.error?.code || '').toUpperCase();
        const errorMsg =
          err?.error?.status?.message ||
          err?.error?.message ||
          'Co loi xay ra khi diem danh. Vui long thu lai sau.';

        if (err.status === 400) {
          const normalized = String(errorMsg).toLowerCase();
          const isLocationError =
            errorCode === 'OUT_OF_RANGE';

          if (isLocationError) {
            this.showPopup.set(true);
            const modalRef = this.modal();
            if (modalRef) this.openConfirmPopupRemote(modalRef, errorMsg);
          } else {
            this.showPopup.set(false);
            this.bridge.show(errorMsg);
          }
        } else {
          this.showPopup.set(false);
          console.error('CheckIn/Out failed:', err);
          this.bridge.show(errorMsg);
        }
        this.refreshStatus();
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

  private openInfoPopup(message: string) {
    const modalRef = this.modal();
    if (!modalRef) {
      this.bridge.show(message);
      return;
    }
    this.showPopup.set(true);
    modalRef.open({
      message,
      confirmText: 'Xác nhận',
      closeOnBackdropClick: true,
      onCancel: () => this.showPopup.set(false),
      onConfirm: () => this.showPopup.set(false),
    });
  }
}
