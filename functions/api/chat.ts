export async function onRequestOptions({ request }) {
  const origin = request.headers.get('Origin') || '*';
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function onRequestPost({ request }) {
  try {
    const origin = request.headers.get('Origin') || '*';
    const { baseUrl, model, messages, temperature } = await request.json();
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Missing API key' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin } });
    }
    const urlBase = (baseUrl && baseUrl.trim().length > 0 ? baseUrl.replace(/\/$/, '') : 'https://api.openai.com/v1');
    const resp = await fetch(`${urlBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model: model || 'gpt-4o-mini', messages, temperature: temperature ?? 0.2 }),
    });
    const text = await resp.text();
    const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin };
    return new Response(text, { status: resp.status, headers });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  }
}
