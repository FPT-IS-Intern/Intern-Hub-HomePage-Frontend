import { Component, inject } from '@angular/core';
import { ButtonContainerComponent } from '@goat-bravos/intern-hub-layout';
import { Router } from '@angular/router';

@Component({
    selector: 'app-create-ticket-btn',
    standalone: true,
    imports: [ButtonContainerComponent],
    templateUrl: './create-ticket-button.component.html',
    styleUrls: ['./button.component.scss']
})
export class TicketActionButtonComponent {
    private router = inject(Router);

    
    goToPage() {
        this.router.navigate(['/ticket/create-ticket']);
    }
}
