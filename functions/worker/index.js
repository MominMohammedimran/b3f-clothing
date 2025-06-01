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
 async function handleRequest(request: Request): Promise<Response> {
  const origin = request.headers.get('Origin') || '';

  // Only allow your frontend domain
  const allowedOrigin = origin === 'https://b3f-prints.pages.dev' ? origin : '';

  const url = new URL(request.url);
  const targetPath = url.pathname.replace('/proxy/', '');
  const targetUrl = `https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/${targetPath}${url.search}`;

  const response = await fetch(targetUrl, {
    method: request.method,
    headers: request.headers,
  });

  const modifiedHeaders = new Headers(response.headers);
  modifiedHeaders.set('Access-Control-Allow-Origin', allowedOrigin);
  modifiedHeaders.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  modifiedHeaders.set('Access-Control-Allow-Headers', 'Content-Type');
  modifiedHeaders.set('Access-Control-Allow-Credentials', 'true');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: modifiedHeaders,
  });
}

addEventListener('fetch', (event) => {
  if (event.request.method === 'OPTIONS') {
    const origin = event.request.headers.get('Origin') || '';
    const allowedOrigin = origin === 'https://b3f-prints.pages.dev' ? origin : '';
    event.respondWith(
      new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': allowedOrigin,
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Credentials': 'true',
        },
      }),
    );
  } else {
    event.respondWith(handleRequest(event.request));
  }
});