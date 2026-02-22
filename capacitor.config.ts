import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.suda.greenbox', // Pon algo único aquí
  appName: 'front_GreenBox0.2',
  webDir: 'www',
  server: {
    androidScheme: 'http',
    allowNavigation: ['192.168.18.194', '*']
  }
};

export default config;
