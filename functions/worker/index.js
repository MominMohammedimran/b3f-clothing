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


