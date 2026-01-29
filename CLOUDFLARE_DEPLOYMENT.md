# Cloudflare Pages Deployment Guide

## Setup

This project is optimized for deployment on Cloudflare Pages using `@cloudflare/next-on-pages` CLI.

### Prerequisites

- Cloudflare Account with Pages enabled
- GitHub repository connected to Cloudflare Pages
- Node.js 18+ (Cloudflare Pages uses Node.js 20.x)

## Build Configuration

### Using Cloudflare Pages Dashboard

1. **Repository Settings**
   - Connect your GitHub repository
   - Select the `main` branch

2. **Build Settings**
   - **Build command**: `npm run build && npx @cloudflare/next-on-pages@latest`
   - **Build output directory**: `.vercel/output/static`
   - **Root directory**: `/` (leave empty)

3. **Environment Variables** (if needed)
   - Add any required environment variables in the Pages dashboard

4. **Compatibility Flags** (Required)
   - Go to Pages project Settings → Functions → Compatibility Flags
   - Add `nodejs_compat` flag for both production and preview environments
   - This enables Node.js compatibility features needed by Next.js

### Using wrangler.toml (Alternative)

The `wrangler.toml` file is already configured for deployment via `wrangler deploy`.

```bash
npx wrangler deploy
```

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

## Performance Features

- **Edge Runtime**: All API routes run on Cloudflare's edge network
- **HTTP-based Data Fetching**: Uses fetch() API compatible with edge runtime
- **In-Memory Caching**: Data cached for 24 hours with revalidation
- **Stale-While-Revalidate**: Continue serving cached content while fetching fresh data
- **Automatic Revalidation**: ISR with 24-hour revalidation schedule

## File Structure for Deployment

```
.vercel/output/
├── static/          # Static files deployed to Cloudflare CDN
├── functions/       # Edge functions
└── _routes.json     # Route configuration
```

## Cloudflare Pages Features Used

- **Edge Caching**: All responses include proper Cache-Control headers
- **Stale-While-Revalidate**: Continue serving cached content while updating
- **CORS Headers**: Properly configured for cross-origin requests
- **Image Optimization**: Configured for `img.doodcdn.co` domain
- **Node.js Compatibility**: Using `nodejs_compat` flag for async operations

## Important: Data File Deployment

**The public/data directory should NOT be deployed to Cloudflare Pages** due to the 20,000 file limit.

### Data Serving Options

1. **Option A: Serve from external CDN** (Recommended)
   - Upload public/data files to a separate CDN or object storage
   - Update the DATA_BASE_URL in API routes to point to external source
   - Example: `const DATA_BASE_URL = 'https://your-cdn.com/data'`

2. **Option B: Keep local for development**
   - Files in public/data are served locally in development
   - Update deployment to use external data source in production
   - Use environment variables to switch URLs based on environment

3. **Option C: Use R2 (Cloudflare's object storage)**
   - Upload data files to Cloudflare R2
   - Configure R2 bucket with public access
   - Update API routes to fetch from R2 URL

### Excluding Data Files from Deployment

The `.vercelignore` file excludes the public/data directory from the build input. When deployed to Cloudflare Pages, ensure:

1. Data files are served from an external source
2. API routes fetch from the external data URL
3. Update `DATA_BASE_URL` in `app/lib/fetchStaticData.ts` for production

## Troubleshooting

### Too many files error (>20,000 files)
- Ensure .vercelignore is properly excluding node_modules, .git, .next
- Check that only static files and necessary functions are in .vercel/output

### nodejs_compat flag not found
- Go to Pages project Settings → Functions → Compatibility Flags
- Add `nodejs_compat` flag manually

### Static files not loading
- Verify public/data files exist
- Check that static files are in .vercel/output/static

## Local Testing

```bash
# Development
npm run dev

# Production build
npm run build

# Cloudflare Pages build
npm run pages

# Start production server
npm start
```

## Deployment Steps

1. Push code to GitHub main branch
2. Cloudflare Pages will automatically detect and build
3. Wait for build to complete (should output to .vercel/output)
4. Your site will be live at `https://your-project.pages.dev`

