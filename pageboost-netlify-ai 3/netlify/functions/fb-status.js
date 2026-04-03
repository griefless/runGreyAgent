// Returns Facebook connection status and page info

export default async (req) => {
  const pageId    = process.env.FB_PAGE_ID;
  const pageToken = process.env.FB_PAGE_ACCESS_TOKEN;

  if (!pageId || !pageToken) {
    return new Response(
      JSON.stringify({ connected: false }),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }

  try {
    // Verify the token and get page info
    const res  = await fetch(
      `https://graph.facebook.com/v19.0/${pageId}?fields=name,fan_count,picture,link&access_token=${pageToken}`
    );
    const data = await res.json();

    if (data.error) {
      return new Response(
        JSON.stringify({ connected: false, error: data.error.message }),
        { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    return new Response(
      JSON.stringify({
        connected: true,
        page: {
          id:       data.id,
          name:     data.name,
          fans:     data.fan_count,
          picture:  data.picture?.data?.url,
          link:     data.link,
        },
      }),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ connected: false, error: err.message }),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
};

export const config = { path: '/api/fb-status' };
