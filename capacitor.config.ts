import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  //appId: 'io.ionic.starter',
  appId: 'com.feyconsuelo.id',
  appName: 'FeyConsuelo',
  webDir: 'www',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https'
  },
  plugins: {
    FirebaseMessaging: {
      presentationOptions: ["badge", "sound", "alert"]  // Opciones de presentación de notificaciones en iOS
    },
    Keyboard: {
      resize: "body"
    }
  }
};

export default config;
