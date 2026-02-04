import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { ApiResponse, AttendanceResponseData, WiFiInfo } from '../models/attendance.model';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
    private http = inject(HttpClient);

    checkNetwork(): Observable<WiFiInfo> {
        // Giả lập logic: Trả về isCompanyWifi: false để test Case hiện Popup
        return of({ wifiName: 'Coffee_WiFi', isCompanyWifi: true }).pipe(delay(400));
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
                "attendanceStatus": "WARNING"
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
                attendanceStatus: 'WARNING'
            }
        } as ApiResponse<AttendanceResponseData>).pipe(delay(800));
    }
}