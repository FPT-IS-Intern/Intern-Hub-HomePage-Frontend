    import { InjectionToken } from '@angular/core';

export interface ApiConfig {
  baseUrl: string;
  endpoints: {
    attendance: {
      checkIn: string;
      checkOut: string;
      status: string;
      history: string;
    };
    location: {
      wifiInfo: string;
      verify: string;
    };
    remote: {
      request: string;
      status: string;
      history: string;
    };
  };
}

export const API_CONFIG: ApiConfig = {
  baseUrl: 'https://your-api-domain.com/api/v1',
  endpoints: {
    attendance: {
      checkIn: '/attendance/checkin',
      checkOut: '/attendance/checkout',
      status: '/attendance/status',
      history: '/attendance/history'
    },
    location: {
      wifiInfo: '/location/wifi-info',
      verify: '/location/verify'
    },
    remote: {
      request: '/remote/request',
      status: '/remote/status',
      history: '/remote/history'
    }
  }
};

export const API_CONFIG_TOKEN = new InjectionToken<ApiConfig>('API_CONFIG');