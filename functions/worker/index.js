const ALLOWED_ORIGINS = [
  'https://b3f-prints.pages.dev',
  'http://localhost:8080',
  // add any other allowed origins here
];

function isAllowedOrigin(origin) {
  // Allow no origin (e.g., direct browser image fetches)
  if (!origin) return true;

  return (
    ALLOWED_ORIGINS.includes(origin) ||
    origin.startsWith('http://localhost')
  );
}

const SUPABASE_STORAGE = 'https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const imagePath = url.pathname.replace('/proxy/', '');
    const origin = request.headers.get('Origin') || '*';

    const corsHeaders = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Proxy-Secure',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400'
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      const backendUrl = SUPABASE_STORAGE + imagePath + url.search;
      const imageRes = await fetch(backendUrl);

      if (!imageRes.ok) {
        return new Response(`Image not found at: ${backendUrl}`, {
          status: 404,
          headers: corsHeaders
        });
      }

      return new Response(imageRes.body, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': imageRes.headers.get('Content-Type') || 'application/octet-stream',
          'Cache-Control': 'public, max-age=86400',
        }
      });
    } catch (e) {
      return new Response('Internal Proxy Error', {
        status: 502,
        headers: corsHeaders
      });
    }
  }
};
