export async function POST(request: Request) {
  const json = (data: unknown, status = 200) => Response.json(data, { status });
  const originHeader = request.headers.get('origin');
  if (originHeader && originHeader !== 'null') {
    try {
      if (new URL(originHeader).origin !== new URL(request.url).origin) {
        return json({ error: 'Invalid request origin.' }, 403);
      }
    } catch {
      return json({ error: 'Invalid request origin.' }, 403);
    }
  }
  const runtime = process.env;
  const aiEndpoint = runtime.APEXA_AI_ENDPOINT || runtime.FRAME_AI_ENDPOINT;
  const aiToken = runtime.APEXA_AI_TOKEN || runtime.FRAME_AI_TOKEN;
  if (!aiEndpoint || !aiToken)
    return json(
      {
        error:
          'AI model endpoint is not configured. You can save drafts or export a brief to continue later.',
      },
      503,
    );
  try {
    const text = await request.text();
    if (text.length > 15_000_000)
      return json(
        { error: 'Reference image exceeds maximum allowed size.' },
        413,
      );
    const body = JSON.parse(text);
    if (
      typeof body.prompt !== 'string' ||
      !body.prompt.trim() ||
      body.prompt.length > 4000
    )
      return json(
        { error: 'Prompt must be between 1 and 4000 characters.' },
        400,
      );
    if (
      !['image', 'video', 'cinema', 'marketing', 'canvas'].includes(
        body.mode,
      ) ||
      !['16:9', '9:16', '1:1', '4:3', '3:2'].includes(body.ratio)
    )
      return json({ error: 'Invalid creative parameters.' }, 400);
    if (
      body.image &&
      (typeof body.image !== 'string' ||
        !/^data:image\/(png|jpeg|webp);base64,/.test(body.image))
    )
      return json({ error: 'Invalid image format.' }, 400);
    const endpoint = new URL(aiEndpoint);
    if (endpoint.protocol !== 'https:')
      return json({ error: 'AI connection is misconfigured.' }, 503);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${aiToken}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(90000),
      redirect: 'error',
    });
    if (!response.ok)
      return json(
        {
          error:
            'AI service failed to process the request. Please try again later.',
        },
        502,
      );
    const result = (await response.json()) as { url?: string; type?: string };
    if (
      !result.url ||
      new URL(result.url).protocol !== 'https:' ||
      !['image', 'video'].includes(result.type || '')
    )
      return json({ error: 'AI service returned an invalid response.' }, 502);
    return json({ url: result.url, type: result.type });
  } catch (e) {
    return json(
      {
        error:
          e instanceof SyntaxError
            ? 'Invalid JSON request body.'
            : 'AI connection disrupted. Please try again.',
      },
      e instanceof SyntaxError ? 400 : 502,
    );
  }
}
