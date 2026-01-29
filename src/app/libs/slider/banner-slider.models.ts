export interface BannerSlide {
  id: number | string;
  imageUrl: string;
  alt?: string;
  title?: string;
  subtitle?: string;
  link?: string;
  htmlContent?: string;
  data?: any;
  isClone?: boolean;
}

export interface BannerSliderBreakpoint {
  slidesPerView?: number;
  spaceBetween?: number;
  [key: string]: any;
}

export interface BannerSliderConfig {
  // Basic
  slides?: BannerSlide[];
  slidesPerView?: number;
  spaceBetween?: number;
  direction?: 'horizontal' | 'vertical';
  width?: number | string;
  height?: number | string;
  
  // Navigation
  navigation?: boolean | {
    enabled?: boolean;
    nextButtonClass?: string;
    prevButtonClass?: string;
    hiddenClass?: string;
    disabledClass?: string;
  };
  
  // Pagination
  pagination?: boolean | {
    enabled?: boolean;
    type?: 'bullets' | 'fraction' | 'progressbar' | 'custom';
    el?: string;
    bulletClass?: string;
    bulletActiveClass?: string;
    clickable?: boolean;
    renderBullet?: Function;
  };
  
  // Scrollbar
  scrollbar?: boolean | {
    enabled?: boolean;
    draggable?: boolean;
    hide?: boolean;
    el?: string;
    dragClass?: string;
  };
  
  // Autoplay
  autoplay?: boolean | {
    enabled?: boolean;
    delay?: number;
    disableOnInteraction?: boolean;
    pauseOnMouseEnter?: boolean;
    reverseDirection?: boolean;
    stopOnLastSlide?: boolean;
  };
  
  // Loop
  loop?: boolean | {
    enabled?: boolean;
    additionalSlides?: number;
  };
  
  // Speed & Effects
  speed?: number;
  effect?: 'slide' | 'fade' | 'cube' | 'coverflow' | 'flip' | 'creative';
  parallax?: boolean | {
    enabled?: boolean;
    parallaxBackgroundImage?: string;
    parallaxBackgroundSize?: string;
  };
  
  // Interaction
  grabCursor?: boolean;
  centeredSlides?: boolean;
  freeMode?: boolean;
  resistance?: boolean;
  resistanceRatio?: number;
  
  // Touch
  touchEventsTarget?: 'container' | 'wrapper';
  touchRatio?: number;
  touchAngle?: number;
  simulateTouch?: boolean;
  shortSwipes?: boolean;
  longSwipes?: boolean;
  longSwipesRatio?: number;
  longSwipesMs?: number;
  followFinger?: boolean;
  allowTouchMove?: boolean;
  threshold?: number;
  touchStartPreventDefault?: boolean;
  touchMoveStopPropagation?: boolean;
  
  // Mousewheel
  mousewheel?: boolean | {
    enabled?: boolean;
    forceToAxis?: boolean;
    invert?: boolean;
    sensitivity?: number;
    eventsTarget?: string;
  };
  
  // Keyboard
  keyboard?: boolean | {
    enabled?: boolean;
    onlyInViewport?: boolean;
  };
  
  // Lazy loading
  lazy?: boolean | {
    enabled?: boolean;
    loadPrevNext?: boolean;
    loadPrevNextAmount?: number;
    loadOnTransitionStart?: boolean;
  };
  
  // Responsive
  breakpoints?: {
    [key: number]: BannerSliderBreakpoint;
  };
  
  // Events
  on?: {
    [key: string]: Function;
  };
  
  // Classes
  containerClass?: string;
  wrapperClass?: string;
  slideClass?: string;
  slideActiveClass?: string;
  slideVisibleClass?: string;
  slideDuplicateClass?: string;
}

export interface BannerSliderEvent {
  activeIndex: number;
  realIndex: number;
  previousIndex: number;
  slides: BannerSlide[];
}

export type BannerSliderEventType = 
  | 'init'
  | 'slideChange'
  | 'transitionStart'
  | 'transitionEnd'
  | 'touchStart'
  | 'touchMove'
  | 'touchEnd'
  | 'click'
  | 'doubleTap'
  | 'imagesReady'
  | 'progress'
  | 'reachBeginning'
  | 'reachEnd'
  | 'destroy';