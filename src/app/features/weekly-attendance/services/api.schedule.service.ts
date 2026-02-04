import { Injectable, inject } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
// import { RestService } from '@goat-bravos/shared-lib-client';

@Injectable({
  providedIn: 'root'
})
export class ScheduleApiService {
//   private restService = inject(RestService);

  // Giả lập trạng thái Mock data
  private mockCheckedDays: string[] = ['MON', 'WED', 'FRI'];

//   danh sách các ngày đã checkin
  getCheckedDays(): Observable<string[]> {
    // return this.restService.getInternal<string[]>('/schedules/checked-days');
    return of(this.mockCheckedDays).pipe(delay(500));
  }

}