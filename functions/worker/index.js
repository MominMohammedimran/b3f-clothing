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
 addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const origin = request.headers.get('Origin') || ''
  const allowedOrigin =
    origin === 'https://b3f-prints.pages.dev' || origin === 'http://localhost:5173'
      ? origin
      : ''

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Credentials': 'true',
      },
    })
  }

  // Extract proxy path
  const path = url.pathname.replace('/proxy/', '')
  const target = `https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/${path}${url.search}`

  const response = await fetch(target, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/octet-stream',
    },
  })

  // Clone response and add CORS headers
  const modifiedResponse = new Response(response.body, response)
  modifiedResponse.headers.set('Access-Control-Allow-Origin', allowedOrigin)
  modifiedResponse.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  modifiedResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  modifiedResponse.headers.set('Access-Control-Allow-Credentials', 'true')

  return modifiedResponse
}

