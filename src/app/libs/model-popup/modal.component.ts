import { Component, input, output, signal, ViewEncapsulation } from '@angular/core';
import { ModalConfig } from './modal.model';


@Component({
    selector: 'app-modal',
    standalone: true,
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.component.css'],
    encapsulation: ViewEncapsulation.None,
})
export class ModalComponent {
    config = input<ModalConfig | null>(null);
    visible = signal(false);
    closed = output<void>();

    private _config = signal<ModalConfig | null>(null);


    open(config: ModalConfig) {
        this._config.set(config);
        this.visible.set(true);
    }


    close() {
        this.visible.set(false);
        this._config.set(null);
        this.closed.emit();
    }


    cancel() {
        this._config()?.onCancel?.();
        this.close();
    }


    confirm() {
        this._config()?.onConfirm?.();
        this.close();
    }


    onBackdropClick(event: MouseEvent) {
        if ((event.target as HTMLElement).classList.contains('overlay') && this._config()?.closeOnBackdropClick) {
            this.cancel();
        }
    }

    vm = this._config.asReadonly();
}