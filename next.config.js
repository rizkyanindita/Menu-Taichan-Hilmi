/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "caripromo.id", // Allow all HTTPS domains
      },
      {
        protocol: "https",
        hostname: "unsplash.com", // Allow all HTTP domains (for development)
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com", // Allow all HTTP domains (for development)
      },
      {
        protocol: "https",
        hostname: "image.idntimes.com", 
      },
      {
        protocol: "https",
        hostname: "drive.google.com",
      },
      {
        protocol: "https",
        hostname: "drive.usercontent.google.com",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
    ],
    // AVIF/WebP memangkas 40-70% byte dibanding JPEG asli dari Drive.
    formats: ["image/avif", "image/webp"],
    // Hasil optimasi ditahan 30 hari di CDN Vercel, jadi Google Drive hanya
    // dihubungi sekali per (gambar x ukuran) — bukan sekali per pengunjung.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Ukuran nyata yang dipakai UI: thumbnail list 88px, kartu grid, modal.
    imageSizes: [96, 128, 180, 256, 384],
    deviceSizes: [420, 640, 828, 1080],
    qualities: [60, 70, 75],
  },
  // Silence the error about webpack config being present while using Turbopack
  // Since next-pwa injects webpack config, we need to acknowledge it or disable turbopack
  // For now, silencing might work if we accept PWA might not work in local dev with Turbopack (which is disabled anyway)
  turbopack: {},
};

module.exports = withPWA(nextConfig);
