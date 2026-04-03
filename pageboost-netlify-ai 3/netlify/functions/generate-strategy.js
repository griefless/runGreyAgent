// ✅ Netlify AI Gateway — no ANTHROPIC_API_KEY needed in your env vars.
// Netlify automatically injects ANTHROPIC_API_KEY + ANTHROPIC_BASE_URL.

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
    const { niche } = await req.json();

    if (!niche) {
      return new Response(JSON.stringify({ error: 'Niche is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const prompt = `You are a top Facebook marketing strategist in 2025. Give me a numbered 5-point action plan to grow a Facebook page in the "${niche}" niche.

Format exactly like this:
1. **Bold Title** — One specific, actionable sentence with a real stat or tactic.
2. **Bold Title** — One specific, actionable sentence with a real stat or tactic.
(etc.)

Rules:
- Be specific and data-driven, not generic
- Mention posting frequency, content types, or engagement tactics
- Max 220 words total
- Do not add intro or outro text — just the 5 numbered points`;

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

export const config = { path: '/api/generate-strategy' };
