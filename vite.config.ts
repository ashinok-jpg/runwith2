import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const requiredEnv = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
];

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  if (command === 'build') {
    // Fail the build instead of deploying an app that crashes on startup
    const env = loadEnv(mode, process.cwd(), 'VITE_');
    const missing = requiredEnv.filter(key => !env[key]);
    if (missing.length > 0) {
      throw new Error(`Missing env vars: ${missing.join(', ')}. Copy .env.example to .env and fill in your Firebase config.`);
    }
  }

  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
            react: ['react', 'react-dom'],
          },
        },
      },
    },
  };
});
