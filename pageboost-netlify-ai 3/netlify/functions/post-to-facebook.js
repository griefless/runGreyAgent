// Posts a text or photo post to a Facebook Page via Graph API
// Requires FB_PAGE_ID and FB_PAGE_ACCESS_TOKEN in Netlify env vars

export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    const { message, imageUrl } = await req.json();

    const pageId    = process.env.FB_PAGE_ID;
    const pageToken = process.env.FB_PAGE_ACCESS_TOKEN;

    if (!pageId || !pageToken) {
      return new Response(
        JSON.stringify({
          error: 'Facebook not connected. Add FB_PAGE_ID and FB_PAGE_ACCESS_TOKEN to your Netlify environment variables.',
          connected: false,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let fbUrl, body;

    if (imageUrl) {
      // Photo post
      fbUrl = `https://graph.facebook.com/v19.0/${pageId}/photos`;
      body  = new URLSearchParams({ url: imageUrl, caption: message, access_token: pageToken });
    } else {
      // Text post
      fbUrl = `https://graph.facebook.com/v19.0/${pageId}/feed`;
      body  = new URLSearchParams({ message, access_token: pageToken });
    }

    const fbRes  = await fetch(fbUrl, { method: 'POST', body });
    const fbData = await fbRes.json();

    if (fbData.error) {
      return new Response(
        JSON.stringify({ error: fbData.error.message, code: fbData.error.code }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        postId: fbData.id,
        postUrl: `https://facebook.com/${fbData.id}`,
      }),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const config = { path: '/api/post-to-facebook' };
