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

/**
 * Resolve base URL cho static assets của HomePage micro-frontend.
 * Khi chạy trong Shell App, đường dẫn `/mock/...` sẽ trỏ về domain Shell
 * thay vì domain HomePage. Hàm này lấy đúng origin từ importmap.
 */
function getHomepageBaseUrl(): string {
  try {
    const scripts = document.querySelectorAll(
      'script[type="importmap-shim"], script[type="importmap"]',
    );
    for (const script of Array.from(scripts)) {
      const map = JSON.parse(script.textContent || '{}');
      const homePageEntry: string = map?.imports?.['homePage'] || '';
      if (homePageEntry) {
        return homePageEntry.substring(0, homePageEntry.lastIndexOf('/'));
      }
    }
  } catch {
    // Ignore parse errors
  }
  return ''; // Fallback khi chạy standalone
}

const MOCK_BANNER_BASE_PATH = `${getHomepageBaseUrl()}/mock`;

// Định nghĩa dữ liệu Mock để test
export const MOCK_BANNER_DATA: BannerApiResponse = {
  status: 'success',
  data: [
    {
      id: '550e8400-e29b-411d-a716-446655440000',
      title: '',
      description: 'Giảm giá lên đến 50% cho tất cả các mặt hàng điện tử.',
      images: {
        desktop: `${MOCK_BANNER_BASE_PATH}/BG.png`,
        mobile: `${MOCK_BANNER_BASE_PATH}/BG.png`,
        alt: 'Banner khuyến mãi mùa hè',
      },
      action: { type: 'LINK', target: '/news', openInNewTab: true },
      displayOrder: 1,
    },
    {
      id: '550e8400-e29b-411d-a716-446655440000',
      title: '',
      description: 'Giảm giá lên đến 50% cho tất cả các mặt hàng điện tử.',
      images: {
        desktop: `${MOCK_BANNER_BASE_PATH}/BG1.png`,
        mobile: `${MOCK_BANNER_BASE_PATH}/BG1.png`,
        alt: 'Banner khuyến mãi mùa hè',
      },
      action: { type: 'LINK', target: '/news', openInNewTab: true },
      displayOrder: 2,
    },
    {
      id: '550e8400-e29b-411d-a716-446655440000',
      title: '',
      description: 'Giảm giá lên đến 50% cho tất cả các mặt hàng điện tử.',
      images: {
        desktop: `${MOCK_BANNER_BASE_PATH}/BG2.png`,
        mobile: `${MOCK_BANNER_BASE_PATH}/BG2.png`,
        alt: 'Banner khuyến mãi mùa hè',
      },
      action: { type: 'LINK', target: '/news', openInNewTab: true },
      displayOrder: 3,
    },
  ],
};
