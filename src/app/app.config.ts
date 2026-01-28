import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { SYSTEM_DESIGN_CONFIG } from 'dynamic-ds';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    {
      provide: SYSTEM_DESIGN_CONFIG,
      useValue: {
        brand: '#E18308', // Màu đại diện cho thương hiệu (từ mã bạn cung cấp)
        primary: '#E18308', // Màu chính (từ mã bạn cung cấp)
        secondary: '#505A5F', // Màu phụ (từ mã bạn cung cấp)
        functional: '#E18308', // Màu chức năng (có thể dùng giống như primary)
        utility: '#CF0026', // Màu tiện ích (thường dùng cho cảnh báo, lỗi)

        // Các màu sắc khác
        linearGradient: 'linear-gradient(to bottom, #FFFFFF80 16%, #FED8B34D 100%) ', // Gradient tuyến tính
        radialGradient: 'radial-gradient(circle, #EDCEA7, #EDCEA700)', // Gradient đối xứng

        // Màu cho các thành phần giao diện
        text: '#E18308', // Màu chữ
        button: '#E18308', // Màu nút bấm 1 (cam sáng)
        buttonSecondary: '#505A5F', // Màu nút bấm 2 (xám tối)
        imageBackground: '#FFF6E8', // Màu nền cho hình ảnh
        panelBackground: '#FFF0DB', // Màu nền của panel chứa nút bấm
        buttonBackground: '#F5A84A', // Màu nền cho nút bấm chính

        // Màu cho shadow button
        buttonShadow: '#FFC880A8', // Màu shadow cho nút bấm
      }
    }
  ]
};
