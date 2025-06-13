
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { designData, orderNumber } = await req.json();

    if (!designData || !orderNumber) {
      throw new Error('Design data and order number are required');
    }

    // Create HTML canvas content for design
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Design ${orderNumber}</title>
        <style>
          body { margin: 0; padding: 20px; background: white; font-family: Arial, sans-serif; }
          .design-container { 
            width: 800px; 
            height: 600px; 
            background: white; 
            border: 1px solid #ddd; 
            position: relative; 
            margin: 0 auto;
          }
          .design-element { position: absolute; }
          .text-element { font-weight: bold; }
          .image-element { max-width: 100%; max-height: 100%; }
        </style>
      </head>
      <body>
        <h1>Order: ${orderNumber}</h1>
        <div class="design-container" id="designCanvas">
          ${designData.elements ? designData.elements.map((element: any, index: number) => {
            if (element.type === 'text') {
              return `<div class="design-element text-element" style="
                left: ${element.x || 0}px;
                top: ${element.y || 0}px;
                color: ${element.color || '#000000'};
                font-size: ${element.fontSize || 16}px;
                font-family: ${element.fontFamily || 'Arial'};
              ">${element.text || ''}</div>`;
            } else if (element.type === 'image') {
              return `<img class="design-element image-element" src="${element.src}" style="
                left: ${element.x || 0}px;
                top: ${element.y || 0}px;
                width: ${element.width || 100}px;
                height: ${element.height || 100}px;
              " />`;
            }
            return '';
          }).join('') : ''}
        </div>
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;

    return new Response(htmlContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="design_${orderNumber}.html"`
      },
    });

  } catch (error) {
    console.error('Error in download-design:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to generate design download' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
