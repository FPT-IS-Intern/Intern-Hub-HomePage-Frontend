import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, Observable } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import {
  BannerApiResponse,
  BannerRawData,
  BannerSlide,
  MOCK_BANNER_DATA,
} from '../components/slider/model/banner.models';
import { getBaseUrl } from '../core/config/app-config';

@Injectable({ providedIn: 'root' })
export class BannerService {
  private http = inject(HttpClient);
  private readonly API_BASE_URL = `/banner/admin/banners`;
  private bannerRawState = signal<BannerRawData[]>([]);

  public readonly slides = computed<BannerSlide[]>(() => {
    const rawData = this.bannerRawState();

    return [...rawData]
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((item) => ({
        id: item.id,
        imageUrl: item.images.desktop,
        alt: item.images.alt,
        link: item.action.target,
        title: item.title,
        description: item.description,
      }));
  });

  fetchBanners(): Observable<BannerApiResponse> {
    // return this.http.get<BannerApiResponse>(...)
    return of(MOCK_BANNER_DATA).pipe(
      tap((res) => {
        if (res.status === 'success') {
          this.bannerRawState.set(res.data);
        }
      }),
      catchError(() => of({ status: 'error', data: [] })),
    );
  }
}
