import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  ApiResponse,
  AttendanceResponseData,
  WeeklyAttendanceItem,
  AttendanceStatusData,
  AttendanceStatusSummary,
  WiFiInfo,
} from '../components/weekly-attendance/models/attendance.model';
import { getBaseUrl } from '../core/config/app-config';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private http = inject(HttpClient);
  // Compute lazily so it picks up window.__env even if it is set after service init.
  private get apiBaseUrl(): string {
    return `${getBaseUrl()}/hrm/attendance`;
  }

  checkNetwork(latitude?: number, longitude?: number): Observable<WiFiInfo> {
    let params = new HttpParams();
    if (latitude != null) params = params.set('latitude', latitude.toString());
    if (longitude != null) params = params.set('longitude', longitude.toString());
    console.log('Checking network with params:', { latitude, longitude });
    return this.http.get<ApiResponse<WiFiInfo>>(`${this.apiBaseUrl}/check-point`, { params }).pipe(
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

  getAttendanceStatus(latitude?: number, longitude?: number): Observable<ApiResponse<AttendanceStatusData>> {
    const params = this.buildParams(latitude, longitude);

    return this.http.get<ApiResponse<AttendanceStatusData>>(`${this.apiBaseUrl}/status`, { params }).pipe(
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
    const params = this.buildParams(latitude, longitude);
    return this.http.post<ApiResponse<any>>(`${this.apiBaseUrl}/check-in`, null, { params });
  }

  postCheckOut(latitude?: number, longitude?: number): Observable<ApiResponse<any>> {
    const params = this.buildParams(latitude, longitude);
    return this.http.post<ApiResponse<any>>(`${this.apiBaseUrl}/check-out`, null, { params });
  }

  getAttendanceInWeek(): Observable<string[]> {
    const params = this.buildParams();
    return this.http
      .get<ApiResponse<WeeklyAttendanceItem[]>>(`${this.apiBaseUrl}/attendance-in-week`, { params })
      .pipe(
        map((res) =>
          (res.data || [])
            .filter((item) => this.isCheckedStatus(item.status))
            .map((item) => this.normalizeDayOfWeek(item.dayOfWeek))
            .filter((day) => !!day),
        ),
      );
  }

  private isCheckedStatus(status: string): boolean {
    const normalized = String(status || '').toUpperCase();
    return (
      normalized === 'CHECK' ||
      normalized === 'PRESENT' ||
      normalized.includes('CHECK_IN') ||
      normalized.includes('CHECK_OUT')
    );
  }

  private normalizeDayOfWeek(dayOfWeek: string): string {
    const normalized = String(dayOfWeek || '').trim().toUpperCase();
    if (!normalized) return '';
    if (normalized.length >= 3) return normalized.slice(0, 3);
    return normalized;
  }

  private buildParams(latitude?: number, longitude?: number): HttpParams {
    let params = new HttpParams();
    if (latitude != null) params = params.set('latitude', latitude.toString());
    if (longitude != null) params = params.set('longitude', longitude.toString());
    return params;
  }
}
