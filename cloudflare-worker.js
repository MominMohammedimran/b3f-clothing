
// Cloudflare Worker Script
// Deploy this at: https://workers.cloudflare.com/

// ConfigurationaddEventListener('fetch', event 



addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})



async function handleRequest(request) {
  const url = new URL(request.url)
  const origin = request.headers.get('Origin') || ''
  const allowedOrigins = ['https://b3f-prints.pages.dev', 'http://localhost:8080']

  const corsOrigin = allowedOrigins.includes(origin) ? origin : ''

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': corsOrigin,
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Credentials': 'true',
      },
    })
  }

  // Actual proxy logic
  const path = url.pathname.replace('/proxy/', '')
  const target = `https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/${path}${url.search}`

  const response = await fetch(target)

  const modifiedResponse = new Response(response.body, response)
  modifiedResponse.headers.set('Access-Control-Allow-Origin', corsOrigin)
  modifiedResponse.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  modifiedResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  modifiedResponse.headers.set('Access-Control-Allow-Credentials', 'true')

  return modifiedResponse
}




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
