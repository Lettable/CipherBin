/** @type {import('next').NextConfig} */
import withPWA from 'next-pwa';

const nextConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development' ? true : false,
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: ({ request }) => request.mode === 'navigate',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages-cache',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 7 * 24 * 60 * 60,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
  ],
});

export default nextConfig;
