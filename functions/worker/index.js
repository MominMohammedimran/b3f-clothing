const ALLOWED_ORIGIN = 'https://b3f-prints.pages.dev';
const BACKEND_API = 'https://cmpggiyuiattqjmddcac.supabase.co/';
const RATE_LIMIT_PER_MINUTE = 100;

// Simple in-memory rate limiting per IP (resets every minute)
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
  async fetch(request) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    const referer = request.headers.get('Referer');

    // Get client IP from CF headers or fallback
    const clientIP =
      request.headers.get('CF-Connecting-IP') ||
      request.headers.get('X-Forwarded-For') ||
      request.headers.get('X-Real-IP') ||
      'unknown';

    // CORS origin check
    if (origin && origin !== ALLOWED_ORIGIN) {
      return new Response('Forbidden - Unauthorized Origin', { status: 403, headers: { 'Content-Type': 'text/plain' } });
    }

    const isAllowedOrigin = origin === ALLOWED_ORIGIN || (referer && referer.startsWith(ALLOWED_ORIGIN));
    if (!isAllowedOrigin) {
      return new Response('Forbidden - Invalid Origin', { status: 403, headers: { 'Content-Type': 'text/plain' } });
    }

    // Handle OPTIONS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    // Rate limiting per IP
    if (isRateLimited(clientIP)) {
      return new Response('Too Many Requests', {
        status: 429,
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/plain',
          'Retry-After': '60',
        },
      });
    }

    try {
      // Remove /proxy prefix if used
      let targetPath = url.pathname.startsWith('/proxy') ? url.pathname.replace('/proxy', '') : url.pathname;

      // Build full backend URL to Supabase Storage public bucket
      const backendUrl = `${BACKEND_API}${targetPath}${url.search}`;

      // Forward headers and add security headers
      const backendHeaders = new Headers(request.headers);
      backendHeaders.set('X-Proxy-Secure', 'true');
      backendHeaders.set('X-Real-IP', clientIP);
      backendHeaders.delete('Host');

      // Forward the request
      const backendRequest = new Request(backendUrl, {
        method: request.method,
        headers: backendHeaders,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null,
      });

      const response = await fetch(backendRequest);

      // Return response with CORS headers
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...corsHeaders,
          'Content-Type': response.headers.get('Content-Type') || 'application/json',
          'Content-Length': response.headers.get('Content-Length') || '',
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
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  },
};
