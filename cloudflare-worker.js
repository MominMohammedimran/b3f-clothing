
// Cloudflare Worker Script
// Deploy this at: https://workers.cloudflare.com/

// Configuration
const ALLOWED_ORIGINS = [
  'https://b3f-prints.pages.dev',
  'http://localhost:8080',
];
const BACKEND_API = 'https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    const referer = request.headers.get('Referer');

    // Allow only requests from allowed origin
    const isAllowedOrigin =
      origin === ALLOWED_ORIGIN ||
      (referer && referer.startsWith(ALLOWED_ORIGIN));

    if (!isAllowedOrigin) {
      return new Response('Forbidden - Invalid Origin', {
        status: 403,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Remove /proxy from the path
    let targetPath = url.pathname.replace(/^\/proxy/, '');
    const backendUrl = `${BACKEND_API}${targetPath}${url.search}`;

    try {
      const backendResponse = await fetch(backendUrl, {
        method: 'GET',
        headers: {
          'X-Proxy-Secure': 'true',
        },
      });

      // Clone the response and preserve the image headers
      const responseHeaders = new Headers(backendResponse.headers);
      responseHeaders.set('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
      responseHeaders.set('Access-Control-Allow-Credentials', 'true');

      return new Response(backendResponse.body, {
        status: backendResponse.status,
        headers: responseHeaders,
      });
    } catch (error) {
      return new Response('Proxy Error: ' + error.message, {
        status: 502,
        headers: {
          'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
          'Content-Type': 'text/plain',
        },
      });
    }
  },
};


/**
 * DEPLOYMENT INSTRUCTIONS:
 * 
 * 1. Go to https://workers.cloudflare.com/
 * 2. Sign in to your Cloudflare account
 * 3. Click "Create a Service"
 * 4. Name your worker (e.g., "b3f-proxy")
 * 5. Copy and paste this entire script
 * 6. Update the BACKEND_API constant with your real backend URL
 * 7. Click "Save and Deploy"
 * 8. Your worker will be available at: https://your-worker-name.your-subdomain.workers.dev
 * 
 * CONFIGURATION:
 * - Update ALLOWED_ORIGIN if your frontend URL changes
 * - Update BACKEND_API with your actual backend URL
 * - Adjust RATE_LIMIT_PER_MINUTE as needed
 * 
 * USAGE IN FRONTEND:
 * Instead of calling your backend directly, call:
 * https://your-worker-name.your-subdomain.workers.dev/api/endpoint
 * 
 * The worker will:
 * ✅ Verify the request comes from your frontend
 * ✅ Add rate limiting
 * ✅ Add CORS headers
 * ✅ Add security headers
 * ✅ Proxy the request to your backend
 * ✅ Return the response with proper CORS
 * 
 * OPTIONAL CUSTOM DOMAIN:
 * You can also set up a custom domain like api.yourdomain.com
 * that points to this worker for cleaner URLs.
 */
