const ALLOWED_ORIGIN = 'https://b3f-prints.pages.dev'; // your frontend domain
const SUPABASE_STORAGE = 'https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/';

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Credentials': 'true',
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const imagePath = url.pathname.replace('/proxy/', '');

    // 1. Handle OPTIONS (CORS preflight)
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // 2. Allow all origins temporarily (for debugging)
    const origin = request.headers.get('Origin');
    const referer = request.headers.get('Referer');

    // ⚠️ Temporarily disable strict origin check to test
    // You can uncomment below to restrict later
    // if (origin !== ALLOWED_ORIGIN && !(referer && referer.startsWith(ALLOWED_ORIGIN))) {
    //   return new Response('Forbidden - Invalid Origin', {
    //     status: 403,
    //     headers: corsHeaders,
    //   });
    // }

    // 3. Fetch image from Supabase
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
