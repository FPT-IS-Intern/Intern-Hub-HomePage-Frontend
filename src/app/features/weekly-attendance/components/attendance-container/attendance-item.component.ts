import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-attendance-item',
  standalone: true,
  templateUrl: './attendance-item.component.html',
  styleUrls: ['./attendance-item.component.css']
})
export class AttendanceItemComponent {
  @Input() image: string = '';
  @Input() label: string = '';
  @Input() time: string | null = null;
  @Input() statusMessage: string | null = null;
  
  @Output() onAction = new EventEmitter<void>();
}