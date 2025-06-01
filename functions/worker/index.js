const ALLOWED_ORIGINS = [
  'https://b3f-prints.pages.dev',
  'http://localhost:8080',
];

const SUPABASE_STORAGE = 'https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/';
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const imagePath = url.pathname.replace('/proxy/', '');

    const origin = request.headers.get('Origin') || '';
    const referer = request.headers.get('Referer') || '';

    const allowOrigin = ALLOWED_ORIGINS.find((o) => origin === o || referer.startsWith(o)) || '*';

    const corsHeaders = {
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Credentials': 'true',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // Fetch from Supabase
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
  },
};
