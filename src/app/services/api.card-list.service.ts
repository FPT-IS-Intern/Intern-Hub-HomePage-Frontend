import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { ApprovalGroup } from '../components/card-list/model/card-list.model';
import { getBaseUrl } from '../core/config/app-config';

@Injectable({ providedIn: 'root' })
export class ApprovalService {
  private http = inject(HttpClient);
  private readonly API_BASE_URL = `${getBaseUrl()}/hrm/approvals`;

  private mockData: ApprovalGroup[] = [
    {
      title: 'Dự Án',
      items: [
        { id: 1, name: 'EximBank', date: '2024-01-15', type: 'leave' },
        { id: 2, name: 'Intern Hub', date: '2024-01-14', type: 'expense' },
      ],
    },
    {
      title: 'Task',
      items: [
        { id: 1, name: 'Log 60 bug', date: '2024-02-01', type: 'mission' },
        { id: 2, name: 'Design Bacground UIUX', date: '2024-02-05', type: 'security' },
      ],
    },
  ];

  getApprovalData(): Observable<ApprovalGroup[]> {
    return of(this.mockData).pipe(delay(500));
    // return this.http.get<ApprovalGroup[]>('https://api.your-domain.com/approvals');
  }
}
