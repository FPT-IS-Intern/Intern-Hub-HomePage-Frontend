import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BannerSliderConfig } from './banner-slider.models';

@Component({
  selector: 'app-banner-slider-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (config && (typeof config.pagination === 'object' ? config.pagination.enabled : config.pagination)) {
      <div 
        class="banner-slider__pagination"
        [ngClass]="{
          'banner-slider__pagination--bullets': typeof config.pagination === 'object' && config.pagination.type === 'bullets',
          'banner-slider__pagination--fraction': typeof config.pagination === 'object' && config.pagination.type === 'fraction',
          'banner-slider__pagination--progressbar': typeof config.pagination === 'object' && config.pagination.type === 'progressbar',
          'banner-slider__pagination--clickable': typeof config.pagination === 'object' && config.pagination.clickable
        }"
        (mousedown)="emit($event)"
        (mousemove)="emit($event)"
        (mouseup)="emit($event)"

        (touchstart)="emit($event)"
        (touchmove)="emit($event)"
        (touchend)="emit($event)"
      >
        @switch (typeof config.pagination === 'object' ? config.pagination.type : 'bullets') {
          @case ('bullets') {
            @for (slide of slides; track i; let i = $index) {
              <span
                class="banner-slider__pagination-bullet"
                [ngClass]="[
                  typeof config.pagination === 'object' ? config.pagination.bulletClass : '',
                  i === realIndex ? (typeof config.pagination === 'object' ? config.pagination.bulletActiveClass : '') : ''
                ]"
                [attr.aria-label]="'Go to slide ' + (i + 1)"
                (click)="typeof config.pagination === 'object' && config.pagination.clickable && onSlideClick(i + 1)"
                role="button"
                tabindex="0"
                (keydown.enter)="typeof config.pagination === 'object' && config.pagination.clickable && onSlideClick(i)"
              ></span>
            }
          }
          
          @case ('fraction') {
            <span class="banner-slider__pagination-current">{{ realIndex + 1 }}</span>
            <span class="banner-slider__pagination-separator"> / </span>
            <span class="banner-slider__pagination-total">{{ slides.length }}</span>
          }
          
          @case ('progressbar') {
            <div class="banner-slider__pagination-progressbar">
              <div 
                class="banner-slider__pagination-progressbar-fill"
                [style.transform]="'translate3d(' + (-100 + ((realIndex + 1) / slides.length) * 100) + '%, 0, 0)'"
              ></div>
            </div>
          }
        }
      </div>
    }
  `
})
export class BannerSliderPaginationComponent {
  @Input() config: BannerSliderConfig | null = null;
  @Input() slides: any[] = [];
  @Input() realIndex: number = 0;

  @Output() slideClick = new EventEmitter<number>();
  @Output() pointerEvent = new EventEmitter<MouseEvent | TouchEvent>();

  onSlideClick(index: number): void {
    this.slideClick.emit(index);
  }

  emit(event: MouseEvent | TouchEvent) {
    this.pointerEvent.emit(event);
  }
}