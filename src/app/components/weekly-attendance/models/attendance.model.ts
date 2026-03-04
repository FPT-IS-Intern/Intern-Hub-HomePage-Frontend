export interface AttendanceStatusData {
  checkInTime: string | null;
  checkOutTime: string | null;
  checkInMessage: string | null;
  checkOutMessage: string | null;
  isCheckInValid: boolean;
  isCheckOutValid: boolean;
  canCheckIn: boolean;
  canCheckOut: boolean;
  sessionOpen: boolean;
  openSessionBranchId: string | null;
  statusMessage: string | null;
}

export interface AttendanceResponseData {
  time: string | null;
  displayMessage: string | null;
  isCheckTimeValid: boolean | false;
  requiresRemote?: boolean;
}

export interface ApiResponse<T> {
  status: number;
  success: boolean;
  message: string;
  data: T;
}

export interface WiFiInfo {
  wifiName: string;
  companyWifi: boolean;
  branchId: string | null;
}

export interface AttendanceStatusSummary extends AttendanceStatusData { }