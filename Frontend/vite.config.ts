import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    headers: {
      "Cross-Origin-Opener-Policy": "unsafe-none"
    }
  },
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            // ⚠️ ALL packages that call React APIs (createContext, useRef, etc.)
            // MUST be in the same chunk as React to avoid "createContext is undefined"
            if (
              id.includes('/react/') ||
              id.includes('/react-dom/') ||
              id.includes('/react-router') ||
              id.includes('@radix-ui') ||
              id.includes('react-hook-form') ||
              id.includes('@hookform') ||
              id.includes('next-themes') ||
              id.includes('@react-oauth') ||
              id.includes('@tanstack') ||
              id.includes('sonner') ||
              id.includes('vaul') ||
              id.includes('cmdk') ||
              id.includes('embla-carousel-react') ||
              id.includes('input-otp') ||
              id.includes('react-day-picker') ||
              id.includes('react-resizable-panels') ||
              id.includes('lucide-react')
            ) {
              return 'vendor-react';
            }
            if (id.includes('socket.io-client')) {
              return 'vendor-socket';
            }
            if (id.includes('leaflet') || id.includes('react-leaflet')) {
              return 'vendor-maps';
            }
            return 'vendor'; // Safe non-React packages: zod, clsx, date-fns, etc.
          }
        }
      }
    },
    chunkSizeWarningLimit: 600,
  }
}));
