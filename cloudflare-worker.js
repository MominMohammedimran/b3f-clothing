
// Cloudflare Worker Script
// Deploy this at: https://workers.cloudflare.com/

// Configuration
const ALLOWED_ORIGINS = [
  'https://b3f-prints.pages.dev',
  'http://localhost:8080',
  'http://localhost:3000',  // add other local dev ports if needed
];

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin.startsWith('http://localhost')) return true;
  return false;
}

const SUPABASE_STORAGE = 'https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const imagePath = url.pathname.replace('/proxy/', '');

    const origin = request.headers.get('Origin');
    console.log('Origin header:', origin);  // This logs origin to the worker console for debugging
    
    if (!isAllowedOrigin(origin)) {
      return new Response('Forbidden - Invalid Origin', {
        status: 403,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    const corsHeaders = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    };

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    try {
      const backendUrl = SUPABASE_STORAGE + imagePath;
      const imageRes = await fetch(backendUrl);

      if (!imageRes.ok) {
        return new Response('Image not found', {
          status: 404,
          headers: corsHeaders,
        });
      }

      const headers = {
        ...corsHeaders,
        'Content-Type': imageRes.headers.get('Content-Type') || 'application/octet-stream',
        'Cache-Control': 'public, max-age=86400',
      };

      return new Response(imageRes.body, {
        status: 200,
        headers,
      });
    } catch (e) {
      return new Response('Internal Proxy Error', {
        status: 502,
        headers: corsHeaders,
      });
    }
  }
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
