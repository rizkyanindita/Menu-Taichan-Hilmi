/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
    skipWaiting: true,
});

const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'caripromo.id' // Allow all HTTPS domains
            },
            {
                protocol: 'https',
                hostname: 'unsplash.com' // Allow all HTTP domains (for development)
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com' // Allow all HTTP domains (for development)
            },
            {
                protocol: 'https',
                hostname: 'image.idntimes.com' // Allow all HTTP domains (for development)
            }
        ],
    },
    // Silence the error about webpack config being present while using Turbopack
    // Since next-pwa injects webpack config, we need to acknowledge it or disable turbopack
    // For now, silencing might work if we accept PWA might not work in local dev with Turbopack (which is disabled anyway)
    turbopack: {},
};

module.exports = withPWA(nextConfig);
