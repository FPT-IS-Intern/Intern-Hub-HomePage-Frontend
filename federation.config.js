const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  name: 'homePage',
  
  exposes: {
    './routes': './src/app/app.routes.ts',
  },
  
  shared: {
    ...shareAll({ 
      singleton: true, 
      strictVersion: true, 
      requiredVersion: 'auto' 
    }),
    // QUAN TRỌNG: Phải share dynamic-ds với cùng config
    'dynamic-ds': {
      singleton: true,
      strictVersion: false,
      requiredVersion: 'auto',
      includeSecondaries: true
    }
  },
  
  skip: [
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
    'ng-zorro-antd',
  ],
});