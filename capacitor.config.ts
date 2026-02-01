import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.getcapacitor.myapp',
  appName: 'front_GreenBox0.2',
  webDir: 'www',
  server: {
    androidScheme: 'http',
    allowNavigation: ['192.168.18.194', '*']
  }
};

export default config;
