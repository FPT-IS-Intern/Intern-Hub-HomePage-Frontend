import { Component, inject } from '@angular/core';
import { ButtonContainerComponent } from '@goat-bravos/intern-hub-layout';
import { Router } from '@angular/router';

@Component({
  selector: 'app-attendance-history-btn',
  standalone: true,
  imports: [ButtonContainerComponent],
  templateUrl: './attendance-history-button.component.html',
  styleUrls: ['./button.component.scss']
})
export class AttendanceHistoryButtonComponent {
  private router = inject(Router);

  goToPage() {
    this.router.navigate(['/dashboard']);
  }
}
