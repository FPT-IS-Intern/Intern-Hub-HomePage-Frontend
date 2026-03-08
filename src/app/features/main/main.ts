import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { DynamicDsService } from 'dynamic-ds';
import { HomePageBannerSliderComponent } from '../../components/slider/slider-banner.component';
import { AttendanceLayoutComponent } from '../../components/weekly-attendance/components/attendance-layout.component';
import { CardListContainerComponent } from '../../components/card-list/card-list-container.component';

@Component({
  selector: 'app-main',
  imports: [HomePageBannerSliderComponent, AttendanceLayoutComponent, CardListContainerComponent],
  templateUrl: './main.html',
  styleUrl: './main.scss',
})
export class Main implements OnInit, AfterViewInit, OnDestroy {
  private readonly themeService = inject(DynamicDsService);
  protected readonly title = signal('Homepage-service-fe');
  protected readonly designWidth = 1239;
  protected readonly viewportScale = signal(1);
  protected readonly canvasHeight = signal(760);

  @ViewChild('scaleContent') private scaleContent?: ElementRef<HTMLElement>;
  @ViewChild('scaleShell') private scaleShell?: ElementRef<HTMLElement>;
  private resizeObserver?: ResizeObserver;

  ngOnInit() {
    this.themeService.initializeTheme().subscribe();
  }

  ngAfterViewInit(): void {
    this.updateScale();
    this.observeContentHeight();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.updateScale();
  }

  private observeContentHeight(): void {
    if (!this.scaleContent || !this.scaleShell) {
      return;
    }

    this.resizeObserver = new ResizeObserver(() => this.updateScale());
    this.resizeObserver.observe(this.scaleContent.nativeElement);
    this.resizeObserver.observe(this.scaleShell.nativeElement);
  }

  private updateScale(): void {
    if (!this.scaleContent) {
      return;
    }

    const contentHeight = Math.max(this.scaleContent.nativeElement.scrollHeight, 760);
    const availableWidth = this.scaleShell?.nativeElement.clientWidth ?? window.innerWidth;
    const availableHeight = this.scaleShell?.nativeElement.clientHeight ?? window.innerHeight;
    const widthRatio = availableWidth / this.designWidth;
    const heightRatio = availableHeight / contentHeight;
    const nextScale = Math.min(widthRatio, heightRatio);

    this.canvasHeight.set(contentHeight);
    this.viewportScale.set(nextScale > 0 ? nextScale : 1);
  }
}
