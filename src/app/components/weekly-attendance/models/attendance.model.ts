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
}

export interface AttendanceStatusSummary {
  checkIn: AttendanceResponseData;
  checkOut: AttendanceResponseData;
}