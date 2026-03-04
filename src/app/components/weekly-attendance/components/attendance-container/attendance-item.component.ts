import { Component, input, output, computed, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-attendance-item',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.ShadowDom,
  templateUrl: './attendance-item.component.html',
  styleUrls: ['./attendance-item.component.scss']
})
export class AttendanceItemComponent {
  image = input.required<string>();
  label = input.required<string>();
  time = input<string | null>(null);
  statusMessage = input<string | null>(null);
  isCheckTimeValid = input<boolean>(false);
  disabled = input<boolean>(false);
  isLoading = input<boolean>(false);


  onAction = output<void>();

  isError = computed(() => this.isCheckTimeValid());

  statusIcon = computed(() => this.isError()
    ? 'x-circle'
    : 'check-circle'
  );
}