import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BannerSliderComponent } from '../../libs/slider/banner-slider.component';
import { BannerSlide, BannerSliderConfig, BannerSliderEvent } from '../../libs/slider/banner-slider.models';

@Component({
  selector: 'app-homepage-banner-slider',
  standalone: true,
  imports: [CommonModule, BannerSliderComponent],
  templateUrl: './slider-banner.component.html',
  styleUrls: ['./slider-banner.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HomePageBannerSliderComponent {
  slides: BannerSlide[] = [
    {
      id: 1,
      imageUrl: 'assets/img/home/BG.png',
      alt: 'Nature Landscape',
      link: '/destinations/nature'
    },
    {
      id: 2,
      imageUrl: 'assets/img/home/BG1.png',
      alt: 'Mountain Adventure',
      link: '/adventures/mountains'
    },
    {
      id: 3,
      imageUrl: 'assets/img/home/BG2.png',
      alt: 'Beach Vacation',
      link: '/vacations/beaches'
    }
  ];

  // Config with navigation and pagination
  sliderConfigWithNav: BannerSliderConfig = {
    navigation: {
      enabled: true
    },
    autoplay: {
      enabled: true,
      delay: 500,
      disableOnInteraction: false,
      pauseOnMouseEnter: true
    },
    pagination: {
      enabled: true,
      type: 'bullets',
      clickable: true
    },
    viewAllButton: {
      enabled: true,
      text: 'Xem tất cả',
      link: '/news-slide'
    },
    loop: true,
    speed: 600,
    effect: 'fade'
  };

  // Thêm event handlers
  onSlideChange(event: BannerSliderEvent) {
    console.log('Slide changed:', event);
  }

  onTransitionEnd(event: BannerSliderEvent) {
    console.log('Transition ended:', event);
  }
}