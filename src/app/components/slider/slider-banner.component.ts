import { Component, ViewEncapsulation, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BannerSliderComponent } from '../../libs/slider/banner-slider.component';
import {
  BannerSlide,
  BannerSliderConfig,
  BannerSliderEvent,
} from '../../libs/slider/banner-slider.models';
import { BannerService } from '../../services/api.slider-banner.service';

@Component({
  selector: 'app-homepage-banner-slider',
  standalone: true,
  imports: [CommonModule, BannerSliderComponent],
  templateUrl: './slider-banner.component.html',
  styleUrls: ['./slider-banner.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HomePageBannerSliderComponent implements OnInit {
  private bannerService = inject(BannerService);
  protected slides = this.bannerService.slides;

  readonly sliderConfigWithNav: BannerSliderConfig = {
    navigation: {
      enabled: true,
    },
    autoplay: {
      enabled: true,
      delay: 1500,
      pauseOnMouseEnter: true,
    },
    pagination: {
      enabled: true,
      clickable: true,
    },
    viewAllButton: {
      enabled: true,
      text: 'Xem tất cả',
      link: '/news-slide',
    },
    loop: true,
    speed: 1500,
    effect: 'fade',
  };

  ngOnInit(): void {
    this.bannerService.fetchBanners().subscribe();
  }
}
