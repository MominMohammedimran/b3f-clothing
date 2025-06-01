//whilw local developing above function should return true the npx wrangler deploy 
//start local developing
// this should be used while deploying
// if (!origin) return false;
//  if (ALLOWED_ORIGINS.includes(origin)) return true;
 // if (origin.startsWith('http://localhost')) return true;
  //return false;
  // 
  // 
  // 
 const ALLOWED_ORIGINS = [
  'https://b3f-prints.pages.dev',
  'http://localhost:8080',
];

const SUPABASE_STORAGE =
  'https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/';

function isAllowedOrigin(origin) {
  return (
    ALLOWED_ORIGINS.includes(origin) ||
    origin?.startsWith('http://localhost')
  );
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const imagePath = url.pathname.replace('/proxy/', '');

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': isAllowedOrigin(origin)
            ? origin
            : 'null',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers':
            'Content-Type, Authorization, X-Requested-With, Accept, Origin',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Block if origin is not allowed
    if (!isAllowedOrigin(origin)) {
      return new Response('Forbidden - Invalid Origin', {
        status: 403,
        headers: {
          'Access-Control-Allow-Origin': 'null',
          'Content-Type': 'text/plain',
        },
      });
    }

    try {
      const backendUrl = SUPABASE_STORAGE + imagePath;
      const imageRes = await fetch(backendUrl);

      if (!imageRes.ok) {
        return new Response('Image not found', {
          status: 404,
          headers: {
            'Access-Control-Allow-Origin': origin,
            'Content-Type': 'text/plain',
          },
        });
      }

      const headers = {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type':
          imageRes.headers.get('Content-Type') || 'application/octet-stream',
        'Cache-Control': 'public, max-age=86400',
      };

      return new Response(imageRes.body, {
        status: 200,
        headers,
      });
    } catch (e) {
      return new Response('Internal Proxy Error', {
        status: 502,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Content-Type': 'text/plain',
        },
      });
    }
  },
};
