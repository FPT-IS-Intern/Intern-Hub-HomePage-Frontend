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
  private locationPromptTimer: ReturnType<typeof setTimeout> | null = null;
  private locationPromptShownThisSession = false;

  // UI State
  isLoading = signal(false);
  showPopup = signal(false);
  remoteRequestPending = signal(false);
  checkInLoading = signal(false);
  checkOutLoading = signal(false);
  forceInitAfterCrossBranchCheckout = signal(false);

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
    currentBranchId: null,
    canResetByBranchChange: false,
    statusMessage: null,
  });
  currentBranchId = signal<string | null>(null);
  networkChecked = signal(false);

  isDifferentBranch = computed(() => {
    const sessionBranch = this.status().openSessionBranchId;
    const currentBranch = this.currentBranchId();
    return !!sessionBranch && !!currentBranch && sessionBranch !== currentBranch;
  });

  showCrossBranchWarning = computed(() => this.status().sessionOpen && this.isDifferentBranch());

  checkInLabel = computed(() => (this.remoteRequestPending() ? 'chá» ghi nháº­n...' : 'Check In'));

  checkInDisplayTime = computed(() =>
    this.forceInitAfterCrossBranchCheckout() ? null : this.status().checkInTime
  );
  checkOutDisplayTime = computed(() =>
    this.showCrossBranchWarning() || this.forceInitAfterCrossBranchCheckout()
      ? null
      : this.status().checkOutTime
  );

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

  refreshStatus(latitude?: number, longitude?: number) {
    this.isLoading.set(true);
    this.networkChecked.set(false);
    this.currentBranchId.set(null);
    if (this.locationPromptTimer) {
      clearTimeout(this.locationPromptTimer);
      this.locationPromptTimer = null;
    }

    const fetchStatus = (latitude?: number, longitude?: number) => {
      this.service.getAttendanceStatus(latitude, longitude).subscribe({
        next: (res) => {
          if (res.data) {
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
            this.maybeScheduleLocationPrompt();
          }
        },
        error: (err) => console.error('API Fail', err),
        complete: () => this.isLoading.set(false),
      });
    };

    const fetchNetworkAndStatus = (latitude?: number, longitude?: number) => {
      this.service.checkNetwork(latitude, longitude).subscribe({
        next: (wifi) => {
          this.currentBranchId.set(wifi.branchId);
          this.networkChecked.set(true);
          this.maybeScheduleLocationPrompt();
        },
        error: () => {
          this.networkChecked.set(true);
          this.maybeScheduleLocationPrompt();
        }
      });
      fetchStatus(latitude, longitude);
    };

    if (latitude != null && longitude != null) {
      fetchNetworkAndStatus(latitude, longitude);
      return;
    }

    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted' && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => fetchNetworkAndStatus(position.coords.latitude, position.coords.longitude),
            () => fetchNetworkAndStatus(),
            { timeout: 5000 }
          );
        } else {
          // Location chua duoc cap quyen: chi kiem tra qua WiFi/IP
          fetchNetworkAndStatus();
        }
      });
    } else {
      // Khong auto-goi geolocation neu khong kiem tra duoc permission state
      fetchNetworkAndStatus();
    }
  }

  private hasCompletedAttendanceToday(): boolean {
    const currentStatus = this.status();
    return !!currentStatus.checkInTime && !!currentStatus.checkOutTime && !currentStatus.sessionOpen;
  }

  private shouldPromptLocationForOnsite(): boolean {
    return (
      this.hasCompletedAttendanceToday() &&
      !this.status().canCheckIn &&
      this.networkChecked() &&
      !this.currentBranchId()
    );
  }

  private async getLocationPermissionState(): Promise<PermissionState | 'unsupported'> {
    if (!navigator.permissions) return 'unsupported';
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      return permission.state;
    } catch {
      return 'unsupported';
    }
  }

  private maybeScheduleLocationPrompt() {
    if (this.locationPromptShownThisSession || this.locationPromptTimer) return;
    if (!this.shouldPromptLocationForOnsite()) return;

    this.getLocationPermissionState().then((state) => {
      if (state === 'granted') return;
      this.locationPromptTimer = setTimeout(() => {
        this.locationPromptTimer = null;
        if (this.locationPromptShownThisSession || !this.shouldPromptLocationForOnsite()) return;
        this.openLocationRequiredPopup();
      }, 4000);
    });
  }

  private openLocationRequiredPopup() {
    const modalRef = this.modal();
    if (!modalRef) return;

    this.locationPromptShownThisSession = true;
    this.showPopup.set(true);
    modalRef.open({
      message: 'Domain cần sử dụng vị trí của bạn để kiểm tra Onsite.',
      confirmText: 'Bật vị trí',
      cancelText: 'Để sau',
      closeOnBackdropClick: true,
      onConfirm: () => {
        this.showPopup.set(false);
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
          (position) => this.refreshStatus(position.coords.latitude, position.coords.longitude),
          () => undefined,
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      },
      onCancel: () => this.showPopup.set(false),
    });
  }

  /**
   * Logic xá»­ lÃ½ chung cho cáº£ Checkin vÃ  Checkout
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
          // Location Ä‘ang báº­t â†’ bá» popup, láº¥y GPS tháº³ng
          proceedWithGPS();
        } else {
          // Location táº¯t hoáº·c chÆ°a cáº¥p quyá»n â†’ hiá»‡n popup há»i
          this.showPopup.set(true);
          modalRef.open({
            message: 'Báº¡n cÃ³ muá»‘n sá»­ dá»¥ng vá»‹ trÃ­ hiá»‡n táº¡i cá»§a mÃ¬nh Ä‘á»ƒ káº¿t quáº£ Ä‘iá»ƒm danh chÃ­nh xÃ¡c hÆ¡n khÃ´ng?',
            confirmText: 'Su dung vi tri',
            cancelText: 'Chi dung WiFi',
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
      // Permissions API not supported â†’ show popup
      this.showPopup.set(true);
      modalRef.open({
        message: 'Báº¡n cÃ³ muá»‘n sá»­ dá»¥ng vá»‹ trÃ­ hiá»‡n táº¡i cá»§a mÃ¬nh Ä‘á»ƒ káº¿t quáº£ Ä‘iá»ƒm danh chÃ­nh xÃ¡c hÆ¡n khÃ´ng?',
        confirmText: 'Su dung vi tri',
        cancelText: 'Chi dung WiFi',
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

    this.bridge.show('Check in cá»§a báº¡n sáº½ Ä‘Æ°á»£c ghi nháº­n sau khi phiáº¿u yÃªu cáº§u  Ä‘Æ°á»£c duyá»‡t.');
    this.remoteRequestPending.set(true);

    // giáº£ láº­p yÃªu cáº§u Ä‘Æ°á»£c phÃª duyá»‡t sao n(s)
    setTimeout(() => {
      this.remoteRequestPending.set(false);
      this.bridge.clear();
    }, 2000);
  }

  openConfirmPopupRemote(modal?: ModalComponent, message?: string) {
    modal?.open({
      message: message || 'Há»‡ thá»‘ng Ä‘ang ghi nháº­n vá»‹ trÃ­ cá»§a báº¡n sai (hoáº·c ngoÃ i bÃ¡n kÃ­nh cho phÃ©p) hoáº·c chÆ°a cÃ³ phiáº¿u lÃ m Remote. Vui lÃ²ng táº¡o phiáº¿u',
      cancelText: 'Há»§y',
      confirmText: 'Táº¡o phiáº¿u',
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
      confirmText: 'XÃ¡c nháº­n',
      closeOnBackdropClick: true,
      onCancel: () => this.showPopup.set(false),
      onConfirm: () => this.showPopup.set(false),
    });
  }
}

