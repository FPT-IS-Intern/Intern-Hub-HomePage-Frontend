import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import {
  BannerApiResponse,
  BannerRawData,
  BannerSlide,
} from '../components/slider/model/banner.models';
import { getBaseUrl } from '../core/config/app-config';

@Injectable({ providedIn: 'root' })
export class BannerService {
  private http = inject(HttpClient);
  private readonly API_BASE_URL = `${getBaseUrl()}/news/banners`;
  private bannerRawState = signal<BannerRawData[]>([]);

  public readonly slides = computed<BannerSlide[]>(() => {
    const rawData = this.bannerRawState();

    return [...rawData]
      .sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0))
      .map((item) => ({
        id: item.id,
        imageUrl: item.desktopImageUrl || item.images?.desktop || '',
        alt: item.imageAltText || item.images?.alt || item.title || 'Banner',
        link: item.actionTarget || item.action?.target,
        title: item.title,
        description: item.description,
      }));
  });

  fetchBanners(total = 5): Observable<BannerApiResponse> {
    const params = new HttpParams().set('total', String(total));

    return this.http.get<BannerApiResponse>(this.API_BASE_URL, { params }).pipe(
      map((res) => ({
        ...res,
        data: Array.isArray(res?.data) ? res.data : [],
      })),
      tap((res) => {
        this.bannerRawState.set(res.data);
      }),
      catchError(() => {
        this.bannerRawState.set([]);
        return of({ status: 'error', data: [] });
      }),
    );
  }
}
