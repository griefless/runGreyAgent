// ✅ Netlify AI Gateway — no ANTHROPIC_API_KEY needed in your env vars.
// Netlify automatically injects ANTHROPIC_API_KEY + ANTHROPIC_BASE_URL
// and bills AI usage directly to your Netlify account.

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
    const { topic, tone, hashtags, postType } = await req.json();

    if (!topic) {
      return new Response(JSON.stringify({ error: 'Topic is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const hashtagInstruction = hashtags
      ? 'Add 6-8 relevant trending hashtags at the end.'
      : 'Do not include hashtags.';

    const postTypeMap = {
      'Text Post':    'a text-only Facebook post',
      'Photo Post':   'a Facebook photo post caption',
      'Reel Caption': 'a Facebook Reel caption (short, punchy, with a hook)',
      'Story':        'a Facebook Story caption (very short, 1-2 lines max)',
    };
    const typeDesc = postTypeMap[postType] || 'a Facebook post';

    const prompt = `You are a top Facebook marketing expert in 2025. Write ${typeDesc} about: "${topic}".

Tone: ${tone}
${hashtagInstruction}

Rules:
- Open with a scroll-stopping hook (emoji + bold statement OR a question)
- 3-5 punchy sentences, conversational and human — never corporate
- End with a clear call-to-action that drives comments or shares
- Optimised for the Facebook algorithm (engagement bait done tastefully)
- Do NOT include quotation marks around the post
- Respond with ONLY the post text, nothing else.`;

    // Netlify AI Gateway automatically injects:
    //   process.env.ANTHROPIC_API_KEY  — Netlify managed key (no sign-up needed)
    //   process.env.ANTHROPIC_BASE_URL — routes through Netlify AI Gateway
    const baseURL = process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com';
    const apiKey  = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'AI Gateway not active. Deploy to Netlify first — AI Gateway requires at least one production deploy.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch(`${baseURL}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return new Response(
        JSON.stringify({ error: err.error?.message || 'AI Gateway error' }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data   = await response.json();
    const result = data.content?.[0]?.text || '';

    return new Response(JSON.stringify({ result }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const config = { path: '/api/generate-caption' };
