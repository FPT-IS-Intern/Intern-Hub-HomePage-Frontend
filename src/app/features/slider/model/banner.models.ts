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

// Định nghĩa dữ liệu Mock để test
export const MOCK_BANNER_DATA: BannerApiResponse = {
    status: "success",
    data: [
        {
            id: "550e8400-e29b-411d-a716-446655440000",
            title: "",
            description: "Giảm giá lên đến 50% cho tất cả các mặt hàng điện tử.",
            images: {
                desktop: 'http://localhost:4200/assets/img/home/BG.png',
                mobile: "http://localhost:4200/assets/img/home/BG_mobile.png",
                alt: "Banner khuyến mãi mùa hè"
            },
            action: { type: "LINK", target: "/news", openInNewTab: true },
            displayOrder: 1
        },
        {
            id: "550e8400-e29b-411d-a716-446655440000",
            title: "",
            description: "Giảm giá lên đến 50% cho tất cả các mặt hàng điện tử.",
            images: {
                desktop: 'http://localhost:4200/assets/img/home/BG1.png',
                mobile: "http://localhost:4200/assets/img/home/BG1_mobile.png",
                alt: "Banner khuyến mãi mùa hè"
            },
            action: { type: "LINK", target: "/news", openInNewTab: true },
            displayOrder: 2
        },
        {
            id: "550e8400-e29b-411d-a716-446655440000",
            title: "",
            description: "Giảm giá lên đến 50% cho tất cả các mặt hàng điện tử.",
            images: {
                desktop: 'http://localhost:4200/assets/img/home/BG2.png',
                mobile: "http://localhost:4200/assets/img/home/BG2_mobile.png",
                alt: "Banner khuyến mãi mùa hè"
            },
            action: { type: "LINK", target: "/news", openInNewTab: true },
            displayOrder: 3
        }
    ]
};