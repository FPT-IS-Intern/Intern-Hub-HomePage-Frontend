import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, Renderer2, inject, input, output, signal, ViewEncapsulation } from '@angular/core';
import { ModalConfig } from './modal.model';


@Component({
    selector: 'app-modal',
    standalone: true,
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.component.css'],
    encapsulation: ViewEncapsulation.None,
})
export class ModalComponent implements OnInit, OnDestroy {
    private readonly document = inject(DOCUMENT);
    private readonly elementRef = inject(ElementRef<HTMLElement>);
    private readonly renderer = inject(Renderer2);

    config = input<ModalConfig | null>(null);
    visible = signal(false);
    closed = output<void>();

    private _config = signal<ModalConfig | null>(null);
    private originalParent: Node | null = null;
    private placeholderNode: Comment | null = null;

    ngOnInit() {
        const host = this.elementRef.nativeElement;
        const parent = host.parentNode;
        const body = this.document?.body;

        if (!parent || !body) {
            return;
        }

        this.originalParent = parent;
        this.placeholderNode = this.renderer.createComment('app-modal-placeholder');
        this.renderer.insertBefore(parent, this.placeholderNode, host);
        this.renderer.appendChild(body, host);
    }

    ngOnDestroy() {
        const host = this.elementRef.nativeElement;

        if (this.originalParent && this.placeholderNode) {
            this.renderer.insertBefore(this.originalParent, host, this.placeholderNode);
            this.renderer.removeChild(this.originalParent, this.placeholderNode);
        }

        this.originalParent = null;
        this.placeholderNode = null;
    }


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
            this.close(); // Chỉ đóng popup (Abort), không trigger onCancel
        }
    }

    vm = this._config.asReadonly();
}
