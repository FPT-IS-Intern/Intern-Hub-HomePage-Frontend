import { Component, viewChild, TemplateRef, signal, effect } from '@angular/core';
import { CommonModule } from "@angular/common";
import { 
  ApprovalListComponent, 
  ApprovalListItemInterface, 
  ButtonContainerComponent 
} from "@goat-bravos/intern-hub-layout";

@Component({
  selector: 'app-card-list',
  standalone: true,
  imports: [
    CommonModule, 
    ApprovalListComponent, 
    ButtonContainerComponent
  ],
  templateUrl: './card-list-component.html',
  styleUrls: ['./card-list-component.scss']
})
export class CardListComponent {
  // Cú pháp Signal ViewChild (Read-only & Reactive)
  readonly actionsTemplate = viewChild.required<TemplateRef<any>>('actionsTemplate');

  // Khởi tạo danh sách bằng Signal
  approvalItems = signal<ApprovalListItemInterface[]>([]);

  constructor() {
    // Effect sẽ tự động chạy khi actionsTemplate đã sẵn sàng trong DOM
    effect(() => {
      const template = this.actionsTemplate();
      
      this.approvalItems.set([
        {
          name: "John Doe - Leave Request",
          date: new Date("2024-01-15"),
          rightTemplate: template,
          rightContext: { row: { id: 1, type: "leave" } },
        },
        {
          name: "Jane Smith - Expense Report",
          date: new Date("2024-01-14"),
          rightTemplate: template,
          rightContext: { row: { id: 2, type: "expense" } },
        },
      ]);
    });
  }

  approve(row: any) {
    console.log("Approved:", row);
  }
}