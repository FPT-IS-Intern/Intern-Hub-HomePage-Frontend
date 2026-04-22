import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BannerSliderConfig } from './banner-slider.models';

@Component({
    selector: 'app-banner-slider-view-all-button',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
        @if (config && showButton) {
        <div class="banner-slider__view-all">
            <a
            [routerLink]="viewAllLink"
            class="banner-slider__view-all-button"
            aria-label="View all"
            >
             <span>{{ buttonText || 'View all' }}</span>
            </a>
        </div>
}
  `
})
export class BannerSliderViewAllButtonComponent {
    @Input() config: BannerSliderConfig | null = null;
    @Input() buttonText: string = 'View all';
    @Input() viewAllLink: string = '#';

    get showButton(): boolean {
        if (!this.config) return false;

        const viewAllConfig = this.config.viewAllButton;
        if (typeof viewAllConfig === 'object') {
            return viewAllConfig.enabled !== false;
        }

        return !!viewAllConfig;
    }
}