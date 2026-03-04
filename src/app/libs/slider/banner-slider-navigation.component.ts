import { Component, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BannerSliderConfig } from './banner-slider.models';

@Component({
  selector: 'app-banner-slider-navigation',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (config && (typeof config.navigation === 'object' ? config.navigation.enabled : config.navigation)) {
      <button 
        type="button"
        class="banner-slider__button banner-slider__button--prev"
        [ngClass]="[
          typeof config.navigation === 'object' ? config.navigation.prevButtonClass : '',
          isBeginning && !config.loop ? (typeof config.navigation === 'object' ? config.navigation.disabledClass : '') : '',
          customPrevClass
        ]"
        [disabled]="isBeginning && !config.loop"
        (click)="onPrevClick()"
        aria-label="Previous slide"
      >
        @if (prevIconTemplate) {
          <ng-container *ngTemplateOutlet="prevIconTemplate"></ng-container>
        } @else {
          <svg class="banner-slider__button-icon" viewBox="0 0 24 24">
            <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/>
          </svg>
        }
      </button>
      
      <button 
        type="button"
        class="banner-slider__button banner-slider__button--next"
        [ngClass]="[
          typeof config.navigation === 'object' ? config.navigation.nextButtonClass : '',
          isEnd && !config.loop ? (typeof config.navigation === 'object' ? config.navigation.disabledClass : '') : '',
          customNextClass
        ]"
        [disabled]="isEnd && !config.loop"
        (click)="onNextClick()"
        aria-label="Next slide"
      >
        @if (nextIconTemplate) {
          <ng-container *ngTemplateOutlet="nextIconTemplate"></ng-container>
        } @else {
          <svg class="banner-slider__button-icon" viewBox="0 0 24 24">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
          </svg>
        }
      </button>
    }
  `
})
export class BannerSliderNavigationComponent {
  @Input() config: BannerSliderConfig | null = null;
  @Input() isBeginning: boolean = false;
  @Input() isEnd: boolean = false;
  @Input() customPrevClass: string = '';
  @Input() customNextClass: string = '';
  @Input() prevIconTemplate: TemplateRef<any> | null = null;
  @Input() nextIconTemplate: TemplateRef<any> | null = null;

  @Output() prevClick = new EventEmitter<void>();
  @Output() nextClick = new EventEmitter<void>();

  onPrevClick(): void {
    this.prevClick.emit();
  }

  onNextClick(): void {
    this.nextClick.emit();
  }
}