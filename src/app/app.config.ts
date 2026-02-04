import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { SYSTEM_DESIGN_CONFIG } from 'dynamic-ds';
import { REST_CONFIG, RestConfig } from '@goat-bravos/shared-lib-client';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    {
      provide: SYSTEM_DESIGN_CONFIG,
      useValue: {
        brand: "#EE8E1B", // --brand-600
        primary: "#E18308", // --primary-600
        secondary: "#00652A", // --secondary-600
        functional: "#C36F06", // --functional-600
        utility: "#F5A84A", // --utility-600
      }
    },

    // Cấu hình REST API
    {
      provide: REST_CONFIG,
      useValue: {
        apiBaseUrl: 'http://localhost:4300/', // Base URL cho các hàm Internal
        enableLogging: true,
        internalAutoRetry: true,
        retryAttempts: 3,
        retryIntervalMs: 1000,
        loginPath: '/login',
        tokenKey: 'accessToken'
      } as RestConfig
    }
  ]
};
