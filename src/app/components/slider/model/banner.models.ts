// Định nghĩa cấu trúc trả về từ Backend (Mapping chính xác với JSON của bạn)
export interface BannerApiResponse {
  status: string;
  data: BannerRawData[];
}

export interface BannerRawData {
  id: string;
  title: string;
  description: string;
  images: {
    desktop: string;
    mobile: string;
    alt: string;
  };
  style?: {
    buttonColor: string;
    textColor: string;
  };
  action: {
    type: string;
    target: string;
    openInNewTab: boolean;
  };
  displayOrder: number;
}

export interface BannerSlide {
  id: string | number;
  imageUrl: string;
  alt: string;
  link?: string;
  title?: string;
  description?: string;
}

import { getFileBaseUrl } from '../../../core/config/app-config';

/**
 * Lấy danh sách banner mock, sử dụng URL S3 thực tế từ biến môi trường của Shell App
 */
export const getMockBanners = (): BannerApiResponse => {
  const base = getFileBaseUrl();
  const fileBase = base.endsWith('/') ? base : `${base}/`;

  return {
    status: 'success',
    data: [
      {
        id: '550e8400-e29b-411d-a716-446655440001',
        title: '',
        description: 'Giảm giá lên đến 50% cho tất cả các mặt hàng điện tử.',
        images: {
          desktop: `${fileBase}banner/bg1.png`,
          mobile: `${fileBase}banner/bg1.png`,
          alt: 'Banner khuyến mãi mùa hè',
        },
        action: { type: 'LINK', target: '/news', openInNewTab: true },
        displayOrder: 1,
      },
      {
        id: '550e8400-e29b-411d-a716-446655440002',
        title: '',
        description: 'Giảm giá lên đến 50% cho tất cả các mặt hàng điện tử.',
        images: {
          desktop: `${fileBase}banner/bg2.png`,
          mobile: `${fileBase}banner/bg2.png`,
          alt: 'Banner khuyến mãi mùa hè',
        },
        action: { type: 'LINK', target: '/news', openInNewTab: true },
        displayOrder: 2,
      },
      {
        id: '550e8400-e29b-411d-a716-446655440003',
        title: '',
        description: 'Giảm giá lên đến 50% cho tất cả các mặt hàng điện tử.',
        images: {
          desktop: `${fileBase}banner/bg3.jpg`,
          mobile: `${fileBase}banner/bg3.jpg`,
          alt: 'Banner khuyến mãi mùa hè',
        },
        action: { type: 'LINK', target: '/news', openInNewTab: true },
        displayOrder: 3,
      },
    ],
  };
};

export const MOCK_BANNER_DATA: BannerApiResponse = getMockBanners();
