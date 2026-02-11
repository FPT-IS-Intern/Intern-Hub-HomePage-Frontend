import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DynamicDsService } from 'dynamic-ds';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
export class App implements OnInit {
  protected readonly title = signal('Homepage-service-fe');
  private themeService = inject(DynamicDsService);

  ngOnInit(): void {
    this.themeService.updateSystemDesignColor({
      // Màu đại diện cho thương hiệu (thường là màu gốc 600)
      brandColor: '#EE8E1B',

      // Màu chính sử dụng cho các UI element quan trọng (thường trùng hoặc đậm hơn Brand)
      primaryColor: '#E18308',

      // Màu phụ để hỗ trợ hoặc tạo điểm nhấn khác biệt
      secondaryColor: '#00652A',

      // Màu dùng cho các trạng thái hoặc thành phần bổ trợ
      functionalColor: '#C36F06',

      // Màu dùng cho background, border hoặc text phụ (thường là nhóm màu trung tính)
      utilityColor: '#828F96'
    });
  }
}
