import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 500,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/scheduler/')) {
            return 'vendor-react';
          }
          // Router
          if (id.includes('node_modules/react-router') || id.includes('node_modules/@remix-run')) {
            return 'vendor-router';
          }
          // Framer Motion
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/motion')) {
            return 'vendor-framer';
          }
          // GSAP
          if (id.includes('node_modules/gsap')) {
            return 'vendor-gsap';
          }
          // Recharts
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) {
            return 'vendor-charts';
          }
          // Swiper
          if (id.includes('node_modules/swiper')) {
            return 'vendor-swiper';
          }
          // Lucide Icons
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
          // Axios
          if (id.includes('node_modules/axios')) {
            return 'vendor-http';
          }
          // QR Code libraries
          if (id.includes('node_modules/html5-qrcode') || id.includes('node_modules/qrcode.react')) {
            return 'vendor-qrcode';
          }
          // React CountUp
          if (id.includes('node_modules/react-countup') || id.includes('node_modules/countup.js')) {
            return 'vendor-countup';
          }
          // Lenis (smooth scroll)
          if (id.includes('node_modules/@studio-freight/lenis') || id.includes('node_modules/lenis')) {
            return 'vendor-lenis';
          }
          // React Intersection Observer
          if (id.includes('node_modules/react-intersection-observer')) {
            return 'vendor-intersection';
          }
          // Other vendor libs
          if (id.includes('node_modules/')) {
            return 'vendor-other';
          }
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'gsap',
      'recharts',
      'swiper',
      'swiper/react',
      'swiper/modules',
      'lucide-react',
      'axios',
      'qrcode.react',
      'react-countup',
    ],
  },
})
