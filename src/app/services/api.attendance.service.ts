import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  ApiResponse,
  AttendanceResponseData,
  AttendanceStatusData,
  AttendanceStatusSummary,
  WiFiInfo,
} from '../components/weekly-attendance/models/attendance.model';
import { getBaseUrl } from '../core/config/app-config';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private http = inject(HttpClient);
  // Adjust this if your backend runs on a different port/path
  private readonly API_BASE_URL = `${getBaseUrl()}/hrm/attendance`;
  private get USER_ID(): string {
    return localStorage.getItem('userId') ?? '';
  }

  checkNetwork(latitude?: number, longitude?: number): Observable<WiFiInfo> {
    let params = new HttpParams();
    if (latitude != null && longitude != null) {
      params = params.set('latitude', latitude).set('longitude', longitude);
    }
    return this.http.get<ApiResponse<WiFiInfo>>(`${this.API_BASE_URL}/check-point`, { params }).pipe(
      map((res) => {
        console.log('Raw network check response:', res);
        return {
          wifiName: res.data?.wifiName || 'Unknown',
          companyWifi: res.data?.companyWifi || false,
          branchId: res.data?.branchId || null,
        };
      }),
    );
  }

  getAttendanceStatus(): Observable<ApiResponse<AttendanceStatusData>> {
    const params = new HttpParams().set('userId', this.USER_ID);
    return this.http.get<ApiResponse<AttendanceStatusData>>(`${this.API_BASE_URL}/status`, { params }).pipe(
      map((res) => {
        if (res.data) {
          if (res.data.checkInTime) res.data.checkInTime = res.data.checkInTime.substring(0, 5);
          if (res.data.checkOutTime) res.data.checkOutTime = res.data.checkOutTime.substring(0, 5);
        }
        return res;
      })
    );
  }

  postCheckIn(latitude?: number, longitude?: number): Observable<ApiResponse<any>> {
    let params = new HttpParams().set('userId', this.USER_ID);
    if (latitude != null && longitude != null) {
      params = params.set('latitude', latitude).set('longitude', longitude);
    }
    return this.http.post<ApiResponse<any>>(`${this.API_BASE_URL}/check-in`, null, { params });
  }

  postCheckOut(latitude?: number, longitude?: number): Observable<ApiResponse<any>> {
    let params = new HttpParams().set('userId', this.USER_ID);
    if (latitude != null && longitude != null) {
      params = params.set('latitude', latitude).set('longitude', longitude);
    }
    return this.http.post<ApiResponse<any>>(`${this.API_BASE_URL}/check-out`, null, { params });
  }
}
