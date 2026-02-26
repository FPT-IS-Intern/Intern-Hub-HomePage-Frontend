import { environment } from '../../../environments/environment';

export function getBaseUrl(serviceName?: 'hrm' | 'banner' | 'auth' | 'scheduler'): string {
  const shellEnv = (window as any).__env;

  // Nếu chạy trong Shell App -> tất cả dùng chung apiUrl của Gateway
  if (shellEnv && shellEnv.apiUrl) {
    return shellEnv.apiUrl;
  }

  // Nếu chạy độc lập -> fallback về URL từng service tùy vào serviceName
  if (serviceName && environment.services[serviceName]) {
    return environment.services[serviceName];
  }

  // Fallback chung nếu không truyển serviceName
  return environment.services.banner; // Hoặc một service mặc định nào đó
}
