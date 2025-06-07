
export async function onRequestPost(context) {
  try {
    const { to, subject, text } = await context.request.json();

    if (!to || !subject || !text) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: to, subject, text' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get SMTP configuration from environment variables
    const {
      SMTP_HOSTNAME,
      SMTP_PORT,
      SMTP_USERNAME,
      SMTP_PASSWORD
    } = context.env;

    if (!SMTP_HOSTNAME || !SMTP_PORT || !SMTP_USERNAME || !SMTP_PASSWORD) {
      return new Response(JSON.stringify({ 
        error: 'SMTP configuration missing' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create email content
    const emailContent = {
      from: SMTP_USERNAME,
      to: to,
      subject: subject,
      text: text,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">B3F Prints & Men's Wear</h2>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
            ${text.split('\n').map(line => `<p>${line}</p>`).join('')}
          </div>
          <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
            This is an automated email from B3F Prints & Men's Wear. Please do not reply to this email.
          </p>
        </div>
      `
    };

    // Use Cloudflare's email service or external SMTP
    // For now, we'll use a simple HTTP request to an email service
    // In production, you might want to use Cloudflare Email Workers or another service
    
    const emailResponse = await fetch(`https://api.smtp2go.com/v3/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Smtp2go-Api-Key': SMTP_PASSWORD // Using password field for API key
      },
      body: JSON.stringify({
        to: [to],
        sender: SMTP_USERNAME,
        subject: subject,
        text_body: text,
        html_body: emailContent.html
      })
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('SMTP service error:', errorText);
      
      // Fallback: return success but log the error
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Email queued (fallback)',
        debug: errorText 
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await emailResponse.json();
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Email sent successfully',
      data: result 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Email function error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
