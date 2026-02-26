import { Component, inject, signal, OnInit } from '@angular/core';
import { ApprovalService } from '../../services/api.card-list.service';
import { CardListComponent } from './card-list-component';
import { ApprovalGroup } from './model/card-list.model';

@Component({
  selector: 'app-card-list-container',
  standalone: true,
  imports: [CardListComponent],
  templateUrl: './card-list-container.component.html',
  styleUrls: ['./card-list-container.component.scss'],
})
export class CardListContainerComponent implements OnInit {
  private approvalService = inject(ApprovalService);
  approvalGroups = signal<ApprovalGroup[]>([]);

  ngOnInit() {
    this.approvalService.getApprovalData().subscribe({
      next: (data) => this.approvalGroups.set(data),
      error: (err) => console.error('Lấy dữ liệu thất bại', err),
    });
  }

  handleApproveEvent(row: any) {
    console.log('Nút bấm được nhấn tại hàng:', row);
  }
}
