import { Component, inject } from '@angular/core';
import { ButtonContainerComponent } from '@goat-bravos/intern-hub-layout';
import { Router } from '@angular/router';

@Component({
    selector: 'app-my-tickets-btn',
    standalone: true,
    imports: [ButtonContainerComponent],
    templateUrl: './my-tickets-button.component.html',
    styleUrls: ['./button.component.scss']
})
export class MyTicketButtonComponent {
    private router = inject(Router);

    goToPage() {
        this.router.navigate(['/dashboard']);
    }
}
