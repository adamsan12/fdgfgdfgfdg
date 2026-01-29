/** @type {import('next').NextConfig} */
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
};

module.exports = nextConfig;
