export interface ModalConfig {
message: string;
cancelText?: string;
confirmText?: string;
panelClass?: string;

onCancel?: () => void;
onConfirm?: () => void;
}