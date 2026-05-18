import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aikurdi.app',
  appName: 'پرسیاری شەرعی',
  webDir: 'dist',
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
  server: {
    allowNavigation: ['*']
  }
};

export default config;
