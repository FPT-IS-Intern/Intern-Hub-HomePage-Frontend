import { BannerSliderConfig } from './banner-slider.models';

export const DEFAULT_BANNER_SLIDER_CONFIG: BannerSliderConfig = {
  // Basic
  slidesPerView: 1,
  spaceBetween: 0,
  direction: 'horizontal',
  width: '100%',
  height: 'auto',
  
  // Navigation
  navigation: {
    enabled: false,
    nextButtonClass: 'banner-slider-button-next',
    prevButtonClass: 'banner-slider-button-prev',
    hiddenClass: 'banner-slider-button-hidden',
    disabledClass: 'banner-slider-button-disabled',
  },
  
  // Pagination
  pagination: {
    enabled: false,
    type: 'bullets',
    bulletClass: 'banner-slider-pagination-bullet',
    bulletActiveClass: 'banner-slider-pagination-bullet-active',
    clickable: true,
  },
  
  // Scrollbar
  scrollbar: {
    enabled: false,
    draggable: true,
    hide: false,
    dragClass: 'banner-slider-scrollbar-drag',
  },
  
  // Autoplay
  autoplay: {
    enabled: false,
    delay: 3000,
    disableOnInteraction: true,
    pauseOnMouseEnter: false,
  },
  
  // Loop
  loop: {
    enabled: false,
    additionalSlides: 0,
  },
  
  // Speed & Effects
  speed: 300,
  effect: 'slide',
  parallax: false,
  
  // Interaction
  grabCursor: false,
  centeredSlides: false,
  freeMode: false,
  resistance: true,
  resistanceRatio: 0.85,
  
  // Touch
  touchEventsTarget: 'container',
  touchRatio: 1,
  touchAngle: 45,
  simulateTouch: true,
  shortSwipes: true,
  longSwipes: true,
  longSwipesRatio: 0.5,
  longSwipesMs: 300,
  followFinger: true,
  allowTouchMove: true,
  threshold: 5,
  touchStartPreventDefault: true,
  touchMoveStopPropagation: false,
  
  // Mousewheel
  mousewheel: false,
  
  // Keyboard
  keyboard: false,
  
  // Lazy loading
  lazy: false,
  
  // Classes
  containerClass: 'banner-slider-container',
  wrapperClass: 'banner-slider-wrapper',
  slideClass: 'banner-slider-slide',
  slideActiveClass: 'banner-slider-slide-active',
  slideVisibleClass: 'banner-slider-slide-visible',
  slideDuplicateClass: 'banner-slider-slide-duplicate',
  
  // Events
  on: {},
};