import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from "@angular/core";
import { NotificationService } from "./notification-bridge.service";

@Component({
    selector: 'app-notification-text',
    standalone: true,
    templateUrl: './notification-text.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class NotificationTextComponent {
    private service = inject(NotificationService);
    // Liên kết trực tiếp Signal của Service vào Template
    message = this.service.text;
}