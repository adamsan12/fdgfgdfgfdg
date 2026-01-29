/** @type {import('next').NextConfig} */
const fs = require('fs');
const path = require('path');

const nextConfig = {
    images: {
        remotePatterns: [
            {
                hostname: "img.doodcdn.co",
            },
            {
                hostname: "placehold.co",
            },
        ],
    },
    logging: {
        fetches: {
            fullUrl: true,
        },
    },
    experimental: {
        isrMemoryCacheSize: 0, // Disable ISR memory cache for Cloudflare
    },
    // Ensure proper caching headers
    headers: async () => {
        return [
            {
                source: '/api/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800'
                    },
                ],
            },
        ];
    },
    // Don't include public/data in static files (Cloudflare Pages has 20,000 file limit)
    onDemandEntries: {
        // Make sure entries are not getting disposed mid-request
        maxInactiveAge: 60 * 1000,
        pagesBufferLength: 5,
    },
};

module.exports = nextConfig;
