
// Cloudflare Worker Script
// Deploy this at: https://workers.cloudflare.com/

// Configuration
const ALLOWED_ORIGIN = 'https://b3f-prints.pages.dev';
const SUPABASE_BASE_URL = 'https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public';
const RATE_LIMIT_PER_MINUTE = 100;

const rateLimitMap = new Map();

function cleanupRateLimit() {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;
  for (const [ip, data] of rateLimitMap.entries()) {
    if (data.lastReset < oneMinuteAgo) {
      rateLimitMap.delete(ip);
    }
  }
}

function isRateLimited(ip) {
  cleanupRateLimit();
  const now = Date.now();
  const data = rateLimitMap.get(ip) || { count: 0, lastReset: now };
  if (now - data.lastReset > 60000) {
    data.count = 0;
    data.lastReset = now;
  }
  data.count++;
  rateLimitMap.set(ip, data);
  return data.count > RATE_LIMIT_PER_MINUTE;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Proxy-Secure',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    const referer = request.headers.get('Referer');
    const clientIP =
      request.headers.get('CF-Connecting-IP') ||
      request.headers.get('X-Forwarded-For') ||
      request.headers.get('X-Real-IP') ||
      'unknown';

    if (origin && origin !== ALLOWED_ORIGIN) {
      return new Response('Forbidden - Unauthorized Origin', { status: 403 });
    }

    const isAllowedOrigin = origin === ALLOWED_ORIGIN || (referer && referer.startsWith(ALLOWED_ORIGIN));
    if (!isAllowedOrigin) {
      return new Response('Forbidden - Invalid Origin', { status: 403 });
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    if (isRateLimited(clientIP)) {
      return new Response('Too Many Requests', {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain', 'Retry-After': '60' },
      });
    }

    try {
      let targetPath = url.pathname;
      if (targetPath.startsWith('/proxy/')) {
        targetPath = targetPath.replace('/proxy/', ''); // Remove prefix
      } else {
        return new Response('Bad Request - missing /proxy/', { status: 400 });
      }

      // Split bucket and file path
      const [bucketName, ...fileParts] = targetPath.split('/');
      if (!bucketName || fileParts.length === 0) {
        return new Response('Bad Request - missing bucket or file path', { status: 400 });
      }

      const filePath = fileParts.join('/');

      // Construct backend URL dynamically based on bucket and path
      const backendUrl = `${SUPABASE_BASE_URL}/${bucketName}/${filePath}${url.search}`;

      const backendHeaders = new Headers(request.headers);
      backendHeaders.set('X-Proxy-Secure', 'true');
      backendHeaders.set('X-Real-IP', clientIP);
      backendHeaders.delete('Host');

      const backendRequest = new Request(backendUrl, {
        method: request.method,
        headers: backendHeaders,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null,
      });

      const response = await fetch(backendRequest);

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...corsHeaders,
          'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
          'Cache-Control': response.headers.get('Cache-Control') || 'no-cache',
        },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: 'Proxy Error',
          message: 'Failed to connect to backend service',
          timestamp: new Date().toISOString(),
        }),
        {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
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
