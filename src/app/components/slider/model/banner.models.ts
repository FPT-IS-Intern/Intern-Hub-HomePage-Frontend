export interface BannerApiResponse {
  status?:
    | string
    | {
        code?: string;
        message?: string | null;
      };
  data: BannerRawData[];
}

export interface BannerRawData {
  id: string | number;
  title: string;
  description: string;
  displayOrder: number;
  desktopImageUrl?: string;
  mobileImageUrl?: string;
  imageAltText?: string;
  actionType?: string;
  actionTarget?: string;
  openInNewTab?: boolean;
  images?: {
    desktop: string;
    mobile: string;
    alt: string;
  } | null;
  style?: {
    buttonColor: string;
    textColor: string;
  };
  action?: {
    type: string;
    target: string;
    openInNewTab: boolean;
  } | null;
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
 * Lay danh sach banner mock, su dung URL S3 thuc te tu bien moi truong cua Shell App
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
        description: 'Giam gia len den 50% cho tat ca cac mat hang dien tu.',
        images: {
          desktop: `${fileBase}banner/bg1.png`,
          mobile: `${fileBase}banner/bg1.png`,
          alt: 'Banner khuyen mai mua he',
        },
        desktopImageUrl: `${fileBase}banner/bg1.png`,
        mobileImageUrl: `${fileBase}banner/bg1.png`,
        imageAltText: 'Banner khuyen mai mua he',
        action: { type: 'LINK', target: '/news', openInNewTab: true },
        actionType: 'LINK',
        actionTarget: '/news',
        openInNewTab: true,
        displayOrder: 1,
      },
      {
        id: '550e8400-e29b-411d-a716-446655440002',
        title: '',
        description: 'Giam gia len den 50% cho tat ca cac mat hang dien tu.',
        images: {
          desktop: `${fileBase}banner/bg2.png`,
          mobile: `${fileBase}banner/bg2.png`,
          alt: 'Banner khuyen mai mua he',
        },
        desktopImageUrl: `${fileBase}banner/bg2.png`,
        mobileImageUrl: `${fileBase}banner/bg2.png`,
        imageAltText: 'Banner khuyen mai mua he',
        action: { type: 'LINK', target: '/news', openInNewTab: true },
        actionType: 'LINK',
        actionTarget: '/news',
        openInNewTab: true,
        displayOrder: 2,
      },
      {
        id: '550e8400-e29b-411d-a716-446655440003',
        title: '',
        description: 'Giam gia len den 50% cho tat ca cac mat hang dien tu.',
        images: {
          desktop: `${fileBase}banner/bg3.jpg`,
          mobile: `${fileBase}banner/bg3.jpg`,
          alt: 'Banner khuyen mai mua he',
        },
        desktopImageUrl: `${fileBase}banner/bg3.jpg`,
        mobileImageUrl: `${fileBase}banner/bg3.jpg`,
        imageAltText: 'Banner khuyen mai mua he',
        action: { type: 'LINK', target: '/news', openInNewTab: true },
        actionType: 'LINK',
        actionTarget: '/news',
        openInNewTab: true,
        displayOrder: 3,
      },
    ],
  };
};

export const MOCK_BANNER_DATA: BannerApiResponse = getMockBanners();
