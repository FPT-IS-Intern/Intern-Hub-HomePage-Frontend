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
