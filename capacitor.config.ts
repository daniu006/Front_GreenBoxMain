import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.getcapacitor.myapp',
  appName: 'front_GreenBox0.2',
  webDir: 'www',
  server: {
    androidScheme: 'http',
    allowNavigation: ['172.16.1.164']
  }
};

export default config;
