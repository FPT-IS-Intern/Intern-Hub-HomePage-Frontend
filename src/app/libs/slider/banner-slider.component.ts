import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  ElementRef,
  ViewChild,
  HostListener,
  ChangeDetectorRef,
  Renderer2,
  ViewEncapsulation,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  BannerSlide,
  BannerSliderConfig,
  BannerSliderEvent,
} from './banner-slider.models';
import { DEFAULT_BANNER_SLIDER_CONFIG } from './banner-slider.config';
import { BannerSliderUtils } from './banner-slider.utils';
import { SizeParserPipe } from './size-parser.pipe';
import { BannerSliderNavigationComponent } from './banner-slider-navigation.component';
import { BannerSliderPaginationComponent } from './banner-slider-pagination.component';
import { BannerSliderViewAllButtonComponent } from './banner-slider-view-all-button.component';

@Component({
  selector: 'app-banner-slider',
  standalone: true,
  imports: [
    CommonModule,
    SizeParserPipe,
    BannerSliderNavigationComponent,
    BannerSliderPaginationComponent,
    BannerSliderViewAllButtonComponent
  ],
  templateUrl: './banner-slider.component.html',
  styleUrls: ['./banner-slider.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class BannerSliderComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {

  @Input() config: Partial<BannerSliderConfig> = {};
  @Input() slides: BannerSlide[] = [];
  @Input() activeIndex: number = 0;

  @Input() customNavPrevClass: string = '';
  @Input() customNavNextClass: string = '';
  @Input() navPrevIconTemplate: TemplateRef<any> | null = null;
  @Input() navNextIconTemplate: TemplateRef<any> | null = null;


  @Output() slideChange = new EventEmitter<BannerSliderEvent>();
  @Output() transitionStart = new EventEmitter<BannerSliderEvent>();
  @Output() transitionEnd = new EventEmitter<BannerSliderEvent>();
  @Output() touchStart = new EventEmitter<BannerSliderEvent>();
  @Output() touchEnd = new EventEmitter<BannerSliderEvent>();
  @Output() click = new EventEmitter<BannerSliderEvent>();
  @Output() doubleTap = new EventEmitter<BannerSliderEvent>();
  @Output() init = new EventEmitter<BannerSliderEvent>();
  @Output() destroy = new EventEmitter<void>();
  @Output() reachBeginning = new EventEmitter<void>();
  @Output() reachEnd = new EventEmitter<void>();

  // View Children
  @ViewChild('container', { static: true }) containerRef!: ElementRef;
  @ViewChild('wrapper', { static: true }) wrapperRef!: ElementRef;

  // Public properties
  currentConfig!: BannerSliderConfig;
  currentIndex: number = 0;
  realIndex: number = 0;
  previousIndex: number = 0;
  isAnimating: boolean = false;
  isTouched: boolean = false;
  isDragging: boolean = false;
  isDisabled: boolean = false;
  isBeginning: boolean = true;
  isEnd: boolean = false;

  slidesWithClones: BannerSlide[] = [];
  slideWidth: number = 0;
  slideHeight: number = 0;
  translate: number = 0;

  // Private properties
  private mergedConfig!: BannerSliderConfig;
  private startTranslate: number = 0;
  private currentTranslate: number = 0;
  private startX: number = 0;
  private startY: number = 0;
  private currentX: number = 0;
  private currentY: number = 0;
  private velocity: number = 0;
  private velocityInterval: any;
  private animatingTimeout: any;
  private autoplayInterval: any;
  private resizeObserver: ResizeObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private isDestroyed: boolean = false;
  private lastClickTime: number = 0;
  private windowWidth: number = window.innerWidth;
  private wrapperWidth: number = 0;
  private wrapperHeight: number = 0;
  private maxTranslate: number = 0;
  private minTranslate: number = 0;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.initializeSlider();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] || changes['slides']) {
      this.updateSlider();
    }

    if (changes['activeIndex'] && changes['activeIndex'].currentValue !== changes['activeIndex'].previousValue) {
      this.slideTo(changes['activeIndex'].currentValue);
    }
  }

  ngAfterViewInit(): void {
    this.setupObservers();
    this.updateSliderDimensions();
    this.cdr.detectChanges();
    this.init.emit(this.createEvent());
  }

  ngOnDestroy(): void {
    this.cleanup();
    this.destroy.emit();
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const keyboardEnabled = typeof this.currentConfig.keyboard === 'object'
      ? this.currentConfig.keyboard?.enabled
      : this.currentConfig.keyboard;

    if (!keyboardEnabled) return;

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.slidePrev();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.slideNext();
    }
  }

  slideTo(index: number, speed?: number): void {
    if (this.isDisabled || this.isAnimating) return;
    const totalSlides = this.slidesWithClones.length;
    const spv = this.currentConfig.slidesPerView || 1;
    const normalizedSpeed = speed ?? (this.currentConfig.speed || 300);
    const loopEnabled = this.isLoopEnabled();

    this.previousIndex = this.currentIndex;
    this.currentIndex = loopEnabled
      ? index
      : this.normalizeIndex(index);
    this.realIndex = this.getRealIndex(this.currentIndex);
    this.isAnimating = true;
    this.transitionStart.emit(this.createEvent());

    this.animateToPosition(this.getTranslateForIndex(this.currentIndex), normalizedSpeed, () => {
      if (loopEnabled) {
        if (this.currentIndex >= totalSlides - spv) {
          this.currentIndex = spv;
        } else if (this.currentIndex < spv) {
          this.currentIndex = totalSlides - spv * 2;
        }

        this.translate = this.getTranslateForIndex(this.currentIndex);
        this.updateWrapperTransform();
      }
      this.isAnimating = false;
      this.updateState();
      this.cdr.detectChanges();
    });
  }

  slideNext(speed?: number): void {
    this.slideTo(this.currentIndex + 1, speed);
  }

  slidePrev(speed?: number): void {
    this.slideTo(this.currentIndex - 1, speed);
  }

  update(): void {
    this.updateSlider();
  }

  destroySlider(): void {
    this.cleanup();
    this.isDestroyed = true;
  }

  getActiveIndex(): number {
    return this.realIndex;
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  getTotalSlides(): number {
    return this.slides.length;
  }

  isBeginningReached(): boolean {
    return this.isBeginning;
  }

  isEndReached(): boolean {
    return this.isEnd;
  }

  // Public method để template gọi
  getWrapperTransform(): string {
    const direction = this.currentConfig.direction || 'horizontal';
    const x = direction === 'horizontal' ? this.translate : 0;
    const y = direction === 'vertical' ? this.translate : 0;
    return BannerSliderUtils.getTransform(x, y, 0, 1, 0);
  }

  // Thêm các method public cho template
  getScrollbarTransform(): string {
    const progress = Math.abs(this.translate) / Math.abs(this.maxTranslate - this.minTranslate);
    const translateX = progress * 70; // 70% là width của scrollbar drag

    return BannerSliderUtils.getTransform(translateX, 0, 0, 1, 0);
  }

  handleSlideClick(slide: BannerSlide, index: number): void {
    this.click.emit(this.createEvent());
  }

  onMouseEnter(): void {
    const autoplay = this.currentConfig.autoplay;
    if (typeof autoplay === 'object' && autoplay.pauseOnMouseEnter) {
      this.clearAutoplay();
    }
  }

  onMouseLeave(): void {
    const autoplay = this.currentConfig.autoplay;
    if (typeof autoplay === 'object' && autoplay.pauseOnMouseEnter) {
      this.setupAutoplay();
    }
  }

  forwardEvent(event: MouseEvent | TouchEvent) {
    if (event instanceof MouseEvent) {
      switch (event.type) {
        case 'mousedown': this.handleMouseDown(event); break;
        case 'mousemove': this.handleMouseMove(event); break;
        case 'mouseup': this.handleMouseUp(event); break;
        case 'click': this.handleClick(event); break;
      }
    }

    if (event instanceof TouchEvent) {
      switch (event.type) {
        case 'touchstart': this.handleTouchStart(event); break;
        case 'touchmove': this.handleTouchMove(event); break;
        case 'touchend': this.handleTouchEnd(event); break;
      }
    }
  }

  // Button view all
  getViewAllLink(): string {
    if (typeof this.currentConfig.viewAllButton === 'object') {
      return this.currentConfig.viewAllButton.link || '#';
    }
    return '#';
  }

  getViewAllButtonText(): string {
    if (typeof this.currentConfig.viewAllButton === 'object') {
      return this.currentConfig.viewAllButton.text || 'View all';
    }
    return 'View all';
  }

  // Private Methods
  private initializeSlider(): void {
    this.mergedConfig = BannerSliderUtils.mergeConfig(
      this.config,
      DEFAULT_BANNER_SLIDER_CONFIG
    );

    this.currentConfig = BannerSliderUtils.applyBreakpoints(
      this.mergedConfig,
      this.windowWidth
    );

    this.prepareSlides();
    this.setupAutoplay();
    this.setupEventListeners();
  }

  private updateSlider(): void {
    this.currentConfig = BannerSliderUtils.applyBreakpoints(
      BannerSliderUtils.mergeConfig(this.config, DEFAULT_BANNER_SLIDER_CONFIG),
      this.windowWidth
    );

    this.prepareSlides();
    this.updateSliderDimensions();
    this.updateState();
    this.setupAutoplay();

    this.cdr.detectChanges();
  }

  private prepareSlides(): void {
    const loopEnabled = this.isLoopEnabled();

    if (loopEnabled && this.slides.length > 0) {
      this.createLoopSlides();
    } else {
      this.slidesWithClones = [...this.slides];
    }
  }

  private createLoopSlides(): void {
    const slidesPerView = this.currentConfig.slidesPerView || 1;
    const additionalSlides = typeof this.currentConfig.loop === 'object'
      ? this.currentConfig.loop?.additionalSlides || slidesPerView
      : slidesPerView;

    const beforeClones = this.slides.slice(-additionalSlides);
    const afterClones = this.slides.slice(0, additionalSlides);

    this.slidesWithClones = [
      ...beforeClones.map((slide, index) => ({
        ...slide,
        id: `clone-before-${index}`,
        isClone: true,
      })),
      ...this.slides,
      ...afterClones.map((slide, index) => ({
        ...slide,
        id: `clone-after-${index}`,
        isClone: true,
      })),
    ];

    this.currentIndex = additionalSlides;
    const size = this.currentConfig.direction === 'vertical' ? this.slideHeight : this.slideWidth;
    const gap = this.currentConfig.spaceBetween || 0;
    this.translate = -(this.currentIndex * (size + gap));
  }

  private updateSliderDimensions(): void {
    if (!this.containerRef?.nativeElement || !this.wrapperRef?.nativeElement) return;

    const container = this.containerRef.nativeElement;
    const wrapper = this.wrapperRef.nativeElement;

    this.wrapperWidth = container.clientWidth;
    this.wrapperHeight = container.clientHeight;

    const slidesPerView = this.currentConfig.slidesPerView || 1;
    const spaceBetween = this.currentConfig.spaceBetween || 0;
    const direction = this.currentConfig.direction || 'horizontal';

    if (direction === 'horizontal') {
      this.slideWidth = (this.wrapperWidth - (spaceBetween * (slidesPerView - 1))) / slidesPerView;
      this.slideHeight = this.wrapperHeight;

      const totalSlides = this.slidesWithClones.length;
      this.maxTranslate = 0;
      this.minTranslate = -((totalSlides - slidesPerView) * (this.slideWidth + spaceBetween));
    } else {
      this.slideWidth = this.wrapperWidth;
      this.slideHeight = (this.wrapperHeight - (spaceBetween * (slidesPerView - 1))) / slidesPerView;

      const totalSlides = this.slidesWithClones.length;
      this.maxTranslate = 0;
      this.minTranslate = -((totalSlides - slidesPerView) * (this.slideHeight + spaceBetween));
    }
    const newTranslate = this.getTranslateForIndex(this.currentIndex);
    const translateDiff = Math.abs(newTranslate - this.translate);
    const threshold = 0.5;

    if (translateDiff > threshold) {
      this.cdr.detectChanges();

      this.translate = newTranslate;
      this.updateWrapperTransform();

      this.cdr.markForCheck();
    }
  }

  private updateWrapperTransform(): void {
    if (!this.wrapperRef?.nativeElement) return;

    const transform = this.getWrapperTransform();
    this.renderer.setStyle(this.wrapperRef.nativeElement, 'transform', transform);
  }

  private animateToPosition(position: number, speed: number, onComplete?: Function): void {
    const wrapper = this.wrapperRef.nativeElement;

    // FIX: Ngăn cập nhật trong quá trình change detection nếu speed = 0
    if (speed === 0) {
      // Đặt trực tiếp giá trị mà không trigger transition
      this.translate = position;
      this.updateWrapperTransform();
      this.renderer.setStyle(wrapper, 'transition', 'none');
      onComplete?.();
      return;
    }

    // animate
    this.translate = position;
    this.updateWrapperTransform();

    // bật transition
    const transition = BannerSliderUtils.getTransition(speed, 'ease');
    this.renderer.setStyle(wrapper, 'transition', transition);

    clearTimeout(this.animatingTimeout);
    this.animatingTimeout = setTimeout(() => {
      this.renderer.setStyle(wrapper, 'transition', 'none');
      onComplete?.();
    }, speed);
  }

  private getTranslateForIndex(index: number): number {
    const slidesPerView = this.currentConfig.slidesPerView || 1;
    const spaceBetween = this.currentConfig.spaceBetween || 0;
    const direction = this.currentConfig.direction || 'horizontal';
    const centeredSlides = this.currentConfig.centeredSlides || false;

    if (direction === 'horizontal') {
      if (centeredSlides) {
        const centeredOffset = (this.wrapperWidth - this.slideWidth) / 2;
        return -((index * (this.slideWidth + spaceBetween)) - centeredOffset);
      }
      return -(index * (this.slideWidth + spaceBetween));
    } else {
      return -(index * (this.slideHeight + spaceBetween));
    }
  }

  // tính index của ảnh dùng cho việc prev/next theo kiểu tuyến tính
  private normalizeIndex(index: number): number {
    const totalSlides = this.slidesWithClones.length;
    const slidesPerView = this.currentConfig.slidesPerView || 1;
    const loopEnabled = this.isLoopEnabled();

    if (loopEnabled) {
      if (index >= totalSlides - slidesPerView) {
        return slidesPerView;
      } else if (index < 0) {
        return totalSlides - slidesPerView * 2;
      }
    }

    return BannerSliderUtils.clamp(index, 0, totalSlides - slidesPerView);
  }

  private getRealIndex(index: number): number {
    const loopEnabled = this.isLoopEnabled();

    if (loopEnabled) {
      const totalRealSlides = this.slides.length;
      const slidesPerView = this.currentConfig.slidesPerView || 1;
      const additionalSlides = typeof this.currentConfig.loop === 'object'
        ? this.currentConfig.loop?.additionalSlides || slidesPerView
        : slidesPerView;

      if (index < additionalSlides) {
        return totalRealSlides - (additionalSlides - index);
      } else if (index >= totalRealSlides + additionalSlides) {
        return index - totalRealSlides - additionalSlides;
      }

      return index - additionalSlides;
    }

    return index;
  }

  private isLoopEnabled(): boolean {
    return typeof this.currentConfig.loop === 'object'
      ? !!this.currentConfig.loop?.enabled
      : !!this.currentConfig.loop;
  }

  private updateState(): void {
    const totalSlides = this.slidesWithClones.length;
    const spv = this.currentConfig.slidesPerView || 1;
    const loopEnabled = this.isLoopEnabled();

    this.isBeginning = this.currentIndex === spv && !loopEnabled;
    this.isEnd = this.currentIndex === totalSlides - spv * 2 && !loopEnabled;

    if (this.isBeginning) this.reachBeginning.emit();
    if (this.isEnd) this.reachEnd.emit();
  }


  private setupAutoplay(): void {
    this.clearAutoplay();

    const autoplayConfig = this.currentConfig.autoplay;
    const autoplayEnabled = typeof autoplayConfig === 'object'
      ? autoplayConfig.enabled
      : autoplayConfig;

    if (autoplayEnabled) {
      const delay = typeof autoplayConfig === 'object' ? autoplayConfig.delay || 3000 : 3000;

      this.autoplayInterval = setInterval(() => {
        if (!this.isAnimating && !this.isTouched && !this.isDragging) {
          this.slideNext();
        }
      }, delay);
    }
  }

  private clearAutoplay(): void {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }
  // touch events mobile
  private setupEventListeners(): void {
    // Touch events
    if (BannerSliderUtils.isTouchDevice()) {
      this.setupTouchEvents();
    }

    // Mouse events
    this.setupMouseEvents();

    // Mousewheel
    const mousewheelEnabled = typeof this.currentConfig.mousewheel === 'object'
      ? this.currentConfig.mousewheel?.enabled
      : this.currentConfig.mousewheel;

    if (mousewheelEnabled) {
      this.setupMouseWheelEvents();
    }
  }

  private setupTouchEvents(): void {
    const container = this.containerRef.nativeElement;

    // Touch start
    this.renderer.listen(container, 'touchstart', (event: TouchEvent) => {
      this.handleTouchStart(event);
    });

    // Touch move
    this.renderer.listen(container, 'touchmove', (event: TouchEvent) => {
      this.handleTouchMove(event);
    });

    // Touch end
    this.renderer.listen(container, 'touchend', (event: TouchEvent) => {
      this.handleTouchEnd(event);
    });
  }

  // mouse event desktop
  private setupMouseEvents(): void {
    const container = this.containerRef.nativeElement;

    // Mouse down
    this.renderer.listen(container, 'mousedown', (event: MouseEvent) => {
      this.handleMouseDown(event);
    });

    // Mouse move
    this.renderer.listen(document, 'mousemove', (event: MouseEvent) => {
      this.handleMouseMove(event);
    });

    // Mouse up
    this.renderer.listen(document, 'mouseup', (event: MouseEvent) => {
      this.handleMouseUp(event);
    });

    // Click
    this.renderer.listen(container, 'click', (event: MouseEvent) => {
      this.handleClick(event);
    });
  }

  private setupMouseWheelEvents(): void {
    const container = this.containerRef.nativeElement;

    this.renderer.listen(container, 'wheel', (event: WheelEvent) => {
      this.handleMouseWheel(event);
    });
  }

  private handleTouchStart(event: TouchEvent): void {
    if (this.isAnimating || this.isDisabled) return;

    this.isTouched = true;
    this.startX = event.touches[0].clientX;
    this.startY = event.touches[0].clientY;
    this.startTranslate = this.translate;

    this.clearAutoplay();
    this.touchStart.emit(this.createEvent());
  }

  private handleTouchMove(event: TouchEvent): void {
    if (!this.isTouched || this.isDisabled) return;

    event.preventDefault();

    this.currentX = event.touches[0].clientX;
    this.currentY = event.touches[0].clientY;

    const diffX = this.currentX - this.startX;
    const diffY = this.currentY - this.startY;

    const direction = this.currentConfig.direction || 'horizontal';
    const allowTouchMove = this.currentConfig.allowTouchMove !== false;

    if (!allowTouchMove) return;

    if (direction === 'horizontal') {
      this.translate = this.startTranslate + diffX;
    } else {
      this.translate = this.startTranslate + diffY;
    }

    this.translate = BannerSliderUtils.clamp(this.translate, this.minTranslate, this.maxTranslate);
    this.updateWrapperTransform();

    // Calculate velocity
    this.calculateVelocity();
  }

  private handleTouchEnd(event: TouchEvent): void {
    if (!this.isTouched) return;

    this.isTouched = false;

    const threshold = this.currentConfig.threshold || 5;
    const direction = this.currentConfig.direction || 'horizontal';

    const diff = direction === 'horizontal'
      ? this.currentX - this.startX
      : this.currentY - this.startY;

    if (Math.abs(diff) > threshold) {
      this.handleSwipe();
    } else {
      this.snapBack();
    }

    this.touchEnd.emit(this.createEvent());
    this.setupAutoplay();
  }

  private isClickPrevented: boolean = false;
  private handleMouseDown(event: MouseEvent): void {
    if (this.isAnimating || this.isDisabled) return;

    event.preventDefault();
    this.isClickPrevented = false;
    this.isDragging = true;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.startTranslate = this.translate;

    this.clearAutoplay();
    this.touchStart.emit(this.createEvent());
  }

  private handleMouseMove(event: MouseEvent): void {
    if (!this.isDragging || this.isDisabled) return;
    this.isClickPrevented = true;
    this.currentX = event.clientX;
    this.currentY = event.clientY;

    const diffX = this.currentX - this.startX;
    const diffY = this.currentY - this.startY;

    const direction = this.currentConfig.direction || 'horizontal';
    const allowTouchMove = this.currentConfig.allowTouchMove !== false;

    if (!allowTouchMove) return;

    if (direction === 'horizontal') {
      this.translate = this.startTranslate + diffX;
    } else {
      this.translate = this.startTranslate + diffY;
    }
    this.translate = BannerSliderUtils.clamp(this.translate, this.minTranslate, this.maxTranslate);
    this.updateWrapperTransform();
    // Calculate velocity
    this.calculateVelocity();
  }

  private handleMouseUp(event: MouseEvent): void {

    if (!this.isDragging) return;

    this.isDragging = false;

    const threshold = this.currentConfig.threshold || 5;
    const direction = this.currentConfig.direction || 'horizontal';

    const diff = direction === 'horizontal'
      ? this.currentX - this.startX
      : this.currentY - this.startY;
    if (Math.abs(diff) > threshold) {
      this.handleSwipe();
    } else {
      this.snapBack();
    }

    this.touchEnd.emit(this.createEvent());
    this.setupAutoplay();
  }

  private handleMouseWheel(event: WheelEvent): void {
    event.preventDefault();

    const delta = Math.sign(event.deltaY);

    if (delta > 0) {
      this.slideNext();
    } else {
      this.slidePrev();
    }
  }

  private handleClick(event: MouseEvent): void {
    if (this.isClickPrevented) {
      event.preventDefault();
      return;
    }

    const now = Date.now();
    const timeDiff = now - this.lastClickTime;
    if (timeDiff < 300) {
      // Double click
      this.doubleTap.emit(this.createEvent());
      this.lastClickTime = 0;
    } else {
      // Single click
      this.click.emit(this.createEvent());
      this.lastClickTime = now;
    }
  }

  private handleSwipe(): void {
    const direction = this.currentConfig.direction || 'horizontal';
    const diff = direction === 'horizontal'
      ? this.currentX - this.startX
      : this.currentY - this.startY;

    const velocity = this.velocity;
    const speed = this.currentConfig.speed || 300;
    const resistanceRatio = this.currentConfig.resistanceRatio || 0.85;

    let targetTranslate = this.translate + (velocity * resistanceRatio);
    targetTranslate = BannerSliderUtils.clamp(targetTranslate, this.minTranslate, this.maxTranslate);

    const slidesPerView = this.currentConfig.slidesPerView || 1;
    const spaceBetween = this.currentConfig.spaceBetween || 0;
    const slideSize = direction === 'horizontal' ? this.slideWidth : this.slideHeight;

    let targetIndex = Math.round(Math.abs(targetTranslate) / (slideSize + spaceBetween));
    this.slideTo(targetIndex, speed);
  }

  private snapBack(): void {
    const currentIndex = Math.round(Math.abs(this.translate) / (this.slideWidth + (this.currentConfig.spaceBetween || 0)));
    const targetIndex = this.normalizeIndex(currentIndex);

    if (targetIndex !== this.currentIndex) {
      this.slideTo(targetIndex);
    } else {
      this.animateToPosition(this.getTranslateForIndex(this.currentIndex), 150);
    }
  }

  private calculateVelocity(): void {
    clearInterval(this.velocityInterval);

    let lastX = this.currentX;
    let lastY = this.currentY;
    let lastTime = Date.now();

    this.velocityInterval = setInterval(() => {
      const now = Date.now();
      const timeDiff = now - lastTime;

      if (timeDiff > 0) {
        const direction = this.currentConfig.direction || 'horizontal';

        if (direction === 'horizontal') {
          const distance = this.currentX - lastX;
          this.velocity = distance / timeDiff;
        } else {
          const distance = this.currentY - lastY;
          this.velocity = distance / timeDiff;
        }

        lastX = this.currentX;
        lastY = this.currentY;
        lastTime = now;
      }
    }, 50);
  }

  private setupObservers(): void {
    // Resize Observer
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(() => {
        this.updateSliderDimensions();
        this.cdr.detectChanges();
      });

      this.resizeObserver.observe(this.containerRef.nativeElement);
    }
  }

  private cleanup(): void {
    this.clearAutoplay();

    if (this.animatingTimeout) {
      clearTimeout(this.animatingTimeout);
    }

    if (this.velocityInterval) {
      clearInterval(this.velocityInterval);
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }

  private createEvent(): BannerSliderEvent {
    return {
      activeIndex: this.currentIndex,
      realIndex: this.realIndex,
      previousIndex: this.previousIndex,
      slides: this.slides,
    };
  }
}