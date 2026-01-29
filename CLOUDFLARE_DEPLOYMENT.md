# Cloudflare Pages Deployment Guide

## Build Configuration

This project is optimized for deployment on Cloudflare Pages using `@cloudflare/next-on-pages`.

### Build Settings

- **Build command**: `npm run build`
- **Build output directory**: `.next`
- **Root directory**: `/`

### Environment Variables

No required environment variables for basic deployment.

## Caching Strategy

The API endpoints implement Cloudflare caching best practices:

### Cache Headers Configuration

1. **Static Data Routes** (`/api/list`, `/api/info`):
   - Cache-Control: `public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800`
   - 24 hours browser cache, 24 hours Cloudflare cache
   - 7 days stale-while-revalidate

2. **Dynamic Routes** (`/api/rand`, `/api/search`):
   - Cache-Control: `public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400`
   - 1 hour browser cache, 1 hour Cloudflare cache
   - 24 hours stale-while-revalidate

3. **API Documentation** (`/api`):
   - Cache-Control: `public, max-age=86400, s-maxage=86400`
   - Revalidation every 24 hours via ISR

## Cloudflare Pages Features Used

- **Edge Caching**: All responses include proper Cache-Control headers
- **Stale-While-Revalidate**: Continue serving cached content while fetching fresh data
- **CORS Headers**: Properly configured for cross-origin requests
- **Image Optimization**: Configured for `img.doodcdn.co` domain

## Performance Optimizations

1. **In-Memory Caching**: Data fetches are cached in memory with 24-hour TTL
2. **Static Generation**: Home page and API documentation are pre-rendered
3. **Efficient Data Loading**: List and detail data loaded on-demand, not preloaded
4. **Search Optimization**: Limited search scope to improve performance

## Deployment Steps

1. Connect your GitHub repository to Cloudflare Pages
2. Set build command: `npm run build`
3. Set build output directory: `.next`
4. Deploy!

The project will automatically use the edge runtime where compatible and Node.js runtime for file system operations.
