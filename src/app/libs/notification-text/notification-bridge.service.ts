import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  // Biến lưu trữ text duy nhất toàn app
  text = signal<string | null>(null);

  show(message: string) {
    this.text.set(message);
  }

  clear() {
    this.text.set(null);
  }
}