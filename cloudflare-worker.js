
// Cloudflare Worker Script
// Deploy this at: https://workers.cloudflare.com/

// Configuration
const ALLOWED_ORIGIN = 'https://b3f-prints.pages.dev';
const BACKEND_API = 'https://my-backend.example.com'; // Replace with your actual backend URL
const RATE_LIMIT_PER_MINUTE = 100;

// In-memory rate limiting (note: this is per worker instance)
const rateLimitMap = new Map();

// Helper function to clean up old rate limit entries
function cleanupRateLimit() {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;
  
  for (const [ip, data] of rateLimitMap.entries()) {
    if (data.lastReset < oneMinuteAgo) {
      rateLimitMap.delete(ip);
    }
  }
}

// Rate limiting function
function isRateLimited(ip) {
  cleanupRateLimit();
  
  const now = Date.now();
  const data = rateLimitMap.get(ip) || { count: 0, lastReset: now };
  
  // Reset count if more than a minute has passed
  if (now - data.lastReset > 60000) {
    data.count = 0;
    data.lastReset = now;
  }
  
  data.count++;
  rateLimitMap.set(ip, data);
  
  return data.count > RATE_LIMIT_PER_MINUTE;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Proxy-Secure',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400', // 24 hours
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    const referer = request.headers.get('Referer');
    const userAgent = request.headers.get('User-Agent');
    
    // Get client IP
    const clientIP = request.headers.get('CF-Connecting-IP') || 
                    request.headers.get('X-Forwarded-For') || 
                    request.headers.get('X-Real-IP') || 
                    'unknown';

    // Block requests from non-allowed origins
    if (origin && origin !== ALLOWED_ORIGIN) {
      console.log(`Blocked request from unauthorized origin: ${origin}`);
      return new Response('Forbidden - Unauthorized Origin', { 
        status: 403,
        headers: {
          'Content-Type': 'text/plain',
        }
      });
    }

    // Allow requests from the allowed origin or with valid referer
    const isAllowedOrigin = origin === ALLOWED_ORIGIN || 
                           (referer && referer.startsWith(ALLOWED_ORIGIN));

    if (!isAllowedOrigin) {
      console.log(`Blocked request. Origin: ${origin}, Referer: ${referer}`);
      return new Response('Forbidden - Invalid Origin', { 
        status: 403,
        headers: {
          'Content-Type': 'text/plain',
        }
      });
    }

    // Handle preflight OPTIONS requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Rate limiting
    if (isRateLimited(clientIP)) {
      console.log(`Rate limited IP: ${clientIP}`);
      return new Response('Too Many Requests', { 
        status: 429,
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/plain',
          'Retry-After': '60',
        }
      });
    }

    try {
      // Rewrite URL path - remove /proxy prefix if present
      let targetPath = url.pathname;
      if (targetPath.startsWith('/proxy')) {
        targetPath = targetPath.replace('/proxy', '');
      }
      
      // Construct the backend URL
      const backendUrl = `${BACKEND_API}${targetPath}${url.search}`;
      
      console.log(`Proxying request to: ${backendUrl}`);

      // Prepare headers for the backend request
      const backendHeaders = new Headers(request.headers);
      
      // Add custom security header
      backendHeaders.set('X-Proxy-Secure', 'true');
      
      // Add real IP header
      backendHeaders.set('X-Real-IP', clientIP);
      
      // Remove host header to avoid conflicts
      backendHeaders.delete('Host');
      
      // Forward the request to the backend
      const backendRequest = new Request(backendUrl, {
        method: request.method,
        headers: backendHeaders,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null,
      });

      // Make the request to the backend
      const response = await fetch(backendRequest);
      
      // Create a new response with CORS headers
      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...corsHeaders,
          // Forward important headers from the backend
          'Content-Type': response.headers.get('Content-Type') || 'application/json',
          'Content-Length': response.headers.get('Content-Length') || '',
          'Cache-Control': response.headers.get('Cache-Control') || 'no-cache',
        },
      });

      // Log successful request
      console.log(`✅ Successfully proxied ${request.method} ${url.pathname} -> ${response.status}`);
      
      return newResponse;

    } catch (error) {
      console.error('Proxy error:', error);
      
      return new Response(JSON.stringify({ 
        error: 'Proxy Error', 
        message: 'Failed to connect to backend service',
        timestamp: new Date().toISOString()
      }), {
        status: 502,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
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
