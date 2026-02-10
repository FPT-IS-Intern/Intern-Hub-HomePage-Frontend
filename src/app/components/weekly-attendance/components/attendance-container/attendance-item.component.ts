import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttendanceStatus } from './../../models/attendance.model';

@Component({
  selector: 'app-attendance-item',
  standalone: true,
  imports: [CommonModule],
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


  onAction = output<void>();

  isError = computed(() => this.isCheckTimeValid());

  statusIcon = computed(() => this.isError()
    ? 'assets/icon/ico_duotone_x_circle_red.svg'
    : 'assets/icon/ico_duotone_check_circle_green.svg'
  );
}