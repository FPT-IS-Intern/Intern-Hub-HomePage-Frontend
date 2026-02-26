import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  ApiResponse,
  AttendanceResponseData,
  AttendanceStatusSummary,
  WiFiInfo,
} from '../components/weekly-attendance/models/attendance.model';
import { getBaseUrl } from '../core/config/app-config';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private http = inject(HttpClient);
  // Adjust this if your backend runs on a different port/path
  private readonly API_BASE_URL = `${getBaseUrl()}/hrm/attendance`;
  // Hardcoded user ID as placeholder until auth is implemented
  private readonly USER_ID = 9155938493849600;

  checkNetwork(): Observable<WiFiInfo> {
    return this.http.get<ApiResponse<WiFiInfo>>(`${this.API_BASE_URL}/network-check`).pipe(
      map((res) => {
        console.log('Raw network check response:', res);
        return {
          wifiName: res.data?.wifiName || 'Unknown',
          companyWifi: res.data?.companyWifi || false,
        };
      }),
    );
  }

  getAttendanceStatus(): Observable<ApiResponse<AttendanceStatusSummary>> {
    const params = new HttpParams().set('userId', this.USER_ID);
    return this.http.get<ApiResponse<any>>(`${this.API_BASE_URL}/status`, { params }).pipe(
      map((res) => {
        const data = res.data;

        // Map flat backend response to nested frontend model
        const summary: AttendanceStatusSummary = {
          checkIn: {
            time: data.checkInTime ? data.checkInTime.substring(0, 5) : null, // HH:mm:ss -> HH:mm
            displayMessage: data.checkInMessage,
            isCheckTimeValid: data.checkInValid,
          },
          checkOut: {
            time: data.checkOutTime ? data.checkOutTime.substring(0, 5) : null,
            displayMessage: data.checkOutMessage,
            isCheckTimeValid: data.checkOutValid,
          },
        };

        if (data.isCheckInValid !== undefined)
          summary.checkIn.isCheckTimeValid = data.isCheckInValid;
        if (data.isCheckOutValid !== undefined)
          summary.checkOut.isCheckTimeValid = data.isCheckOutValid;

        return {
          ...res,
          data: summary,
        };
      }),
    );
  }

  postCheckIn(): Observable<ApiResponse<AttendanceResponseData>> {
    const params = new HttpParams().set('userId', this.USER_ID);
    return this.http.post<ApiResponse<any>>(`${this.API_BASE_URL}/check-in`, null, { params }).pipe(
      map((res) => {
        const data = res.data;

        const checkInDate = new Date(data.checkInTime);
        const timeStr = `${checkInDate.getHours().toString().padStart(2, '0')}:${checkInDate.getMinutes().toString().padStart(2, '0')}`;

        return {
          ...res,
          data: {
            time: timeStr,
            displayMessage: data.message,
            isCheckTimeValid: data.checkInValid,
          },
        };
      }),
    );
  }

  postCheckOut(): Observable<ApiResponse<AttendanceResponseData>> {
    const params = new HttpParams().set('userId', this.USER_ID);
    return this.http
      .post<ApiResponse<any>>(`${this.API_BASE_URL}/check-out`, null, { params })
      .pipe(
        map((res) => {
          const data = res.data;
          const checkOutDate = new Date(data.checkOutTime);
          const timeStr = `${checkOutDate.getHours().toString().padStart(2, '0')}:${checkOutDate.getMinutes().toString().padStart(2, '0')}`;

          return {
            ...res,
            data: {
              time: timeStr,
              displayMessage: data.message,
              isCheckTimeValid: data.checkOutValid, // Map from backend field
            },
          };
        }),
      );
  }
}
