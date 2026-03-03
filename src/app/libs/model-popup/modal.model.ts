export interface ModalConfig {
    message: string;
    cancelText?: string;
    confirmText?: string;
    panelClass?: string;
    closeOnBackdropClick?: boolean;

    onCancel?: () => void;
    onConfirm?: () => void;
}