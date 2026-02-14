import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse, AttendanceResponseData, AttendanceStatusSummary, WiFiInfo } from '../models/attendance.model';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
    private http = inject(HttpClient);
    // Adjust this if your backend runs on a different port/path
    private readonly API_BASE_URL = 'http://localhost:8080/hrm-service/attendance';
    // Hardcoded user ID as placeholder until auth is implemented
    private readonly USER_ID = 1;

    checkNetwork(): Observable<WiFiInfo> {
        return this.http.get<ApiResponse<WiFiInfo>>(`${this.API_BASE_URL}/network-check`)
            .pipe(
                map(res => {
                    // The backend returns wrapped in ResponseApi, extract data
                    // Map backend response key names if necessary, though they seem to match mostly
                    console.log('Raw network check response:', res);
                    return {
                        wifiName: res.data?.wifiName || 'Unknown',
                        companyWifi: res.data?.companyWifi || false
                    };
                })
            );
    }

    getAttendanceStatus(): Observable<ApiResponse<AttendanceStatusSummary>> {
        const params = new HttpParams().set('userId', this.USER_ID);
        return this.http.get<ApiResponse<any>>(`${this.API_BASE_URL}/status`, { params })
            .pipe(
                map(res => {
                    const backendData = res.data;

                    // Map flat backend response to nested frontend model
                    const summary: AttendanceStatusSummary = {
                        checkIn: {
                            time: backendData.checkInTime ? backendData.checkInTime.substring(0, 5) : null, // HH:mm:ss -> HH:mm
                            displayMessage: backendData.checkInMessage,
                            isCheckTimeValid: backendData.checkInValid // Note: backend uses isCheckInValid (boolean getter often maps to field name without 'is' in JSON depending on serializer, but let's assume standard bean mapping or simple field access. Actually lombok @Data usually generates getIsCheckInValid or isCheckInValid. JSON field is likely 'checkInValid' or 'isCheckInValid'. Let's try to be safe)
                        },
                        checkOut: {
                            time: backendData.checkOutTime ? backendData.checkOutTime.substring(0, 5) : null,
                            displayMessage: backendData.checkOutMessage,
                            isCheckTimeValid: backendData.checkOutValid
                        }
                    };

                    // Handle boolean mapping if JSON keys include 'is'
                    if (backendData.isCheckInValid !== undefined) summary.checkIn.isCheckTimeValid = backendData.isCheckInValid;
                    if (backendData.isCheckOutValid !== undefined) summary.checkOut.isCheckTimeValid = backendData.isCheckOutValid;


                    return {
                        ...res,
                        data: summary
                    };
                })
            );
    }

    postCheckIn(): Observable<ApiResponse<AttendanceResponseData>> {
        const body = { userId: this.USER_ID }; // Backend expects AttendanceRequest with userId
        return this.http.post<ApiResponse<any>>(`${this.API_BASE_URL}/check-in`, body)
            .pipe(
                map(res => {
                    const backendData = res.data;
                    // Backend returns AttendanceResponse (id, status, message)
                    // It DOES NOT return time or validation status in this response based on the DTO viewing
                    // So we must rely on the status or message, OR, ideally, re-fetch status. 
                    // However, the component expects { time, displayMessage ... } immediately.
                    // For now let's map what we can and maybe rely on refetching in component if it does so,
                    // OR we simulate it. 
                    // Actually, the component does: 
                    //   apiCall.subscribe(res => this.checkIn.set({ time: res.data.time ... }))

                    // Since backend CheckIn response is minimal, we might need to chain a getStatus call here 
                    // OR simply return a partial success and let the component refresh? 
                    // The component logic relies on the returned data to update UI state *without* refetching.
                    // But the backend `AttendanceResponse` only has `attendanceStatus` and `message`.
                    // We can return the message. Time is current time roughly.

                    const now = new Date();
                    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

                    return {
                        ...res,
                        data: {
                            time: timeStr,
                            displayMessage: backendData.message,
                            isCheckTimeValid: true // We assume success if 200 OK. 
                        }
                    };
                })
            );
    }

    postCheckOut(): Observable<ApiResponse<AttendanceResponseData>> {
        const body = { userId: this.USER_ID };
        return this.http.post<ApiResponse<any>>(`${this.API_BASE_URL}/check-out`, body)
            .pipe(
                map(res => {
                    const backendData = res.data;
                    const now = new Date();
                    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

                    return {
                        ...res,
                        data: {
                            time: timeStr,
                            displayMessage: backendData.message,
                            isCheckTimeValid: true
                        }
                    };
                })
            );
    }
}