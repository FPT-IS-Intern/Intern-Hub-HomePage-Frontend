import { Component, viewChild, TemplateRef, input, output, computed } from '@angular/core';
import { CommonModule } from "@angular/common";
import {
  ApprovalListComponent,
  ApprovalListItemInterface,
  ButtonContainerComponent
} from "@goat-bravos/intern-hub-layout";
import { EmptyStateComponent } from '../empty-state/empty-state.component';

@Component({
  selector: 'app-card-list',
  standalone: true,
  imports: [
    CommonModule,
    ApprovalListComponent,
    ButtonContainerComponent,
    EmptyStateComponent
  ],
  templateUrl: './card-list-component.html',
  styleUrls: ['./card-list-component.scss']
})
export class CardListComponent {
  headerTitle = input.required<string>();
  rawData = input.required<any[]>();

  // Output để báo cho cha khi nhấn nút
  onApprove = output<any>();

  readonly actionsTemplate = viewChild.required<TemplateRef<any>>('actionsTemplate');

  // Computed signal để map template vào data mỗi khi rawData hoặc template thay đổi
  formattedItems = computed(() => {
    const template = this.actionsTemplate();
    return this.rawData().map(item => ({
      ...item,
      rightTemplate: template,
      rightContext: { row: item }
    }));
  });
}