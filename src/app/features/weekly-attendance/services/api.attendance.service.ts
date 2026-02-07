import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { ApiResponse, AttendanceResponseData, AttendanceStatusSummary, WiFiInfo } from '../models/attendance.model';



@Injectable({ providedIn: 'root' })
export class AttendanceService {
    private http = inject(HttpClient);
    private readonly API_BASE_URL = '';

    checkNetwork(): Observable<WiFiInfo> {
        // Giả lập logic: Trả về isCompanyWifi: false để test Case hiện Popup
        return of({ wifiName: 'WiFi', isCompanyWifi: false }).pipe(delay(400));
    }

    getAttendanceStatus(): Observable<ApiResponse<AttendanceStatusSummary>> {
        // KHI CÓ API THẬT:
        // return this.http.get<ApiResponse<AttendanceStatusSummary>>(`${this.API_BASE_URL}/status`);

        // GIẢ LẬP ĐỂ TEST UI:
        return of({
            status: 200,
            success: true,
            message: 'Success',
            data: {
                checkIn: {
                    actionType: 'CHECKIN',
                    time: null,
                    displayMessage: null,
                    isCheckTimeValid: false
                },
                checkOut: {
                    actionType: 'CHECKOUT',
                    time: null,
                    displayMessage: null,
                    isCheckTimeValid: false
                }
            }
        } as ApiResponse<AttendanceStatusSummary>).pipe(delay(600));
    }

    // Giả lập API Check-in
    postCheckIn(): Observable<ApiResponse<AttendanceResponseData>> {
        return of({
            status: 200,
            success: true,
            message: 'OK',
            data: {
                "actionType": "CHECKIN",
                "time": "10:30",
                "displayMessage": "Check in thành công (10:30) trễ hơn 8:30",
                "isCheckTimeValid": false
            }
        } as ApiResponse<AttendanceResponseData>).pipe(delay(800));
    }

    // Giả lập API Check-out
    postCheckOut(): Observable<ApiResponse<AttendanceResponseData>> {
        return of({
            status: 200,
            success: true,
            message: 'OK',
            data: {
                actionType: 'CHECKOUT',
                time: '16:00',
                displayMessage: 'Check out thành công (16:00) sớm hơn 17:30',
                isCheckTimeValid: true
            }
        } as ApiResponse<AttendanceResponseData>).pipe(delay(800));
    }
}