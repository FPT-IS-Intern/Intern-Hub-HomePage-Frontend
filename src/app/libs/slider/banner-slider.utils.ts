import { BannerSliderConfig, BannerSliderBreakpoint } from './banner-slider.models';

export class BannerSliderUtils {
    /**
     * Merge configuration với default config
     */
    static mergeConfig(
        userConfig: BannerSliderConfig,
        defaultConfig: BannerSliderConfig
    ): BannerSliderConfig {
        const merged = { ...defaultConfig };

        for (const key in userConfig) {
            if (Object.prototype.hasOwnProperty.call(userConfig, key)) {
                // Ép kiểu key ở đây
                const k = key as keyof BannerSliderConfig;

                const userValue = userConfig[k];
                const defaultValue = merged[k];

                if (typeof userValue === 'object' && userValue !== null &&
                    typeof defaultValue === 'object' && defaultValue !== null &&
                    !Array.isArray(userValue)) {
                    // Cần ép kiểu thêm một chút ở phần gán để TS an tâm
                    (merged[k] as object) = { ...defaultValue, ...userValue };
                } else {
                    // Ép kiểu any ở đây nếu các giá trị quá khác biệt, 
                    // hoặc để TS tự suy luận từ BannerSliderConfig
                    (merged[k] as any) = userValue;
                }
            }
        }

        return merged;
    }

    /**
     * Apply responsive breakpoints
     */
    static applyBreakpoints(
        config: BannerSliderConfig,
        windowWidth: number
    ): BannerSliderConfig {
        if (!config.breakpoints) return config;

        const breakpoints = Object.keys(config.breakpoints)
            .map(Number)
            .sort((a, b) => b - a); // Từ lớn đến nhỏ

        let matchedBreakpoint: BannerSliderBreakpoint | null = null;

        for (const breakpoint of breakpoints) {
            if (windowWidth >= breakpoint) {
                matchedBreakpoint = config.breakpoints[breakpoint];
                break;
            }
        }

        if (matchedBreakpoint) {
            return { ...config, ...matchedBreakpoint };
        }

        return config;
    }

    /**
     * Kiểm tra touch device
     */
    static isTouchDevice(): boolean {
        return 'ontouchstart' in window ||
            navigator.maxTouchPoints > 0 ||
            (navigator as any).msMaxTouchPoints > 0;
    }

    /**
     * Throttle function
     */
    static throttle<T extends (...args: any[]) => any>(
        func: T,
        limit: number
    ): (...args: Parameters<T>) => void {
        let inThrottle: boolean;

        return function (this: any, ...args: Parameters<T>) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    }

    /**
     * Debounce function
     */
    static debounce<T extends (...args: any[]) => any>(
        func: T,
        wait: number
    ): (...args: Parameters<T>) => void {
        let timeout: ReturnType<typeof setTimeout>;

        return function (this: any, ...args: Parameters<T>) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    /**
     * Get CSS transform string
     */
    static getTransform(
        x: number = 0,
        y: number = 0,
        z: number = 0,
        scale: number = 1,
        rotate: number = 0
    ): string {
        return `translate3d(${x}px, ${y}px, ${z}px) scale(${scale}) rotate(${rotate}deg)`;
    }

    /**
     * Get transition string
     */
    static getTransition(duration: number = 300, timingFunction: string = 'ease'): string {
        return `transform ${duration}ms ${timingFunction}`;
    }

    /**
     * Clamp value between min and max
     */
    static clamp(value: number, min: number, max: number): number {
        return Math.min(Math.max(value, min), max);
    }

    /**
     * Parse width/height values
     */
    static parseSize(value: number | string): string {
        if (typeof value === 'number') {
            return `${value}px`;
        }
        return value;
    }
}